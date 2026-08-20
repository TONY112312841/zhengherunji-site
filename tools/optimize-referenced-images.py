from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "upload" / "images" / "optimized" / "generated"
MANIFEST = ROOT / "tools" / "optimized-images.json"
EXCLUDED = {".git", ".wrangler", ".vercel", "deploy", "node_modules", "归档"}
MIN_BYTES = 90 * 1024
MAX_EDGE = 1920


def html_files() -> list[Path]:
    return [
        path
        for path in ROOT.rglob("*.html")
        if not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)
    ]


def referenced_jpegs() -> set[Path]:
    found: set[Path] = set()
    expression = re.compile(r'(?:src|data-src)=["\']([^"\']+)["\']', re.I)
    for html_path in html_files():
        html = html_path.read_text(encoding="utf-8")
        for match in expression.finditer(html):
            value = match.group(1).split("?", 1)[0]
            if value.startswith(("http:", "https:", "//", "data:")):
                continue
            try:
                source = (html_path.parent / value.lstrip("/")).resolve()
            except OSError:
                continue
            if not source.is_relative_to(ROOT) or source.suffix.lower() not in {".jpg", ".jpeg"}:
                continue
            if source.exists() and source.stat().st_size >= MIN_BYTES:
                found.add(source)
    if MANIFEST.exists():
        previous = json.loads(MANIFEST.read_text(encoding="utf-8"))
        for value in previous:
            source = (ROOT / value).resolve()
            if source.is_relative_to(ROOT) and source.exists() and source.stat().st_size >= MIN_BYTES:
                found.add(source)
    return found


def optimize(source: Path) -> tuple[Path, tuple[int, int], tuple[int, int]] | None:
    relative = source.relative_to(ROOT).as_posix()
    digest = hashlib.sha1(relative.encode("utf-8")).hexdigest()[:10]
    target = OUTPUT / f"image-{digest}.webp"

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        original_size = image.size
        if max(image.size) > MAX_EDGE:
            image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        optimized_size = image.size
        image.save(target, "WEBP", quality=80, method=6, optimize=True)

    if target.stat().st_size >= source.stat().st_size * 0.88:
        target.unlink()
        return None
    return target, original_size, optimized_size


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    if not OUTPUT.resolve().is_relative_to(ROOT.resolve()):
        raise RuntimeError("Refusing to clean an output directory outside the workspace")
    for stale in OUTPUT.glob("*.webp"):
        stale.unlink()
    manifest: dict[str, str] = {}
    report: list[dict[str, object]] = []

    for source in sorted(referenced_jpegs()):
        result = optimize(source)
        if result is None:
            continue
        target, original_dimensions, optimized_dimensions = result
        source_rel = source.relative_to(ROOT).as_posix()
        target_rel = target.relative_to(ROOT).as_posix()
        manifest[source_rel] = target_rel
        report.append(
            {
                "source": source_rel,
                "target": target_rel,
                "before": source.stat().st_size,
                "after": target.stat().st_size,
                "dimensions_before": original_dimensions,
                "dimensions_after": optimized_dimensions,
            }
        )

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    before = sum(item["before"] for item in report)
    after = sum(item["after"] for item in report)
    print(
        json.dumps(
            {
                "converted": len(report),
                "before_bytes": before,
                "after_bytes": after,
                "saved_percent": round((1 - after / before) * 100, 1) if before else 0,
                "images": report,
            },
            indent=2,
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
