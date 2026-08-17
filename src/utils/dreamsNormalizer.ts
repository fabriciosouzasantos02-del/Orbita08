import { OracleDreamEntry, OracleDreamInterpretation } from '../types';

export function normalizeOracleInterpretation(interp: any): OracleDreamInterpretation {
  if (!interp) {
    return {
      title: "Visão Onírica",
      mainMeaning: "Interpretação sintonizada pelo oráculo estelar.",
      psychological: "Aspectos do subconsciente em alinhamento.",
      spiritual: "Conexão sutil com planos superiores.",
      attention: null,
      opportunities: null,
      protection: null,
      loveArea: null,
      financeArea: null,
      careerArea: null,
      luckyNumbers: ["07", "14", "21"],
      favorableColors: ["Dourado", "Azul"],
      positivityLevel: 4.5,
      oracleAdvice: "Mantenha a mente tranquila e observe os sinais ao seu redor.",
      detectedAnimals: null,
      detectedColors: null,
      detectedNumbers: null,
      predominantEmotion: null,
      dreamEnergyIndex: 75,
      dreamEnergyType: "Energia Espiritual",
      universeMessage: "O universo conspira a favor da sua evolução cósmica."
    };
  }

  let parsed = interp;
  if (typeof interp === 'string') {
    try {
      parsed = JSON.parse(interp);
    } catch {
      parsed = { mainMeaning: interp };
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    parsed = {};
  }

  // Ensure luckyNumbers is always an array of strings
  let luckyNumbers: string[] = ["07", "14", "21"];
  if (Array.isArray(parsed.luckyNumbers)) {
    luckyNumbers = parsed.luckyNumbers.map((n: any) => String(n));
  } else if (typeof parsed.luckyNumbers === 'string') {
    luckyNumbers = parsed.luckyNumbers.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  // Ensure favorableColors is always an array of strings
  let favorableColors: string[] = ["Dourado", "Azul"];
  if (Array.isArray(parsed.favorableColors)) {
    favorableColors = parsed.favorableColors.map((c: any) => String(c));
  } else if (typeof parsed.favorableColors === 'string') {
    favorableColors = parsed.favorableColors.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  // Normalize detectedAnimals
  let detectedAnimals: { animal: string; meaning: string }[] | null = null;
  if (Array.isArray(parsed.detectedAnimals)) {
    detectedAnimals = parsed.detectedAnimals
      .filter((a: any) => a && (a.animal || typeof a === 'string'))
      .map((a: any) => typeof a === 'string' ? { animal: a, meaning: "" } : { animal: String(a.animal || ""), meaning: String(a.meaning || "") });
  }

  // Normalize detectedColors
  let detectedColors: { color: string; meaning: string }[] | null = null;
  if (Array.isArray(parsed.detectedColors)) {
    detectedColors = parsed.detectedColors
      .filter((c: any) => c && (c.color || typeof c === 'string'))
      .map((c: any) => typeof c === 'string' ? { color: c, meaning: "" } : { color: String(c.color || ""), meaning: String(c.meaning || "") });
  }

  // Normalize detectedNumbers
  let detectedNumbers: { number: string; meaning: string }[] | null = null;
  if (Array.isArray(parsed.detectedNumbers)) {
    detectedNumbers = parsed.detectedNumbers
      .filter((n: any) => n && (n.number || typeof n === 'string' || typeof n === 'number'))
      .map((n: any) => typeof n === 'object' ? { number: String(n.number || ""), meaning: String(n.meaning || "") } : { number: String(n), meaning: "" });
  }

  // Normalize predominantEmotion
  let predominantEmotion: { emotion: string; explanation: string } | null = null;
  if (parsed.predominantEmotion) {
    if (typeof parsed.predominantEmotion === 'object') {
      predominantEmotion = {
        emotion: String(parsed.predominantEmotion.emotion || ""),
        explanation: String(parsed.predominantEmotion.explanation || "")
      };
    } else if (typeof parsed.predominantEmotion === 'string') {
      predominantEmotion = {
        emotion: parsed.predominantEmotion,
        explanation: ""
      };
    }
  }

  return {
    title: parsed.title || "Visão de Alquimia Onírica",
    mainMeaning: parsed.mainMeaning || parsed.summary || (typeof parsed === 'string' ? parsed : "Interpretação sintonizada."),
    psychological: parsed.psychological || parsed.emotionalAspects || "",
    spiritual: parsed.spiritual || null,
    attention: parsed.attention || (Array.isArray(parsed.attentionPoints) ? parsed.attentionPoints.join(". ") : null),
    opportunities: parsed.opportunities || (Array.isArray(parsed.positivePoints) ? parsed.positivePoints.join(". ") : null),
    protection: parsed.protection || null,
    loveArea: parsed.loveArea || null,
    financeArea: parsed.financeArea || null,
    careerArea: parsed.careerArea || null,
    luckyNumbers: luckyNumbers.length > 0 ? luckyNumbers : ["07", "14", "21"],
    favorableColors: favorableColors.length > 0 ? favorableColors : ["Dourado", "Azul"],
    positivityLevel: typeof parsed.positivityLevel === 'number' ? parsed.positivityLevel : 4.5,
    oracleAdvice: parsed.oracleAdvice || parsed.advice || "",
    detectedAnimals,
    detectedColors,
    detectedNumbers,
    predominantEmotion,
    dreamEnergyIndex: typeof parsed.dreamEnergyIndex === 'number' ? parsed.dreamEnergyIndex : 75,
    dreamEnergyType: parsed.dreamEnergyType || "Energia Espiritual",
    universeMessage: parsed.universeMessage || parsed.finalMessage || "O Universo saúda seu caminhar cósmico."
  };
}

export function normalizeOracleDreamEntry(raw: any): OracleDreamEntry {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `dream_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: "",
      title: "Relato de Sonho",
      language: "pt",
      description: "",
      interpretation: null
    };
  }

  const desc = raw.description || raw.text || raw.content || "";
  let interp = null;
  if (raw.interpretation) {
    interp = normalizeOracleInterpretation(raw.interpretation);
  }

  const title = raw.title || interp?.title || (desc.trim() ? desc.slice(0, 30) + (desc.length > 30 ? "..." : "") : "Relato de Sonho");

  return {
    id: String(raw.id || `dream_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`),
    chartId: raw.chartId || undefined,
    date: String(raw.date || new Date().toISOString().split('T')[0]),
    time: raw.time ? String(raw.time) : "",
    title,
    language: raw.language || "pt",
    description: String(desc),
    interpretation: interp
  };
}

export function normalizeDreamsList(list: any[]): OracleDreamEntry[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeOracleDreamEntry);
}
