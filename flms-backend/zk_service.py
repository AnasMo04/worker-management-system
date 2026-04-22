import os
import sys
import ctypes
import base64
import time
import json
import threading
import io

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

def create_bmp_base64(raw_pixels, width, height):
    """Wraps raw grayscale pixels into a basic BMP format and returns Base64."""
    try:
        # BMP File Header (14 bytes)
        # BFType (2), BFSize (4), BFReserved1 (2), BFReserved2 (2), BFOffBits (4)
        file_size = 14 + 40 + 1024 + (width * height)
        bmp_header = bytearray([0x42, 0x4D]) # 'BM'
        bmp_header += file_size.to_bytes(4, 'little')
        bmp_header += (0).to_bytes(4, 'little')
        bmp_header += (14 + 40 + 1024).to_bytes(4, 'little')

        # BMP Info Header (40 bytes)
        # BiSize (4), Width (4), Height (4), BiPlanes (2), BiBitCount (2), BiCompression (4), ...
        info_header = (40).to_bytes(4, 'little')
        info_header += width.to_bytes(4, 'little')
        info_header += height.to_bytes(4, 'little')
        info_header += (1).to_bytes(2, 'little') # 1 plane
        info_header += (8).to_bytes(2, 'little') # 8 bits per pixel
        info_header += (0).to_bytes(4, 'little') # No compression
        info_header += (width * height).to_bytes(4, 'little')
        info_header += (0).to_bytes(4, 'little') * 4

        # Grayscale Color Palette (1024 bytes)
        palette = bytearray()
        for i in range(256):
            palette += bytearray([i, i, i, 0])

        bmp_data = bmp_header + info_header + palette + raw_pixels
        return base64.b64encode(bmp_data).decode('utf-8')
    except Exception as e:
        log("ERROR", f"BMP Creation failed: {e}")
        return ""

class ZKEvents:
    """Event Sink for ZK ActiveX Component."""
    def OnImageReceived(self, AImageValid):
        if AImageValid:
            try:
                # 1. Capture and Emit Image
                temp_file = "temp_preview.bmp"
                zk_com.SaveBitmap(temp_file)
                if os.path.exists(temp_file):
                    with open(temp_file, "rb") as f:
                        b64 = base64.b64encode(f.read()).decode('utf-8')
                        log("IMAGE_DATA", b64)
                    os.remove(temp_file)

                # 2. Capture and Emit Quality immediately
                try:
                    # Use GetCapParam(101) to fetch actual quality score
                    quality = zk_com.GetCapParam(101)
                    log("QUALITY", str(quality))
                except:
                    # Fallback to property
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
        if ActionResult:
            # ATemplate is the fingerprint data
            # Convert to string if it's a memory view or bytes
            template_b64 = base64.b64encode(bytes(ATemplate)).decode('utf-8')
            result = { "index": current_finger_index, "template": template_b64 }
            print(f"ENROLLMENT: {json.dumps(result)}")
            sys.stdout.flush()
            log("INFO", f"Captured finger {current_finger_index} (ActiveX)")

    def OnHIDCardRead(self, ACardSN):
        # ACardSN is the Serial Number of the NFC/HID Card
        log("CARD_SCANNED", str(ACardSN))

    def OnCardPoweredOn(self, ATR):
        log("INFO", f"NFC Card Powered On. ATR: {ATR}")

def initialize_activex():
    global zk_com
    try:
        import win32com.client
        log("INFO", "Attempting ActiveX Dispatch: ZKFPEngXControl.ZKFPEngX")
        # Use WithEvents to catch OnImageReceived and OnFeatureInfo
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
    global h_device, terminate_flag, current_finger_index, zk_com, zkfp

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
        # ZK9500 default: 256x360
        w, h = 256, 360
        img_buffer = ctypes.create_string_buffer(w * h)

        while not terminate_flag:
            try:
                t_size_ptr = ctypes.pointer(ctypes.c_int(tid_size))
                acquire_fn = zkfp.zkfp_AcquireFingerprint if hasattr(zkfp, 'zkfp_AcquireFingerprint') else zkfp.ZKFPM_AcquireFingerprint
                ret = acquire_fn(h_device, img_buffer, template_buffer, t_size_ptr)

                if ret == 0:
                    # Quality Check in DLL mode
                    # Note: DLL mode quality check usually requires zkfp_ExtractTemplate or similar
                    # For simplicity, we'll use a mock quality for now or rely on hardware code
                    log("QUALITY", "75") # Mock quality for DLL for now

                    actual_size = t_size_ptr.contents.value
                    template_data = template_buffer.raw[:actual_size]
                    template_b64 = base64.b64encode(template_data).decode('utf-8')

                    # Image Preview
                    img_b64 = create_bmp_base64(img_buffer.raw, w, h)
                    if img_b64:
                        log("IMAGE_DATA", img_b64)

                    result = { "index": current_finger_index, "template": template_b64 }
                    print(f"ENROLLMENT: {json.dumps(result)}")
                    sys.stdout.flush()
                    log("INFO", f"Captured finger {current_finger_index} (DLL)")
                    time.sleep(1)
                elif ret == -8:
                    log("FEEDBACK", "Poor image quality. Please try again.")
                    log("QUALITY", "20")
            except Exception as e:
                log("ERROR", f"DLL Capture error: {e}")
                time.sleep(1)
            time.sleep(0.05)

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
