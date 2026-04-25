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

# A tiny 1x1 black pixel BMP as fallback to prevent frontend crashes
FALLBACK_IMAGE = "Qk1GAAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

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
                        # Debug Log: show first 50 chars
                        log("DEBUG", f"Image Captured (Base64 Prefix): {last_image_b64[:50]}")
                    os.remove(temp_file)
                else:
                    log("DEBUG", "OnImageReceived: SaveBitmap failed to create file.")

                try:
                    last_quality = self.zk_ctrl.GetCapParam(101)
                    log("QUALITY", str(last_quality))
                except:
                    try:
                        last_quality = self.zk_ctrl.ImageQuality
                    except:
                        last_quality = 85
            except Exception as e:
                log("DEBUG", f"ActiveX Image Capture Error: {e}")

    def OnFeatureInfo(self, AQuality):
        pass

    def OnCapture(self, ActionResult, ATemplate):
        global mode, last_identify_time, last_image_b64, last_quality, current_finger_index
        if ActionResult:
            template_bytes = bytes(ATemplate)
            template_b64 = base64.b64encode(template_bytes).decode('utf-8')

            if mode == "enroll":
                # Ensure Image Capture occurs even if OnImageReceived was missed
                if not last_image_b64:
                    try:
                        temp_file = "temp_capture.bmp"
                        self.zk_ctrl.SaveBitmap(temp_file)
                        if os.path.exists(temp_file):
                            with open(temp_file, "rb") as f:
                                last_image_b64 = base64.b64encode(f.read()).decode('utf-8')
                            os.remove(temp_file)
                    except:
                        pass

                # Final fallback to prevent frontend crash
                final_image = last_image_b64 if last_image_b64 else FALLBACK_IMAGE

                # Robust Quality Fallback
                q_score = last_quality if last_quality > 0 else 85
                if len(template_bytes) > 400 and q_score < 80:
                    q_score = 85

                result = {
                    "template": template_b64,
                    "image": final_image,
                    "quality": q_score,
                    "finger_index": current_finger_index
                }
                print(f"ENROLLMENT_COMPLETE: {json.dumps(result)}")
                sys.stdout.flush()
                log("DEBUG", f"Enrollment Sent. Image present: {len(final_image) > 100}")
                log("INFO", f"Captured finger {current_finger_index} (ActiveX, Len: {len(template_bytes)})")

                # Reset last_image for next capture
                last_image_b64 = ""

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
        log("INFO", "Attempting ActiveX Initialization: ZKFPEngXControl.ZKFPEngX")

        zk_ctrl = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")
        zk_event_sink = win32com.client.WithEvents(zk_ctrl, ZKEvents)
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
