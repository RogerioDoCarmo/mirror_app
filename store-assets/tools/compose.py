"""Builds the App Store / Google Play screenshot sets from raw app captures.

    python store-assets/tools/compose.py [--set android/phone ...] [--out DIR]

Raw captures live in ``store-assets/raw/<set>/`` (``<set>`` is one of the folder
names under ``store-assets/screenshots/``) and are real screenshots of the
running app, never mockups. Each slide below is a gradient, a caption and, for
most of them, a capture inside a device frame. Slides whose raw capture is
missing are skipped and reported, so a set can be built as captures arrive.

Needs Pillow (``pip install pillow``). Fonts: Arial, falling back to DejaVu.
"""

from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
SCREENSHOTS = ROOT / "screenshots"
ICON = ROOT.parent / "assets" / "icon.png"

# Store slot -> canvas size (see store-assets/README.md).
SETS: dict[str, tuple[int, int]] = {
    "android/phone": (1080, 1920),
    "android/tablet-7in": (1200, 1920),
    "android/tablet-10in": (1600, 2560),
    "android/landscape": (1920, 1080),
    "ios/phone": (1242, 2688),
    "ios/ipad": (2064, 2752),
}

WHITE = (255, 255, 255)
SUBTITLE = (205, 224, 252)
BEZEL = (10, 10, 12)
SHADOW_PAD = 48  # transparent margin around a frame image, for its soft shadow

SKY = ((127, 186, 251), (38, 96, 178))
NIGHT = ((111, 176, 250), (13, 16, 22))
DAY = ((111, 176, 250), (38, 96, 178))


@dataclass(frozen=True)
class Slide:
    """One screenshot. ``frames`` are raw capture names shown in device frames."""

    name: str
    gradient: tuple[tuple[int, int, int], tuple[int, int, int]] = SKY
    caption: str = ""  # caption above the frames
    title: str = ""  # large centred headline (text slides); a newline breaks lines
    subtitle: str = ""
    badge: str = ""  # extra bold line under the subtitle
    icon: bool = False
    frames: list[str] = field(default_factory=list)
    labels: list[str] = field(default_factory=list)  # one small label under each frame


# Eight slides, the most Google Play allows per device type. The permission
# slide (08) is carried over from the previous set, see LEGACY below.
SLIDES = [
    Slide("01-hero", title="Just a mirror.", icon=True,
          subtitle="A fast, beautifully simple mirror.\nOpen it and go."),
    Slide("02-mirror", caption="Your mirror, in real time", frames=["mirror"]),
    Slide("03-zoom", caption="Pinch to zoom in", frames=["zoom"]),
    Slide("04-flip", caption="See yourself as others do", frames=["mirrored", "unmirrored"],
          labels=["Mirror view", "As others see you"]),
    Slide("05-back-camera", caption="Back camera and flashlight", frames=["back-torch"]),
    Slide("06-privacy", gradient=NIGHT, title="Private\nby design.",
          subtitle="Nothing is ever recorded, stored, or sent.\nThe camera stays on your device."),
    Slide("07-languages", gradient=DAY, title="Speaks your\nlanguage.",
          subtitle="Fully translated and ready to use.", badge="EN \u00b7 PT \u00b7 ES \u00b7 JA"),
]

# Unchanged by 1.4.0: renamed to its new number from the 1.3.x set.
LEGACY = {"05-permission.png": "08-permission.png"}


def font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    names = ["arialbd.ttf", "Arial Bold.ttf"] if bold else ["arial.ttf", "Arial.ttf"]
    dirs = [r"C:\Windows\Fonts", "/System/Library/Fonts/Supplemental", "/usr/share/fonts/truetype/msttcorefonts"]
    for d in dirs:
        for n in names:
            p = Path(d) / n
            if p.exists():
                return ImageFont.truetype(str(p), size)
    return ImageFont.truetype("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", size)


def gradient(size, top, bottom) -> Image.Image:
    w, h = size
    column = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / (h - 1)
        column.putpixel((0, y), tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return column.resize((w, h))


def centred(draw, text, y, fnt, fill, width, spacing=1.12, x0=0) -> int:
    """Draw (possibly multi-line) text centred in [x0, x0 + width); returns the y below it."""
    for line in text.split("\n"):
        box = draw.textbbox((0, 0), line, font=fnt)
        draw.text((x0 + (width - (box[2] - box[0])) / 2 - box[0], y), line, font=fnt, fill=fill)
        y += round(fnt.size * spacing)
    return y


def framed(raw: Image.Image, max_w: int, max_h: int) -> Image.Image:
    """The capture inside a rounded black device frame, with a soft shadow."""
    rw, rh = raw.size
    bezel = max(8, round(min(max_w, max_h) * 0.026))
    scale = min((max_w - 2 * bezel) / rw, (max_h - 2 * bezel) / rh)
    sw, sh = round(rw * scale), round(rh * scale)
    fw, fh = sw + 2 * bezel, sh + 2 * bezel
    radius = round(min(fw, fh) * 0.10)
    pad = SHADOW_PAD
    out = Image.new("RGBA", (fw + 2 * pad, fh + 2 * pad), (0, 0, 0, 0))

    shadow = Image.new("RGBA", out.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (pad, pad + 14, pad + fw, pad + fh + 14), radius, fill=(0, 0, 0, 95))
    out.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(20)))

    ImageDraw.Draw(out).rounded_rectangle((pad, pad, pad + fw, pad + fh), radius, fill=BEZEL)
    inner = max(4, radius - bezel)
    screen = raw.convert("RGBA").resize((sw, sh), Image.LANCZOS)
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw - 1, sh - 1), inner, fill=255)
    out.paste(screen, (pad + bezel, pad + bezel), mask)
    return out


def rounded_icon(side: int) -> Image.Image:
    icon = Image.open(ICON).convert("RGBA").resize((side, side), Image.LANCZOS)
    mask = Image.new("L", (side, side), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, side - 1, side - 1), round(side * 0.22), fill=255)
    icon.putalpha(mask)
    return icon


def text_slide(slide: Slide, size) -> Image.Image:
    """Headline block centred a little above the middle of the canvas."""
    w, h = size
    canvas = gradient(size, *slide.gradient).convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    title_f, sub_f = font(True, round(w * 0.098)), font(False, round(w * 0.043))
    icon_side = round(w * 0.185)
    total = (
        len(slide.title.split("\n")) * round(title_f.size * 1.12)
        + len(slide.subtitle.split("\n")) * round(sub_f.size * 1.5)
        + (round(w * 0.1) if slide.badge else 0)
        + (icon_side + round(w * 0.075) if slide.icon else 0)
    )
    y = round(h * 0.5 - total / 2)
    if slide.icon:
        canvas.alpha_composite(rounded_icon(icon_side), ((w - icon_side) // 2, y))
        y += icon_side + round(w * 0.075)
    y = centred(draw, slide.title, y, title_f, WHITE, w) + round(w * 0.012)
    y = centred(draw, slide.subtitle, y, sub_f, SUBTITLE, w, 1.5)
    if slide.badge:
        centred(draw, slide.badge, y + round(w * 0.05), font(True, round(w * 0.052)), WHITE, w)
    return canvas.convert("RGB")


def frame_slide(slide: Slide, size, raw_dir: Path) -> Image.Image | None:
    """Caption above one or two device frames; None if a raw capture is missing."""
    w, h = size
    captures = []
    for name in slide.frames:
        path = raw_dir / f"{name}.png"
        if not path.exists():
            return None
        captures.append(Image.open(path))

    canvas = gradient(size, *slide.gradient).convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    centred(draw, slide.caption, round(h * 0.07), font(True, round(min(w, h * 0.5625) * 0.052)), WHITE, w)

    n, gap = len(captures), round(w * 0.03)
    box_w = round(min(w * 0.82, (w * 0.9 - gap * (n - 1)) / n))
    box_h = round(h * 0.65)
    frames = [framed(c, box_w, box_h) for c in captures]
    label_f = font(False, round(min(w, h * 0.5625) * 0.034))
    # Each frame image carries SHADOW_PAD of transparent margin; lay out by the visible body.
    body_w = [f.width - 2 * SHADOW_PAD for f in frames]
    x = (w - (sum(body_w) + gap * (n - 1))) // 2
    area_top, area_h = round(h * 0.162), round(h * 0.70)
    for i, fr in enumerate(frames):
        body_h = fr.height - 2 * SHADOW_PAD
        y = area_top + (area_h - body_h) // 2 if n > 1 else area_top
        canvas.alpha_composite(fr, (x - SHADOW_PAD, y - SHADOW_PAD))
        if slide.labels:
            centred(draw, slide.labels[i], y + body_h + round(h * 0.012), label_f, SUBTITLE, body_w[i], x0=x)
        x += body_w[i] + gap
    return canvas.convert("RGB")


def render(slide: Slide, size, raw_dir: Path) -> Image.Image | None:
    return text_slide(slide, size) if slide.title else frame_slide(slide, size, raw_dir)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--set", action="append", choices=sorted(SETS), help="build only this set (repeatable)")
    ap.add_argument("--out", type=Path, default=SCREENSHOTS, help="output root (default: store-assets/screenshots)")
    ap.add_argument("--raw", type=Path, default=RAW, help="raw captures root (default: store-assets/raw)")
    args = ap.parse_args()

    missing: list[str] = []
    for set_name in args.set or sorted(SETS):
        size, out_dir, raw_dir = SETS[set_name], args.out / set_name, args.raw / set_name
        out_dir.mkdir(parents=True, exist_ok=True)
        for slide in SLIDES:
            image = render(slide, size, raw_dir)
            if image is None:
                names = ", ".join(slide.frames)
                missing.append(f"{set_name}: {slide.name} needs raw/{set_name}/ {names}")
                continue
            image.save(out_dir / f"{slide.name}.png", optimize=True)
            print("wrote", out_dir / f"{slide.name}.png")
        for old, new in LEGACY.items():
            src = SCREENSHOTS / set_name / old
            if src.exists() and args.out == SCREENSHOTS and not (out_dir / new).exists():
                os.replace(src, out_dir / new)
                print("renamed", src.name, "->", new)
    for line in missing:
        print("skipped:", line, file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
