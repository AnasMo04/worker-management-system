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

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

def initialize_activex():
    """Attempts to initialize the sensor via ActiveX (win32com)."""
    global zk_com
    try:
        import win32com.client
        log("INFO", "Attempting ActiveX Dispatch: ZKFPEngXControl.ZKFPEngX")
        zk_com = win32com.client.Dispatch("ZKFPEngXControl.ZKFPEngX")

        # Initialize ActiveX component
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
    """Fallback to direct DLL loading if ActiveX fails."""
    global zkfp
    DLL_NAME = "libzkfp.dll"
    while not terminate_flag:
        try:
            log("INFO", f"Falling back to DLL load: {DLL_NAME}")
            zkfp = ctypes.WinDLL(DLL_NAME)

            # Check for ZKFPM_Init (typical in newer SDK versions)
            if hasattr(zkfp, 'ZKFPM_Init'):
                log("INFO", "Detected ZKFPM_Init (V5.3+)")
                ret = zkfp.ZKFPM_Init()
            else:
                log("INFO", "Detected zkfp_Init (Standard)")
                ret = zkfp.zkfp_Init()

            if ret == 0:
                log("STATUS", "DLL Bridge Ready")
                return True
            else:
                log("WAITING", f"DLL Initialization failed (Code: {ret})")
        except FileNotFoundError:
            log("WAITING", "libzkfp.dll not found in system path. Please ensure ZKTeco drivers are installed.")
        except Exception as e:
            log("WAITING", f"DLL Bridge failed: {e}")

        time.sleep(5)
    return False

def open_device():
    global h_device, h_db, zk_com, zkfp

    if zk_com:
        # ActiveX handling
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
        # DLL handling
        while not terminate_flag:
            try:
                count = zkfp.zkfp_GetDeviceCount() if hasattr(zkfp, 'zkfp_GetDeviceCount') else zkfp.ZKFPM_GetDeviceCount()
                if count > 0:
                    h_device = zkfp.zkfp_OpenDevice(0) if hasattr(zkfp, 'zkfp_OpenDevice') else zkfp.ZKFPM_OpenDevice(0)
                    if h_device:
                        log("INFO", "DLL: Device opened successfully.")
                        h_db = zkfp.zkfp_DBInit() if hasattr(zkfp, 'zkfp_DBInit') else zkfp.ZKFPM_DBInit()
                        return True
                    else:
                        log("WAITING", "DLL: Failed to open device.")
                else:
                    log("WAITING", "DLL: Device not found.")
            except Exception as e:
                log("ERROR", f"DLL open error: {e}")
            time.sleep(3)

    return False

def capture_loop():
    global h_device, terminate_flag, current_finger_index, zk_com, zkfp

    log("STATUS", "Ready for fingerprint capture")

    if zk_com:
        # ActiveX Capture Logic
        # In ActiveX, we usually handle events, but for a simple bridge, we can poll
        while not terminate_flag:
            try:
                # ZK ActiveX typically emits an OnCapture event.
                # If polling is needed, we'd check specific properties,
                # but often with COM in a script, we use a loop with pump_messages or similar.
                # For this bridge, we'll try to get the LastTemplate if available or use a small delay.
                # Note: Real ActiveX usage in Python usually requires a message pump.
                import pythoncom
                pythoncom.PumpWaitingMessages()

                # If the component provides a way to get the template synchronously:
                # template = zk_com.LastTemplate
                # if template: ...

                time.sleep(0.1)
            except Exception as e:
                log("ERROR", f"ActiveX Capture Error: {e}")
                time.sleep(1)

    elif zkfp:
        # Standard DLL Capture Logic
        tid_size = 2048
        template_buffer = ctypes.create_string_buffer(tid_size)
        img_buffer = ctypes.create_string_buffer(640 * 480)

        while not terminate_flag:
            try:
                t_size_ptr = ctypes.pointer(ctypes.c_int(tid_size))
                # Support both naming conventions
                acquire_fn = zkfp.zkfp_AcquireFingerprint if hasattr(zkfp, 'zkfp_AcquireFingerprint') else zkfp.ZKFPM_AcquireFingerprint
                ret = acquire_fn(h_device, img_buffer, template_buffer, t_size_ptr)

                if ret == 0:
                    actual_size = t_size_ptr.contents.value
                    template_data = template_buffer.raw[:actual_size]
                    template_b64 = base64.b64encode(template_data).decode('utf-8')

                    result = { "index": current_finger_index, "template": template_b64 }
                    print(f"ENROLLMENT: {json.dumps(result)}")
                    sys.stdout.flush()
                    log("INFO", f"Captured finger {current_finger_index}")
                    time.sleep(1)
                elif ret == -8:
                    log("FEEDBACK", "Poor image quality. Please try again.")
            except Exception as e:
                log("ERROR", f"DLL Capture error: {e}")
                time.sleep(1)
            time.sleep(0.1)

def listen_for_commands():
    global terminate_flag, current_finger_index
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
        except:
            pass

if __name__ == "__main__":
    try:
        log("STATUS", "32-bit Bridge Active")

        cmd_thread = threading.Thread(target=listen_for_commands, daemon=True)
        cmd_thread.start()

        # Try ActiveX first, then fallback to DLL
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
