import fs from 'fs';
import path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', 'dist', 'i18n', 'scripts'].includes(file)) {
        results = results.concat(walk(fullPath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (!file.endsWith('.d.ts')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk('./src');
const SEMANTIC_KEY = /^[a-z][a-z0-9]*(?:[._-][a-zA-Z0-9]+)*$/;

const fileMatches: Record<string, string[]> = {};

for (const file of files) {
  if (['translations.ts', 'check-translations.ts', 'check-numerology-translations.ts', 'validate-translations.ts', 'audit-i18n.ts', 'autoAuditPatch.ts', 'translationPatch.ts', 'data.ts'].some(f => file.endsWith(f))) continue;
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const matchesInFile: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('import') || trimmed.startsWith('//') || trimmed.startsWith('*') ||
      trimmed.startsWith('/*') || trimmed.startsWith('interface ') || trimmed.startsWith('type ') ||
      line.includes('console.log') || line.includes('console.error') || line.includes('useTranslation') ||
      line.includes('translateUiText') || line.includes('tI18n') || line.includes(': Record<')
    ) return;

    const matches = [
      ...line.matchAll(/t\(\s*['"]([^'"]{2,})['"]/g),
      ...line.matchAll(/(?:placeholder|title|aria-label|aria-description|alt)=['"]([^'"]{3,})['"]/g),
    ];

    for (const match of matches) {
      const text = match[1]?.trim();
      if (text && (!SEMANTIC_KEY.test(text) || /\s/.test(text))) {
        matchesInFile.push(`L${index + 1}: "${text}"`);
      }
    }
  });

  if (matchesInFile.length > 0) {
    fileMatches[file] = matchesInFile;
  }
}

console.log('Files with non-semantic t() or hardcoded attributes:');
Object.keys(fileMatches).forEach(f => {
  console.log(`\n📄 ${f} (${fileMatches[f].length} occurrences):`);
  fileMatches[f].forEach(m => console.log(`   ${m}`));
});
