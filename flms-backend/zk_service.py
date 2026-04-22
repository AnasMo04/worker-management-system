import os
import sys
import ctypes
import base64
import time
import json
import threading

# --- CONFIGURATION ---
DLL_NAME = "libzkfp.dll"

# Global state
zkfp = None
h_device = None
h_db = None
terminate_flag = False

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

def initialize_sdk():
    global zkfp
    log("STATUS", "32-bit Bridge Active")

    # 1. Debug: Print PATH environment variable
    log("DEBUG", f"System PATH: {os.environ.get('PATH', '')}")

    # 2. Load DLL using Windows search paths (System32, SysWOW64, etc.)
    # The user confirmed the Demo works, so the DLL should be in a standard path.
    while not terminate_flag:
        try:
            log("INFO", f"Attempting to load {DLL_NAME} from system paths...")
            zkfp = ctypes.WinDLL(DLL_NAME)
            log("INFO", "DLL loaded successfully from system path.")
            break
        except FileNotFoundError:
            log("WAITING", f"CRITICAL: {DLL_NAME} not found. Please ensure ZKTeco drivers are installed and the DLL is in System32/SysWOW64.")
            time.sleep(5)
        except Exception as e:
            log("WAITING", f"Failed to load DLL: {e}. Retrying...")
            time.sleep(5)

    # 3. Initialize Library
    while not terminate_flag:
        try:
            ret = zkfp.zkfp_Init()
            if ret == 0:
                log("INFO", "Library initialized successfully.")
                break
            else:
                log("WAITING", f"Library initialization failed (Code: {ret}). Retrying...")
        except Exception as e:
            log("ERROR", f"Exception during Init: {e}")
        time.sleep(3)

def open_device():
    global h_device, h_db
    while not terminate_flag:
        try:
            count = zkfp.zkfp_GetDeviceCount()
            if count > 0:
                h_device = zkfp.zkfp_OpenDevice(0)
                if h_device:
                    log("INFO", "Device opened successfully.")
                    # Initialize DB handle
                    h_db = zkfp.zkfp_DBInit()
                    break
                else:
                    log("WAITING", "Failed to open device. Retrying...")
            else:
                log("WAITING", "Device not found, retrying...")
        except Exception as e:
            log("ERROR", f"Exception opening device: {e}")
        time.sleep(3)

# Shared variable for current finger index
current_finger_index = 0

def capture_loop():
    global h_device, terminate_flag, current_finger_index

    # Prepare buffers
    tid_size = 2048
    template_buffer = ctypes.create_string_buffer(tid_size)
    img_buffer = ctypes.create_string_buffer(640 * 480)

    log("STATUS", "Ready for fingerprint capture")

    while not terminate_flag:
        try:
            t_size_ptr = ctypes.pointer(ctypes.c_int(tid_size))
            ret = zkfp.zkfp_AcquireFingerprint(h_device, img_buffer, template_buffer, t_size_ptr)

            if ret == 0:
                actual_size = t_size_ptr.contents.value
                template_data = template_buffer.raw[:actual_size]
                template_b64 = base64.b64encode(template_data).decode('utf-8')

                result = {
                    "index": current_finger_index,
                    "template": template_b64
                }
                print(f"ENROLLMENT: {json.dumps(result)}")
                sys.stdout.flush()
                log("INFO", f"Captured finger {current_finger_index}")

                time.sleep(1)
            elif ret == -8:
                log("FEEDBACK", "Poor image quality. Please try again.")
            else:
                pass

        except Exception as e:
            log("ERROR", f"Capture error: {e}")
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
        except Exception as e:
            pass

if __name__ == "__main__":
    try:
        cmd_thread = threading.Thread(target=listen_for_commands, daemon=True)
        cmd_thread.start()

        initialize_sdk()
        open_device()
        capture_loop()
    except KeyboardInterrupt:
        log("INFO", "Terminating...")
    finally:
        terminate_flag = True
        if h_device:
            try:
                zkfp.zkfp_CloseDevice(h_device)
                zkfp.zkfp_Terminate()
            except:
                pass
        log("INFO", "Shutdown complete")
