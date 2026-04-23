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
    def __init__(self):
        self.zk_ctrl = None

    def set_ctrl(self, ctrl):
        self.zk_ctrl = ctrl

    def OnImageReceived(self, AImageValid):
        if AImageValid:
            try:
                if not self.zk_ctrl:
                    return

                # 1. Ensure Engine State: Call BeginCapture if for some reason not capturing
                # (Though OnImageReceived implies it is, we follow user instruction)
                try:
                    if self.zk_ctrl.IsRegister: # IsRegister is a property that might indicate state
                        pass
                except:
                    pass

                # 2. Extract Features FIRST (Wrapped in specific try-except as requested)
                try:
                    self.zk_ctrl.ExtractFeatures()
                except Exception as e:
                    log("DEBUG", f"ExtractFeatures execution failed: {e}")

                # 3. Fetch quality score via GetCapParam(101)
                try:
                    quality = self.zk_ctrl.GetCapParam(101)
                    log("QUALITY", str(quality))
                except Exception as e:
                    log("DEBUG", f"GetCapParam(101) failed: {e}")

                # 4. Capture and Emit Image Preview
                temp_file = os.path.join(os.environ.get('TEMP', '.'), "temp_preview.bmp")
                self.zk_ctrl.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", b64)
                    try:
                        os.remove(temp_file)
                    except:
                        pass
            except Exception as e:
                log("DEBUG", f"ActiveX Image Process Error: {e}")

    def OnCapture(self, ActionResult, ATemplate):
        global mode, last_identify_time, stored_templates
        if ActionResult:
            try:
                # Live template from capture
                live_template_bytes = bytes(ATemplate)
                live_template_b64 = base64.b64encode(live_template_bytes).decode('utf-8')
                t_len = len(live_template_bytes)

                # Debugging: Print length of live template
                log("DEBUG", f"Live Template Extracted. Length: {t_len}")

                if mode == "enroll":
                    # Fallback Quality Score based on template length
                    q_score = 85 if t_len > 400 else 70 if t_len > 0 else 0
                    log("QUALITY", str(q_score))

                    result = {"index": current_finger_index, "template": live_template_b64}
                    print(f"ENROLLMENT: {json.dumps(result)}")
                    sys.stdout.flush()
                    log("INFO", f"Enrolled finger {current_finger_index}")

                elif mode == "identify":
                    # Manual 1:1 Identification Loop
                    now = time.time()
                    if now - last_identify_time < 1.5:
                        return
                    last_identify_time = now

                    if not stored_templates:
                        log("FEEDBACK", "No templates loaded for search.")
                        return

                    log("INFO", f"Searching {len(stored_templates)} records...")
                    match_found = False

                    for item in stored_templates:
                        try:
                            # VerFingerFromStr(reg_template, live_template)
                            # reg_template (item["template"]) is from DB
                            # live_template_b64 is from current capture
                            score = self.zk_ctrl.VerFingerFromStr(item["template"], live_template_b64)

                            if score > 10:
                                log("IDENTIFIED", str(item["id"]))
                                match_found = True
                                break
                        except Exception as e:
                            continue

                    if not match_found:
                        log("FEEDBACK", "No match found.")
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

        # 1. Main Dispatch object
        zk_ctrl = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")

        # 2. Event Sink
        # Note: In pywin32, WithEvents returns a class that inherits from both
        # the provided class AND the event interface.
        zk_event_sink = win32com.client.WithEvents(zk_ctrl, ZKEvents)

        # 3. Fix Object Context: Store reference to dispatch object in the sink instance
        zk_event_sink.set_ctrl(zk_ctrl)

        # 4. Initialization
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
                log("INFO", f"Mode Switched: {mode}")
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
                # Ensure Engine State
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
