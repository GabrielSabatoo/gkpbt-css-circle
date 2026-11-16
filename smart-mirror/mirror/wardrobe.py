"""Your wardrobe: a JSON file plus one photo per item, all stored locally."""
import json
import threading
import uuid

from . import config

_lock = threading.Lock()


def _ensure() -> None:
    config.WARDROBE_IMAGES.mkdir(parents=True, exist_ok=True)
    if not config.WARDROBE_FILE.exists():
        config.WARDROBE_FILE.write_text("[]", encoding="utf-8")


def all_items() -> list[dict]:
    _ensure()
    return json.loads(config.WARDROBE_FILE.read_text(encoding="utf-8"))


def _save(items: list[dict]) -> None:
    config.WARDROBE_FILE.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")


def add(tags: dict, jpeg: bytes) -> dict:
    with _lock:
        items = all_items()
        item = {"id": uuid.uuid4().hex[:8], "available": True, **tags}
        (config.WARDROBE_IMAGES / f"{item['id']}.jpg").write_bytes(jpeg)
        items.append(item)
        _save(items)
        return item


def update(item_id: str, changes: dict) -> dict | None:
    with _lock:
        items = all_items()
        for item in items:
            if item["id"] == item_id:
                item.update({k: v for k, v in changes.items() if k != "id"})
                _save(items)
                return item
    return None


def remove(item_id: str) -> bool:
    with _lock:
        items = all_items()
        kept = [i for i in items if i["id"] != item_id]
        if len(kept) == len(items):
            return False
        _save(kept)
        (config.WARDROBE_IMAGES / f"{item_id}.jpg").unlink(missing_ok=True)
        return True


def as_prompt_text(items: list[dict]) -> str:
    """Compact list the AI can pick from. Only clean/available items are offered."""
    lines = [
        f"- [{i['id']}] {i.get('name', '')} | {i.get('category', '')} | {i.get('color', '')} | "
        f"formality: {i.get('formality', '')} | warmth: {i.get('warmth', '')}"
        for i in items
        if i.get("available", True)
    ]
    return "\n".join(lines) if lines else "(the wardrobe is empty)"
