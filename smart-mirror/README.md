# Smart Mirror — AI outfit stylist

A two-way mirror with a screen behind it. Press a button and it:

- **Rates your outfit** — takes a photo, looks at the weather and the occasion, and gives tips.
- **Suggests an outfit** — picks a combination from *your own* clothes.
- **Manages your wardrobe** — from your phone, photograph each item; the AI fills in category,
  color, formality and warmth. Mark items as "in the laundry" so they aren't suggested.

The AI is Claude (Anthropic API), answers in Brazilian Portuguese by default,
and the weather comes from Open-Meteo (free, no key).

```
[Camera] → [Raspberry Pi: Python/Flask] → [Claude API]
                │       ↑
                │   [Open-Meteo weather]   [data/wardrobe.json + photos]
                ↓
     [Chromium fullscreen on the monitor behind the mirror]
     [Your phone → http://<pi-ip>:8080/wardrobe]
```

Hardware list, wiring and build steps: **[HARDWARE.md](HARDWARE.md)**.

## Try it on your computer first (no hardware needed)

```bash
cd smart-mirror
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then edit .env and add your ANTHROPIC_API_KEY
```

Put any full-body photo at `smart-mirror/sample.jpg` (used when no camera is found), then:

```bash
python -m mirror.app
```

Open http://localhost:8080 (mirror) and http://localhost:8080/wardrobe (wardrobe).
To test the screens without an API key, set `MIRROR_DEMO=1` in `.env`.

## On the Raspberry Pi

1. Flash **Raspberry Pi OS (64-bit, with desktop)** with Raspberry Pi Imager. Set Wi-Fi, user `pi`
   and enable SSH in the Imager settings.
2. Copy this folder to `/home/pi/smart-mirror`, then:
   ```bash
   sudo apt update && sudo apt install -y python3-picamera2 unclutter
   cd ~/smart-mirror
   python3 -m venv --system-site-packages .venv   # system packages = picamera2 + gpiozero
   .venv/bin/pip install -r requirements.txt
   cp .env.example .env && nano .env
   ```
3. Check the camera: `rpicam-still -o test.jpg`
4. Start on boot:
   ```bash
   sudo cp scripts/smart-mirror.service /etc/systemd/system/
   sudo systemctl enable --now smart-mirror
   chmod +x scripts/kiosk.sh
   echo "/home/pi/smart-mirror/scripts/kiosk.sh &" >> ~/.config/labwc/autostart
   ```
5. Reboot. The mirror page opens fullscreen. Find the Pi's IP with `hostname -I` and open
   `http://<ip>:8080/wardrobe` on your phone (same Wi-Fi) to add clothes.

## Tips for good results

- Photograph wardrobe items one at a time on a plain background (bed, floor), good light.
- Good, neutral-white lighting at the mirror makes colors accurate.
- `MIRROR_EFFORT=low` is fastest (a few seconds). Try `medium` if you want more careful advice.

## Privacy

- Photos of you are taken only when you press the button, sent to the AI, and **never saved**.
- Wardrobe photos stay on the Pi (`data/`).
- The server has no login — keep it on your home Wi-Fi only; don't expose port 8080 to the internet.

## Costs

Each analysis is one Claude API call with one image. Roughly R$0.10 per use with the default model; check current
prices at https://www.anthropic.com/pricing. Set a monthly spend limit in the Anthropic Console.

## Project layout

```
mirror/
  app.py       web server + API routes + optional GPIO button
  ai.py        Claude calls: check_outfit, suggest_outfit, tag_item
  camera.py    Pi camera → USB webcam → sample.jpg fallback
  weather.py   Open-Meteo forecast
  wardrobe.py  JSON wardrobe storage
  config.py    settings from .env
  templates/   mirror.html (the mirror), wardrobe.html (phone)
  static/      mirror screen CSS/JS
scripts/       systemd service + kiosk launcher
```

## Ideas for later

- Voice: "espelho, o que eu visto hoje?" (wake word + speech-to-text).
- Google Calendar: automatically know about today's meetings.
- History: remember what you wore so it doesn't repeat outfits.
