
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Matches: // @ts-ignore\nimport pkg from 'react-router-dom';\nconst { ... } = pkg;
    pattern1 = re.compile(r"//\s*@ts-ignore\s*import\s+pkg\s+from\s+['\"]react-router-dom['\"];?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*pkg;?")
    
    # 2. Matches: import pkg from 'react-router-dom';\nconst { ... } = pkg;
    pattern2 = re.compile(r"import\s+pkg\s+from\s+['\"]react-router-dom['\"];?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*pkg;?")

    # 3. Matches: import * as AnyName from 'react-router-dom';\nconst { ... } = (...).default || ...;
    pattern3 = re.compile(r"import\s+\*\s+as\s+(\w+)\s+from\s+['\"]react-router-dom['\"];?\s*const\s+\w+\s*=\s*\(\1\s+as\s+any\)\.default\s*\|\|\s*\1;?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*\w+;?")

    # 4. Matches my previous robust fix (RR)
    pattern4 = re.compile(r"import\s+\*\s+as\s+RR\s+from\s+['\"]react-router-dom['\"];?\s*const\s+ReactRouterDOM\s*=\s*\(RR\s+as\s+any\)\.default\s*\|\|\s*RR;?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*ReactRouterDOM;?")

    def replacement(match):
        # The items are in the last group that matched something non-empty
        items = [g for g in match.groups() if g and '{' not in g]
        if not items:
            # Fallback for pattern 3 where group 1 is the name
            items = match.group(len(match.groups())).strip()
        else:
            items = items[0].strip()
        return f"import {{ {items} }} from 'react-router-dom';"

    new_content = content
    new_content = pattern1.sub(replacement, new_content)
    new_content = pattern2.sub(replacement, new_content)
    new_content = pattern4.sub(replacement, new_content)
    # Pattern 3 is the most complex one, let's handle it manually if needed but try the sub first
    new_content = pattern3.sub(replacement, new_content)
    
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
