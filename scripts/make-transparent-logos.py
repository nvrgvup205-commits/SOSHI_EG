#!/usr/bin/env python3
"""Knock out solid black/white logo plates and emit transparent brand assets."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1] / "frontend" / "public"
EMERALD = (6, 35, 28, 255)
GOLD = (229, 169, 60)


def flood_background(rgb: np.ndarray, target: np.ndarray, threshold: float) -> np.ndarray:
    h, w = rgb.shape[:2]
    dist = np.sqrt(((rgb.astype(np.int16) - target.astype(np.int16)) ** 2).sum(axis=2))
    is_bg = dist <= threshold
    seen = np.zeros((h, w), dtype=np.uint8)
    stack: list[tuple[int, int]] = []

    for x in range(w):
        if is_bg[0, x]:
            stack.append((0, x))
        if is_bg[h - 1, x]:
            stack.append((h - 1, x))
    for y in range(h):
        if is_bg[y, 0]:
            stack.append((y, 0))
        if is_bg[y, w - 1]:
            stack.append((y, w - 1))

    while stack:
        y, x = stack.pop()
        if seen[y, x] or not is_bg[y, x]:
            continue
        # scanline fill
        left = x
        while left > 0 and is_bg[y, left - 1] and not seen[y, left - 1]:
            left -= 1
        right = x
        while right < w - 1 and is_bg[y, right + 1] and not seen[y, right + 1]:
            right += 1
        seen[y, left : right + 1] = 1
        for nx in range(left, right + 1):
            if y > 0 and is_bg[y - 1, nx] and not seen[y - 1, nx]:
                stack.append((y - 1, nx))
            if y < h - 1 and is_bg[y + 1, nx] and not seen[y + 1, nx]:
                stack.append((y + 1, nx))
    return seen.astype(bool)


def knock_out(path: Path, bg: str, threshold: float, blur: float) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    arr = np.array(src)
    rgb = arr[:, :, :3]
    target = np.array([0, 0, 0] if bg == "black" else [255, 255, 255], dtype=np.int16)
    bg_mask = flood_background(rgb, target, threshold)

    fg = (~bg_mask).astype(np.uint8) * 255
    alpha = Image.fromarray(fg, mode="L").filter(ImageFilter.GaussianBlur(radius=blur))
    alpha_arr = np.array(alpha).astype(np.float32)

    # Fade leftover plate color on the fringe so no halo box remains.
    dist = np.sqrt(((rgb.astype(np.int16) - target) ** 2).sum(axis=2)).astype(np.float32)
    fringe = (dist < threshold * 1.8) & (alpha_arr < 250)
    fade = np.clip(dist / max(threshold, 1.0), 0, 1)
    alpha_arr[fringe] = np.minimum(alpha_arr[fringe], fade[fringe] * 255)

    arr[:, :, 3] = np.clip(alpha_arr, 0, 255).astype(np.uint8)
    out = Image.fromarray(arr, "RGBA")
    return crop_content(out, pad=12)


def crop_content(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def save_png(im: Image.Image, dest: Path, max_h: int | None = None) -> None:
    if max_h and im.height > max_h:
        ratio = max_h / im.height
        im = im.resize((max(1, int(im.width * ratio)), max_h), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG", optimize=True)


def composite_icon(logo: Image.Image, size: int, dest: Path) -> None:
    canvas = Image.new("RGBA", (size, size), EMERALD)
    # Warm gold radial wash
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pix = overlay.load()
    cx = cy = size / 2
    radius = size * 0.55
    for y in range(size):
        for x in range(size):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            a = max(0, 1 - d / radius) * 70
            pix[x, y] = (GOLD[0], GOLD[1], GOLD[2], int(a))
    canvas = Image.alpha_composite(canvas, overlay)

    mark = logo.copy()
    # Prefer the emblem: keep full lockup but inset for maskable safe zone
    box = int(size * 0.78)
    mark.thumbnail((box, box), Image.Resampling.LANCZOS)
    x = (size - mark.width) // 2
    y = (size - mark.height) // 2
    canvas.alpha_composite(mark, (x, y))
    canvas.convert("RGB").save(dest, "PNG", optimize=True)


def main() -> None:
    dark = knock_out(ROOT / "logo.png", "black", threshold=26, blur=1.4)
    light = knock_out(ROOT / "logo-light.png", "white", threshold=32, blur=1.1)

    save_png(dark, ROOT / "logo.png", max_h=1100)
    save_png(light, ROOT / "logo-light.png", max_h=640)

    # Transparent copies used by PWA / apple touch fallbacks
    save_png(dark, ROOT / "logo-transparent.png", max_h=1100)

    slices = ROOT / "logo"
    if slices.is_dir():
        for slice_path in sorted(slices.glob("slice-*.png")):
            processed = knock_out(slice_path, "black", threshold=26, blur=1.0)
            save_png(processed, slice_path)

    composite_icon(dark, 192, ROOT / "pwa-192.png")
    composite_icon(dark, 512, ROOT / "pwa-512.png")
    composite_icon(dark, 180, ROOT / "apple-touch-icon.png")
    print("transparent logos written")
    for name in ["logo.png", "logo-light.png", "pwa-192.png", "pwa-512.png", "apple-touch-icon.png"]:
        p = ROOT / name
        im = Image.open(p)
        print(f"  {name}: {im.size} {im.mode} {p.stat().st_size} bytes")


if __name__ == "__main__":
    main()
