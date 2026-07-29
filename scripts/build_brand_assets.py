"""Build deterministic transparent KAIRO brand assets from the approved raster.

The source artwork has a smooth, edge-connected backdrop. OpenCV's gradient
flood fill removes only pixels reachable from the canvas border and therefore
preserves the enclosed dark regions inside the heart and wordmark.
"""

from __future__ import annotations

import argparse
import base64
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def connected_background(image_bgr: np.ndarray, tolerance: int) -> np.ndarray:
    height, width = image_bgr.shape[:2]
    mask = np.zeros((height + 2, width + 2), dtype=np.uint8)
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8)

    seeds = [
        (0, 0),
        (width - 1, 0),
        (0, height - 1),
        (width - 1, height - 1),
        (width // 2, 0),
        (width // 2, height - 1),
        (0, height // 2),
        (width - 1, height // 2),
    ]
    difference = (tolerance, tolerance, tolerance)
    for seed in seeds:
        cv2.floodFill(
            image_bgr,
            mask,
            seed,
            0,
            loDiff=difference,
            upDiff=difference,
            flags=flags,
        )
    return mask[1:-1, 1:-1] == 255


def isolate_logo(image_bgr: np.ndarray, edge_background: np.ndarray) -> np.ndarray:
    height, width = image_bgr.shape[:2]
    grabcut_mask = np.full((height, width), cv2.GC_BGD, dtype=np.uint8)

    left, right = int(width * 0.27), int(width * 0.73)
    top, bottom = int(height * 0.10), int(height * 0.82)
    content_region = np.zeros((height, width), dtype=bool)
    content_region[top:bottom, left:right] = True
    grabcut_mask[content_region] = cv2.GC_PR_FGD
    grabcut_mask[edge_background] = cv2.GC_BGD

    hsv = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    gradient_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gradient_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    gradient = cv2.magnitude(gradient_x, gradient_y)

    # Definite foreground seeds come from sharp logo edges and the enclosed
    # near-black heart interior. Smooth green backdrop pixels never become
    # foreground seeds.
    sharp_logo = content_region & (gradient > 72) & ((hsv[:, :, 1] > 55) | (hsv[:, :, 2] < 85))
    heart_region = np.zeros((height, width), dtype=bool)
    heart_region[int(height * 0.13) : int(height * 0.67), left:right] = True
    dark_heart = heart_region & (hsv[:, :, 2] < 38)
    grabcut_mask[sharp_logo | dark_heart] = cv2.GC_FGD

    background_model = np.zeros((1, 65), np.float64)
    foreground_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(
        image_bgr,
        grabcut_mask,
        None,
        background_model,
        foreground_model,
        8,
        cv2.GC_INIT_WITH_MASK,
    )
    result = np.where(
        (grabcut_mask == cv2.GC_FGD) | (grabcut_mask == cv2.GC_PR_FGD),
        255,
        0,
    ).astype(np.uint8)

    # The heart is a closed emblem. Fill its exact extracted outer contour so
    # every original internal circuit and dark region is retained, even where
    # a green circuit color is close to the former backdrop color.
    upper = np.zeros_like(result)
    heart_cutoff = int(height * 0.69)
    upper[:heart_cutoff] = result[:heart_cutoff]
    contours, _ = cv2.findContours(upper, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        heart_contour = max(contours, key=cv2.contourArea)
        if cv2.contourArea(heart_contour) > width * height * 0.08:
            cv2.drawContours(result, [heart_contour], -1, 255, thickness=cv2.FILLED)
    return result


def build_assets(source: Path, output_directory: Path, tolerance: int) -> None:
    if not source.exists():
        raise FileNotFoundError(source)
    source_rgba = np.asarray(Image.open(source).convert("RGBA"))
    source_bgra = cv2.cvtColor(source_rgba, cv2.COLOR_RGBA2BGRA)

    image_bgr = source_bgra[:, :, :3].copy()
    background = connected_background(image_bgr.copy(), tolerance)
    foreground = isolate_logo(image_bgr, background)

    # Keep all meaningful disconnected pieces of the KAIRO wordmark while
    # discarding isolated compression specks.
    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(foreground, 8)
    cleaned = np.zeros_like(foreground)
    for component in range(1, component_count):
        if stats[component, cv2.CC_STAT_AREA] >= 24:
            cleaned[labels == component] = 255

    # A very small matte softening keeps antialiased edges smooth without
    # changing the logo geometry or any of its RGB colors.
    alpha = cv2.GaussianBlur(cleaned, (0, 0), 0.55)
    alpha[cleaned == 255] = 255

    visible = np.argwhere(alpha > 8)
    if visible.size == 0:
        raise RuntimeError("No foreground remained after background removal.")

    top, left = visible.min(axis=0)
    bottom, right = visible.max(axis=0)
    padding = 12
    top = max(0, int(top) - padding)
    left = max(0, int(left) - padding)
    bottom = min(alpha.shape[0] - 1, int(bottom) + padding)
    right = min(alpha.shape[1] - 1, int(right) + padding)

    output = source_bgra[top : bottom + 1, left : right + 1].copy()
    output[:, :, 3] = alpha[top : bottom + 1, left : right + 1]

    output_directory.mkdir(parents=True, exist_ok=True)
    png_path = output_directory / "kairo-logo-transparent.png"
    encoded, png_bytes = cv2.imencode(".png", output, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    if not encoded:
        raise RuntimeError(f"Failed to write {png_path}")
    png_bytes.tofile(png_path)

    rgba = Image.open(png_path).convert("RGBA")
    encoded_png = base64.b64encode(png_path.read_bytes()).decode("ascii")
    svg_path = output_directory / "kairo-logo-transparent.svg"
    svg_path.write_text(
        (
            '<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {rgba.width} {rgba.height}" '
            f'width="{rgba.width}" height="{rgba.height}" role="img" aria-label="KAIRO">'
            f'<image width="{rgba.width}" height="{rgba.height}" '
            f'href="data:image/png;base64,{encoded_png}"/></svg>'
        ),
        encoding="utf-8",
    )

    favicon_canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    favicon_logo = rgba.copy()
    favicon_logo.thumbnail((220, 236), Image.Resampling.LANCZOS)
    favicon_canvas.alpha_composite(
        favicon_logo,
        ((256 - favicon_logo.width) // 2, (256 - favicon_logo.height) // 2),
    )
    favicon_canvas.save(output_directory / "kairo-favicon.png", optimize=True)

    transparent_ratio = float(np.count_nonzero(output[:, :, 3] == 0)) / output[:, :, 3].size
    print(
        json.dumps(
            {
            "source": str(source),
            "png": str(png_path),
            "svg": str(svg_path),
            "width": output.shape[1],
            "height": output.shape[0],
            "transparent_ratio": round(transparent_ratio, 4),
            "tolerance": tolerance,
            },
            ensure_ascii=True,
        )
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output-directory", required=True, type=Path)
    parser.add_argument("--tolerance", type=int, default=14)
    arguments = parser.parse_args()
    build_assets(arguments.source, arguments.output_directory, arguments.tolerance)


if __name__ == "__main__":
    main()
