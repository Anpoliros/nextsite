#!/usr/bin/env python3
"""
清除指定目录中的 .DS_Store 文件和以 ._ 开头的文件

使用方法:
    python clean_files.py /path/to/directory
    python clean_files.py /path/to/directory --dry-run  # 仅显示将要删除的文件，不实际删除
"""

import os
import sys
import argparse


def find_files_to_clean(directory):
    """
    查找目录中需要清除的文件
    
    Args:
        directory: 要搜索的目录路径
        
    Returns:
        list: 需要删除的文件路径列表
    """
    files_to_delete = []
    
    for root, dirs, files in os.walk(directory):
        for filename in files:
            # 检查是否是 .DS_Store 或以 ._ 开头的文件
            if filename == '.DS_Store' or filename.startswith('._'):
                filepath = os.path.join(root, filename)
                files_to_delete.append(filepath)
    
    return files_to_delete


def delete_files(files, dry_run=False):
    """
    删除文件列表中的文件
    
    Args:
        files: 要删除的文件路径列表
        dry_run: 如果为True，只显示不实际删除
        
    Returns:
        tuple: (成功删除的数量, 失败的数量)
    """
    success_count = 0
    fail_count = 0
    
    for filepath in files:
        try:
            if dry_run:
                print(f"[DRY RUN] 将删除: {filepath}")
                success_count += 1
            else:
                os.remove(filepath)
                print(f"已删除: {filepath}")
                success_count += 1
        except Exception as e:
            print(f"删除失败 {filepath}: {e}")
            fail_count += 1
    
    return success_count, fail_count


def main():
    parser = argparse.ArgumentParser(
        description='清除指定目录中的 .DS_Store 文件和以 ._ 开头的文件'
    )
    parser.add_argument(
        'directory',
        help='要清理的目录路径'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='仅显示将要删除的文件，不实际删除'
    )
    
    args = parser.parse_args()
    
    # 检查目录是否存在
    if not os.path.exists(args.directory):
        print(f"错误: 目录 '{args.directory}' 不存在")
        sys.exit(1)
    
    if not os.path.isdir(args.directory):
        print(f"错误: '{args.directory}' 不是一个目录")
        sys.exit(1)
    
    print(f"正在扫描目录: {args.directory}")
    print("-" * 60)
    
    # 查找需要删除的文件
    files_to_delete = find_files_to_clean(args.directory)
    
    if not files_to_delete:
        print("未找到需要清除的文件")
        return
    
    print(f"找到 {len(files_to_delete)} 个文件需要清除\n")
    
    # 删除文件
    success, fail = delete_files(files_to_delete, args.dry_run)
    
    print("-" * 60)
    if args.dry_run:
        print(f"\n[DRY RUN] 找到 {success} 个文件")
    else:
        print(f"\n完成！成功删除 {success} 个文件")
        if fail > 0:
            print(f"失败 {fail} 个文件")


if __name__ == '__main__':
    main()