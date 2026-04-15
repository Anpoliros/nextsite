#!/usr/bin/env python3
"""
智能处理 Markdown 文件中的图片引用

功能：
1. 将 MD 文件中的图片引用替换为图片目录的绝对/相对路径
2. 支持 Web 模式（Hugo 等静态站点生成器）
3. 使用最长匹配算法精确匹配图片路径
4. 支持自定义路径转换模式

使用方法:
    python md_image_processor.py --image-dir ./images --md-dir ./content
    python md_image_processor.py --image-dir ./images --md-dir ./content --web
    python md_image_processor.py --image-dir ./images --md-dir ./content --web --pattern "/static/images/{path}"
    python md_image_processor.py --image-dir ./images --md-dir ./content --dry-run
"""

import os
import re
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional


class ImagePathMatcher:
    """图片路径匹配器，使用字典树(Trie)实现高效的最长匹配"""
    
    def __init__(self):
        self.images = {}  # 存储 {相对路径: 绝对路径}
        self.path_parts_map = {}  # 存储 {路径部分: [完整路径列表]} 用于快速查找
        self.no_ext_map = {}  # 存储 {不带扩展名的路径: [完整路径列表]} 用于无扩展名匹配
    
    def add_image(self, relative_path: str, absolute_path: str):
        """添加图片路径到索引"""
        # 标准化路径分隔符
        relative_path = relative_path.replace('\\', '/')
        self.images[relative_path] = absolute_path
        
        # 建立反向索引：从文件名到完整路径
        filename = os.path.basename(relative_path)
        if filename not in self.path_parts_map:
            self.path_parts_map[filename] = []
        self.path_parts_map[filename].append(relative_path)
        
        # 建立无扩展名索引：支持 mcp-1 匹配到 mcp-1.png
        filename_no_ext = os.path.splitext(filename)[0]
        if filename_no_ext not in self.no_ext_map:
            self.no_ext_map[filename_no_ext] = []
        self.no_ext_map[filename_no_ext].append(relative_path)
        
        # 同时为完整路径（不带扩展名）建立索引
        path_no_ext = os.path.splitext(relative_path)[0]
        if path_no_ext not in self.no_ext_map:
            self.no_ext_map[path_no_ext] = []
        self.no_ext_map[path_no_ext].append(relative_path)
    
    def find_best_match(self, image_ref: str) -> Optional[str]:
        """
        使用最长匹配算法查找最佳匹配的图片路径
        
        Args:
            image_ref: MD 中引用的图片路径
            
        Returns:
            匹配到的图片相对路径，如果没有匹配则返回 None
        """
        # 标准化路径
        image_ref = image_ref.replace('\\', '/')
        image_ref = image_ref.lstrip('./')
        
        # 移除开头的斜杠（处理绝对路径如 /images/pic.png）
        image_ref = image_ref.lstrip('/')
        
        # 1. 尝试直接匹配
        if image_ref in self.images:
            return image_ref
        
        # 2. 智能提取路径：尝试移除常见的前缀目录（如 images/, static/images/ 等）
        # 生成多个候选路径进行匹配
        candidates_to_try = [image_ref]
        
        # 分割路径，尝试去掉前面的目录
        parts = image_ref.split('/')
        for i in range(1, len(parts)):
            candidates_to_try.append('/'.join(parts[i:]))
        
        # 对每个候选路径尝试匹配
        best_match = None
        best_match_length = 0
        
        for candidate in candidates_to_try:
            # 2.1 尝试直接匹配候选路径
            if candidate in self.images:
                if len(candidate) > best_match_length:
                    best_match = candidate
                    best_match_length = len(candidate)
                continue
            
            # 2.2 尝试后缀匹配（最长匹配）
            for image_path in self.images.keys():
                # 检查 image_path 是否以 candidate 结尾
                if image_path.endswith(candidate):
                    # 确保是完整的路径组件匹配（避免部分文件名匹配）
                    if len(image_path) == len(candidate) or image_path[-len(candidate)-1] == '/':
                        if len(candidate) > best_match_length:
                            best_match = image_path
                            best_match_length = len(candidate)
        
        if best_match:
            return best_match
        
        # 3. 尝试无扩展名匹配（支持 mcp-1 匹配到 mcp-1.png）
        if image_ref in self.no_ext_map:
            candidates = self.no_ext_map[image_ref]
            if len(candidates) == 1:
                return candidates[0]
            # 如果有多个匹配（如 mcp-1.png 和 mcp-1.jpeg），优先返回 .png，然后 .jpg/.jpeg
            for ext in ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']:
                for candidate in candidates:
                    if candidate.lower().endswith(ext):
                        return candidate
            # 否则返回第一个
            return candidates[0]
        
        # 尝试去掉候选路径扩展名后匹配
        for candidate in candidates_to_try:
            candidate_no_ext = os.path.splitext(candidate)[0]
            if candidate_no_ext in self.no_ext_map:
                matches = self.no_ext_map[candidate_no_ext]
                if len(matches) == 1:
                    return matches[0]
                # 多个匹配时优先 .png
                for ext in ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']:
                    for match in matches:
                        if match.lower().endswith(ext):
                            return match
                return matches[0]
        
        # 4. 尝试文件名匹配（如果引用中没有路径，或者之前的匹配都失败了）
        filename = os.path.basename(image_ref)
        
        # 先尝试带扩展名的文件名匹配
        if filename in self.path_parts_map:
            candidates = self.path_parts_map[filename]
            if len(candidates) == 1:
                return candidates[0]
            
            # 如果有多个同名文件，尝试使用更多上下文进行匹配
            # 比如 /images/123/x250-1.png，我们尝试匹配包含 123 的路径
            if len(parts) >= 2:
                parent_dir = parts[-2]  # 获取父目录名
                for candidate_path in candidates:
                    if parent_dir in candidate_path:
                        return candidate_path
            
            # 否则返回路径最短的（最可能是用户想要的）
            return min(candidates, key=lambda x: len(x))
        
        # 再尝试不带扩展名的文件名匹配
        filename_no_ext = os.path.splitext(filename)[0]
        if filename_no_ext in self.no_ext_map:
            candidates = self.no_ext_map[filename_no_ext]
            if len(candidates) == 1:
                return candidates[0]
            
            # 如果有多个同名文件
            if len(parts) >= 2:
                parent_dir = parts[-2]
                for candidate_path in candidates:
                    if parent_dir in candidate_path:
                        return candidate_path
            
            # 优先返回 .png
            for ext in ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']:
                for candidate in candidates:
                    if candidate.lower().endswith(ext):
                        return candidate
            
            return min(candidates, key=lambda x: len(x))
        
        # 5. 尝试包含匹配（查找包含该引用的所有路径，选择最长匹配）
        for candidate in candidates_to_try:
            for image_path in self.images.keys():
                if candidate in image_path:
                    # 提取匹配部分，确保是路径组件
                    img_parts = image_path.split('/')
                    ref_parts = candidate.split('/')
                    
                    # 检查是否是连续的路径片段
                    for i in range(len(img_parts) - len(ref_parts) + 1):
                        if img_parts[i:i+len(ref_parts)] == ref_parts:
                            if len(candidate) > best_match_length:
                                best_match = image_path
                                best_match_length = len(candidate)
        
        return best_match


class MarkdownImageProcessor:
    """Markdown 图片引用处理器"""
    
    # 默认路径转换模式
    DEFAULT_PATTERNS = {
        'web': '/{path}',  # Web 模式：/images/pic1.png
        'relative': '{path}',  # 相对路径模式：images/pic1.png
        'absolute': '{abs_path}',  # 绝对路径模式：/home/user/images/pic1.png
    }
    
    def __init__(self, image_dir: str, md_dir: str, is_web: bool = False, 
                 custom_pattern: Optional[str] = None, dry_run: bool = False,
                 verbose: bool = False):
        """
        初始化处理器
        
        Args:
            image_dir: 图片目录路径
            md_dir: Markdown 文件目录路径
            is_web: 是否为 Web 模式
            custom_pattern: 自定义路径转换模式，支持占位符 {path}, {abs_path}, {filename}
            dry_run: 是否为试运行模式
            verbose: 是否显示详细输出（包括已经正确格式的匹配）
        """
        self.image_dir = Path(image_dir).resolve()
        self.md_dir = Path(md_dir).resolve()
        self.is_web = is_web
        self.dry_run = dry_run
        self.verbose = verbose
        
        # 设置路径转换模式
        if custom_pattern:
            self.path_pattern = custom_pattern
        elif is_web:
            # Web 模式：移除前导 ./ 并添加 /
            base_name = os.path.basename(image_dir).lstrip('.')
            self.path_pattern = f'/{base_name}/{{path}}'
        else:
            self.path_pattern = str(self.image_dir) + '/{path}'
        
        self.matcher = ImagePathMatcher()
        self.stats = {
            'images_found': 0,
            'md_files_processed': 0,
            'references_updated': 0,
            'references_not_found': 0
        }
    
    def scan_images(self):
        """扫描图片目录，建立索引"""
        print(f"正在扫描图片目录: {self.image_dir}")
        
        if not self.image_dir.exists():
            raise ValueError(f"图片目录不存在: {self.image_dir}")
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'}
        
        for root, _, files in os.walk(self.image_dir):
            for filename in files:
                if Path(filename).suffix.lower() in image_extensions:
                    abs_path = Path(root) / filename
                    rel_path = abs_path.relative_to(self.image_dir)
                    rel_path_str = str(rel_path).replace('\\', '/')
                    
                    self.matcher.add_image(rel_path_str, str(abs_path))
                    self.stats['images_found'] += 1
        
        print(f"找到 {self.stats['images_found']} 个图片文件\n")
    
    def convert_path(self, relative_path: str, absolute_path: str) -> str:
        """
        根据配置的模式转换路径
        
        Args:
            relative_path: 相对于图片目录的路径
            absolute_path: 绝对路径
            
        Returns:
            转换后的路径
        """
        filename = os.path.basename(relative_path)
        
        result = self.path_pattern.format(
            path=relative_path,
            abs_path=absolute_path,
            filename=filename
        )
        
        return result
    
    def process_markdown_content(self, content: str, md_file_path: str) -> Tuple[str, int]:
        """
        处理 Markdown 内容，替换图片引用
        
        Args:
            content: Markdown 文件内容
            md_file_path: Markdown 文件路径（用于日志）
            
        Returns:
            (处理后的内容, 替换次数)
        """
        # 匹配 Markdown 图片语法: ![alt](path) 或 ![alt](path "title")
        # 也匹配 HTML img 标签: <img src="path">
        patterns = [
            (r'!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)', 'markdown'),  # Markdown 语法
            (r'<img\s+[^>]*src=["\'"]([^"\']+)["\']', 'html'),  # HTML img 标签
        ]
        
        replacements = 0
        new_content = content
        
        for pattern, syntax_type in patterns:
            matches = list(re.finditer(pattern, new_content))
            
            # 从后往前替换，避免索引变化
            for match in reversed(matches):
                if syntax_type == 'markdown':
                    alt_text = match.group(1)
                    image_ref = match.group(2)
                    full_match = match.group(0)
                else:  # html
                    image_ref = match.group(1)
                    full_match = match.group(0)
                    alt_text = None
                
                # 跳过外部链接
                if image_ref.startswith(('http://', 'https://', '//')):
                    continue
                
                # 查找最佳匹配
                best_match = self.matcher.find_best_match(image_ref)
                
                if best_match:
                    new_path = self.convert_path(
                        best_match,
                        self.matcher.images[best_match]
                    )
                    
                    # 构建新的引用
                    if syntax_type == 'markdown':
                        new_ref = f'![{alt_text}]({new_path})'
                    else:  # html
                        new_ref = full_match.replace(image_ref, new_path)
                    
                    # 检查是否需要替换（路径是否有变化）
                    needs_update = (image_ref != new_path)
                    
                    if needs_update:
                        # 替换
                        start, end = match.span()
                        new_content = new_content[:start] + new_ref + new_content[end:]
                        replacements += 1
                        
                        print(f"  ✓ {image_ref}")
                        print(f"    -> 匹配到: {best_match}")
                        print(f"    -> 输出为: {new_path}")
                    else:
                        # 路径已经正确，只在 verbose 模式下显示
                        if self.verbose:
                            print(f"  ✓ {image_ref}")
                            print(f"    -> 匹配到: {best_match}")
                            print(f"    -> 已是正确格式，无需更新")
                else:
                    self.stats['references_not_found'] += 1
                    print(f"  ✗ 未找到匹配: {image_ref}")
                    
                    # 提供调试信息：显示可能的候选项
                    filename = os.path.basename(image_ref)
                    if filename in self.matcher.path_parts_map:
                        print(f"    提示: 找到同名文件 '{filename}'，可能的候选:")
                        for candidate in self.matcher.path_parts_map[filename][:3]:  # 只显示前3个
                            print(f"      - {candidate}")
        
        return new_content, replacements
    
    def process_markdown_file(self, md_file: Path):
        """处理单个 Markdown 文件"""
        print(f"\n处理文件: {md_file.relative_to(self.md_dir)}")
        
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, replacements = self.process_markdown_content(
                content, str(md_file)
            )
            
            if replacements > 0:
                if self.dry_run:
                    print(f"  [DRY RUN] 将更新 {replacements} 个引用")
                else:
                    with open(md_file, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"  ✓ 已更新 {replacements} 个引用")
                
                self.stats['references_updated'] += replacements
            else:
                print(f"  - 无需更新")
            
            self.stats['md_files_processed'] += 1
            
        except Exception as e:
            print(f"  ✗ 处理失败: {e}")
    
    def process_all_markdown_files(self):
        """处理所有 Markdown 文件"""
        print(f"正在扫描 Markdown 目录: {self.md_dir}")
        print("=" * 70)
        
        if not self.md_dir.exists():
            raise ValueError(f"Markdown 目录不存在: {self.md_dir}")
        
        md_files = list(self.md_dir.rglob('*.md'))
        
        if not md_files:
            print("未找到 Markdown 文件")
            return
        
        print(f"找到 {len(md_files)} 个 Markdown 文件\n")
        
        for md_file in md_files:
            self.process_markdown_file(md_file)
    
    def print_summary(self):
        """打印处理摘要"""
        print("\n" + "=" * 70)
        print("处理摘要:")
        print("-" * 70)
        print(f"图片总数:          {self.stats['images_found']}")
        print(f"处理的 MD 文件:    {self.stats['md_files_processed']}")
        print(f"更新的引用:        {self.stats['references_updated']}")
        print(f"未找到的引用:      {self.stats['references_not_found']}")
        
        if self.dry_run:
            print("\n[DRY RUN] 未实际修改任何文件")
        
        print("=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description='智能处理 Markdown 文件中的图片引用',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 基本用法
  %(prog)s --image-dir ./images --md-dir ./content
  
  # Web 模式（Hugo 等）
  %(prog)s --image-dir ./images --md-dir ./content --web
  
  # 自定义路径模式
  %(prog)s --image-dir ./images --md-dir ./content --pattern "/static/images/{path}"
  
  # 预览模式（不修改文件）
  %(prog)s --image-dir ./images --md-dir ./content --dry-run
  
  # 详细模式（显示所有匹配，包括已正确的）
  %(prog)s --image-dir ./images --md-dir ./content --verbose

路径模式占位符:
  {path}      - 相对于图片目录的路径 (例如: lab1/pic1.png)
  {abs_path}  - 绝对路径 (例如: /home/user/images/lab1/pic1.png)
  {filename}  - 仅文件名 (例如: pic1.png)

无扩展名匹配:
  支持在 Markdown 中不写扩展名，例如 ![](mcp-1) 会自动匹配到 mcp-1.png 或 mcp-1.jpeg
  优先级: .png > .jpg > .jpeg > .webp > .gif > .svg
        """
    )
    
    parser.add_argument(
        '--image-dir',
        required=True,
        help='图片目录路径'
    )
    
    parser.add_argument(
        '--md-dir',
        required=True,
        help='Markdown 文件目录路径'
    )
    
    parser.add_argument(
        '--web',
        action='store_true',
        help='启用 Web 模式（适用于 Hugo 等静态站点生成器）'
    )
    
    parser.add_argument(
        '--pattern',
        help='自定义路径转换模式（覆盖 --web 设置）'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='预览模式，不实际修改文件'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='显示详细输出，包括已经是正确格式的匹配'
    )
    
    args = parser.parse_args()
    
    try:
        # 创建处理器
        processor = MarkdownImageProcessor(
            image_dir=args.image_dir,
            md_dir=args.md_dir,
            is_web=args.web,
            custom_pattern=args.pattern,
            dry_run=args.dry_run,
            verbose=args.verbose
        )
        
        # 显示配置
        print("配置信息:")
        print(f"  图片目录: {processor.image_dir}")
        print(f"  MD 目录:  {processor.md_dir}")
        print(f"  Web 模式: {'是' if args.web else '否'}")
        print(f"  路径模式: {processor.path_pattern}")
        if args.dry_run:
            print(f"  运行模式: 预览模式（不修改文件）")
        print()
        
        # 扫描图片
        processor.scan_images()
        
        # 处理 Markdown 文件
        processor.process_all_markdown_files()
        
        # 打印摘要
        processor.print_summary()
        
    except Exception as e:
        print(f"\n错误: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())