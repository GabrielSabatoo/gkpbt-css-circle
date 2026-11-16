"""Settings, read from environment variables (or a .env file next to the project)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    env_file = BASE_DIR / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()

# AI
MODEL = os.environ.get("MIRROR_MODEL", "claude-opus-5-5")
EFFORT = os.environ.get("MIRROR_EFFORT", "low")  # low = faster answers in front of the mirror
LANGUAGE = os.environ.get("MIRROR_LANGUAGE", "Brazilian Portuguese")
# DEMO_MODE returns canned answers so you can build the UI without an API key.
DEMO_MODE = os.environ.get("MIRROR_DEMO", "0") == "1"

# Location for the weather (default: São Paulo). Find yours on maps: right-click > coordinates.
LATITUDE = float(os.environ.get("MIRROR_LAT", "-23.55"))
LONGITUDE = float(os.environ.get("MIRROR_LON", "-46.63"))
TIMEZONE = os.environ.get("MIRROR_TZ", "America/Sao_Paulo")

# Camera: "auto" tries the Pi camera, then a USB webcam, then a test image.
CAMERA = os.environ.get("MIRROR_CAMERA", "auto")  # auto | picamera | usb | file
TEST_IMAGE = Path(os.environ.get("MIRROR_TEST_IMAGE", BASE_DIR / "sample.jpg"))
# The camera is usually mounted sideways behind a portrait mirror.
CAMERA_ROTATE = int(os.environ.get("MIRROR_CAMERA_ROTATE", "0"))

# Optional physical button on a Raspberry Pi GPIO pin (BCM numbering). 0 = disabled.
BUTTON_PIN = int(os.environ.get("MIRROR_BUTTON_PIN", "0"))

# Wardrobe storage
DATA_DIR = Path(os.environ.get("MIRROR_DATA_DIR", BASE_DIR / "data"))
WARDROBE_FILE = DATA_DIR / "wardrobe.json"
WARDROBE_IMAGES = DATA_DIR / "wardrobe_images"

HOST = os.environ.get("MIRROR_HOST", "0.0.0.0")  # 0.0.0.0 lets your phone reach the wardrobe page
PORT = int(os.environ.get("MIRROR_PORT", "8080"))
