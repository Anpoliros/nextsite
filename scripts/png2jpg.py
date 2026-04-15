# -*- coding: utf-8 -*-
import os
import sys
import argparse
import time
import shutil
import uuid
import concurrent.futures
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from PIL import Image

# =================配置区域=================
# 默认并发工作线程数
DEFAULT_WORKERS = 8

# JPEG 保存质量 (1-95, 95为最高常用质量, 100可能会导致文件过大且收益递减)
JPEG_QUALITY = 95

# 默认是否删除原文件 (True: 删除, False: 保留)
DEFAULT_DELETE_ORIGINAL = True

# 默认是否级联处理子目录 (True: 级联, False: 仅当前目录)
DEFAULT_CASCADE = True

# 即使在reserve模式下，是否尝试复制原始文件的时间属性到新文件
COPY_FILE_STATS = True
# =========================================

def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="将目录下的PNG文件转换为JPEG文件，支持并行处理。")
    
    parser.add_argument('--dir', '-d', required=True, help="要处理的目标目录路径")
    
    parser.add_argument('--reserve', action='store_true', help="保留原始PNG文件 (默认删除)")
    
    parser.add_argument('--no-cascade', action='store_true', help="不遍历子目录 (默认级联处理)")
    
    parser.add_argument('--dry-run', action='store_true', help="仅扫描并显示文件统计，不执行转换")
    
    parser.add_argument('--workers', type=int, default=DEFAULT_WORKERS, help=f"并行处理的进程数 (默认: {DEFAULT_WORKERS})")
    
    return parser.parse_args()

def scan_files(root_dir, cascade):
    """扫描目录下的所有PNG文件"""
    png_files = []
    root_path = Path(root_dir)
    
    if not root_path.exists():
        print(f"错误: 目录 '{root_dir}' 不存在。")
        return []

    if cascade:
        for path in root_path.rglob('*'):
            if path.is_file() and path.suffix.lower() == '.png':
                png_files.append(path)
    else:
        for path in root_path.glob('*'):
            if path.is_file() and path.suffix.lower() == '.png':
                png_files.append(path)
                
    return png_files

def print_tree_structure(files, root_dir):
    """以树形结构打印文件统计 (Dry Run 模式)"""
    print(f"\n[Dry Run] 扫描结果 - 根目录: {root_dir}")
    print("-" * 50)
    
    dir_counts = {}
    total_count = 0
    
    for file_path in files:
        parent = file_path.parent
        if parent not in dir_counts:
            dir_counts[parent] = 0
        dir_counts[parent] += 1
        total_count += 1
        
    sorted_dirs = sorted(dir_counts.keys())
    
    for d in sorted_dirs:
        try:
            rel_path = d.relative_to(root_dir)
            display_path = "." if str(rel_path) == "." else str(rel_path)
            print(f"📁 {display_path}: {dir_counts[d]} 个 PNG 文件")
        except ValueError:
            print(f"📁 {d}: {dir_counts[d]} 个 PNG 文件")
            
    print("-" * 50)
    print(f"总计发现 PNG 文件: {total_count}")
    print("-" * 50)

def convert_one_file(args):
    """单个文件转换逻辑 (用于多进程调用)"""
    file_path, delete_original, archive_dir, root_dir = args
    
    try:
        # 构造目标文件名
        target_path = file_path.with_suffix('.jpg')
        
        # 打开图像
        with Image.open(file_path) as img:
            # 转换为RGB模式 (处理透明通道)
            # 如果图像有透明通道 (RGBA) 或 P 模式带透明度，需要处理背景
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # 创建一个白色背景的新图像
                background = Image.new('RGB', img.size, (255, 255, 255))
                # 将原图粘贴到背景上，使用原图的透明通道作为遮罩
                # 注意：这里需要先将原图转为 RGBA 以获取 alpha 通道
                background.paste(img.convert('RGBA'), mask=img.convert('RGBA').split()[3])
                rgb_img = background
            else:
                rgb_img = img.convert('RGB')
            
            # 保存为 JPEG
            # subsampling=0: 关闭色度抽样，保持最高颜色保真度 (4:4:4)
            # quality=JPEG_QUALITY: 设置质量
            rgb_img.save(target_path, 'JPEG', quality=JPEG_QUALITY, subsampling=0)
            
        # 复制文件时间属性 (创建时间、修改时间)
        if COPY_FILE_STATS:
            try:
                shutil.copystat(file_path, target_path)
            except Exception:
                pass # 忽略属性复制错误

        # 删除原文件
        if delete_original:
            try:
                os.remove(file_path)
                return (True, f"转换并删除: {file_path.name}")
            except Exception as e:
                return (False, f"转换成功但删除失败 {file_path.name}: {str(e)}")
        else:
            # 移动到归档目录
            if archive_dir:
                try:
                    # 计算相对路径，保持目录结构
                    rel_path = file_path.relative_to(root_dir)
                    dest_path = archive_dir / rel_path
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(file_path), str(dest_path))
                    return (True, f"转换并归档: {file_path.name}")
                except Exception as e:
                     return (False, f"转换成功但归档失败 {file_path.name}: {str(e)}")
            return (True, f"转换保留: {file_path.name}")
            
    except Exception as e:
        return (False, f"失败 {file_path.name}: {str(e)}")

def main():
    args = parse_arguments()
    
    # 参数处理逻辑
    delete_mode = not args.reserve       # reserve=True -> delete_mode=False
    cascade_mode = not args.no_cascade   # no_cascade=True -> cascade_mode=False
    
    target_dir = Path(args.dir)
    workers = args.workers
    
    start_scan = time.time()
    png_files = scan_files(target_dir, cascade_mode)
    scan_duration = time.time() - start_scan
    
    if args.dry_run:
        print_tree_structure(png_files, target_dir)
        return

    total_files = len(png_files)
    if total_files == 0:
        print("没有需要处理的文件。")
        return

    print(f"扫描完成，耗时 {scan_duration:.2f} 秒。共找到 {total_files} 个 PNG 文件。")
    print(f"开始处理，并发数: {workers}")

    archive_dir = None
    if not delete_mode:
        # 生成归档目录名 png_{xxxx}
        uid = str(uuid.uuid4())[:4]
        archive_dir_name = f"png_{uid}"
        archive_dir = target_dir / archive_dir_name
        print(f"模式: 保留原文件并归档至: {archive_dir_name}")
        # 创建归档根目录（虽然线程里也会创建父目录，这里先创建根目录比较稳妥）
        if not args.dry_run:
            archive_dir.mkdir(parents=True, exist_ok=True)
    else:
        print("模式: 删除原文件")
        
    print(f"级联处理子目录: {'是' if cascade_mode else '否'}")
    print(f"JPEG 质量: {JPEG_QUALITY}")
    
    start_process = time.time()
    
    # 准备任务参数
    # 如果是归档模式，传递 archive_dir 和 target_dir (作为root计算相对路径)
    tasks = [(f, delete_mode, archive_dir, target_dir) for f in png_files]
    
    success_count = 0
    fail_count = 0
    
    # 使用进程池并行处理
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as executor:
        # 使用 map 或者 submit 都可以，这里用 map 方便获取结果顺序，但为了进度条可能需要 as_completed (这里简化为直接迭代)
        # 为了更好的体验，我们打印简单的进度
        results = list(executor.map(convert_one_file, tasks))
        
        for success, msg in results:
            if success:
                success_count += 1
                # print(msg) # 文件太多时建议注释掉，或者仅打印失败的
            else:
                fail_count += 1
                print(f"[错误] {msg}")

    end_process = time.time()
    duration = end_process - start_process
    
    print("-" * 50)
    print(f"处理完成。")
    print(f"总耗时: {duration:.2f} 秒")
    print(f"平均速度: {len(png_files) / duration if duration > 0 else 0:.1f} 文件/秒")
    print(f"成功: {success_count}")
    print(f"失败: {fail_count}")
    print("-" * 50)

if __name__ == '__main__':
    main()
