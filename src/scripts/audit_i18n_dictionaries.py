import os
import re
import json

# Let's inspect src/i18n files
i18n_dir = 'src/i18n'
i18n_files = [f for f in os.listdir(i18n_dir) if f.endswith('.ts') and f != 'index.ts' and f != 'types.ts']

print(f"Dictionary modules found in src/i18n/: {len(i18n_files)}")
for f in sorted(i18n_files):
    print(f" - {f}")

# Let's run a node script or python regex parser to extract keys per language from src/i18n
