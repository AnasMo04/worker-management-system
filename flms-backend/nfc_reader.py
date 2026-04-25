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
            # print("No readers found")
            return None

        # Filter for ACS readers specifically to avoid trying to use ZK9500 as a card reader
        acs_reader = None
        for reader in r:
            if "ACS" in str(reader) or "ACR122" in str(reader):
                acs_reader = reader
                break

        if not acs_reader:
            return None

        connection = acs_reader.createConnection()
        # Explicitly handle 'Card holder busy' or 'Reader busy' exceptions
        try:
            connection.connect()
        except Exception as e:
            if "Card holder busy" in str(e) or "Reader busy" in str(e):
                return None
            raise e

        # Get UID APDU command
        GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]
        data, sw1, sw2 = connection.transmit(GET_UID)

        if sw1 == 0x90 and sw2 == 0x00:
            # Convert byte array to a single large integer (Decimal string)
            # as requested for frontend compatibility.
            return str(int.from_bytes(bytes(data), byteorder='big'))
        return None
    except Exception as e:
        # Silently fail if no card is present or busy
        return None

if __name__ == "__main__":
    print("[NFC] Service Starting")
    sys.stdout.flush()
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
