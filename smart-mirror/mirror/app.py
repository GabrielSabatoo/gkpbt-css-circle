"""Web server: the mirror screen (/) and the wardrobe manager for your phone (/wardrobe).

Run with:  python -m mirror.app
"""
import logging
import threading

from flask import Flask, abort, jsonify, render_template, request, send_from_directory

from . import ai, camera, config, wardrobe, weather

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("mirror")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024  # phone photos

_busy = threading.Lock()  # one AI request at a time
_button = {"presses": 0}  # the mirror page polls this to react to the physical button


def _weather():
    try:
        return weather.today()
    except Exception as exc:
        log.warning("weather unavailable: %s", exc)
        return None


def _items_by_id(ids):
    by_id = {i["id"]: i for i in wardrobe.all_items()}
    return [by_id[i] for i in ids if i in by_id]


def _run_ai(job):
    if not _busy.acquire(blocking=False):
        return jsonify(error="Já estou analisando, um momento..."), 429
    try:
        return jsonify(job())
    except ai.AIError as exc:
        return jsonify(error=str(exc)), 502
    except RuntimeError as exc:  # camera problems
        return jsonify(error=str(exc)), 500
    finally:
        _busy.release()


# ---------- pages ----------

@app.get("/")
def mirror_page():
    return render_template("mirror.html")


@app.get("/wardrobe")
def wardrobe_page():
    return render_template("wardrobe.html")


@app.get("/wardrobe-images/<item_id>.jpg")
def wardrobe_image(item_id):
    return send_from_directory(config.WARDROBE_IMAGES, f"{item_id}.jpg")


# ---------- mirror API ----------

@app.get("/api/status")
def status():
    return jsonify(weather=_weather(), button_presses=_button["presses"], demo=config.DEMO_MODE)


@app.post("/api/check")
def check():
    occasion = (request.get_json(silent=True) or {}).get("occasion", "")

    def job():
        photo = camera.capture()  # kept in memory only, never saved
        items = wardrobe.all_items()
        result = ai.check_outfit(photo, weather.describe(_weather()), occasion, wardrobe.as_prompt_text(items))
        result["swap_items"] = _items_by_id(result.get("swap_item_ids", []))
        return result

    return _run_ai(job)


@app.post("/api/suggest")
def suggest():
    occasion = (request.get_json(silent=True) or {}).get("occasion", "")

    def job():
        items = wardrobe.all_items()
        result = ai.suggest_outfit(weather.describe(_weather()), occasion, wardrobe.as_prompt_text(items))
        result["items"] = _items_by_id(result.get("item_ids", []))
        result["alternative_items"] = _items_by_id(result.get("alternative_item_ids", []))
        return result

    return _run_ai(job)


# ---------- wardrobe API (used from your phone) ----------

@app.get("/api/wardrobe")
def list_items():
    return jsonify(wardrobe.all_items())


@app.post("/api/wardrobe")
def add_item():
    upload = request.files.get("photo")
    if not upload:
        abort(400, "photo is required")
    jpeg = camera.shrink(upload.read(), rotate=False)  # normalise size/format

    def job():
        return wardrobe.add(ai.tag_item(jpeg), jpeg)

    return _run_ai(job)


@app.patch("/api/wardrobe/<item_id>")
def edit_item(item_id):
    item = wardrobe.update(item_id, request.get_json(force=True) or {})
    return jsonify(item) if item else abort(404)


@app.delete("/api/wardrobe/<item_id>")
def delete_item(item_id):
    return ("", 204) if wardrobe.remove(item_id) else abort(404)


# ---------- optional physical button ----------

def _start_button():
    if not config.BUTTON_PIN:
        return
    try:
        from gpiozero import Button
    except ImportError:
        log.warning("gpiozero not installed - physical button disabled")
        return
    button = Button(config.BUTTON_PIN, bounce_time=0.3)

    def pressed():
        _button["presses"] += 1

    button.when_pressed = pressed
    app.config["_button"] = button  # keep a reference so it isn't garbage-collected
    log.info("Button ready on GPIO %s", config.BUTTON_PIN)


def main():
    _start_button()
    log.info("Mirror on http://localhost:%s  |  wardrobe on http://<pi-ip>:%s/wardrobe", config.PORT, config.PORT)
    app.run(host=config.HOST, port=config.PORT, threaded=True)


if __name__ == "__main__":
    main()
