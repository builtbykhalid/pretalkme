
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Very loose match for ANY react-router-dom import
    # This will match:
    # import { ... } from 'react-router-dom'
    # import * as ... from 'react-router-dom'
    # and replace them with the Vite-approved pattern.
    
    # 1. Matches: import { a, b } from 'react-router-dom';
    pattern1 = re.compile(r"import\s+\{\s*([^}]+)\s*\}\s+from\s+['\"]react-router-dom['\"];?")
    
    # 2. Matches: import * as AnyName from 'react-router-dom';
    #    Optionally matches a following const { ... } = AnyName;
    pattern2 = re.compile(r"import\s+\*\s+as\s+(\w+)\s+from\s+['\"]react-router-dom['\"];?(\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*\1;?)?")

    # 3. Matches our previous intermediate fix: import * as RR from ... const ReactRouterDOM = ... const { ... } = ReactRouterDOM;
    pattern3 = re.compile(r"import\s+\*\s+as\s+RR\s+from\s+['\"]react-router-dom['\"];?\s*const\s+ReactRouterDOM\s*=\s*\(RR\s+as\s+any\)\.default\s*\|\|\s*RR;?\s*const\s+\{\s*([^}]+)\s*\}\s*=\s*ReactRouterDOM;?")

    def replacement1(match):
        items = match.group(1).strip()
        return f"// @ts-ignore\nimport pkg from 'react-router-dom';\nconst {{ {items} }} = pkg;"

    def replacement2(match):
        name = match.group(1)
        items = match.group(3)
        if items:
            return f"// @ts-ignore\nimport pkg from 'react-router-dom';\nconst {{ {items.strip()} }} = pkg;"
        else:
            return f"// @ts-ignore\nimport pkg from 'react-router-dom';\nconst {name} = pkg;"

    def replacement3(match):
        items = match.group(1).strip()
        return f"// @ts-ignore\nimport pkg from 'react-router-dom';\nconst {{ {items} }} = pkg;"

    new_content = content
    new_content = pattern3.sub(replacement3, new_content)
    new_content = pattern2.sub(replacement2, new_content)
    new_content = pattern1.sub(replacement1, new_content)
    
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
