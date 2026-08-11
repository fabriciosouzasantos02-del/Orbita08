import os
import re

ui_files = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx') and not root.startswith('src/i18n') and not root.startswith('src/scripts'):
            ui_files.append(os.path.join(root, f))

print(f"Total TSX files: {len(ui_files)}")

legacy_t_calls = []
hardcoded_jsx = []

for fp in sorted(ui_files):
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        # find t("phrase") or t('phrase')
        matches = re.findall(r't\((["\'])(.*?)\1\)', line)
        for q, m in matches:
            if ' ' in m or re.search(r'[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]', m):
                legacy_t_calls.append((fp, idx, m))
        
        # find raw text in JSX tags
        jsx_matches = re.findall(r'>\s*([^<{][^<>{}\r\n\t]{2,})\s*<', line)
        for jm in jsx_matches:
            jm_s = jm.strip()
            if re.search(r'[a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]', jm_s) and not jm_s.startswith('//') and not jm_s.startswith('/*'):
                hardcoded_jsx.append((fp, idx, jm_s))

print(f"Legacy t('phrase') calls in TSX: {len(legacy_t_calls)}")
print(f"Hardcoded JSX text nodes in TSX: {len(hardcoded_jsx)}")

by_file_t = {}
for fp, idx, m in legacy_t_calls:
    by_file_t[fp] = by_file_t.get(fp, 0) + 1

print("\nTop files with legacy t('phrase') calls:")
for fp, cnt in sorted(by_file_t.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  {fp}: {cnt}")

by_file_jsx = {}
for fp, idx, m in hardcoded_jsx:
    by_file_jsx[fp] = by_file_jsx.get(fp, 0) + 1

print("\nTop files with hardcoded JSX text:")
for fp, cnt in sorted(by_file_jsx.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f"  {fp}: {cnt}")
