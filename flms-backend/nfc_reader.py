import sys
import time
try:
    from smartcard.System import readers
    from smartcard.util import toHexString
except ImportError:
    print("Error: pyscard library not found. Install with: pip install pyscard")
    sys.exit(1)

def get_nfc_uid():
    """Reads UID from ACS readers (ACR122U, etc)"""
    try:
        r = readers()
        if not r:
            print("No readers found")
            return None

        reader = r[0]
        connection = reader.createConnection()
        connection.connect()

        # Get UID APDU command
        GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]
        data, sw1, sw2 = connection.transmit(GET_UID)

        if sw1 == 0x90 and sw2 == 0x00:
            return toHexString(data).replace(" ", ":")
        return None
    except Exception as e:
        # Silently fail if no card is present
        return None

if __name__ == "__main__":
    last_uid = None
    while True:
        uid = get_nfc_uid()
        if uid and uid != last_uid:
            print(f"UID: {uid}")
            sys.stdout.flush()
            last_uid = uid
        elif not uid:
            last_uid = None

        time.sleep(0.5)
