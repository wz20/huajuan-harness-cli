#!/usr/bin/env python3
"""Create a portable ZIP whose non-ASCII paths carry the UTF-8 flag."""

from __future__ import annotations

import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def main() -> int:
    if len(sys.argv) != 3:
        raise SystemExit("usage: create-release-zip.py <source-directory> <output.zip>")

    source = Path(sys.argv[1]).resolve()
    output = Path(sys.argv[2]).resolve()
    if not source.is_dir():
        raise SystemExit(f"source directory does not exist: {source}")

    entries = [source, *sorted(source.rglob("*"), key=lambda item: item.as_posix())]
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9, strict_timestamps=False) as archive:
        for entry in entries:
            if entry.is_symlink():
                raise SystemExit(f"symbolic links are not allowed in Release: {entry}")
            relative = entry.relative_to(source.parent).as_posix()
            archive.write(entry, relative)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
