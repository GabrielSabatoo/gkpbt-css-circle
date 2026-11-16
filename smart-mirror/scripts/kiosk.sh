#!/usr/bin/env bash
# Opens the mirror page fullscreen once the desktop starts.
# Add to autostart: on Raspberry Pi OS (Wayland/labwc), append this line to
#   ~/.config/labwc/autostart :   /home/pi/smart-mirror/scripts/kiosk.sh &
set -euo pipefail

# Wait for the server to come up
until curl -s -o /dev/null http://localhost:8080/api/status; do sleep 2; done

# Hide the mouse pointer if unclutter is installed
command -v unclutter >/dev/null && unclutter -idle 0.5 &

exec chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --check-for-update-interval=31536000 --overscroll-history-navigation=0 \
  http://localhost:8080/
