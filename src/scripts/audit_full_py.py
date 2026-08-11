import os
import re

files_to_check = []
for root, dirs, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            files_to_check.append(os.path.join(root, f))

if os.path.exists("server.ts"):
    files_to_check.append("server.ts")

pt_regex = re.compile(r"[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]")

hardcoded_findings = []

for filepath in sorted(files_to_check):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        l_strip = line.strip()
        if l_strip.startswith("//") or l_strip.startswith("import ") or "console." in l_strip:
            continue
        if pt_regex.search(line):
            if ('"' in line or "'" in line or "`" in line or ">" in line) and "t(" not in line and "t`" not in line:
                if not filepath.startswith("src/i18n/") and not filepath.startswith("src/scripts/"):
                    hardcoded_findings.append((filepath, idx, l_strip))

print(f"TOTAL_HARDCODED_LINES={len(hardcoded_findings)}")

by_file = {}
for fp, line_no, text in hardcoded_findings:
    by_file.setdefault(fp, []).append((line_no, text))

for fp, items in sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"\nFILE: {fp} | TOTAL: {len(items)}")
    for l_no, txt in items[:12]:
        print(f"  Line {l_no}: {txt[:120]}")
