import os
import re
import json

# Group files into modules
def get_module(filepath):
    fp = filepath.replace('\\', '/')
    if fp == 'server.ts':
        return 'Backend (server.ts)'
    if 'src/i18n/' in fp:
        return 'i18n Infrastructure'
    if 'src/components/' in fp:
        fn = os.path.basename(fp)
        if 'Tarot' in fn or 'tarot' in fn:
            return 'Tarot Module'
        if 'Astro' in fn or 'Zodiac' in fn or 'Transit' in fn or 'Natal' in fn or 'CircularChart' in fn or 'InteractiveAstro' in fn or 'Planetary' in fn or 'Synastry' in fn or 'Lunar' in fn:
            return 'Astrology Module'
        if 'Numerology' in fp or 'numerology' in fp:
            return 'Numerology Module'
        if 'Cupido' in fn or 'Compatibility' in fn or 'Synastry' in fn:
            return 'Compatibility & Synastry Module'
        if 'Dream' in fn or 'dreams' in fn or 'Oniric' in fn:
            return 'Dreams Module'
        if 'Chakra' in fn:
            return 'Chakras Module'
        if 'Biorhythm' in fn:
            return 'Biorhythms Module'
        if 'Prosperity' in fn or 'prosperity' in fn:
            return 'Prosperity Module'
        if 'Premium' in fn or 'Conversion' in fn:
            return 'Subscriptions & Premium Module'
        if 'Social' in fn or 'Community' in fn:
            return 'Social & Virality Module'
        if 'Dashboard' in fn or 'UserDashboard' in fn or 'Portal' in fn:
            return 'Dashboard & Portal Module'
        return 'Other Components'
    if 'src/lib/' in fp:
        return 'Libraries & Utilities'
    if fp == 'src/App.tsx':
        return 'Core Layout & Navigation (App.tsx)'
    if fp.startswith('src/'):
        fn = os.path.basename(fp)
        if 'tarot' in fn: return 'Tarot Module'
        if 'numerology' in fn: return 'Numerology Module'
        if 'prosperity' in fn: return 'Prosperity Module'
        if 'data' in fn: return 'Data Files'
        return 'Root Src Files'
    return 'Other Files'

all_files = []
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            all_files.append(os.path.join(root, f))
if os.path.exists('server.ts'):
    all_files.append('server.ts')

pt_char = re.compile(r'[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]')

module_stats = {}

total_hardcoded = 0
total_visible_ui = 0
total_internal_tech = 0

for fp in sorted(all_files):
    if 'src/i18n/' in fp or 'src/scripts/' in fp:
        continue
    mod = get_module(fp)
    if mod not in module_stats:
        module_stats[mod] = {
            'files': [],
            'hardcoded_lines': 0,
            't_literal_calls': 0,
            't_semantic_calls': 0,
            'examples': []
        }
    
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
    fp_lines = 0
    for idx, line in enumerate(lines, 1):
        l_strip = line.strip()
        if l_strip.startswith('//') or l_strip.startswith('import ') or 'console.' in l_strip:
            continue
            
        t_matches = re.findall(r't\((["\'])(.*?)\1\)', line)
        for q, tm in t_matches:
            if ' ' in tm or pt_char.search(tm):
                module_stats[mod]['t_literal_calls'] += 1
            else:
                module_stats[mod]['t_semantic_calls'] += 1
                
        if pt_char.search(line):
            if ('"' in line or "'" in line or "`" in line or '>' in line) and 't(' not in line and 't`' not in line:
                fp_lines += 1
                total_hardcoded += 1
                if len(module_stats[mod]['examples']) < 5:
                    module_stats[mod]['examples'].append((os.path.basename(fp), idx, l_strip[:100]))
                    
    if fp not in module_stats[mod]['files']:
        module_stats[mod]['files'].append(fp)
    module_stats[mod]['hardcoded_lines'] += fp_lines

print("=== MODULE BREAKDOWN ===")
for mod, data in sorted(module_stats.items(), key=lambda x: x[1]['hardcoded_lines'], reverse=True):
    print(f"\n📁 {mod}")
    print(f"   Files involved: {len(data['files'])}")
    print(f"   Hardcoded PT lines: {data['hardcoded_lines']}")
    print(f"   t() literal phrase calls: {data['t_literal_calls']}")
    print(f"   t() semantic ID calls: {data['t_semantic_calls']}")
    print("   Examples:")
    for fn, lno, txt in data['examples']:
        print(f"     - {fn}:L{lno}: {txt}")
