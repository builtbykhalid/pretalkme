import os, glob

files = glob.glob('src/components/ReactApp/**/*.tsx', recursive=True)
all_clean = True
for f in files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    # Count CSS class occurrences only (skip .toUpperCase() JS calls)
    # We count font-black as CSS issue
    fb = content.count('font-black')
    # For uppercase, only flag when it appears in className strings (not .toUpperCase())
    import re
    uc_css = len(re.findall(r'className[^>]*uppercase', content))
    if fb > 0 or uc_css > 0:
        print(f'{os.path.relpath(f)}: font-black={fb} uppercase-in-class={uc_css}')
        all_clean = False

if all_clean:
    print('ALL CLEAN - no font-black or uppercase CSS classes remaining!')
