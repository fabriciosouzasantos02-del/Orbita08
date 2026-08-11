import os
import re
import json

# Collect files
src_files = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            src_files.append(os.path.join(root, f))

all_target_files = sorted(src_files)
if os.path.exists('server.ts'):
    all_target_files.append('server.ts')

pt_char = re.compile(r'[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]')

hardcoded_lines = []
t_literal_keys = []
t_semantic_keys = []

by_file = {}

for fp in all_target_files:
    if fp.startswith('src/i18n/') or fp.startswith('src/scripts/'):
        continue
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    fp_hardcoded = 0
    for idx, line in enumerate(lines, 1):
        l_strip = line.strip()
        if l_strip.startswith('//') or l_strip.startswith('import ') or 'console.' in l_strip:
            continue

        # Find t("...") or t('...')
        t_matches = re.findall(r't\((["\'])(.*?)\1\)', line)
        for quote, tm in t_matches:
            if ' ' in tm or pt_char.search(tm):
                t_literal_keys.append((fp, idx, tm))
            else:
                t_semantic_keys.append((fp, idx, tm))

        # Check hardcoded Portuguese
        if pt_char.search(line):
            if ('"' in line or "'" in line or "`" in line or '>' in line) and 't(' not in line and 't`' not in line:
                hardcoded_lines.append((fp, idx, l_strip))
                fp_hardcoded += 1

    if fp_hardcoded > 0:
        by_file[fp] = fp_hardcoded

print("=== STATS ===")
print(f"Total TS/TSX files scanned: {len(all_target_files)}")
print(f"Files with hardcoded PT: {len(by_file)}")
print(f"Total hardcoded PT lines: {len(hardcoded_lines)}")
print(f"Total t() calls with literal Portuguese phrases: {len(t_literal_keys)}")
print(f"Total t() calls with semantic keys: {len(t_semantic_keys)}")

print("\n=== TOP FILES WITH HARDCODED PT ===")
for fp, cnt in sorted(by_file.items(), key=lambda x: x[1], reverse=True)[:25]:
    print(f" - {fp}: {cnt} lines")

# Save detailed output for analysis
with open('audit_details.json', 'w', encoding='utf-8') as out_f:
    json.dump({
        "hardcoded_count": len(hardcoded_lines),
        "hardcoded_lines": hardcoded_lines[:100],
        "t_literal_count": len(t_literal_keys),
        "t_semantic_count": len(t_semantic_keys),
        "by_file": by_file
    }, out_f, indent=2, ensure_ascii=False)
