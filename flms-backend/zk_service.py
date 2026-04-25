import os
import sys
import ctypes
import base64
import time
import json
import threading

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
last_identify_time = 0

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

class ZKEvents:
    """Event Sink for ZK ActiveX Component."""
    def OnImageReceived(self, AImageValid):
        if AImageValid:
            try:
                # 1. Extract Features FIRST to allow quality calculation
                try:
                    self.zk_ctrl.ExtractFeatures()
                except Exception as e:
                    log("DEBUG", f"ExtractFeatures failed: {e}")

                # 2. Capture and Emit Image
                temp_file = "temp_preview.bmp"
                self.zk_ctrl.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", b64)
                    os.remove(temp_file)

                # 3. Capture and Emit Quality immediately
                try:
                    quality = self.zk_ctrl.GetCapParam(101)
                    log("QUALITY", str(quality))
                except:
                    try:
                        quality = self.zk_ctrl.ImageQuality
                        log("QUALITY", str(quality))
                    except:
                        pass
            except Exception as e:
                log("DEBUG", f"ActiveX Image Capture Error: {e}")

    def OnFeatureInfo(self, AQuality):
        log("QUALITY", str(AQuality))
        if AQuality < 50:
            log("FEEDBACK", "Poor quality, please try again")

    def OnCapture(self, ActionResult, ATemplate):
        global mode, last_identify_time, current_finger_index, stored_templates
        if ActionResult:
            template_bytes = bytes(ATemplate)
            template_b64 = base64.b64encode(template_bytes).decode('utf-8')

            if mode == "enroll":
                # Synthetic Quality Score based on template length
                q_score = 0
                t_len = len(template_bytes)
                if t_len > 400:
                    q_score = 85
                elif t_len > 0:
                    q_score = 70

                log("QUALITY", str(q_score))

                # Capture Image for Enrollment
                enroll_image = ""
                temp_file = "enroll_temp.bmp"
                try:
                    self.zk_ctrl.SaveBitmap(temp_file)
                    if os.path.exists(temp_file):
                        with open(temp_file, "rb") as f:
                            enroll_image = base64.b64encode(f.read()).decode('utf-8')
                        os.remove(temp_file)
                except Exception as e:
                    log("DEBUG", f"Enrollment image capture failed: {e}")

                result = {
                    "template": template_b64,
                    "image": enroll_image,
                    "quality": q_score,
                    "finger_index": current_finger_index
                }
                print(f"ENROLLMENT_COMPLETE: {json.dumps(result)}")
                sys.stdout.flush()
                log("INFO", f"Captured finger {current_finger_index} (ActiveX, Len: {t_len})")

            elif mode == "identify":
                # Manual 1:1 Identification Loop
                now = time.time()
                if now - last_identify_time < 2:
                    return
                last_identify_time = now

                if not stored_templates:
                    log("FEEDBACK", "No templates loaded for search.")
                    return

                log("INFO", f"Starting manual 1:1 matching against {len(stored_templates)} records...")
                match_found = False

                for item in stored_templates:
                    reg_template = item.get("template")
                    if not reg_template:
                        continue

                    try:
                        # Cast both to string and strip
                        t1 = str(template_b64).strip()
                        t2 = str(reg_template).strip()

                        # VerFingerFromStr(Template1, Template2) returns score (e.g. 0-100)
                        # Threshold 10 as requested
                        score = self.zk_ctrl.VerFingerFromStr(t1, t2)
                        log('DEBUG', f"ID {item['id']} Score: {score}")

                        if score > 10:
                            log("IDENTIFIED", str(item["id"]))
                            match_found = True
                            break
                    except Exception as e:
                        log("DEBUG", f"Match failed for ID {item['id']}: {e}")

                if not match_found:
                    log("FEEDBACK", "No match found")

def clean_com_cache():
    """Clears the gen_py folder to force a fresh COM mapping."""
    import shutil
    temp_dir = os.environ.get('TEMP')
    if temp_dir:
        gen_py_path = os.path.join(temp_dir, 'gen_py')
        if os.path.exists(gen_py_path):
            try:
                log("INFO", f"Cleaning COM cache: {gen_py_path}")
                shutil.rmtree(gen_py_path)
            except Exception as e:
                log("DEBUG", f"Could not clean COM cache: {e}")

def initialize_activex():
    global zk_ctrl, zk_event_sink
    try:
        import win32com.client
        log("INFO", "Attempting ActiveX Dispatch + WithEvents separation: ZKFPEngXControl.ZKFPEngX")

        # 1. Create the main Dispatch object (for methods)
        zk_ctrl = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")

        # 2. Bind Events to a separate handler
        zk_event_sink = win32com.client.WithEvents(zk_ctrl, ZKEvents)

        # Mandatory: Pass reference to event sink
        zk_event_sink.zk_ctrl = zk_ctrl

        # 3. Use Dispatch object for initialization
        ret = zk_ctrl.InitEngine()
        if ret == 0:
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
            if hasattr(zkfp, 'ZKFPM_Init'):
                ret = zkfp.ZKFPM_Init()
            else:
                ret = zkfp.zkfp_Init()

            if ret == 0:
                log("STATUS", "DLL Bridge Ready")
                return True
            else:
                log("WAITING", f"DLL Initialization failed (Code: {ret})")
        except FileNotFoundError:
            log("WAITING", "libzkfp.dll not found in system path.")
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
                count = zkfp.zkfp_GetDeviceCount() if hasattr(zkfp, 'zkfp_GetDeviceCount') else zkfp.ZKFPM_GetDeviceCount()
                if count > 0:
                    h_device = zkfp.zkfp_OpenDevice(0) if hasattr(zkfp, 'zkfp_OpenDevice') else zkfp.ZKFPM_OpenDevice(0)
                    if h_device:
                        log("INFO", "DLL: Device opened successfully.")
                        h_db = zkfp.zkfp_DBInit() if hasattr(zkfp, 'zkfp_DBInit') else zkfp.ZKFPM_DBInit()
                        return True
            except Exception as e:
                log("ERROR", f"DLL open error: {e}")
            time.sleep(3)
    return False

def capture_loop():
    global h_device, terminate_flag, current_finger_index, zk_ctrl, zkfp, mode

    log("STATUS", "Ready for fingerprint capture")

    if zk_ctrl:
        import pythoncom
        while not terminate_flag:
            try:
                pythoncom.PumpWaitingMessages()
                time.sleep(0.05)
            except Exception as e:
                log("ERROR", f"ActiveX Loop Error: {e}")
                time.sleep(1)
    elif zkfp:
        tid_size = 2048
        template_buffer = ctypes.create_string_buffer(tid_size)
        w, h = 256, 360
        img_buffer = ctypes.create_string_buffer(w * h)

        while not terminate_flag:
            try:
                t_size_ptr = ctypes.pointer(ctypes.c_int(tid_size))
                acquire_fn = zkfp.zkfp_AcquireFingerprint if hasattr(zkfp, 'zkfp_AcquireFingerprint') else zkfp.ZKFPM_AcquireFingerprint
                ret = acquire_fn(h_device, img_buffer, template_buffer, t_size_ptr)

                if ret == 0:
                    actual_size = t_size_ptr.contents.value
                    template_data = template_buffer.raw[:actual_size]
                    template_b64 = base64.b64encode(template_data).decode('utf-8')

                    if mode == "enroll":
                        result = { "index": current_finger_index, "template": template_b64 }
                        print(f"ENROLLMENT: {json.dumps(result)}")
                        sys.stdout.flush()
                        log("INFO", f"Captured finger {current_finger_index} (DLL)")

                    elif mode == "identify":
                        # DLL 1:N matching usually requires DB manipulation (zkfp_DBAdd, zkfp_DBIdentify)
                        # For now, we'll suggest using ActiveX for hardware-assisted identification
                        log("FEEDBACK", "Identify mode requires ActiveX bridge for ZK8500R")

                    time.sleep(1)
                elif ret == -8:
                    log("FEEDBACK", "Poor image quality. Please try again.")
            except Exception as e:
                log("ERROR", f"DLL Capture error: {e}")
                time.sleep(1)
            time.sleep(0.05)

def listen_for_commands():
    global terminate_flag, current_finger_index, mode, zk_ctrl
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
                templates = data.get("templates", []) # [{ "id": 1, "template": "..." }]
                global stored_templates
                stored_templates = templates
                log("INFO", f"Backend stored {len(stored_templates)} templates for manual matching.")
        except Exception as e:
            # log("ERROR", f"Command error: {e}")
            pass

if __name__ == "__main__":
    try:
        log("STATUS", "32-bit Bridge Active")
        clean_com_cache()
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
        if h_device and zkfp:
            try:
                close_fn = zkfp.zkfp_CloseDevice if hasattr(zkfp, 'zkfp_CloseDevice') else zkfp.ZKFPM_CloseDevice
                term_fn = zkfp.zkfp_Terminate if hasattr(zkfp, 'zkfp_Terminate') else zkfp.ZKFPM_Terminate
                close_fn(h_device)
                term_fn()
            except:
                pass
        log("INFO", "Shutdown complete")
