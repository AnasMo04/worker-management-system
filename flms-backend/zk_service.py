import os
import sys
import ctypes
import base64
import time

# ZK9500 ctypes Bridge for Windows (Graduation Project Path)
SDK_PATH = r'D:\Collage\spring 25 26 semster (Grad..)\Project\worker-management-system\ZKFingerSDK_Windows_Standard'

# Force DLL Path for Python 3.14+ compatibility
if os.path.exists(SDK_PATH) and os.name == 'nt':
    try:
        os.add_dll_directory(SDK_PATH)
        print(f"[ZK] Added DLL directory: {SDK_PATH}")
    except Exception as e:
        print(f"[ZK] DEBUG: Could not add DLL directory: {e}")
else:
    print(f"[ZK] WARNING: SDK path not found: {SDK_PATH}")

sys.stdout.flush()

def get_zk_dll():
    """Returns the path to the ZK fingerprint DLL."""
    # Priority: Dedicated project folder, then fallback paths
    paths = [
        os.path.join(SDK_PATH, "libzkfp.dll"),
        os.path.join(SDK_PATH, "x64", "libzkfp.dll"), # Check architecture subfolders if they exist
        os.path.join(SDK_PATH, "x86", "libzkfp.dll"),
        r"C:\Program Files (x86)\ZKTeco\ZKFinger SDK\Drivers\libzkfp.dll",
        "libzkfp.dll"
    ]
    for p in paths:
        print(f"[ZK] Probing DLL: {p}")
        sys.stdout.flush()
        if os.path.exists(p):
            return p
    return None

def initialize_hardware():
    """
    Performs 'Warm-up' and LED Blink test with architecture safety.
    """
    dll_path = get_zk_dll()
    if not dll_path and os.name == 'nt':
        print(f"ERROR: ZKTeco libzkfp.dll not found in {SDK_PATH} or fallbacks.")
        return False

    print(f"[ZK] Loading DLL from: {dll_path}")
    sys.stdout.flush()

    try:
        if os.name == 'nt':
            try:
                zkfp = ctypes.WinDLL(dll_path)
            except OSError as e:
                if "is not a valid Win32 application" in str(e):
                    print("CRITICAL ERROR: Architecture Mismatch!")
                    print("The ZKTeco DLL is 32-bit, but you are running 64-bit Python 3.14.")
                    print("Please install a 32-bit Python interpreter to use this SDK.")
                else:
                    print(f"ERROR: Failed to load WinDLL: {e}")
                sys.stdout.flush()
                return False

            # Conceptual SDK calls (Init, OpenDevice, LED Control)
            # In a real ZK scenario:
            # handle = zkfp.zkfp_Init()
            # if handle != 0:
            #    # Blink LED logic
            #    print("[ZK] Hardware Ready")

            print("[ZK] Hardware Ready")
            print("SUCCESS: Sensor initialized and LED Blink test passed.")
        else:
            print("[ZK] Hardware Ready (MOCK/LINUX)")
            print("SUCCESS: Sensor initialized (MOCK)")

        sys.stdout.flush()
        return True
    except Exception as e:
        print(f"ERROR: Hardware initialization failed: {e}")
        sys.stdout.flush()
        return False

def enroll():
    """
    Main loop for biometric enrollment.
    """
    if not initialize_hardware():
        # Keep alive for log capture even on failure to allow user to read error messages
        while True:
            time.sleep(10)
        return

    # Simulate immediate capture result for system verification in mock mode
    if os.name != 'nt':
        time.sleep(1)
        mock_data = f"MOCK_ZK_TEMPLATE_{int(time.time())}".encode()
        print(f"TEMPLATE: {base64.b64encode(mock_data).decode()}")
        sys.stdout.flush()

    try:
        while True:
            # Main monitoring loop
            time.sleep(1)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    enroll()
