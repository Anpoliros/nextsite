#!/usr/bin/env python3
"""Format Markdown pipe tables by padding cells to aligned right edges."""

from __future__ import annotations

import argparse
import os
import re
import sys
import tempfile
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Iterable


SEPARATOR_RE = re.compile(r"^:?-{3,}:?$")
FENCE_RE = re.compile(r"^\s*(```|~~~)")


class WidthMode(str, Enum):
    VSCODE = "vscode"
    VIM = "vim"


@dataclass(frozen=True)
class FormatResult:
    path: Path
    changed: bool
    error: str | None = None


def has_cjk(text: str) -> bool:
    """判断文本是否包含 CJK 字符，用于决定模糊宽度字符的处理方式。"""
    for char in text:
        codepoint = ord(char)
        if (
            0x3400 <= codepoint <= 0x4DBF
            or 0x4E00 <= codepoint <= 0x9FFF
            or 0xF900 <= codepoint <= 0xFAFF
            or 0x3040 <= codepoint <= 0x30FF
            or 0xAC00 <= codepoint <= 0xD7AF
        ):
            return True
    return False


def display_width(text: str, mode: WidthMode, cjk_context: bool = False) -> int:
    """按显示宽度计算长度：中文等宽字符算 2，普通 ASCII 算 1。"""
    width = 0
    ambiguous_wide = mode is WidthMode.VIM and cjk_context

    for char in text:
        if unicodedata.combining(char):
            continue

        east_asian_width = unicodedata.east_asian_width(char)
        if east_asian_width in {"F", "W"} or (ambiguous_wide and east_asian_width == "A"):
            width += 2
        else:
            width += 1

    return width


def split_table_row(line: str) -> list[str]:
    body = line.rstrip("\n")
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|"):
        body = body[:-1]

    cells: list[str] = []
    current: list[str] = []
    escaped = False

    for char in body:
        if char == "|" and not escaped:
            cells.append("".join(current).strip())
            current = []
            continue

        current.append(char)
        escaped = char == "\\" and not escaped
        if char != "\\":
            escaped = False

    cells.append("".join(current).strip())
    return cells


def is_table_line(line: str) -> bool:
    stripped = line.strip()
    return stripped.startswith("|") and stripped.endswith("|") and stripped.count("|") >= 2


def is_separator_row(cells: Iterable[str]) -> bool:
    return all(SEPARATOR_RE.match(cell.replace(" ", "")) for cell in cells)


def separator_cell(cell: str, width: int) -> str:
    raw = cell.replace(" ", "")
    left = raw.startswith(":")
    right = raw.endswith(":")
    dash_count = max(3, width - int(left) - int(right))

    if left and right:
        return ":" + "-" * dash_count + ":"
    if left:
        return ":" + "-" * dash_count
    if right:
        return "-" * dash_count + ":"
    return "-" * max(3, width)


def format_table_block(lines: list[str], mode: WidthMode) -> list[str]:
    rows = [split_table_row(line) for line in lines]
    column_count = max(len(row) for row in rows)
    cjk_context = any(has_cjk(cell) for row in rows for cell in row)

    normalized_rows = [row + [""] * (column_count - len(row)) for row in rows]
    widths = [
        max(max(display_width(row[index], mode, cjk_context) for row in normalized_rows), 3)
        for index in range(column_count)
    ]

    formatted: list[str] = []
    for row in normalized_rows:
        separator = is_separator_row(row)
        cells: list[str] = []

        for index, cell in enumerate(row):
            if separator:
                value = separator_cell(cell, widths[index])
            else:
                value = cell + " " * (widths[index] - display_width(cell, mode, cjk_context))
            cells.append(f" {value} ")

        formatted.append("|" + "|".join(cells) + "|")

    return formatted


def format_markdown_tables(text: str, mode: WidthMode) -> str:
    lines = text.splitlines()
    output: list[str] = []
    table_buffer: list[str] = []
    in_fence = False

    def flush_table() -> None:
        nonlocal table_buffer
        if len(table_buffer) >= 2:
            output.extend(format_table_block(table_buffer, mode))
        else:
            output.extend(table_buffer)
        table_buffer = []

    for line in lines:
        if FENCE_RE.match(line):
            flush_table()
            in_fence = not in_fence
            output.append(line)
            continue

        if not in_fence and is_table_line(line):
            table_buffer.append(line)
            continue

        flush_table()
        output.append(line)

    flush_table()

    trailing_newline = "\n" if text.endswith("\n") else ""
    return "\n".join(output) + trailing_newline


def write_atomic(path: Path, content: str) -> None:
    """同目录临时文件 + replace，避免中途失败留下半截文件。"""
    fd, tmp_name = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=str(path.parent),
        text=True,
    )
    tmp_path = Path(tmp_name)

    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as file:
            file.write(content)
            file.flush()
            os.fsync(file.fileno())
        os.replace(tmp_path, path)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def process_file(path: Path, dry_run: bool, mode: WidthMode) -> FormatResult:
    try:
        original = path.read_text(encoding="utf-8")
        formatted = format_markdown_tables(original, mode)
        changed = formatted != original

        if changed and not dry_run:
            write_atomic(path, formatted)

        return FormatResult(path=path, changed=changed)
    except Exception as exc:  # noqa: BLE001 - CLI 需要把单文件错误汇总出来
        return FormatResult(path=path, changed=False, error=str(exc))


def collect_markdown_files(directory: Path, recursive: bool) -> list[Path]:
    pattern = "**/*.md" if recursive else "*.md"
    return sorted(path for path in directory.glob(pattern) if path.is_file())


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Format Markdown pipe tables by padding cells.",
    )
    parser.add_argument("file", nargs="?", type=Path, help="Markdown file to format")
    parser.add_argument("-d", "--dir", type=Path, help="Directory containing Markdown files")
    parser.add_argument("--flat", action="store_true", help="Do not recurse in directory mode")
    parser.add_argument("--dry-run", action="store_true", help="Only report files that would change")
    width_group = parser.add_mutually_exclusive_group()
    width_group.add_argument(
        "--vscode",
        action="store_const",
        const=WidthMode.VSCODE,
        dest="mode",
        help="Use VS Code-like width: ambiguous-width characters count as 1 (default)",
    )
    width_group.add_argument(
        "--vim",
        action="store_const",
        const=WidthMode.VIM,
        dest="mode",
        help="Use Vim/CJK-like width: ambiguous-width characters count as 2 near CJK text",
    )
    parser.add_argument(
        "-j",
        "--jobs",
        type=int,
        default=os.cpu_count() or 4,
        help="Worker count in directory mode",
    )
    parser.set_defaults(mode=WidthMode.VSCODE)
    return parser.parse_args(argv)


def validate_args(args: argparse.Namespace) -> str | None:
    if bool(args.file) == bool(args.dir):
        return "请指定一个文件，或使用 -d/--dir 指定一个目录。"
    if args.flat and not args.dir:
        return "--flat 只能和 -d/--dir 一起使用。"
    if args.jobs < 1:
        return "--jobs 必须大于 0。"
    if args.file and (not args.file.exists() or not args.file.is_file()):
        return f"文件不存在或不是普通文件：{args.file}"
    if args.dir and (not args.dir.exists() or not args.dir.is_dir()):
        return f"目录不存在或不是目录：{args.dir}"
    return None


def run_file_mode(path: Path, dry_run: bool, mode: WidthMode) -> int:
    result = process_file(path, dry_run, mode)
    if result.error:
        print(f"error: {result.path}: {result.error}", file=sys.stderr)
        return 1

    if result.changed:
        action = "would format" if dry_run else "formatted"
        print(f"{action}: {result.path}")
    else:
        print(f"unchanged: {result.path}")
    return 0


def run_dir_mode(directory: Path, flat: bool, dry_run: bool, jobs: int, mode: WidthMode) -> int:
    files = collect_markdown_files(directory, recursive=not flat)
    if not files:
        print(f"no markdown files: {directory}")
        return 0

    changed = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=jobs) as executor:
        futures = [executor.submit(process_file, path, dry_run, mode) for path in files]

        for future in as_completed(futures):
            result = future.result()
            if result.error:
                failed += 1
                print(f"error: {result.path}: {result.error}", file=sys.stderr)
                continue

            if result.changed:
                changed += 1
                action = "would format" if dry_run else "formatted"
                print(f"{action}: {result.path}")

    total = len(files)
    mode = "dry-run" if dry_run else "write"
    print(f"done: {total} checked, {changed} changed, {failed} failed ({mode})")
    return 1 if failed else 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    error = validate_args(args)
    if error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    if args.file:
        return run_file_mode(args.file, args.dry_run, args.mode)

    return run_dir_mode(args.dir, args.flat, args.dry_run, args.jobs, args.mode)


if __name__ == "__main__":
    raise SystemExit(main())
