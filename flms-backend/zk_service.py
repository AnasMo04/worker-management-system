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
current_finger_index = 0
mode = "enroll"  # "enroll" or "identify"
stored_templates = []  # List of { "id": 1, "template": "..." }
last_identify_time = 0

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

class ZKEvents:
    """Event Sink for ZK ActiveX Component."""
    def OnImageReceived(self, AImageValid):
        global zk_ctrl
        if AImageValid:
            try:
                # 1. Extract Features FIRST as required by architecture
                try:
                    zk_ctrl.ExtractFeatures()
                except Exception as e:
                    log("DEBUG", f"ExtractFeatures failed: {e}")

                # 2. Fetch quality score via GetCapParam(101) after extraction
                try:
                    quality = zk_ctrl.GetCapParam(101)
                    log("QUALITY", str(quality))
                except Exception as e:
                    log("DEBUG", f"GetCapParam(101) failed: {e}")

                # 3. Capture and Emit Image Preview
                temp_file = os.path.join(os.environ.get('TEMP', '.'), "temp_preview.bmp")
                zk_ctrl.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", b64)
                    try:
                        os.remove(temp_file)
                    except:
                        pass
            except Exception as e:
                log("DEBUG", f"ActiveX Image Capture Error: {e}")

    def OnFeatureInfo(self, AQuality):
        # Optional: Secondary quality event
        pass

    def OnCapture(self, ActionResult, ATemplate):
        global mode, last_identify_time, zk_ctrl, stored_templates
        if ActionResult:
            try:
                template_bytes = bytes(ATemplate)
                template_b64 = base64.b64encode(template_bytes).decode('utf-8')
                t_len = len(template_bytes)

                if mode == "enroll":
                    # Fallback Quality Score based on template length as requested
                    q_score = 85 if t_len > 400 else 70 if t_len > 0 else 0
                    log("QUALITY", str(q_score))

                    result = {"index": current_finger_index, "template": template_b64}
                    print(f"ENROLLMENT: {json.dumps(result)}")
                    sys.stdout.flush()
                    log("INFO", f"Enrolled finger {current_finger_index} (Len: {t_len})")

                elif mode == "identify":
                    # Manual 1:1 Identification Loop (Threshold 10)
                    now = time.time()
                    if now - last_identify_time < 1.5:  # Rate limiting
                        return
                    last_identify_time = now

                    if not stored_templates:
                        log("FEEDBACK", "No templates loaded for search.")
                        return

                    log("INFO", f"Searching {len(stored_templates)} templates...")
                    match_found = False

                    for item in stored_templates:
                        try:
                            # VerFingerFromStr returns a score. Threshold = 10.
                            score = zk_ctrl.VerFingerFromStr(template_b64, item["template"])
                            if score > 10:
                                log("IDENTIFIED", str(item["id"]))
                                match_found = True
                                break
                        except Exception as e:
                            continue

                    if not match_found:
                        log("FEEDBACK", "Fingerprint not recognized")
            except Exception as e:
                log("ERROR", f"OnCapture Error: {e}")

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

        # 1. Main Dispatch object for methods
        zk_ctrl = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")

        # 2. Event Sink for events (Separated to avoid AttributeError)
        zk_event_sink = win32com.client.WithEvents(zk_ctrl, ZKEvents)

        # 3. Initialization
        if zk_ctrl.InitEngine() == 0:
            zk_ctrl.FPEngineVersion = "9" # Force engine version if needed
            log("STATUS", "Biometric Bridge Ready")
            return True
        else:
            log("ERROR", "InitEngine failed. Is the sensor connected?")
            return False
    except Exception as e:
        log("ERROR", f"ActiveX failure: {e}")
        return False

def listen_for_commands():
    global terminate_flag, current_finger_index, mode, stored_templates
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
                log("INFO", f"Mode: {mode}")
            elif cmd == "load_templates":
                stored_templates = data.get("templates", [])
                log("INFO", f"Loaded {len(stored_templates)} templates")
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
                zk_ctrl.BeginCapture()
                log("INFO", "Capture started.")

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
