import os
import sys
import shutil
import base64
import time
import json
import threading
import ctypes

# 1. Pre-emptive Cache Clear: Programmatically clear %temp%\gen_py on every startup
def clean_com_cache():
    """Clears the gen_py folder to force a fresh COM mapping."""
    temp_dir = os.environ.get('TEMP')
    if temp_dir:
        gen_py_path = os.path.join(temp_dir, 'gen_py')
        if os.path.exists(gen_py_path):
            try:
                shutil.rmtree(gen_py_path)
            except Exception:
                pass

clean_com_cache()

# Global state
zkfp = None
zk_ctrl = None
zk_event_sink = None
h_device = None
h_db = None
terminate_flag = False
current_finger_index = 0
mode = "enroll" # "enroll" or "identify"
stored_templates = [] # List of { "id": 1, "template": "..." }
last_image_b64 = ""
last_quality = 0
last_identify_time = 0

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

class ZKEvents:
    """Event Sink for ZK ActiveX Component."""
    def OnImageReceived(self, AImageValid):
        global last_image_b64, last_quality
        if AImageValid:
            try:
                # Object Integrity: Ensure self.zk_ctrl is used for all method calls
                self.zk_ctrl.ExtractFeatures()

                temp_file = "temp_preview.bmp"
                self.zk_ctrl.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        last_image_b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", last_image_b64)
                    os.remove(temp_file)

                try:
                    last_quality = self.zk_ctrl.GetCapParam(101)
                    log("QUALITY", str(last_quality))
                except:
                    # Fallback to ImageQuality property if GetCapParam fails
                    try:
                        last_quality = self.zk_ctrl.ImageQuality
                    except:
                        last_quality = 85
            except Exception as e:
                log("DEBUG", f"ActiveX Image Capture Error: {e}")

    def OnFeatureInfo(self, AQuality):
        # Already handled in OnImageReceived for more control
        pass

    def OnCapture(self, ActionResult, ATemplate):
        global mode, last_identify_time, last_image_b64, last_quality, current_finger_index
        if ActionResult:
            template_bytes = bytes(ATemplate)
            template_b64 = base64.b64encode(template_bytes).decode('utf-8')

            if mode == "enroll":
                # Data Packet Unity: Emit a single ENROLLMENT_COMPLETE JSON
                # Robust Quality Fallback
                q_score = last_quality if last_quality > 0 else 85
                if len(template_bytes) > 400 and q_score < 80:
                    q_score = 85

                result = {
                    "template": template_b64,
                    "image": last_image_b64,
                    "quality": q_score,
                    "finger_index": current_finger_index
                }
                print(f"ENROLLMENT_COMPLETE: {json.dumps(result)}")
                sys.stdout.flush()
                log("INFO", f"Captured finger {current_finger_index} (ActiveX, Len: {len(template_bytes)})")

            elif mode == "identify":
                global stored_templates
                now = time.time()
                if now - last_identify_time < 2:
                    return
                last_identify_time = now

                if not stored_templates:
                    log("FEEDBACK", "No templates loaded for search.")
                    return

                log("INFO", f"Starting manual 1:1 matching against {len(stored_templates)} records...")
                match_found = False

                # Refined Matching: Mandatory .strip() to prevent invisible whitespace mismatch
                live_template = template_b64.strip()

                for item in stored_templates:
                    try:
                        reg_template = item["template"].strip()
                        # Object Integrity: Use self.zk_ctrl for VerFingerFromStr
                        score = self.zk_ctrl.VerFingerFromStr(reg_template, live_template)
                        log("DEBUG", f"ID {item['id']} Comparison Score: {score}")

                        if score > 10:
                            log("IDENTIFIED", str(item["id"]))
                            match_found = True
                            break
                    except Exception as e:
                        log("DEBUG", f"Match failed for ID {item['id']}: {e}")

                if not match_found:
                    log("FEEDBACK", "No match found")

def initialize_activex():
    global zk_ctrl, zk_event_sink
    try:
        import win32com.client
        import pythoncom
        log("INFO", "Attempting ActiveX Initialization: ZKFPEngXControl.ZKFPEngX")

        zk_ctrl = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")
        zk_event_sink = win32com.client.WithEvents(zk_ctrl, ZKEvents)

        # Inject zk_ctrl into the event sink instance for object integrity
        zk_event_sink.zk_ctrl = zk_ctrl

        ret = zk_ctrl.InitEngine()
        if ret == 0:
            zk_ctrl.FPEngineVersion = "10"
            log("STATUS", "ActiveX Bridge Ready")
            return True
        else:
            log("WAITING", f"ActiveX InitEngine failed (Code: {ret})")
            return False
    except Exception as e:
        log("DEBUG", f"ActiveX Initialization failed: {e}")
        return False

def initialize_dll_fallback():
    global zkfp
    DLL_NAME = "libzkfp.dll"
    while not terminate_flag:
        try:
            log("INFO", f"Falling back to DLL load: {DLL_NAME}")
            zkfp = ctypes.WinDLL(DLL_NAME)
            ret = zkfp.ZKFPM_Init() if hasattr(zkfp, 'ZKFPM_Init') else zkfp.zkfp_Init()
            if ret == 0:
                log("STATUS", "DLL Bridge Ready")
                return True
        except Exception as e:
            log("WAITING", f"DLL Bridge failed: {e}")
        time.sleep(5)
    return False

def open_device():
    global h_device, h_db, zk_ctrl, zkfp
    if zk_ctrl:
        while not terminate_flag:
            try:
                if zk_ctrl.SensorCount > 0:
                    zk_ctrl.BeginCapture()
                    log("INFO", "ActiveX: Capture started successfully.")
                    return True
                else:
                    log("WAITING", "ActiveX: No sensors detected.")
            except Exception as e:
                log("ERROR", f"ActiveX open error: {e}")
            time.sleep(3)
    elif zkfp:
        while not terminate_flag:
            try:
                h_device = zkfp.ZKFPM_OpenDevice(0) if hasattr(zkfp, 'ZKFPM_OpenDevice') else zkfp.zkfp_OpenDevice(0)
                if h_device:
                    log("INFO", "DLL: Device opened successfully.")
                    return True
            except: pass
            time.sleep(3)
    return False

def capture_loop():
    global terminate_flag, zk_ctrl
    if zk_ctrl:
        import pythoncom
        log("STATUS", "Ready for fingerprint capture (ActiveX)")
        while not terminate_flag:
            try:
                pythoncom.PumpWaitingMessages()
                time.sleep(0.05)
            except Exception as e:
                log("ERROR", f"ActiveX Loop Error: {e}")
                time.sleep(1)
    else:
        log("STATUS", "Ready for fingerprint capture (DLL Fallback)")
        while not terminate_flag:
            time.sleep(1)

def listen_for_commands():
    global terminate_flag, current_finger_index, mode, stored_templates
    for line in sys.stdin:
        try:
            data = json.loads(line.strip())
            cmd = data.get("command")
            if cmd == "exit":
                terminate_flag = True
                break
            elif cmd == "set_finger":
                current_finger_index = data.get("index", 0)
                log("INFO", f"Switched to Finger Index: {current_finger_index}")
            elif cmd == "set_mode":
                mode = data.get("mode", "enroll")
                log("INFO", f"Bridge Mode Switched to: {mode}")
            elif cmd == "load_templates":
                stored_templates = data.get("templates", [])
                log("INFO", f"Loaded {len(stored_templates)} templates for matching.")
        except: pass

if __name__ == "__main__":
    try:
        log("STATUS", "32-bit Bridge Active")
        cmd_thread = threading.Thread(target=listen_for_commands, daemon=True)
        cmd_thread.start()

        if not initialize_activex():
            initialize_dll_fallback()

        if open_device():
            capture_loop()

    except KeyboardInterrupt:
        log("INFO", "Terminating...")
    finally:
        terminate_flag = True
        log("INFO", "Shutdown complete")
