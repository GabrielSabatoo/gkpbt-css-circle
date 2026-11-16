"""The AI stylist: talks to Claude through the official Anthropic SDK.

Three jobs:
  check_outfit  - look at the photo of what you're wearing and give feedback
  suggest_outfit - pick an outfit from your wardrobe for today's weather/occasion
  tag_item      - look at a photo of one clothing item and describe it for the wardrobe
"""
import base64
import json
import logging

from . import config

log = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        import anthropic

        _client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
    return _client


class AIError(RuntimeError):
    pass


SYSTEM = (
    "You are a friendly personal stylist living inside a smart mirror. "
    f"Always answer in {config.LANGUAGE}. Be concise: the text is read on a mirror, "
    "standing up, in a hurry. Comment only on clothes, colors, fit and accessories - "
    "never on the person's body, weight, face or attractiveness. Be encouraging and practical, "
    "and take the weather and the occasion into account."
)


def _image_block(jpeg: bytes) -> dict:
    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": base64.standard_b64encode(jpeg).decode("utf-8"),
        },
    }


def _ask(content: list, schema: dict) -> dict:
    """One Claude call that must return JSON matching `schema`."""
    import anthropic

    try:
        response = _get_client().beta.messages.create(
            model=config.MODEL,
            max_tokens=16000,
            system=SYSTEM,
            messages=[{"role": "user", "content": content}],
            output_config={
                "effort": config.EFFORT,
                "format": {"type": "json_schema", "schema": schema},
            },
            # If a safety classifier declines, retry on Anthropic's recommended fallback model.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except anthropic.AuthenticationError as exc:
        raise AIError("Invalid or missing ANTHROPIC_API_KEY.") from exc
    except anthropic.RateLimitError as exc:
        raise AIError("Too many requests - wait a moment and try again.") from exc
    except anthropic.APIStatusError as exc:
        raise AIError(f"AI service error ({exc.status_code}).") from exc
    except anthropic.APIConnectionError as exc:
        raise AIError("No internet connection to the AI service.") from exc

    if response.stop_reason == "refusal":
        raise AIError("The AI declined this request. Try another photo.")
    if response.stop_reason == "max_tokens":
        raise AIError("The AI answer was cut off. Try again.")
    text = next((b.text for b in response.content if b.type == "text"), None)
    if text is None:
        raise AIError("The AI returned no answer.")
    return json.loads(text)


# ---------- 1. Rate what I'm wearing ----------

CHECK_SCHEMA = {
    "type": "object",
    "properties": {
        "headline": {"type": "string", "description": "One short sentence, max ~8 words."},
        "score": {"type": "integer", "description": "1-10 for how well the outfit fits the day."},
        "good": {"type": "array", "items": {"type": "string"}},
        "tips": {"type": "array", "items": {"type": "string"}},
        "swap_item_ids": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Wardrobe ids (from the list) worth swapping in. Empty if none.",
        },
    },
    "required": ["headline", "score", "good", "tips", "swap_item_ids"],
    "additionalProperties": False,
}


def check_outfit(photo: bytes, weather_text: str, occasion: str, wardrobe_text: str) -> dict:
    if config.DEMO_MODE:
        return {
            "headline": "Ótima combinação para hoje!",
            "score": 8,
            "good": ["Cores neutras combinam bem", "Calça com bom caimento"],
            "tips": ["Leve um casaco leve: esfria à noite", "Troque o tênis por um sapato se a reunião for formal"],
            "swap_item_ids": [],
        }
    prompt = (
        f"Weather: {weather_text}\nOccasion today: {occasion or 'normal day'}\n\n"
        f"My wardrobe (use the ids in swap_item_ids if you suggest a swap):\n{wardrobe_text}\n\n"
        "Look at the photo of what I'm wearing. Give at most 2 'good' points and at most 3 tips."
    )
    return _ask([_image_block(photo), {"type": "text", "text": prompt}], CHECK_SCHEMA)


# ---------- 2. Pick an outfit for me ----------

SUGGEST_SCHEMA = {
    "type": "object",
    "properties": {
        "headline": {"type": "string"},
        "item_ids": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Wardrobe ids that make up the outfit, top to bottom.",
        },
        "why": {"type": "string", "description": "One or two sentences."},
        "alternative_item_ids": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["headline", "item_ids", "why", "alternative_item_ids"],
    "additionalProperties": False,
}


def suggest_outfit(weather_text: str, occasion: str, wardrobe_text: str) -> dict:
    if config.DEMO_MODE:
        return {"headline": "Look casual para um dia quente", "item_ids": [], "why": "Modo demonstração.",
                "alternative_item_ids": []}
    prompt = (
        f"Weather: {weather_text}\nOccasion today: {occasion or 'normal day'}\n\n"
        f"My wardrobe:\n{wardrobe_text}\n\n"
        "Build one complete outfit using ONLY ids from the list, and one alternative. "
        "If the wardrobe is missing something essential, say so in 'why'."
    )
    return _ask([{"type": "text", "text": prompt}], SUGGEST_SCHEMA)


# ---------- 3. Describe a clothing item for the wardrobe ----------

TAG_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string", "description": "Short name, e.g. 'Camisa social azul-clara'."},
        "category": {
            "type": "string",
            "enum": ["top", "bottom", "dress", "outerwear", "shoes", "accessory"],
        },
        "color": {"type": "string"},
        "pattern": {"type": "string"},
        "formality": {"type": "string", "enum": ["casual", "smart casual", "business", "formal", "sport"]},
        "warmth": {"type": "string", "enum": ["light", "medium", "warm"]},
    },
    "required": ["name", "category", "color", "pattern", "formality", "warmth"],
    "additionalProperties": False,
}


def tag_item(photo: bytes) -> dict:
    if config.DEMO_MODE:
        return {"name": "Peça de exemplo", "category": "top", "color": "azul", "pattern": "liso",
                "formality": "casual", "warmth": "light"}
    prompt = "This photo shows ONE clothing item or accessory. Describe it for my digital wardrobe."
    return _ask([_image_block(photo), {"type": "text", "text": prompt}], TAG_SCHEMA)
