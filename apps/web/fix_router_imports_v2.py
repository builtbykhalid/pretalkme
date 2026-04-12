
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Target our previous "robust" fix (RR)
    pattern_rr = re.compile(r"import\s+\*\s+as\s+RR\s+from\s+['\"]react-router-dom['\"];?\s*const\s+ReactRouterDOM\s*=\s*\(RR\s+as\s+any\)\.default\s*\|\|\s*RR;?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*ReactRouterDOM;?")
    
    # Target the old * as ReactRouterDOM fix
    pattern_rrd = re.compile(r"import\s+\*\s+as\s+ReactRouterDOM\s+from\s+['\"]react-router-dom['\"];?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*ReactRouterDOM;?")

    # Target standard named imports (just in case)
    pattern_named = re.compile(r"import\s+\{\s*([^}]+)\s*\}\s+from\s+['\"]react-router-dom['\"];?")

    new_content = content
    
    def replacement(match):
        items = match.group(1).strip()
        return f"// @ts-ignore\nimport pkg from 'react-router-dom';\nconst {{ {items} }} = pkg;"

    new_content = pattern_rr.sub(replacement, new_content)
    new_content = pattern_rrd.sub(replacement, new_content)
    new_content = pattern_named.sub(replacement, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

root = r"c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src"
count = 0
for dirpath, dirnames, filenames in os.walk(root):
    for filename in filenames:
        if filename.endswith(('.tsx', '.ts', '.jsx', '.js')):
            if fix_file(os.path.join(dirpath, filename)):
                print(f"Fixed: {os.path.join(dirpath, filename)}")
                count += 1

print(f"Total files fixed: {count}")
