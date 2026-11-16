"""Today's weather from Open-Meteo (free, no API key)."""
import time

import requests

from . import config

_cache: dict = {"at": 0.0, "data": None}

# WMO weather codes -> short description
CODES = {
    0: "clear sky", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
    45: "fog", 48: "fog", 51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
    61: "light rain", 63: "rain", 65: "heavy rain", 80: "rain showers",
    81: "rain showers", 82: "violent rain showers", 95: "thunderstorm",
    96: "thunderstorm with hail", 99: "thunderstorm with hail",
}


def today() -> dict:
    """Returns {"now": °C, "min": °C, "max": °C, "rain_chance": %, "summary": str}."""
    if _cache["data"] and time.time() - _cache["at"] < 30 * 60:
        return _cache["data"]
    resp = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": config.LATITUDE,
            "longitude": config.LONGITUDE,
            "timezone": config.TIMEZONE,
            "current": "temperature_2m,weather_code",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
            "forecast_days": 1,
        },
        timeout=10,
    )
    resp.raise_for_status()
    body = resp.json()
    data = {
        "now": round(body["current"]["temperature_2m"]),
        "min": round(body["daily"]["temperature_2m_min"][0]),
        "max": round(body["daily"]["temperature_2m_max"][0]),
        "rain_chance": body["daily"]["precipitation_probability_max"][0] or 0,
        "summary": CODES.get(body["current"]["weather_code"], "unknown"),
    }
    _cache.update(at=time.time(), data=data)
    return data


def describe(w: dict | None) -> str:
    if not w:
        return "Weather unknown."
    return (
        f"Now {w['now']}°C, {w['summary']}. Today min {w['min']}°C, max {w['max']}°C, "
        f"{w['rain_chance']}% chance of rain."
    )
