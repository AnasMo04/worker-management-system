import os
import sys
import ctypes
import base64
import time
import json
import threading

# Global state
zkfp = None
zk_com = None
h_device = None
h_db = None
terminate_flag = False
current_finger_index = 0
mode = "enroll" # "enroll" or "identify"

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
                    zk_com.ExtractFeatures()
                except Exception as e:
                    log("DEBUG", f"ExtractFeatures failed: {e}")

                # 2. Capture and Emit Image
                temp_file = "temp_preview.bmp"
                zk_com.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", b64)
                    os.remove(temp_file)

                # 3. Capture and Emit Quality immediately
                try:
                    # Use GetCapParam(101) to fetch actual quality score after feature extraction
                    quality = zk_com.GetCapParam(101)
                    log("QUALITY", str(quality))
                except:
                    try:
                        quality = zk_com.ImageQuality
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
        global mode
        if ActionResult:
            template_bytes = bytes(ATemplate)
            template_b64 = base64.b64encode(template_bytes).decode('utf-8')

            if mode == "enroll":
                # Synthetic Quality Score based on template length
                # User requested: > 400 bytes -> 85%
                q_score = 0
                t_len = len(template_bytes)
                if t_len > 400:
                    q_score = 85
                elif t_len > 0:
                    q_score = 70

                log("QUALITY", str(q_score))

                result = { "index": current_finger_index, "template": template_b64 }
                print(f"ENROLLMENT: {json.dumps(result)}")
                sys.stdout.flush()
                log("INFO", f"Captured finger {current_finger_index} (ActiveX, Len: {t_len})")

            elif mode == "identify":
                # Identification logic
                # For ActiveX, IdentificationFromStr returns ID or -1
                # Ensure templates were loaded first
                try:
                    matched_id = zk_com.IdentificationFromStr(template_b64)
                    if matched_id > 0:
                        log("IDENTIFIED", str(matched_id))
                    else:
                        log("FEEDBACK", "No match found")
                except Exception as e:
                    log("ERROR", f"Identification failed: {e}")

def initialize_activex():
    global zk_com
    try:
        import win32com.client
        log("INFO", "Attempting ActiveX Dispatch: ZKFPEngXControl.ZKFPEngX")
        zk_com = win32com.client.DispatchWithEvents("ZKFPEngXControl.ZKFPEngX", ZKEvents)

        ret = zk_com.InitEngine()
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
    global h_device, h_db, zk_com, zkfp
    if zk_com:
        while not terminate_flag:
            try:
                if zk_com.SensorCount > 0:
                    zk_com.BeginCapture()
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
    global h_device, terminate_flag, current_finger_index, zk_com, zkfp, mode

    log("STATUS", "Ready for fingerprint capture")

    if zk_com:
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
    global terminate_flag, current_finger_index, mode, zk_com
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
                if zk_com:
                    # Clear existing and load new
                    zk_com.AddRegTemplateStr(0, "") # Usually 0 is a reset in some versions or we loop
                    log("INFO", f"Loading {len(templates)} templates for identification...")
                    count = 0
                    for item in templates:
                        try:
                            # AddRegTemplateStr(ID, Template)
                            zk_com.AddRegTemplateStr(item["id"], item["template"])
                            count += 1
                        except:
                            pass
                    log("INFO", f"Successfully loaded {count} templates.")
        except Exception as e:
            # log("ERROR", f"Command error: {e}")
            pass

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
        if h_device and zkfp:
            try:
                close_fn = zkfp.zkfp_CloseDevice if hasattr(zkfp, 'zkfp_CloseDevice') else zkfp.ZKFPM_CloseDevice
                term_fn = zkfp.zkfp_Terminate if hasattr(zkfp, 'zkfp_Terminate') else zkfp.ZKFPM_Terminate
                close_fn(h_device)
                term_fn()
            except:
                pass
        log("INFO", "Shutdown complete")
