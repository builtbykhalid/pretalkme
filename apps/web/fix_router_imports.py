
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern 1: import * as ReactRouterDOM from 'react-router-dom';
    #            const { ... } = ReactRouterDOM;
    pattern1 = re.compile(r"import\s+\*\s+as\s+ReactRouterDOM\s+from\s+['\"]react-router-dom['\"];?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*ReactRouterDOM;?")
    
    # Pattern 2: import { ... } from 'react-router-dom';
    pattern2 = re.compile(r"import\s+\{\s*([^}]+)\s*\}\s+from\s+['\"]react-router-dom['\"];?")

    new_content = content
    
    def replacement(match):
        items = match.group(1).strip()
        return f"import * as RR from 'react-router-dom';\nconst ReactRouterDOM = (RR as any).default || RR;\nconst {{ {items} }} = ReactRouterDOM;"

    new_content = pattern1.sub(replacement, new_content)
    new_content = pattern2.sub(replacement, new_content)
    
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
