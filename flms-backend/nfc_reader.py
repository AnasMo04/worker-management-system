import sys
import time
from smartcard.System import readers
from smartcard.util import toHexString

def get_uid():
    """Listens for NFC card taps and prints the UID."""
    print("NFC Reader Started - Listening for cards...", flush=True)

    # Track the last seen UID to avoid duplicate triggers
    last_uid = None

    while True:
        try:
            r = readers()
            if not r:
                # No readers found
                time.sleep(1)
                continue

            reader = r[0]
            connection = reader.createConnection()

            try:
                connection.connect()

                # Get UID command (Get Data APDU for most ACS readers)
                # FF CA 00 00 00
                GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]
                data, sw1, sw2 = connection.transmit(GET_UID)

                if sw1 == 0x90 and sw2 == 0x00:
                    uid = toHexString(data).replace(" ", "")
                    if uid != last_uid:
                        # Print UID to stdout for the Node.js parent process
                        print(f"UID:{uid}", flush=True)
                        last_uid = uid

                # Small delay to prevent CPU hammering
                time.sleep(1)

            except Exception:
                # Card removed or error
                last_uid = None
                time.sleep(0.5)

        except KeyboardInterrupt:
            break
        except Exception as e:
            # Handle reader disconnection etc.
            time.sleep(1)

if __name__ == "__main__":
    get_uid()
