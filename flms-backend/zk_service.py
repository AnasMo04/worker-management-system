import os
import sys
import ctypes
import base64
import time
import json
import threading

# Global state
zk_ctrl = None
zk_event_sink = None
terminate_flag = False
is_capturing_flag = False # Strict hardware capture toggle
current_finger_index = 0
mode = "enroll"  # "enroll" or "identify"
stored_templates = []  # List of { "id": 1, "template": "..." }
last_identify_time = 0

# Shared data between events
last_image_b64 = ""
last_quality = 0

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

class ZKEvents:
    """Event Sink for ZK ActiveX Component."""
    def __init__(self):
        self.zk_ctrl = None

    def set_ctrl(self, ctrl):
        self.zk_ctrl = ctrl

    def OnImageReceived(self, AImageValid):
        global last_image_b64, last_quality, is_capturing_flag
        if not is_capturing_flag:
            return

        if AImageValid:
            try:
                if not self.zk_ctrl:
                    return

                # 1. Extract Features FIRST
                try:
                    self.zk_ctrl.ExtractFeatures()
                except Exception as e:
                    log("DEBUG", f"ExtractFeatures failed: {e}")

                # 2. Fetch quality score
                try:
                    last_quality = self.zk_ctrl.GetCapParam(101)
                    log("QUALITY", str(last_quality))
                except Exception as e:
                    log("DEBUG", f"GetCapParam(101) failed: {e}")

                # 3. Capture and Emit Image Preview
                temp_file = os.path.join(os.environ.get('TEMP', '.'), "temp_preview.bmp")
                self.zk_ctrl.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        last_image_b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", last_image_b64)
                    try:
                        os.remove(temp_file)
                    except:
                        pass
            except Exception as e:
                log("DEBUG", f"ActiveX Image Process Error: {e}")

    def OnCapture(self, ActionResult, ATemplate):
        global mode, last_identify_time, stored_templates, last_image_b64, last_quality, current_finger_index, is_capturing_flag
        if not is_capturing_flag:
            return

        if ActionResult:
            try:
                # Live template from capture
                live_template_bytes = bytes(ATemplate)
                live_template_b64 = base64.b64encode(live_template_bytes).decode('utf-8')
                t_len = len(live_template_bytes)

                log("DEBUG", f"Live Template Captured. Length: {t_len}")

                if mode == "enroll":
                    # Quality Fallback
                    is_synthetic = False
                    q_score = last_quality
                    if q_score <= 0:
                        is_synthetic = True
                        q_score = 85 if t_len > 400 else 70 if t_len > 0 else 0

                    # EXACT JSON STRUCTURE as requested
                    payload = {
                        "type": "ENROLLMENT",
                        "template": live_template_b64.strip(),
                        "image": last_image_b64,
                        "quality": q_score,
                        "finger_index": current_finger_index,
                        "is_synthetic": is_synthetic
                    }
                    print(f"BIOMETRIC_DATA: {json.dumps(payload)}")
                    sys.stdout.flush()
                    log("INFO", f"Enrolled finger {current_finger_index}")

                elif mode == "identify":
                    # Manual 1:1 Identification Loop
                    now = time.time()
                    if now - last_identify_time < 1.5:
                        return
                    last_identify_time = now

                    if not stored_templates:
                        log("FEEDBACK", "No templates loaded.")
                        return

                    log("INFO", f"Searching {len(stored_templates)} records...")
                    match_found = False
                    live_clean = live_template_b64.strip()

                    for item in stored_templates:
                        try:
                            reg_clean = item["template"].strip()
                            score = self.zk_ctrl.VerFingerFromStr(reg_clean, live_clean)
                            if score > 10:
                                # EXACT JSON STRUCTURE for identified
                                payload = { "type": "IDENTIFIED", "id": item["id"] }
                                print(f"BIOMETRIC_DATA: {json.dumps(payload)}")
                                sys.stdout.flush()
                                match_found = True
                                break
                        except:
                            continue

                    if not match_found:
                        log("FEEDBACK", "Fingerprint not recognized.")
            except Exception as e:
                log("ERROR", f"OnCapture Processing Error: {e}")

def clean_com_cache():
    """Clears the gen_py folder to prevent COM errors."""
    import shutil
    temp_dir = os.environ.get('TEMP')
    if temp_dir:
        gen_py_path = os.path.join(temp_dir, 'gen_py')
        if os.path.exists(gen_py_path):
            try:
                shutil.rmtree(gen_py_path)
                log("INFO", "COM cache cleared.")
            except:
                pass

def initialize_activex():
    global zk_ctrl, zk_event_sink
    try:
        import win32com.client
        import pythoncom

        log("INFO", "Initializing ZKFPEngXControl.ZKFPEngX...")
        zk_ctrl = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")
        zk_event_sink = win32com.client.WithEvents(zk_ctrl, ZKEvents)
        zk_event_sink.set_ctrl(zk_ctrl)

        if zk_ctrl.InitEngine() == 0:
            zk_ctrl.FPEngineVersion = "9"
            log("STATUS", "Biometric Bridge Ready")
            return True
        else:
            log("ERROR", "InitEngine failed.")
            return False
    except Exception as e:
        log("ERROR", f"ActiveX failure: {e}")
        return False

def listen_for_commands():
    global terminate_flag, current_finger_index, mode, stored_templates, zk_ctrl, is_capturing_flag
    while not terminate_flag:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            data = json.loads(line.strip())
            cmd = data.get("command")
            if cmd == "exit":
                terminate_flag = True
            elif cmd == "set_finger":
                current_finger_index = data.get("index", 0)
            elif cmd == "set_mode":
                mode = data.get("mode", "enroll")
                log("INFO", f"Mode Switched: {mode}")
            elif cmd == "load_templates":
                stored_templates = data.get("templates", [])
                log("INFO", f"Loaded {len(stored_templates)} templates")
            elif cmd == "start_capture":
                if zk_ctrl:
                    zk_ctrl.BeginCapture()
                    is_capturing_flag = True
                    log("INFO", "Capture STARTED")
            elif cmd == "stop_capture":
                is_capturing_flag = False
                log("INFO", "Capture STOPPED")
        except:
            pass

if __name__ == "__main__":
    try:
        log("STATUS", "Starting 32-bit Python Bridge")
        clean_com_cache()

        cmd_thread = threading.Thread(target=listen_for_commands, daemon=True)
        cmd_thread.start()

        if initialize_activex():
            if zk_ctrl.SensorCount > 0:
                log("INFO", "Hardware detected and idle.")

                import pythoncom
                while not terminate_flag:
                    pythoncom.PumpWaitingMessages()
                    time.sleep(0.02)
            else:
                log("ERROR", "No fingerprint sensor detected.")

    except KeyboardInterrupt:
        pass
    finally:
        terminate_flag = True
        log("INFO", "Bridge shutting down.")
