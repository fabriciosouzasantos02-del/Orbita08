import { mergedTranslations } from '../i18n';

const languages = ['pt', 'en', 'es', 'de', 'fr'] as const;

console.log("=== DEEP DICTIONARY AUDIT ===");

const keysPerLang: Record<string, number> = {};
const dictByLang: Record<string, Record<string, string>> = {
  pt: {},
  en: {},
  es: {},
  de: {},
  fr: {}
};

for (const lang of languages) {
  dictByLang[lang] = (mergedTranslations[lang] || {}) as Record<string, string>;
  keysPerLang[lang] = Object.keys(dictByLang[lang]).length;
}

console.log("Total keys per language:");
console.log(JSON.stringify(keysPerLang, null, 2));

const ptKeys = Object.keys(dictByLang.pt);
console.log(`Total Base PT Keys: ${ptKeys.length}`);

// Count literal phrase keys vs semantic keys in Base PT dictionary
let literalPhraseKeys = 0;
let semanticIdKeys = 0;

for (const k of ptKeys) {
  if (k.includes(' ') || /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(k)) {
    literalPhraseKeys++;
  } else {
    semanticIdKeys++;
  }
}

console.log(`Literal Phrase Keys in PT dict: ${literalPhraseKeys}`);
console.log(`Semantic ID Keys in PT dict: ${semanticIdKeys}`);

// Check missing keys in each language compared to PT
const missingKeys: Record<string, string[]> = { en: [], es: [], de: [], fr: [] };
const emptyKeys: Record<string, string[]> = { pt: [], en: [], es: [], de: [], fr: [] };

for (const lang of languages) {
  for (const k of ptKeys) {
    const val = dictByLang[lang]?.[k];
    if (val === undefined) {
      if (lang !== 'pt') missingKeys[lang].push(k);
    } else if (val === '') {
      emptyKeys[lang].push(k);
    }
  }
}

console.log("\nMissing keys count relative to PT:");
for (const lang of ['en', 'es', 'de', 'fr']) {
  console.log(` - ${lang}: ${missingKeys[lang].length} missing keys`);
}

console.log("\nEmpty string values count:");
for (const lang of languages) {
  console.log(` - ${lang}: ${emptyKeys[lang].length} empty values`);
}

// Check Portuguese leakage in EN, ES, DE, FR (where string in non-PT is identical to PT string or contains PT specific words)
const ptLeakage: Record<string, Array<{ key: string; ptVal: string; targetVal: string }>> = {
  en: [],
  es: [],
  de: [],
  fr: []
};

const ptRegex = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/i;

for (const lang of ['en', 'es', 'de', 'fr'] as const) {
  for (const k of ptKeys) {
    const ptVal = dictByLang.pt[k];
    const targetVal = dictByLang[lang]?.[k];
    if (!targetVal) continue;

    // Check exact match for long phrases or PT specific accented words in non-PT
    if (ptVal.length > 15 && ptVal === targetVal) {
      ptLeakage[lang].push({ key: k, ptVal, targetVal });
    } else if (lang !== 'es' && lang !== 'pt' && ptRegex.test(targetVal) && ptVal.length > 10) {
      // If EN, DE, FR contains PT accented characters and matches PT
      ptLeakage[lang].push({ key: k, ptVal, targetVal });
    }
  }
}

console.log("\nPortuguese leakage count in non-PT dictionaries:");
for (const lang of ['en', 'es', 'de', 'fr']) {
  console.log(` - ${lang}: ${ptLeakage[lang].length} leaked PT entries`);
}

// Check placeholder inconsistencies (e.g., {{var}}, {var}, %s)
const placeholderRegex = /\{\{?\w+\}?\}|\%\w+/g;
const placeholderIssues: Array<{ key: string; lang: string; ptPlaceholders: string[]; targetPlaceholders: string[] }> = [];

for (const k of ptKeys) {
  const ptVal = dictByLang.pt[k] || '';
  const ptMatches = (ptVal.match(placeholderRegex) || []).sort();

  if (ptMatches.length > 0) {
    for (const lang of ['en', 'es', 'de', 'fr'] as const) {
      const targetVal = dictByLang[lang]?.[k] || '';
      const targetMatches = (targetVal.match(placeholderRegex) || []).sort();

      if (JSON.stringify(ptMatches) !== JSON.stringify(targetMatches)) {
        placeholderIssues.push({
          key: k,
          lang,
          ptPlaceholders: ptMatches,
          targetPlaceholders: targetMatches
        });
      }
    }
  }
}

console.log(`\nPlaceholder Inconsistencies count: ${placeholderIssues.length}`);

// Check duplications (different keys with exact same PT value)
const ptValuesMap: Record<string, string[]> = {};
for (const k of ptKeys) {
  const val = dictByLang.pt[k];
  if (val && val.length > 10) {
    ptValuesMap[val] = ptValuesMap[val] || [];
    ptValuesMap[val].push(k);
  }
}

let duplicateValueCount = 0;
for (const [val, keysList] of Object.entries(ptValuesMap)) {
  if (keysList.length > 1) {
    duplicateValueCount += (keysList.length - 1);
  }
}

console.log(`Duplicated PT values across multiple keys: ${duplicateValueCount}`);
