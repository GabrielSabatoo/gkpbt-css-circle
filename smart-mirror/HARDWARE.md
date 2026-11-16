# Hardware build guide

Prices are rough Brazilian retail estimates (late 2026) — check Mercado Livre, Kabum, Amazon BR,
and local glass/acrylic shops ("vidraçaria", "loja de acrílico").

## Shopping list

| Part | Suggestion | Est. price (R$) |
|---|---|---|
| Computer | Raspberry Pi 5 (4GB is enough, 8GB is nicer) + official 27W USB-C power supply + 32GB+ microSD | 650–1,100 |
| Cooling | Pi 5 Active Cooler (it gets hot inside a frame) | 40–80 |
| Camera | Raspberry Pi Camera Module 3 **Wide** (wider view = full body from closer) + Pi 5 camera cable (22→15 pin) | 250–450 |
| Display | 24" IPS monitor, **1080p, slim, with the power supply built in or external brick**, VESA mount. IPS = good viewing angles. | 600–1,000 |
| Mirror | Two-way mirror cut to the monitor's outer size + 2–3 cm. **Glass "espelho espião / vidro espelhado bidirecional"** looks best; **acrylic two-way mirror** is lighter/safer but can warp | 200–600 |
| Frame | Wood frame (marcenaria) deep enough to hold monitor + Pi, ~6–8 cm deep, with air holes at top and bottom | 150–400 |
| Lighting | LED strip, neutral white (4000K), high CRI (≥90) around the frame — good light makes the AI see real colors | 60–150 |
| Button (optional) | Momentary push button 16mm + 2 jumper wires | 10–30 |
| Misc | HDMI micro→standard cable, power strip, cable clips, black tape/paint | 50–100 |
| **Total** | | **~R$2,000–3,900** |

Cheaper path: a used monitor and an acrylic mirror bring it near R$1,500.
A mini PC (used Intel N100) instead of the Pi also works — use a USB webcam then.

## How the two-way mirror trick works

The mirror reflects most light from the room side. Where the screen behind it is **black**, you see a
normal mirror; where it shows **bright white text**, the light passes through. That's why the UI is
pure black with white text. For the best effect: bright room, dark inside the frame (paint inside black).

## Layout (portrait, seen from behind)

```
 ┌───────────────────────────┐
 │   [camera]  ← small hole in the mirror coating at the top,
 │                or mount it just above the frame
 │ ┌───────────────────────┐ │
 │ │                       │ │
 │ │   monitor (portrait)  │ │   two-way glass in front of everything
 │ │                       │ │
 │ └───────────────────────┘ │
 │   [Pi]  [power strip]     │   ← ventilation holes at top & bottom
 └───────────────────────────┘
       [button on the side of the frame]
```

**Camera:** cameras can't see well through two-way mirror. Either
(a) scrape a small circle (~1 cm) of the reflective coating off the back of the glass and put the
lens right against it, or (b) mount the camera on top of the frame, tilted down slightly.
Place it at ~1.6–1.8 m height and stand ~1.5–2 m away for a full-body shot.

**Monitor rotation:** in Raspberry Pi OS, *Screen Configuration → Orientation → Right/Left* to make it
portrait. If the camera is sideways too, set `MIRROR_CAMERA_ROTATE` in `.env`.

## Button wiring (optional)

```
Pi GPIO17 (physical pin 11) ──── button ──── GND (physical pin 9)
```
No resistor needed (the Pi's internal pull-up is used). Set `MIRROR_BUTTON_PIN=17`.

## Safety

- Glass mirrors are heavy: fix the frame to the wall with proper anchors (bucha + parafuso) or a
  French cleat, not just nails.
- Keep ventilation; the Pi and monitor both make heat in a closed box.
- Don't install in a humid bathroom unless everything is protected — bedroom/closet is better.
- Privacy: the camera only captures when you press the button, and photos are never saved.
  For extra peace of mind, add a small sliding cover over the lens.

## Build order

1. Set up the Pi with the software first (see README) using any monitor — make sure everything works.
2. Test the camera angle by standing where you'll normally stand.
3. Build/buy the frame around the monitor's measurements.
4. Mount monitor, Pi, camera; route cables; add LEDs.
5. Mount the glass last; hang on the wall.
