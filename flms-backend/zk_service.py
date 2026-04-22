import os
import sys
import ctypes
import base64
import time
import json
import threading

# --- CONFIGURATION ---
SDK_PATH = r'D:\Collage\spring 25 26 semster (Grad..)\Project\worker-management-system\ZKFingerSDK_Windows_Standard'
DLL_NAME = "libzkfp.dll"

# Global state
zkfp = None
h_device = None
h_db = None
terminate_flag = False

def log(prefix, message):
    print(f"[{prefix}] {message}")
    sys.stdout.flush()

def find_dll_recursive(directory, target_dll):
    """Recursively searches for the DLL in the directory and its subfolders."""
    for root, dirs, files in os.walk(directory):
        if target_dll in files:
            return os.path.join(root, target_dll)
    return None

def initialize_sdk():
    global zkfp
    log("STATUS", "32-bit Bridge Active")

    # 1. Debug: List directory content
    if os.path.exists(SDK_PATH):
        try:
            content = os.listdir(SDK_PATH)
            log("DEBUG", f"Contents of {SDK_PATH}: {content}")
        except Exception as e:
            log("ERROR", f"Failed to list SDK directory: {e}")
    else:
        log("ERROR", f"SDK Path NOT FOUND: {SDK_PATH}")

    # 2. Find and Add DLL Directory
    dll_full_path = None
    while not terminate_flag:
        dll_full_path = find_dll_recursive(SDK_PATH, DLL_NAME)
        if dll_full_path:
            log("INFO", f"Found DLL at: {dll_full_path}")
            dll_dir = os.path.dirname(dll_full_path)
            try:
                os.add_dll_directory(dll_dir)
                log("INFO", f"Added DLL directory to search path: {dll_dir}")
            except Exception as e:
                log("DEBUG", f"os.add_dll_directory failed (expected on some Python versions): {e}")
            break
        else:
            log("WAITING", f"DLL '{DLL_NAME}' not found in {SDK_PATH} (checked subfolders). Retrying...")
            time.sleep(3)

    # 3. Load DLL
    while not terminate_flag:
        try:
            zkfp = ctypes.WinDLL(dll_full_path)
            log("INFO", "DLL loaded successfully.")
            break
        except Exception as e:
            log("WAITING", f"Failed to load DLL from {dll_full_path}: {e}. Retrying...")
            time.sleep(3)

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
    # Typical sizes for ZK9500
    tid_size = 2048
    template_buffer = ctypes.create_string_buffer(tid_size)

    # In a real implementation, we'd get image width/height from parameters
    # For now, we assume standard ZK9500 (approx 256x360 or similar)
    img_buffer = ctypes.create_string_buffer(640 * 480)

    log("STATUS", "Ready for fingerprint capture")

    while not terminate_flag:
        try:
            # zkfp_AcquireFingerprint returns 0 on success
            # Parameters: handle, imgBuffer, templateBuffer, templateSize (pointer)
            t_size_ptr = ctypes.pointer(ctypes.c_int(tid_size))
            ret = zkfp.zkfp_AcquireFingerprint(h_device, img_buffer, template_buffer, t_size_ptr)

            if ret == 0:
                # Successfully captured
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

                # Small debounce
                time.sleep(1)
            elif ret == -1:
                # Internal error
                pass
            elif ret == -8:
                # Extraction failed
                log("FEEDBACK", "Poor image quality. Please try again.")
            else:
                # No finger or other code
                pass

        except Exception as e:
            log("ERROR", f"Capture error: {e}")
            time.sleep(1)

        time.sleep(0.1)

def listen_for_commands():
    global terminate_flag, current_finger_index
    # Listen for finger index changes from stdin
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
            # log("ERROR", f"Failed to parse command: {e}")
            pass

if __name__ == "__main__":
    try:
        # Start command listener in thread
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
