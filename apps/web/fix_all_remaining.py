import os, glob, re

base = 'src/components/ReactApp'
files = glob.glob(f'{base}/**/*.tsx', recursive=True)

# Global pattern replacements - applied to ALL files
# These are safe, universal substitutions
global_replacements = [
    # font-black in className strings -> font-semibold
    # We handle specific patterns:
    
    # Tiny text sizes with font-black
    ('text-[8px]', 'text-xs'),
    ('text-[9px]', 'text-xs'),
    ('text-[10px]', 'text-xs'),
    ('text-[11px]', 'text-xs'),
    
    # font-black standalone or with common patterns
    (' font-black tracking-tighter', ' font-semibold'),
    (' font-black tracking-tight', ' font-semibold'),
    (' font-black tracking-wider', ''),
    (' font-black tracking-widest', ''),
    (' font-black uppercase tracking-widest', ''),
    (' font-black uppercase tracking-wider', ''),
    (' font-black uppercase', ''),
    ('font-black uppercase tracking-widest ', ''),
    ('font-black uppercase tracking-wider ', ''),
    ('font-black uppercase ', ''),
    
    # uppercase with tracking in className
    (' uppercase tracking-widest', ''),
    (' uppercase tracking-wider', ''),
    (' uppercase tracking-[0.2em]', ''),
    
    # font-bold uppercase
    (' font-bold uppercase tracking-widest', ' font-medium'),
    (' font-bold uppercase tracking-wider', ' font-medium'),
    (' font-bold uppercase', ' font-medium'),
    
    # After removing uppercase, clean up remaining font-black
    # These must come AFTER the combined patterns above
]

# File-wide regex: replace remaining 'font-black' not already caught
font_black_regex = re.compile(r'\bfont-black\b')
uppercase_css_regex = re.compile(r'\buppercase\b(?=[^"\']*["\'])')  # uppercase in className strings

total_files_changed = 0
total_replacements = 0

for filepath in sorted(files):
    with open(filepath, encoding='utf-8') as f:
        original = f.read()
    
    content = original
    
    # Apply global string replacements
    for old, new in global_replacements:
        if old in content:
            n = content.count(old)
            content = content.replace(old, new)
            total_replacements += n
    
    # Replace remaining font-black with font-semibold
    # But skip .toUpperCase() and JavaScript logic
    # Only replace inside className="..." or className={`...`} contexts
    def replace_font_black(m):
        return 'font-semibold'
    
    # Simple full replacement of font-black class token
    before_fb = content.count('font-black')
    content = font_black_regex.sub('font-semibold', content)
    after_fb = content.count('font-black')
    total_replacements += (before_fb - after_fb)
    
    # Replace remaining 'uppercase' CSS class (not JS .toUpperCase())
    # We need to be careful: only replace 'uppercase' that's in className strings
    # Strategy: replace ' uppercase' preceded by common tailwind patterns
    uppercase_in_class = re.compile(r'(?<=[\s"\'])uppercase(?=[\s"\'\}])')
    before_uc = len(uppercase_in_class.findall(content))
    content = uppercase_in_class.sub('', content)
    after_uc = len(uppercase_in_class.findall(content))
    total_replacements += (before_uc - after_uc)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        fb_left = content.count('font-black')
        uc_left = len(uppercase_in_class.findall(content))
        print(f'FIXED {os.path.relpath(filepath)}: font-black={fb_left} uppercase={uc_left}')
        total_files_changed += 1

print(f'\nTotal: {total_files_changed} files changed, ~{total_replacements} replacements')
