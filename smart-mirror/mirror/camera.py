"""Takes one photo and returns it as JPEG bytes. Nothing is written to disk."""
import io
import logging

from PIL import Image, ImageOps

from . import config

log = logging.getLogger(__name__)
MAX_SIDE = 1280  # smaller images = faster, cheaper AI calls; enough detail for clothes


def shrink(jpeg: bytes, rotate: bool = True) -> bytes:
    """Resize to MAX_SIDE and re-encode as JPEG. `rotate` applies the mirror camera's rotation."""
    img = ImageOps.exif_transpose(Image.open(io.BytesIO(jpeg))).convert("RGB")  # phone photos
    if rotate and config.CAMERA_ROTATE:
        img = img.rotate(-config.CAMERA_ROTATE, expand=True)
    img.thumbnail((MAX_SIDE, MAX_SIDE))
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=85)
    return out.getvalue()


def _from_picamera() -> bytes:
    from picamera2 import Picamera2  # installed on Raspberry Pi OS

    cam = Picamera2()
    try:
        cam.configure(cam.create_still_configuration())
        cam.start()
        buf = io.BytesIO()
        cam.capture_file(buf, format="jpeg")
        return buf.getvalue()
    finally:
        cam.close()


def _from_usb() -> bytes:
    import cv2

    cap = cv2.VideoCapture(0)
    try:
        for _ in range(5):  # let auto-exposure settle
            cap.read()
        ok, frame = cap.read()
        if not ok:
            raise RuntimeError("USB camera returned no frame")
        ok, jpeg = cv2.imencode(".jpg", frame)
        return jpeg.tobytes()
    finally:
        cap.release()


def _from_file() -> bytes:
    if not config.TEST_IMAGE.exists():
        raise RuntimeError(
            f"No camera found and no test image at {config.TEST_IMAGE}. "
            "Put a full-body photo there or set MIRROR_TEST_IMAGE."
        )
    return config.TEST_IMAGE.read_bytes()


SOURCES = {"picamera": _from_picamera, "usb": _from_usb, "file": _from_file}


def capture() -> bytes:
    order = [config.CAMERA] if config.CAMERA != "auto" else ["picamera", "usb", "file"]
    errors = []
    for name in order:
        try:
            return shrink(SOURCES[name]())
        except Exception as exc:  # try the next source
            errors.append(f"{name}: {exc}")
            log.debug("camera source %s failed: %s", name, exc)
    raise RuntimeError("Could not take a photo. " + " | ".join(errors))
