"""Draws Miroji's floating controls onto a bare camera capture.

    python store-assets/tools/controls.py in.png out.png [--flip] [--zoom 2.2]
                                          [--torch] [--torch-on]
                                          [--width-dp 390] [--inset-dp 34]

For the captures that were taken before the controls existed (the 1.3.x store
images show a bare camera frame), this adds the buttons the 1.4.0 app draws on
top of the preview, with the same geometry and colours as
``src/components/FloatingIconButton`` and ``src/screens/MirrorScreen``:

- 48 dp discs, ``rgba(0, 0, 0, 0.6)`` with a 1 dp ``rgba(255, 255, 255, 0.7)``
  ring and a 26 dp white Ionicons glyph;
- bottom-left, 16 dp from the side and 48 dp (plus the bottom inset) from the
  bottom, 12 dp apart: flashlight (back camera only, on top), mirror toggle,
  camera switch (lowest).

``--flip`` mirrors the picture first (what the toggle does to the preview, the
buttons stay put) and ``--zoom`` scales the middle of it up (digital zoom). Both
act on the picture only, so the result is an edit of a real capture, not a new
one: say so wherever the images are published.

Needs Pillow and the Ionicons font that ships with ``@expo/vector-icons``.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
ICONS = ROOT / "node_modules" / "@expo" / "vector-icons" / "build" / "vendor" / "react-native-vector-icons"

SIZE, ICON_SIZE, GAP, SIDE, BOTTOM = 48, 26, 12, 16, 48  # dp, as in the app


def glyph(name: str, px: int) -> tuple[ImageFont.FreeTypeFont, str]:
    codes = json.loads((ICONS / "glyphmaps" / "Ionicons.json").read_text(encoding="utf8"))
    return ImageFont.truetype(str(ICONS / "Fonts" / "Ionicons.ttf"), px), chr(codes[name])


def button(icon: str, dp: float) -> Image.Image:
    """One floating button at ``dp`` pixels per dp, drawn 4x and scaled down for smooth edges."""
    ss = 4
    d = round(SIZE * dp * ss)
    out = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    ring = max(1, round(dp * ss))
    draw.ellipse((0, 0, d - 1, d - 1), fill=(255, 255, 255, round(255 * 0.7)))
    draw.ellipse((ring, ring, d - 1 - ring, d - 1 - ring), fill=(0, 0, 0, 0))
    inner = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    ImageDraw.Draw(inner).ellipse((ring, ring, d - 1 - ring, d - 1 - ring), fill=(0, 0, 0, round(255 * 0.6)))
    out = Image.alpha_composite(inner, out)
    font, char = glyph(icon, round(ICON_SIZE * dp * ss))
    box = ImageDraw.Draw(out).textbbox((0, 0), char, font=font)
    ImageDraw.Draw(out).text(((d - (box[2] - box[0])) / 2 - box[0], (d - (box[3] - box[1])) / 2 - box[1]),
                             char, font=font, fill=(255, 255, 255, 255))
    return out.resize((round(SIZE * dp), round(SIZE * dp)), Image.LANCZOS)


def add_controls(img: Image.Image, width_dp: float, inset_dp: float, torch: bool, torch_on: bool) -> Image.Image:
    img = img.convert("RGBA")
    dp = img.width / width_dp
    icons = (["flashlight" if torch_on else "flashlight-outline"] if torch else []) + [
        "swap-horizontal", "camera-reverse-outline"]
    y = img.height - round((BOTTOM + inset_dp) * dp)
    for icon in reversed(icons):  # lowest first, walking up
        b = button(icon, dp)
        y -= b.height
        img.alpha_composite(b, (round(SIDE * dp), y))
        y -= round(GAP * dp)
    return img.convert("RGB")


def zoomed(img: Image.Image, factor: float) -> Image.Image:
    w, h = img.size
    cw, ch = round(w / factor), round(h / factor)
    box = ((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch)
    return img.crop(box).resize((w, h), Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path)
    ap.add_argument("dst", type=Path)
    ap.add_argument("--flip", action="store_true", help="mirror the picture left to right")
    ap.add_argument("--zoom", type=float, default=1.0, help="digital zoom factor on the centre")
    ap.add_argument("--torch", action="store_true", help="draw the flashlight button (back camera)")
    ap.add_argument("--torch-on", action="store_true", help="flashlight button in its active look")
    ap.add_argument("--width-dp", type=float, default=390, help="logical screen width of the device")
    ap.add_argument("--inset-dp", type=float, default=34, help="bottom safe-area inset of the device")
    a = ap.parse_args()
    img = Image.open(a.src).convert("RGB")
    if a.zoom != 1.0:
        img = zoomed(img, a.zoom)
    if a.flip:
        img = ImageOps.mirror(img)
    add_controls(img, a.width_dp, a.inset_dp, a.torch or a.torch_on, a.torch_on).save(a.dst)


if __name__ == "__main__":
    main()
