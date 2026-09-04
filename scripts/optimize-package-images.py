"""Create package-ready WebP assets while preserving the original source files.

Run from the ``xuanshiai-vue`` repository root. Originals are copied to
``design-sources/package-originals`` before optimized variants are written.
The script deliberately does not delete ``static`` inputs; removal happens only
after source references and visual output have been reviewed.
"""

from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"
ARCHIVE = ROOT / "design-sources" / "package-originals"


@dataclass(frozen=True)
class AssetGroup:
    source_glob: str
    destination: Path
    max_size: tuple[int, int]
    quality: int


GROUPS = (
    AssetGroup(
        "moxiang-master-*.png",
        ROOT / "pagesSub" / "profileExtra" / "static",
        (256, 256),
        72,
    ),
    AssetGroup(
        "generated/*.png",
        STATIC / "generated",
        (672, 336),
        72,
    ),
    AssetGroup(
        "portraits/*.*",
        STATIC / "portraits",
        (480, 720),
        70,
    ),
    AssetGroup(
        "cases/*.*",
        ROOT / "pagesSub" / "matchmaker" / "static" / "cases",
        (640, 960),
        72,
    ),
    AssetGroup(
        "poster-templates/*.png",
        ROOT / "pagesSub" / "profileExtra" / "static" / "poster-templates",
        (328, 588),
        78,
    ),
)


def optimize(source: Path, destination_dir: Path, max_size: tuple[int, int], quality: int) -> None:
    relative = source.relative_to(STATIC)
    archived = ARCHIVE / relative
    archived.parent.mkdir(parents=True, exist_ok=True)
    if not archived.exists():
        shutil.copy2(source, archived)

    destination_dir.mkdir(parents=True, exist_ok=True)
    destination = destination_dir / f"{source.stem}.webp"
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        image.save(
            destination,
            "WEBP",
            quality=quality,
            method=6,
            exact=image.mode == "RGBA",
        )
    print(
        f"{relative.as_posix()} -> {destination.relative_to(ROOT).as_posix()} "
        f"({source.stat().st_size} -> {destination.stat().st_size} bytes)"
    )


def main() -> None:
    for group in GROUPS:
        for source in sorted(STATIC.glob(group.source_glob)):
            if source.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                continue
            optimize(source, group.destination, group.max_size, group.quality)


if __name__ == "__main__":
    main()
