import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { AstrologyMap } from '../types';
import { 
  Orbit, Play, Pause, RotateCcw, Zap, Calendar, 
  Sparkles, Compass, Eye, ShieldAlert, CircleDot, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getCurrentLang, Language } from '../translations';

interface TransitMapProps {
  mapData: AstrologyMap;
}

// 12 Zodiac signs with elements, colors, symbols and degrees
const ZODIAC_DEFINITIONS = [
  { id: "aries", namePt: "Áries", symbol: "♈", element: "fire", color: "#EF4444", startDeg: 0 },
  { id: "taurus", namePt: "Touro", symbol: "♉", element: "earth", color: "#10B981", startDeg: 30 },
  { id: "gemini", namePt: "Gêmeos", symbol: "♊", element: "air", color: "#06B6D4", startDeg: 60 },
  { id: "cancer", namePt: "Câncer", symbol: "♋", element: "water", color: "#6366F1", startDeg: 90 },
  { id: "leo", namePt: "Leão", symbol: "♌", element: "fire", color: "#EF4444", startDeg: 120 },
  { id: "virgo", namePt: "Virgem", symbol: "♍", element: "earth", color: "#10B981", startDeg: 150 },
  { id: "libra", namePt: "Libra", symbol: "♎", element: "air", color: "#06B6D4", startDeg: 180 },
  { id: "scorpio", namePt: "Escorpião", symbol: "♏", element: "water", color: "#6366F1", startDeg: 210 },
  { id: "sagittarius", namePt: "Sagitário", symbol: "♐", element: "fire", color: "#EF4444", startDeg: 240 },
  { id: "capricorn", namePt: "Capricórnio", symbol: "♑", element: "earth", color: "#10B981", startDeg: 270 },
  { id: "aquarius", namePt: "Aquário", symbol: "♒", element: "air", color: "#06B6D4", startDeg: 300 },
  { id: "pisces", namePt: "Peixes", symbol: "♓", element: "water", color: "#6366F1", startDeg: 330 }
];

// Planet orbital configurations and details
interface PlanetConfig {
  name: string;
  label: string;
  symbol: string;
  baseAngle: number; // approximate base transit angle at reference date
  speed: number;     // speed in degrees per simulation day
  color: string;
  radiusOffset: number; // orbital radius on the canvas
  description: string;
}

const TRANSIT_METADATA: PlanetConfig[] = [
  { name: "Sol", label: "Sol ☀️", symbol: "☉", baseAngle: 78, speed: 0.98, color: "#F59E0B", radiusOffset: 30, description: "O foco central da vitalidade física e da consciência vigilante." },
  { name: "Lua", label: "Lua 🌙", symbol: "☽", baseAngle: 332, speed: 13.17, color: "#E2E8F0", radiusOffset: 12, description: "Reflete as flutuações cotidianas das emoções, intuição e receptividade pública." },
  { name: "Mercúrio", label: "Mercúrio ☿", symbol: "☿", baseAngle: 98, speed: 1.2, color: "#38BDF8", radiusOffset: 18, description: "Regente do raciocínio prático, conexões comerciais e agilidade verbal." },
  { name: "Vênus", label: "Vênus ♀", symbol: "♀", baseAngle: 62, speed: 1.2, color: "#F472B6", radiusOffset: 24, description: "Atração magnética, acordos estéticos, afetos e valorização material." },
  { name: "Marte", label: "Marte ♂", symbol: "♂", baseAngle: 192, speed: 0.52, color: "#EF4444", radiusOffset: 36, description: "Energia propulsora, iniciativa de conquista, coragem e impulsão física." },
  { name: "Júpiter", label: "Júpiter ♃", symbol: "♃", baseAngle: 84, speed: 0.08, color: "#A78BFA", radiusOffset: 44, description: "A grande expansão mental, justiça, síntese filosófica e oportunidades afortunadas." },
  { name: "Saturno", label: "Saturno ♄", symbol: "♄", baseAngle: 355, speed: 0.03, color: "#F59E0B", radiusOffset: 52, description: "O mestre das formas rígidas, disciplina temporal e maturação de compromissos." },
  { name: "Urano", label: "Urano ♅", symbol: "♅", baseAngle: 58, speed: 0.011, color: "#22D3EE", radiusOffset: 60, description: "Estopim do progresso tecnológico, intuição disruptiva e inconformismo libertador." },
  { name: "Netuno", label: "Netuno ♆", symbol: "♆", baseAngle: 358, speed: 0.006, color: "#818CF8", radiusOffset: 68, description: "Dissolução espiritual dos limites, imaginação onírica profunda e sensitividade extrema." },
  { name: "Plutão", label: "Plutão ♇", symbol: "♇", baseAngle: 304, speed: 0.004, color: "#F43F5E", radiusOffset: 76, description: "Renascimento por expurgação, regeneração invisível e forças magnéticas inevitáveis." }
];

// Complete 5-language dictionary architecture
const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    // Zodiac Signs
    "Áries": "Aries", "Touro": "Taurus", "Gêmeos": "Gemini", "Câncer": "Cancer",
    "Leão": "Leo", "Virgem": "Virgo", "Libra": "Libra", "Escorpião": "Scorpio",
    "Sagitário": "Sagittarius", "Capricórnio": "Capricorn", "Aquário": "Aquarius", "Peixes": "Pisces",
    // Elements
    "FIRE": "Fire", "EARTH": "Earth", "AIR": "Air", "WATER": "Water",
    "Fogo": "Fire", "Terra": "Earth", "Ar": "Air", "Água": "Water",
    // Planets
    "Sol": "Sun", "Lua": "Moon", "Mercúrio": "Mercury", "Vênus": "Venus",
    "Marte": "Mars", "Júpiter": "Jupiter", "Saturno": "Saturn", "Urano": "Uranus",
    "Netuno": "Neptune", "Plutão": "Pluto", "Ascendente": "Ascendant", "Meio do Céu": "Midheaven",
    // Labels
    "Sol ☀️": "Sun ☀️", "Lua 🌙": "Moon 🌙", "Mercúrio ☿": "Mercury ☿", "Vênus ♀": "Venus ♀",
    "Marte ♂": "Mars ♂", "Júpiter ♃": "Jupiter ♃", "Saturno ♄": "Saturn ♄", "Urano ♅": "Uranus ♅",
    "Netuno ♆": "Neptune ♆", "Plutão ♇": "Pluto ♇",
    // Cardinal Axes
    "MC": "MC", "FC": "IC", "AC": "AC", "DC": "DC",
    "MEIO DO CÉU": "MIDHEAVEN", "FUNDO DO CÉU": "IMMUM COELI", "ASCENDENTE": "ASCENDANT", "DESCENDENTE": "DESCENDANT",
    // Descriptions
    "O foco central da vitalidade física e da consciência vigilante.": "The central focus of physical vitality and watchful consciousness.",
    "Reflete as flutuações cotidianas das emoções, intuição e receptividade pública.": "Reflects the daily fluctuations of emotions, intuition, and public receptivity.",
    "Regente do raciocínio prático, conexões comerciais e agilidade verbal.": "Ruler of practical reasoning, business connections, and verbal agility.",
    "Atração magnética, acordos estéticos, afetos e valorização material.": "Magnetic attraction, aesthetic agreements, affection, and material valuation.",
    "Energia propulsora, iniciativa de conquista, coragem e impulsão física.": "Propelling energy, initiative for conquest, courage, and physical drive.",
    "A grande expansão mental, justiça, síntese filosófica e oportunidades afortunadas.": "The great mental expansion, justice, philosophical synthesis, and fortunate opportunities.",
    "O mestre das formas rígidas, disciplina temporal e maturação de compromissos.": "The master of rigid forms, temporal discipline, and maturation of commitments.",
    "Estopim do progresso tecnológico, intuição disruptiva e inconformismo libertador.": "Fuse of technological progress, disruptive intuition, and liberating nonconformism.",
    "Dissolução espiritual dos limites, imaginação onírica profunda e sensitividade extrema.": "Spiritual dissolution of limits, dream-like imagination, and extreme sensitivity.",
    "Renascimento por expurgação, regeneração invisível e forças magnéticas inevitáveis.": "Rebirth by expurgation, invisible regeneration, and inevitable magnetic forces.",
    // Aspects
    "Conjunção": "Conjunction", "Oposição": "Opposition", "Trígono": "Trine", "Quadratura": "Square", "Sextil": "Sextile",
    "Fusão de propósitos celestes e intensidade focalizada.": "Fusion of celestial purposes and focused intensity.",
    "Polarização ou reflexão crítica exigindo diplomacia ativa.": "Polarization or critical reflection requiring active diplomacy.",
    "Fluxo espontâneo que remove entraves com sorte natural.": "Spontaneous flow that removes obstacles with natural luck.",
    "Força transformadora impulsionada sob pressões e atritos.": "Transformative force driven by pressure and friction.",
    "Oportunidades de colaboração que premiam ações conscientes.": "Opportunities for collaboration that reward conscious actions.",
    // UI
    "Alinhamento de Trânsitos em Tempo Real": "Real-Time Transits Alignment",
    "Analise trânsitos rotacionando dinamicamente e cruzando aspectos com suas casas de nascimento.": "Analyze transits by dynamically rotating and crossing aspects with your birth houses.",
    "Mandala Astrológica HD • Trânsitos": "HD Astrological Mandala • Transits",
    "Pausar Fluxo": "Pause Flow", "Iniciar Fluxo": "Start Flow", "Resetar data oficial (Tempo Real)": "Reset to Real-Time Date",
    "Velocidade:": "Speed:", "LESTE / ASCENDENTE": "EAST / ASCENDANT", "OESTE / DESCENDENTE": "WEST / DESCENDANT",
    "Simulado:": "Simulated:", "dias de trânsito": "transit days",
    "Conjunção (0°)": "Conjunction (0°)", "Oposição (180°)": "Opposition (180°)", "Trígono (120°)": "Trine (120°)",
    "Quadratura (90°)": "Square (90°)", "Sextil (60°)": "Sextile (60°)", "Natal": "Natal", "Trânsito": "Transit",
    "Navegar Órbitas": "Navigate Orbits", "Trânsito Atual ⓣ": "Current Transit ⓣ", "de": "of",
    "Posição Natal ⓝ": "Natal Position ⓝ", "Não mapeado": "Not mapped", "Aspectos Ativos deste planeta": "Active Aspects of this planet",
    "conexões": "connections", "com seu": "with your",
    "Nenhum aspecto maior exato formado no momento com o seu mapa natal. Rotacione o tempo usando a velocidade de simulação para ver novos alinhamentos celestes dinamicamente!": "No exact major aspect formed at the moment with your natal chart. Rotate time using the simulation speed to see new celestial alignments dynamically!",
    "Insight do Alinhamento Ativo": "Active Alignment Insight",
    "O trânsito solar ilumina seu mapa atual estimulando renovações de identidade.": "The solar transit illuminates your current chart stimulating renewals of identity.",
    "Sensibilidade acelerada em oscilações oníricas diárias. Excelente para journaling.": "Accelerated sensitivity in daily dream oscillations. Excellent for journaling.",
    "Aceleração de contatos, excelente para reavaliar correspondências importantes.": "Acceleration of contacts, excellent for re-evaluating important correspondences.",
    "Magnetismo em alta facilitando entendimentos com parcerias e acordos estéticos.": "Magnetism on the rise facilitating understandings with partnerships and aesthetic agreements.",
    "Mantenha o foco ativo para evitar conflitos desnecessários, redirecione o impulso.": "Keep focus active to avoid unnecessary conflicts, redirect impulse.",
    "Trânsitos de planetas geracionais influenciam as estruturas institucionais de sua jornada de longo prazo.": "Transits of generational planets influence the institutional structures of your long-term journey.",
    "Casa": "House", "Casas Astrológicas": "Astrological Houses", "Aspectos Ativos": "Active Aspects",
    "Geometria Sagrada": "Sacred Geometry", "Órbitas em Movimento": "Orbits in Motion"
  },
  es: {
    // Zodiac Signs
    "Áries": "Aries", "Touro": "Tauro", "Gêmeos": "Géminis", "Câncer": "Cáncer",
    "Leão": "Leo", "Virgem": "Virgo", "Libra": "Libra", "Escorpião": "Escorpio",
    "Sagitário": "Sagitario", "Capricórnio": "Capricornio", "Aquário": "Acuario", "Peixes": "Piscis",
    // Elements
    "FIRE": "Fuego", "EARTH": "Tierra", "AIR": "Aire", "WATER": "Agua",
    "Fogo": "Fuego", "Terra": "Tierra", "Ar": "Aire", "Água": "Agua",
    // Planets
    "Sol": "Sol", "Lua": "Luna", "Mercúrio": "Mercurio", "Vênus": "Venus",
    "Marte": "Marte", "Júpiter": "Júpiter", "Saturno": "Saturno", "Urano": "Urano",
    "Netuno": "Neptuno", "Plutão": "Plutón", "Ascendente": "Ascendente", "Meio do Céu": "Medio Cielo",
    // Labels
    "Sol ☀️": "Sol ☀️", "Lua 🌙": "Luna 🌙", "Mercúrio ☿": "Mercurio ☿", "Vênus ♀": "Venus ♀",
    "Marte ♂": "Marte ♂", "Júpiter ♃": "Júpiter ♃", "Saturno ♄": "Saturno ♄", "Urano ♅": "Urano ♅",
    "Netuno ♆": "Neptuno ♆", "Plutão ♇": "Plutón ♇",
    // Cardinal Axes
    "MC": "MC", "FC": "IC", "AC": "AC", "DC": "DC",
    "MEIO DO CÉU": "MEDIO CIELO", "FUNDO DO CÉU": "FONDO DEL CIELO", "ASCENDENTE": "ASCENDENTE", "DESCENDENTE": "DESCENDENTE",
    // Descriptions
    "O foco central da vitalidade física e da consciência vigilante.": "El foco central de la vitalidad física y la conciencia vigilante.",
    "Reflete as flutuações cotidianas das emoções, intuição e receptividade pública.": "Refleja las fluctuaciones cotidianas de las emociones, la intuición y la receptividad pública.",
    "Regente do raciocínio prático, conexões comerciais e agilidade verbal.": "Regente del razonamiento práctico, conexiones comerciales y agilidad verbal.",
    "Atração magnética, acordos estéticos, afetos e valorização material.": "Atracción magnética, acuerdos estéticos, afectos y valorización material.",
    "Energia propulsora, iniciativa de conquista, coragem e impulsão física.": "Energía propulsora, iniciativa de conquista, coraje e impulso físico.",
    "A grande expansão mental, justiça, síntese filosófica e oportunidades afortunadas.": "La gran expansión mental, la justicia, la síntesis filosófica y las oportunidades afortunadas.",
    "O mestre das formas rígidas, disciplina temporal e maturação de compromissos.": "El maestro de las formas rígidas, la disciplina temporal y la maduración de los compromisos.",
    "Estopim do progresso tecnológico, intuição disruptiva e inconformismo libertador.": "Detonante del progreso tecnológico, intuición disruptiva e inconformismo liberador.",
    "Dissolução espiritual dos limites, imaginação onírica profunda e sensitividade extrema.": "Disolución espiritual de los límites, imaginación onírica profunda y sensibilidad extrema.",
    "Renascimento por expurgação, regeneração invisível e forças magnéticas inevitáveis.": "Renacimiento por expurgación, regeneración invisible y fuerzas magnéticas inevitables.",
    // Aspects
    "Conjunção": "Conjunción", "Oposição": "Oposición", "Trígono": "Trígono", "Quadratura": "Cuadratura", "Sextil": "Sextil",
    "Fusão de propósitos celestes e intensidade focalizada.": "Fusión de propósitos celestes e intensidad enfocada.",
    "Polarização ou reflexão crítica exigindo diplomacia ativa.": "Polarización o reflexión crítica que exige diplomacia activa.",
    "Fluxo espontâneo que remove entraves com sorte natural.": "Flujo espontáneo que elimina obstáculos con suerte natural.",
    "Força transformadora impulsionada sob pressões e atritos.": "Fuerza transformadora impulsada bajo presiones y fricciones.",
    "Oportunidades de colaboração que premiam ações conscientes.": "Oportunidades de colaboración que premian acciones conscientes.",
    // UI
    "Alinhamento de Trânsitos em Tempo Real": "Alineación de Tránsitos en Tiempo Real",
    "Analise trânsitos rotacionando dinamicamente e cruzando aspectos com suas casas de nascimento.": "Analice tránsitos rotando dinámicamente y cruzando aspectos con sus cartas de nacimiento.",
    "Mandala Astrológica HD • Trânsitos": "Mandala Astrológica HD • Tránsitos",
    "Pausar Fluxo": "Pausar Flujo", "Iniciar Fluxo": "Iniciar Flujo", "Resetar data oficial (Tempo Real)": "Restablecer a Fecha en Tiempo Real",
    "Velocidade:": "Velocidad:", "LESTE / ASCENDENTE": "ESTE / ASCENDENTE", "OESTE / DESCENDENTE": "OESTE / DESCENDENTE",
    "Simulado:": "Simulado:", "dias de trânsito": "días de tránsito",
    "Conjunção (0°)": "Conjunción (0°)", "Oposição (180°)": "Oposición (180°)", "Trígono (120°)": "Trígono (120°)",
    "Quadratura (90°)": "Cuadratura (90°)", "Sextil (60°)": "Sextil (60°)", "Natal": "Natal", "Trânsito": "Tránsito",
    "Navegar Órbitas": "Navegar Órbitas", "Trânsito Atual ⓣ": "Tránsito Actual ⓣ", "de": "de",
    "Posição Natal ⓝ": "Posición Natal ⓝ", "Não mapeado": "No mapeado", "Aspectos Ativos deste planeta": "Aspectos Activos de este planeta",
    "conexões": "conexiones", "com seu": "con su",
    "Nenhum aspecto maior exato formado no momento com o seu mapa natal. Rotacione o tempo usando a velocidade de simulação para ver novos alinhamentos celestes dinamicamente!": "Ningún aspecto mayor exacto formado en este momento con su carta natal. ¡Rote el tiempo usando la velocidad de simulación para ver nuevas alineaciones celestes dinámicamente!",
    "Insight do Alinhamento Ativo": "Insight del Alineamiento Activo",
    "O trânsito solar ilumina seu mapa atual estimulando renovações de identidade.": "El tránsito solar ilumina su mapa actual estimulando renovaciones de identidad.",
    "Sensibilidade acelerada em oscilações oníricas diárias. Excelente para journaling.": "Sensibilidad acelerada en oscilaciones oníricas diarias. Excelente para journaling.",
    "Aceleração de contatos, excelente para reavaliar correspondências importantes.": "Aceleración de contactos, excelente para reevaluar correspondencias importantes.",
    "Magnetismo em alta facilitando entendimentos com parcerias e acordos estéticos.": "Magnetismo en alza facilitando entendimientos con asociaciones y acuerdos estéticos.",
    "Mantenha o foco ativo para evitar conflitos desnecessários, redirecione o impulso.": "Mantenga el foco activo para evitar conflictos innecesarios, redireccione el impulso.",
    "Trânsitos de planetas geracionais influenciam as estruturas institucionais de sua jornada de longo prazo.": "Los tránsitos de planetas generacionales influyen en las estructuras institucionales de su viaje a largo plazo.",
    "Casa": "Casa", "Casas Astrológicas": "Casas Astrológicas", "Aspectos Ativos": "Aspectos Activos",
    "Geometria Sagrada": "Geometría Sagrada", "Órbitas em Movimento": "Órbitas en Movimiento"
  },
  de: {
    // Zodiac Signs
    "Áries": "Widder", "Touro": "Stier", "Gêmeos": "Zwillinge", "Câncer": "Krebs",
    "Leão": "Löwe", "Virgem": "Jungfrau", "Libra": "Waage", "Escorpião": "Skorpion",
    "Sagitário": "Schütze", "Capricórnio": "Steinbock", "Aquário": "Wassermann", "Peixes": "Fische",
    // Elements
    "FIRE": "Feuer", "EARTH": "Erde", "AIR": "Luft", "WATER": "Wasser",
    "Fogo": "Feuer", "Terra": "Erde", "Ar": "Luft", "Água": "Wasser",
    // Planets
    "Sol": "Sonne", "Lua": "Mond", "Mercúrio": "Merkur", "Vênus": "Venus",
    "Marte": "Mars", "Júpiter": "Jupiter", "Saturno": "Saturn", "Urano": "Uranus",
    "Netuno": "Neptun", "Plutão": "Pluto", "Ascendente": "Aszendent", "Meio do Céu": "Medium Coeli",
    // Labels
    "Sol ☀️": "Sonne ☀️", "Lua 🌙": "Mond 🌙", "Mercúrio ☿": "Merkur ☿", "Vênus ♀": "Venus ♀",
    "Marte ♂": "Mars ♂", "Júpiter ♃": "Jupiter ♃", "Saturno ♄": "Saturn ♄", "Urano ♅": "Uranus ♅",
    "Netuno ♆": "Neptun ♆", "Plutão ♇": "Pluto ♇",
    // Cardinal Axes
    "MC": "MC", "FC": "IC", "AC": "AC", "DC": "DC",
    "MEIO DO CÉU": "MEDIUM COELI", "FUNDO DO CÉU": "IMMUM COELI", "ASCENDENTE": "ASZENDENT", "DESCENDENTE": "DESZENDENT",
    // Descriptions
    "O foco central da vitalidade física e da consciência vigilante.": "Der zentrale Fokus der physischen Vitalität und des wachsamen Bewusstseins.",
    "Reflete as flutuações cotidianas das emoções, intuição e receptividade pública.": "Spiegelt die täglichen Schwankungen von Emotionen, Intuition und öffentlicher Empfänglichkeit wider.",
    "Regente do raciocínio prático, conexões comerciais e agilidade verbal.": "Herrscher über praktisches Denken, geschäftliche Verbindungen und verbale Agilität.",
    "Atração magnética, acordos estéticos, afetos e valorização material.": "Magnetische Anziehungskraft, ästhetische Vereinbarungen, Zuneigung und materielle Bewertung.",
    "Energia propulsora, iniciativa de conquista, coragem e impulsão física.": "Antriebsenergie, Initiative zur Eroberung, Mut und körperlicher Antrieb.",
    "A grande expansão mental, justiça, síntese filosófica e oportunidades afortunadas.": "Die große mentale Expansion, Gerechtigkeit, philosophische Synthese und glückliche Gelegenheiten.",
    "O mestre das formas rígidas, disciplina temporal e maturação de compromissos.": "Der Meister der starren Formen, der zeitlichen Disziplin und des Reifens von Verpflichtungen.",
    "Estopim do progresso tecnológico, intuição disruptiva e inconformismo libertador.": "Zünder des technologischen Fortschritts, disruptive Intuition und befreiende Nonkonformität.",
    "Dissolução espiritual dos limites, imaginação onírica profunda e sensitividade extrema.": "Spirituelle Auflösung von Grenzen, tiefe traumhafte Fantasie und extreme Sensibilität.",
    "Renascimento por expurgação, regeneração invisível e forças magnéticas inevitáveis.": "Wiedergeburt durch Bereinigung, unsichtbare Regeneration und unvermeidliche magnetische Kräfte.",
    // Aspects
    "Conjunção": "Konjunktion", "Oposição": "Opposition", "Trígono": "Trigon", "Quadratura": "Quadrat", "Sextil": "Sextil",
    "Fusão de propósitos celestes e intensidade focalizada.": "Verschmelzung himmlischer Absichten und fokussierter Intensität.",
    "Polarização ou reflexão crítica exigindo diplomacia ativa.": "Polarisierung oder kritische Reflexion, die aktive Diplomatie erfordert.",
    "Fluxo espontâneo que remove entraves com sorte natural.": "Spontaner Fluss, der Hindernisse mit natürlichem Glück beseitigt.",
    "Força transformadora impulsionada sob pressões e atritos.": "Transformative Kraft, angetrieben von Druck und Reibung.",
    "Oportunidades de colaboração que premiam ações conscientes.": "Möglichkeiten zur Zusammenarbeit, die bewusstes Handeln belohnen.",
    // UI
    "Alinhamento de Trânsitos em Tempo Real": "Echtzeit-Transit-Ausrichtung",
    "Analise trânsitos rotacionando dinamicamente e cruzando aspectos com suas casas de nascimento.": "Analysieren Sie Transite, indem Sie Aspekte dynamisch drehen und mit Ihren Geburtshäusern kreuzen.",
    "Mandala Astrológica HD • Trânsitos": "HD Astrologische Mandala • Transite",
    "Pausar Fluxo": "Ablauf pausieren", "Iniciar Fluxo": "Ablauf starten", "Resetar data oficial (Tempo Real)": "Auf Echtzeit-Datum zurücksetzen",
    "Velocidade:": "Geschwindigkeit:", "LESTE / ASCENDENTE": "OSTEN / ASZENDENT", "OESTE / DESCENDENTE": "WESTEN / DESZENDENT",
    "Simulado:": "Simuliert:", "dias de trânsito": "Transittage",
    "Conjunção (0°)": "Konjunktion (0°)", "Oposição (180°)": "Opposition (180°)", "Trígono (120°)": "Trigon (120°)",
    "Quadratura (90°)": "Quadrat (90°)", "Sextil (60°)": "Sextil (60°)", "Natal": "Natal", "Trânsito": "Transit",
    "Navegar Órbitas": "Umlaufbahnen navigieren", "Trânsito Atual ⓣ": "Aktueller Transit ⓣ", "de": "von",
    "Posição Natal ⓝ": "Geburtsposition ⓝ", "Não mapeado": "Nicht abgebildet", "Aspectos Ativos deste planeta": "Aktive Aspekte dieses Planeten",
    "conexões": "Verbindungen", "com seu": "mit Ihrem",
    "Nenhum aspecto maior exato formado no momento com o seu mapa natal. Rotacione o tempo usando a velocidade de simulação para ver novos alinhamentos celestes dinamicamente!": "Zurzeit bildet sich kein genauer Hauptaspekt mit Ihrem Geburtshoroskop. Drehen Sie die Zeit mit der Simulationsgeschwindigkeit, um neue himmlische Ausrichtungen dynamisch zu sehen!",
    "Insight do Alinhamento Ativo": "Erkenntnis der aktiven Ausrichtung",
    "O trânsito solar ilumina seu mapa atual estimulando renovações de identidade.": "Der Sonnen-Transit erleuchtet Ihr aktuelles Horoskop und regt Erneuerungen der Identität an.",
    "Sensibilidade acelerada em oscilações oníricas diárias. Excelente para journaling.": "Beschleunigte Empfindlichkeit bei täglichen Traumschwankungen. Hervorragend geeignet für Journaling.",
    "Aceleração de contatos, excelente para reavaliar correspondências importantes.": "Beschleunigung der Kontakte, hervorragend zur Neubewertung wichtiger Korrespondenz.",
    "Magnetismo em alta facilitando entendimentos com parcerias e acordos estéticos.": "Steigender Magnetismus erleichtert Vereinbarungen bei Partnerschaften und ästhetischen Absprachen.",
    "Mantenha o foco ativo para evitar conflitos desnecessários, redirecione o impulso.": "Halten Sie den Fokus aktiv, um unnötige Konflikte zu vermeiden, leiten Sie den Impuls um.",
    "Trânsitos de planetas geracionais influenciam as estruturas institucionais de sua jornada de longo prazo.": "Transite von Generationenplaneten beeinflussen die institutionellen Strukturen Ihrer langfristigen Reise.",
    "Casa": "Haus", "Casas Astrológicas": "Astrologische Häuser", "Aspectos Ativos": "Aktive Aspekte",
    "Geometria Sagrada": "Heilige Geometrie", "Órbitas em Movimento": "Orbits in Bewegung"
  },
  fr: {
    // Zodiac Signs
    "Áries": "Bélier", "Touro": "Taureau", "Gêmeos": "Gémeaux", "Câncer": "Cancer",
    "Leão": "Lion", "Virgem": "Vierge", "Libra": "Balance", "Escorpião": "Scorpion",
    "Sagitário": "Sagittaire", "Capricórnio": "Capricorne", "Aquário": "Verseau", "Peixes": "Poissons",
    // Elements
    "FIRE": "Feu", "EARTH": "Terre", "AIR": "Air", "WATER": "Eau",
    "Fogo": "Feu", "Terra": "Terre", "Ar": "Air", "Água": "Eau",
    // Planets
    "Sol": "Soleil", "Lua": "Lune", "Mercúrio": "Mercure", "Vênus": "Vénus",
    "Marte": "Mars", "Júpiter": "Jupiter", "Saturno": "Saturne", "Urano": "Uranus",
    "Netuno": "Neptune", "Plutão": "Pluton", "Ascendente": "Ascendant", "Meio do Céu": "Milieu du Ciel",
    // Labels
    "Sol ☀️": "Soleil ☀️", "Lua 🌙": "Lune 🌙", "Mercúrio ☿": "Mercure ☿", "Vênus ♀": "Vénus ♀",
    "Marte ♂": "Mars ♂", "Júpiter ♃": "Jupiter ♃", "Saturno ♄": "Saturne ♄", "Urano ♅": "Uranus ♅",
    "Netuno ♆": "Neptune ♆", "Plutão ♇": "Pluton ♇",
    // Cardinal Axes
    "MC": "MC", "FC": "FC", "AC": "AC", "DC": "DC",
    "MEIO DO CÉU": "MILIEU DU CIEL", "FUNDO DO CÉU": "FOND DU CIEL", "ASCENDENTE": "ASCENDANT", "DESCENDENTE": "DESCENDANT",
    // Descriptions
    "O foco central da vitalidade física e da consciência vigilante.": "Le foyer central de la vitalité physique et de la conscience vigilante.",
    "Reflete as flutuações cotidianas das emoções, intuição e receptividade pública.": "Reflète les fluctuations quotidiennes des émotions, de l'intuition et de la réceptivité du public.",
    "Regente do raciocínio prático, conexões comerciais e agilidade verbal.": "Régent du raisonnement pratique, des connexions commerciales et de l'agilité verbale.",
    "Atração magnética, acordos estéticos, afetos e valorização material.": "Attraction magnétique, accords esthétiques, affections et valorisation matérielle.",
    "Energia propulsora, iniciativa de conquista, coragem e impulsão física.": "Énergie de propulsion, initiative de conquête, courage et dynamisme physique.",
    "A grande expansão mental, justiça, síntese filosófica e oportunidades afortunadas.": "La grande expansion mentale, la justice, la synthèse philosophique et les opportunités heureuses.",
    "O mestre das formas rígidas, disciplina temporal e maturação de compromissos.": "Le maître des formes rigides, de la discipline temporelle et de la maturation des engagements.",
    "Estopim do progresso tecnológico, intuição disruptiva e inconformismo libertador.": "Déclencheur du progrès technologique, de l'intuition disruptive et de l'anticonformisme libérateur.",
    "Dissolução espiritual dos limites, imaginação onírica profunda e sensitividade extrema.": "Dissolution spirituelle des limites, imagination onirique profonde et sensibilité extrême.",
    "Renascimento por expurgação, regeneração invisível e forces magnétiques inévitáveis.": "Renaissance par expurgation, régénération invisible et forces magnétiques inévitables.",
    // Aspects
    "Conjunção": "Conjonction", "Oposição": "Opposition", "Trígono": "Trine", "Quadratura": "Carré", "Sextil": "Sextile",
    "Fusão de propósitos celestes e intensidade focalizada.": "Fusion d'intentions célestes et d'intensité focalisée.",
    "Polarização ou reflexão crítica exigindo diplomacia ativa.": "Polarisation ou réflexion critique exigeant une diplomatie active.",
    "Fluxo espontâneo que remove entraves com sorte natural.": "Flux spontané qui élimine les obstacles avec une chance naturelle.",
    "Força transformadora impulsionada sob pressões e atritos.": "Force transformatrice entraînée par la pression et la friction.",
    "Oportunidades de colaboração que premiam ações conscientes.": "Opportunités de collaboration qui récompensent les actions conscientes.",
    // UI
    "Alinhamento de Trânsitos em Tempo Real": "Alignement des Transits en Temps Réel",
    "Analise trânsitos rotacionando dinamicamente e cruzando aspectos com suas casas de nascimento.": "Analysez les transits en faisant tourner dynamiquement et en croisant les aspects avec vos maisons de naissance.",
    "Mandala Astrológica HD • Trânsitos": "Mandala Astrologique HD • Transits",
    "Pausar Fluxo": "Pause Flux", "Iniciar Fluxo": "Démarrer Flux", "Resetar data oficial (Tempo Real)": "Réinitialiser à la date en temps réel",
    "Velocidade:": "Vitesse:", "LESTE / ASCENDENTE": "EST / ASCENDANT", "OESTE / DESCENDENTE": "OUEST / DESCENDANT",
    "Simulado:": "Simulé:", "dias de trânsito": "jours de transit",
    "Conjunção (0°)": "Conjonction (0°)", "Oposição (180°)": "Opposition (180°)", "Trígono (120°)": "Trine (120°)",
    "Quadratura (90°)": "Carré (90°)", "Sextil (60°)": "Sextile (60°)", "Natal": "Natal", "Trânsito": "Transit",
    "Navegar Órbitas": "Naviguer les Orbites", "Trânsito Atual ⓣ": "Transit Actuel ⓣ", "de": "de",
    "Posição Natal ⓝ": "Position Natale ⓝ", "Não mapeado": "Non cartographié", "Aspectos Ativos deste planeta": "Aspects Actifs de ce planète",
    "conexões": "connexions", "com seu": "avec votre",
    "Nenhum aspecto maior exato formado no momento com o seu mapa natal. Rotacione o tempo usando a velocidade de simulação para ver novos alinhamentos celestes dinamicamente!": "Aucun aspect majeur exact formé pour le moment avec votre carte natale. Faites pivoter le temps à l'aide de la vitesse de simulation pour voir de nouveaux alignements célestes de manière dynamique !",
    "Insight do Alinhamento Ativo": "Aperçu de l'Alignement Actif",
    "O trânsito solar ilumina seu mapa atual estimulando renovações de identidade.": "Le transit solaire illumine votre carte actuelle stimulant les renouvellements d'identité.",
    "Sensibilidade acelerada em oscilações oníricas diárias. Excelente para journaling.": "Sensibilité accélérée dans les oscillations quotidiennes des rêves. Excellent pour le journaling.",
    "Aceleração de contatos, excelente para reavaliar correspondências importantes.": "Accélération des contacts, excellente pour réévaluer les correspondances importantes.",
    "Magnetismo em alta facilitando entendimentos com parcerias e acordos estéticos.": "Magnétisme en hausse facilitant les ententes de partenariats et les accords esthétiques.",
    "Mantenha o foco ativo para evitar conflitos desnecessários, redirigez l'élan.": "Gardez le focus actif pour éviter les conflits inutiles, redirigez l'élan.",
    "Trânsitos de planetas geracionais influenciam as estruturas institucionais de sua jornada de longo prazo.": "Les transits des planètes générationnelles influencent les structures institutionnelles de votre voyage à long terme.",
    "Casa": "Maison", "Casas Astrológicas": "Maisons Astrologiques", "Aspectos Ativos": "Aspects Actifs",
    "Geometria Sagrada": "Géométrie Sacrée", "Órbitas em Movimento": "Orbites en Mouvement"
  }
};

export default function TransitMap({ mapData }: TransitMapProps) {
  const { t: i18nT, i18n } = useTranslation();
  
  const currentLang = useMemo(() => {
    return getCurrentLang();
  }, [i18n.language]);

  const t = (text: string): string => {
    if (!text) return "";
    const activeL = currentLang || 'pt';
    if (activeL !== 'pt') {
      const localDict = LOCAL_TRANSLATIONS[activeL];
      if (localDict && localDict[text]) {
        return localDict[text];
      }
    }
    return i18nT(text) || text;
  };

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simDays, setSimDays] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1); // days added per loop interval
  const [selectedPlanet, setSelectedPlanet] = useState<string>("Sol");
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'planet' | 'aspect' | 'sign' | 'house';
    title: string;
    detail: string;
    extra?: string;
  } | null>(null);

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 560, height: 560 });

  // Update dimensions with ResizeObserver for responsive fluid sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      const targetSize = Math.max(300, Math.min(620, width));
      setDimensions({ width: targetSize, height: targetSize });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Simulation loop interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimDays((prev) => prev + (simSpeed * 0.1));
    }, 50); // smooth tick representing real progression
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Read natal positions of planets from birth chart
  const getNatalAngle = (planetName: string): number | null => {
    if (!mapData || !mapData.astros || !Array.isArray(mapData.astros)) {
      return null;
    }
    const matched = mapData.astros.find(
      (a) => a && a.name && (a.name.toLowerCase().includes(planetName.toLowerCase()) || 
             planetName.toLowerCase().includes(a.name.toLowerCase()))
    );
    if (!matched) return null;
    
    const signIndex = ZODIAC_DEFINITIONS.findIndex((s) => s.namePt.toLowerCase() === (matched.sign || "").toLowerCase());
    if (signIndex === -1) return null;
    
    let deg = 0;
    try {
      if (typeof matched.degree === 'number') {
        deg = Math.floor(matched.degree);
      } else if (matched.degree !== undefined && matched.degree !== null) {
        const matchDeg = String(matched.degree).match(/^\d+/);
        deg = matchDeg ? parseInt(matchDeg[0], 10) : 0;
      }
    } catch {
      deg = 0;
    }

    return (signIndex * 30 + deg) % 360;
  };

  // Calculate dynamic angle for each transit planet according to days elapsed
  const getTransitAngle = (planet: PlanetConfig): number => {
    const rawDeg = planet.baseAngle + (simDays * planet.speed);
    return ((rawDeg % 360) + 360) % 360;
  };

  // Convert degrees to zodiac sign and relative degrees
  const getAstroLabel = (deg: number) => {
    const signIndex = Math.floor(((deg % 360) + 360) % 360 / 30);
    const sign = ZODIAC_DEFINITIONS[signIndex] || ZODIAC_DEFINITIONS[0];
    const degreesInSign = Math.floor(deg % 30);
    return {
      degrees: degreesInSign,
      signName: sign.namePt,
      signSymbol: sign.symbol,
      color: sign.color
    };
  };

  // Check mathematical aspects
  const checkAspect = (angle1: number, angle2: number) => {
    let diff = Math.abs(angle1 - angle2);
    if (diff > 180) diff = 360 - diff;

    const orb = 6.0; // 6-degree celestial orb tolerance

    if (Math.abs(diff - 0) <= orb) return { type: "Conjunção", symbol: "☌", color: "#F59E0B", desc: "Fusão de propósitos celestes e intensidade focalizada." };
    if (Math.abs(diff - 180) <= orb) return { type: "Oposição", symbol: "☍", color: "#E11D48", desc: "Polarização ou reflexão crítica exigindo diplomacia ativa." };
    if (Math.abs(diff - 120) <= orb) return { type: "Trígono", symbol: "△", color: "#38BDF8", desc: "Fluxo espontâneo que remove entraves com sorte natural." };
    if (Math.abs(diff - 90) <= orb) return { type: "Quadratura", symbol: "□", color: "#F43F5E", desc: "Força transformadora impulsionada sob pressões e atritos." };
    if (Math.abs(diff - 60) <= orb) return { type: "Sextil", symbol: "⚹", color: "#10B981", desc: "Oportunidades de colaboração que premiam ações conscientes." };

    return null;
  };

  // Calculate all active transit aspects
  const getAllActiveAspects = () => {
    const list: Array<{
      transit: string;
      natal: string;
      type: string;
      color: string;
      symbol: string;
      desc: string;
      angleTransit: number;
      angleNatal: number;
      transitRadius: number;
    }> = [];

    TRANSIT_METADATA.forEach((transitPlanet) => {
      const tAngle = getTransitAngle(transitPlanet);
      TRANSIT_METADATA.forEach((natalPlanet) => {
        const nAngle = getNatalAngle(natalPlanet.name);
        if (nAngle !== null) {
          const aspect = checkAspect(tAngle, nAngle);
          if (aspect) {
            list.push({
              transit: transitPlanet.name,
              natal: natalPlanet.name,
              type: aspect.type,
              color: aspect.color,
              symbol: aspect.symbol,
              desc: aspect.desc,
              angleTransit: tAngle,
              angleNatal: nAngle,
              transitRadius: transitPlanet.radiusOffset
            });
          }
        }
      });
    });
    return list;
  };

  const activeAspects = getAllActiveAspects();
  
  // Highlighted aspects for selected or hovered planet
  const getHighlightedAspects = () => {
    const focusPlanet = hoveredPlanet || selectedPlanet;
    if (!focusPlanet) return [];
    return activeAspects.filter(
      (asp) => asp.transit.toLowerCase() === focusPlanet.toLowerCase() ||
               asp.natal.toLowerCase() === focusPlanet.toLowerCase()
    );
  };

  const highlightedAspects = getHighlightedAspects();

  // D3 Rendering with the Vector Style of the Mandala Astrológica HD
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;
    const center = width / 2;
    
    // Scale radii mathematically matching Mandala Astrológica HD layout
    const baseUnit = width / 600;
    const outerGoldRingRadius = 265 * baseUnit;
    const zodiacOuterRadius = 245 * baseUnit;
    const zodiacInnerRadius = 210 * baseUnit;
    const transitOuterTrack = 200 * baseUnit;
    const housesOuterRadius = 165 * baseUnit;
    const housesInnerRadius = 125 * baseUnit;
    const aspectsCenterRadius = 85 * baseUnit;
    const natalPlanetRadius = 145 * baseUnit;

    // Filters and Gradients definitions
    let defs = svg.select("defs");
    if (defs.empty()) {
      defs = svg.append("defs");
    }

    // Ensure glow filter
    if (defs.select("#mandala-gold-glow").empty()) {
      const glowFilter = defs.append("filter")
        .attr("id", "mandala-gold-glow")
        .attr("x", "-30%")
        .attr("y", "-30%")
        .attr("width", "160%")
        .attr("height", "160%");
      glowFilter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
      const feMerge = glowFilter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "blur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    if (defs.select("#mandala-cyan-glow").empty()) {
      const cyanFilter = defs.append("filter")
        .attr("id", "mandala-cyan-glow")
        .attr("x", "-20%")
        .attr("y", "-20%")
        .attr("width", "140%")
        .attr("height", "140%");
      cyanFilter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
      const feMerge = cyanFilter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "blur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    if (defs.select("#natal-mandala-center").empty()) {
      const radialGrad = defs.append("radialGradient")
        .attr("id", "natal-mandala-center")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      radialGrad.append("stop").attr("offset", "0%").attr("stop-color", "#0F172A").attr("stop-opacity", "0.8");
      radialGrad.append("stop").attr("offset", "70%").attr("stop-color", "#060A15").attr("stop-opacity", "0.95");
      radialGrad.append("stop").attr("offset", "100%").attr("stop-color", "#040814").attr("stop-opacity", "1");
    }

    // Polar coordinate converter matching Mandala Astrológica HD:
    // 0° is Ascendant on the left (-90° rotation shift)
    const polarToCartesian = (degrees: number, r: number) => {
      const radians = (degrees - 90) * Math.PI / 180;
      return {
        x: r * Math.cos(radians),
        y: r * Math.sin(radians)
      };
    };

    // Main Chart Group
    let chartGroup = svg.select<SVGGElement>(".mandala-chart-group");
    if (chartGroup.empty()) {
      chartGroup = svg.append("g").attr("class", "mandala-chart-group");
    }
    chartGroup.attr("transform", `translate(${center}, ${center})`);

    // 1. Base Concentric Geometry Rings (Mandala HD Style)
    let ringsGroup = chartGroup.select(".mandala-rings-group");
    if (ringsGroup.empty()) {
      ringsGroup = chartGroup.append("g").attr("class", "mandala-rings-group");
    }

    const ringsData = [
      { id: "outer-gold", r: outerGoldRingRadius, stroke: "#D97706", strokeWidth: 2.5, opacity: 0.8, fill: "none" },
      { id: "zodiac-outer", r: zodiacOuterRadius, stroke: "#F59E0B", strokeWidth: 1.5, opacity: 0.6, fill: "none" },
      { id: "zodiac-inner", r: zodiacInnerRadius, stroke: "#94A3B8", strokeWidth: 1.0, opacity: 0.3, fill: "none" },
      { id: "transit-track", r: transitOuterTrack, stroke: "#D97706", strokeWidth: 0.8, opacity: 0.25, fill: "none", dash: "3 3" },
      { id: "houses-outer", r: housesOuterRadius, stroke: "#F59E0B", strokeWidth: 1.2, opacity: 0.5, fill: "url(#natal-mandala-center)" },
      { id: "houses-inner", r: housesInnerRadius, stroke: "#38BDF8", strokeWidth: 1.0, opacity: 0.4, fill: "#040814" },
      { id: "aspects-center", r: aspectsCenterRadius, stroke: "#F59E0B", strokeWidth: 0.8, opacity: 0.3, fill: "#03060F" }
    ];

    const rings = ringsGroup.selectAll<SVGCircleElement, any>("circle").data(ringsData, d => d.id);
    rings.exit().remove();
    rings.enter()
      .append("circle")
      .merge(rings)
      .attr("r", d => d.r)
      .attr("stroke", d => d.stroke)
      .attr("stroke-width", d => d.strokeWidth)
      .attr("stroke-opacity", d => d.opacity)
      .attr("fill", d => d.fill)
      .attr("stroke-dasharray", d => d.dash || null);

    // 2. 12 Zodiac Segments (30° Each) with 0° Tick Markers and Sign Names (Mandala HD Style)
    let zodiacGroup = chartGroup.select(".mandala-zodiac-group");
    if (zodiacGroup.empty()) {
      zodiacGroup = chartGroup.append("g").attr("class", "mandala-zodiac-group");
    }

    const zodiacData = ZODIAC_DEFINITIONS.map((sign, idx) => {
      const startDeg = idx * 30;
      const midDeg = startDeg + 15;
      const p1 = polarToCartesian(startDeg, outerGoldRingRadius);
      const p2 = polarToCartesian(startDeg, zodiacInnerRadius);
      const glyphPos = polarToCartesian(midDeg, (zodiacOuterRadius + zodiacInnerRadius) / 2);
      const namePos = polarToCartesian(midDeg, (outerGoldRingRadius + zodiacOuterRadius) / 2);
      const tickPos = polarToCartesian(startDeg, outerGoldRingRadius + (12 * baseUnit));

      return {
        id: sign.id,
        namePt: sign.namePt,
        symbol: sign.symbol,
        element: sign.element,
        color: sign.color,
        p1,
        p2,
        glyphPos,
        namePos,
        tickPos
      };
    });

    // Zodiac Segment Dividers
    const zodiacLines = zodiacGroup.selectAll<SVGLineElement, any>(".zodiac-divider")
      .data(zodiacData, d => d.id);
    zodiacLines.exit().remove();
    zodiacLines.enter()
      .append("line")
      .attr("class", "zodiac-divider")
      .attr("stroke", "#D97706")
      .attr("stroke-width", 1.2)
      .attr("stroke-opacity", 0.45)
      .merge(zodiacLines)
      .attr("x1", d => d.p1.x)
      .attr("y1", d => d.p1.y)
      .attr("x2", d => d.p2.x)
      .attr("y2", d => d.p2.y);

    // 0° Tick Markers
    const tickTexts = zodiacGroup.selectAll<SVGTextElement, any>(".zodiac-tick")
      .data(zodiacData, d => `tick-${d.id}`);
    tickTexts.exit().remove();
    tickTexts.enter()
      .append("text")
      .attr("class", "zodiac-tick font-mono select-none font-semibold")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#FDE68A")
      .attr("opacity", 0.8)
      .merge(tickTexts)
      .attr("font-size", `${Math.max(7.5, 9 * baseUnit)}px`)
      .attr("x", d => d.tickPos.x)
      .attr("y", d => d.tickPos.y)
      .text("0°");

    // Zodiac Glyphs
    const glyphTexts = zodiacGroup.selectAll<SVGTextElement, any>(".zodiac-glyph")
      .data(zodiacData, d => `glyph-${d.id}`);
    glyphTexts.exit().remove();
    glyphTexts.enter()
      .append("text")
      .attr("class", "zodiac-glyph font-bold select-none cursor-pointer drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .merge(glyphTexts)
      .attr("font-size", `${Math.max(12, 16 * baseUnit)}px`)
      .attr("x", d => d.glyphPos.x)
      .attr("y", d => d.glyphPos.y)
      .attr("fill", d => d.color)
      .text(d => d.symbol)
      .on("mouseenter", (event, d) => {
        setHoveredEntity({
          type: 'sign',
          title: t(d.namePt),
          detail: `${t(d.element.toUpperCase())} • 30° Segment`,
          extra: d.symbol
        });
      })
      .on("mouseleave", () => setHoveredEntity(null));

    // Zodiac Sign Names in Rim
    const nameTexts = zodiacGroup.selectAll<SVGTextElement, any>(".zodiac-name")
      .data(zodiacData, d => `name-${d.id}`);
    nameTexts.exit().remove();
    nameTexts.enter()
      .append("text")
      .attr("class", "zodiac-name font-serif font-bold select-none cursor-pointer tracking-wider")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .merge(nameTexts)
      .attr("font-size", `${Math.max(7.5, 9.5 * baseUnit)}px`)
      .attr("x", d => d.namePos.x)
      .attr("y", d => d.namePos.y)
      .attr("fill", d => d.color)
      .text(d => t(d.namePt).slice(0, 4).toUpperCase())
      .on("mouseenter", (event, d) => {
        setHoveredEntity({
          type: 'sign',
          title: t(d.namePt),
          detail: `${t(d.element.toUpperCase())} • 30° Segment`,
          extra: d.symbol
        });
      })
      .on("mouseleave", () => setHoveredEntity(null));

    // 3. 12 Astrological Houses Radial Dividers & Numbering (Mandala HD Style)
    let housesGroup = chartGroup.select(".mandala-houses-group");
    if (housesGroup.empty()) {
      housesGroup = chartGroup.append("g").attr("class", "mandala-houses-group");
    }

    const housesData = Array.from({ length: 12 }).map((_, i) => {
      const houseNum = i + 1;
      const angleDeg = i * 30;
      const p1 = polarToCartesian(angleDeg, housesOuterRadius);
      const p2 = polarToCartesian(angleDeg, housesInnerRadius);
      const numPos = polarToCartesian(angleDeg + 15, (housesOuterRadius + housesInnerRadius) / 2);
      return { houseNum, angleDeg, p1, p2, numPos };
    });

    const houseLines = housesGroup.selectAll<SVGLineElement, any>(".house-divider")
      .data(housesData, d => d.houseNum);
    houseLines.exit().remove();
    houseLines.enter()
      .append("line")
      .attr("class", "house-divider")
      .attr("stroke", "#94A3B8")
      .attr("stroke-width", 0.8)
      .attr("stroke-opacity", 0.35)
      .merge(houseLines)
      .attr("x1", d => d.p1.x)
      .attr("y1", d => d.p1.y)
      .attr("x2", d => d.p2.x)
      .attr("y2", d => d.p2.y);

    const houseNumbers = housesGroup.selectAll<SVGTextElement, any>(".house-number")
      .data(housesData, d => d.houseNum);
    houseNumbers.exit().remove();
    houseNumbers.enter()
      .append("text")
      .attr("class", "house-number font-sans font-semibold select-none cursor-pointer transition-colors hover:fill-amber-300")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#CBD5E1")
      .merge(houseNumbers)
      .attr("font-size", `${Math.max(9, 11 * baseUnit)}px`)
      .attr("x", d => d.numPos.x)
      .attr("y", d => d.numPos.y)
      .text(d => d.houseNum)
      .on("mouseenter", (event, d) => {
        setHoveredEntity({
          type: 'house',
          title: `${t("Casa")} ${d.houseNum}`,
          detail: `${d.angleDeg}° • ${t("Casas Astrológicas")}`
        });
      })
      .on("mouseleave", () => setHoveredEntity(null));

    // 4. Four Cardinal Cross Axes with Gold Arrows (AC, DC, MC, FC)
    let axesGroup = chartGroup.select(".mandala-axes-group");
    if (axesGroup.empty()) {
      axesGroup = chartGroup.append("g").attr("class", "mandala-axes-group").attr("filter", "url(#mandala-gold-glow)");
    }

    const arrowSize = 6 * baseUnit;
    const axesData = [
      { id: "mc", label: "MC", full: t("MEIO DO CÉU"), x1: 0, y1: -outerGoldRingRadius + (15 * baseUnit), x2: 0, y2: -housesInnerRadius, arrow: `0,${-outerGoldRingRadius + (5 * baseUnit)} ${-arrowSize},${-outerGoldRingRadius + (18 * baseUnit)} ${arrowSize},${-outerGoldRingRadius + (18 * baseUnit)}`, textX: 0, textY: -outerGoldRingRadius - (5 * baseUnit) },
      { id: "fc", label: "FC", full: t("FUNDO DO CÉU"), x1: 0, y1: outerGoldRingRadius - (15 * baseUnit), x2: 0, y2: housesInnerRadius, arrow: `0,${outerGoldRingRadius - (5 * baseUnit)} ${-arrowSize},${outerGoldRingRadius - (18 * baseUnit)} ${arrowSize},${outerGoldRingRadius - (18 * baseUnit)}`, textX: 0, textY: outerGoldRingRadius + (15 * baseUnit) },
      { id: "ac", label: "AC", full: t("ASCENDENTE"), x1: -outerGoldRingRadius + (15 * baseUnit), y1: 0, x2: -housesInnerRadius, y2: 0, arrow: `${-outerGoldRingRadius + (5 * baseUnit)},0 ${-outerGoldRingRadius + (18 * baseUnit)},${-arrowSize} ${-outerGoldRingRadius + (18 * baseUnit)},${arrowSize}`, textX: -outerGoldRingRadius - (12 * baseUnit), textY: 0 },
      { id: "dc", label: "DC", full: t("DESCENDENTE"), x1: outerGoldRingRadius - (15 * baseUnit), y1: 0, x2: housesInnerRadius, y2: 0, arrow: `${outerGoldRingRadius - (5 * baseUnit)},0 ${outerGoldRingRadius - (18 * baseUnit)},${-arrowSize} ${outerGoldRingRadius - (18 * baseUnit)},${arrowSize}`, textX: outerGoldRingRadius + (12 * baseUnit), textY: 0 }
    ];

    const axisItems = axesGroup.selectAll<SVGGElement, any>(".cardinal-axis-item")
      .data(axesData, d => d.id);
    axisItems.exit().remove();
    const axisItemsEnter = axisItems.enter().append("g").attr("class", "cardinal-axis-item");
    axisItemsEnter.append("line").attr("stroke", "#F59E0B").attr("stroke-width", 2.0);
    axisItemsEnter.append("polygon").attr("fill", "#F59E0B");
    axisItemsEnter.append("text").attr("class", "font-serif font-bold text-amber-300 select-none").attr("fill", "#FDE68A");

    const axisItemsMerge = axisItemsEnter.merge(axisItems);
    axisItemsMerge.select("line")
      .attr("x1", d => d.x1).attr("y1", d => d.y1)
      .attr("x2", d => d.x2).attr("y2", d => d.y2);
    axisItemsMerge.select("polygon").attr("points", d => d.arrow);
    axisItemsMerge.select("text")
      .attr("x", d => d.textX).attr("y", d => d.textY)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("font-size", `${Math.max(8, 10 * baseUnit)}px`)
      .text(d => d.label);

    // 5. Dynamic Aspect Lines & Sacred Web (Mandala HD Style)
    const transitionDuration = isPlaying ? 55 : 300;
    const transitionEase = isPlaying ? d3.easeLinear : d3.easeCubicOut;

    const drawRays = highlightedAspects.length > 0 ? highlightedAspects : activeAspects;
    const aspectLinesData = drawRays.map((asp, idx) => {
      const tPlanetConf = TRANSIT_METADATA.find(p => p.name === asp.transit);
      const tRadius = transitOuterTrack - (tPlanetConf ? tPlanetConf.radiusOffset * 0.15 * baseUnit : 0);
      const pTransit = polarToCartesian(asp.angleTransit, tRadius);
      const pNatal = polarToCartesian(asp.angleNatal, natalPlanetRadius);
      const isFocusedRay = highlightedAspects.length > 0;
      return {
        id: `${asp.transit}-${asp.natal}-${idx}`,
        transit: asp.transit,
        natal: asp.natal,
        type: asp.type,
        x1: pTransit.x,
        y1: pTransit.y,
        x2: pNatal.x,
        y2: pNatal.y,
        color: asp.color,
        opacity: isFocusedRay ? 0.95 : 0.45,
        width: isFocusedRay ? 2.0 : 1.2,
        dash: asp.type === "Quadratura" ? "3 3" : "none",
        symbol: asp.symbol,
        showGlyph: isFocusedRay
      };
    });

    let aspectsContainer = chartGroup.select(".mandala-aspects-container");
    if (aspectsContainer.empty()) {
      aspectsContainer = chartGroup.append("g").attr("class", "mandala-aspects-container");
    }

    const aspectLines = aspectsContainer.selectAll<SVGLineElement, any>(".aspect-sacred-ray")
      .data(aspectLinesData, d => d.id);

    aspectLines.exit().transition().duration(120).attr("stroke-opacity", 0).remove();

    const aspectLinesEnter = aspectLines.enter()
      .append("line")
      .attr("class", "aspect-sacred-ray cursor-pointer")
      .attr("x1", d => d.x1).attr("y1", d => d.y1)
      .attr("x2", d => d.x2).attr("y2", d => d.y2)
      .attr("stroke", d => d.color)
      .attr("stroke-opacity", 0)
      .attr("stroke-width", d => d.width)
      .attr("stroke-dasharray", d => d.dash)
      .attr("filter", d => d.type === "Trígono" ? "url(#mandala-cyan-glow)" : null);

    aspectLinesEnter.merge(aspectLines)
      .transition()
      .duration(transitionDuration)
      .ease(transitionEase)
      .attr("x1", d => d.x1).attr("y1", d => d.y1)
      .attr("x2", d => d.x2).attr("y2", d => d.y2)
      .attr("stroke", d => d.color)
      .attr("stroke-opacity", d => d.opacity)
      .attr("stroke-width", d => d.width)
      .attr("stroke-dasharray", d => d.dash)
      .attr("filter", d => d.type === "Trígono" ? "url(#mandala-cyan-glow)" : null);

    // Aspect Glyphs on Center
    let badgeContainer = chartGroup.select(".mandala-aspect-badges-container");
    if (badgeContainer.empty()) {
      badgeContainer = chartGroup.append("g").attr("class", "mandala-aspect-badges-container");
    }

    const aspectBadges = badgeContainer.selectAll<SVGGElement, any>(".aspect-badge-node")
      .data(aspectLinesData.filter(d => d.showGlyph), d => d.id);

    aspectBadges.exit().remove();
    const aspectBadgesEnter = aspectBadges.enter().append("g").attr("class", "aspect-badge-node").attr("opacity", 0);
    aspectBadgesEnter.append("circle").attr("r", 7 * baseUnit).attr("fill", "#040814").attr("stroke-width", 1.2);
    aspectBadgesEnter.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("class", "font-mono font-bold select-none");

    const aspectBadgesMerge = aspectBadgesEnter.merge(aspectBadges);
    aspectBadgesMerge.transition().duration(transitionDuration).ease(transitionEase)
      .attr("opacity", 1)
      .attr("transform", d => `translate(${(d.x1 + d.x2) / 2}, ${(d.y1 + d.y2) / 2})`);
    aspectBadgesMerge.select("circle").attr("stroke", d => d.color);
    aspectBadgesMerge.select("text").attr("fill", d => d.color).attr("font-size", `${Math.max(7, 9 * baseUnit)}px`).text(d => d.symbol);

    // 6. Natal Birth Planets ⓝ (Mandala HD Style - Circular Badges & Degrees)
    const natalPlanetsData = TRANSIT_METADATA.map((planet) => {
      const nAngle = getNatalAngle(planet.name);
      if (nAngle === null) return null;
      const pos = polarToCartesian(nAngle, natalPlanetRadius);
      const isFocused = hoveredPlanet === planet.name || selectedPlanet === planet.name;
      return {
        name: planet.name,
        symbol: planet.symbol,
        color: planet.color,
        x: pos.x,
        y: pos.y,
        angle: nAngle,
        isFocused
      };
    }).filter(Boolean) as any[];

    let natalContainer = chartGroup.select(".mandala-natal-planets-container");
    if (natalContainer.empty()) {
      natalContainer = chartGroup.append("g").attr("class", "mandala-natal-planets-container");
    }

    const natalNodes = natalContainer.selectAll<SVGGElement, any>(".natal-badge-node")
      .data(natalPlanetsData, d => d.name);

    natalNodes.exit().remove();
    const natalNodesEnter = natalNodes.enter().append("g")
      .attr("class", "natal-badge-node cursor-pointer")
      .on("click", (event, d) => setSelectedPlanet(d.name))
      .on("mouseover", (event, d) => {
        setHoveredPlanet(d.name);
        const lbl = getAstroLabel(d.angle);
        setHoveredEntity({
          type: 'planet',
          title: `${t(d.name)} ⓝ (${d.symbol})`,
          detail: `${lbl.degrees}° ${t("de")} ${t(lbl.signName)} • ${t("Posição Natal ⓝ")}`,
          extra: t("Aspectos Ativos deste planeta")
        });
      })
      .on("mouseleave", () => {
        setHoveredPlanet(null);
        setHoveredEntity(null);
      });

    natalNodesEnter.append("circle").attr("class", "natal-badge-bg").attr("fill", "#040814").attr("stroke-width", 1.5);
    natalNodesEnter.append("text").attr("class", "natal-badge-symbol font-bold select-none").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
    natalNodesEnter.append("text").attr("class", "natal-badge-tag font-mono select-none text-[6.5px] fill-slate-400").attr("text-anchor", "middle").attr("dominant-baseline", "middle");

    const natalNodesMerge = natalNodesEnter.merge(natalNodes);

    natalNodesMerge.select(".natal-badge-bg")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attr("cx", d => d.x).attr("cy", d => d.y)
      .attr("r", d => (d.isFocused ? 11 : 8.5) * baseUnit)
      .attr("stroke", d => d.color)
      .attr("filter", d => d.isFocused ? "url(#mandala-gold-glow)" : null);

    natalNodesMerge.select(".natal-badge-symbol")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attr("x", d => d.x).attr("y", d => d.y)
      .attr("fill", d => d.color)
      .attr("font-size", d => `${(d.isFocused ? 10 : 8) * baseUnit}px`)
      .text(d => d.symbol);

    natalNodesMerge.select(".natal-badge-tag")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attr("x", d => d.x).attr("y", d => d.y + (13 * baseUnit))
      .attr("font-size", `${Math.max(6, 7.5 * baseUnit)}px`)
      .attr("fill", d => d.isFocused ? "#FFF" : "rgba(148, 163, 184, 0.65)")
      .text(d => `${d.name.slice(0, 3).toUpperCase()}ⓝ`);

    // 7. Dynamic Transit Moving Planets ⓣ (Mandala HD Style with stardust trail & glowing badge)
    const transitPlanetsData = TRANSIT_METADATA.map((planet) => {
      const tAngle = getTransitAngle(planet);
      const tRadius = transitOuterTrack - (planet.radiusOffset * 0.15 * baseUnit);
      const pos = polarToCartesian(tAngle, tRadius);
      const isFocused = hoveredPlanet === planet.name || selectedPlanet === planet.name;
      return {
        name: planet.name,
        symbol: planet.symbol,
        color: planet.color,
        x: pos.x,
        y: pos.y,
        angle: tAngle,
        radius: tRadius,
        isFocused
      };
    });

    let transitContainer = chartGroup.select(".mandala-transit-planets-container");
    if (transitContainer.empty()) {
      transitContainer = chartGroup.append("g").attr("class", "mandala-transit-planets-container");
    }

    const transitNodes = transitContainer.selectAll<SVGGElement, any>(".transit-badge-node")
      .data(transitPlanetsData, d => d.name);

    const transitNodesEnter = transitNodes.enter().append("g")
      .attr("class", "transit-badge-node cursor-pointer")
      .on("click", (event, d) => setSelectedPlanet(d.name))
      .on("pointerdown", (event, d) => setSelectedPlanet(d.name))
      .on("mouseover", (event, d) => {
        setHoveredPlanet(d.name);
        const lbl = getAstroLabel(d.angle);
        setHoveredEntity({
          type: 'planet',
          title: `${t(d.name)} ⓣ (${d.symbol})`,
          detail: `${lbl.degrees}° ${t("de")} ${t(lbl.signName)} • ${t("Trânsito Atual ⓣ")}`,
          extra: t(TRANSIT_METADATA.find(p => p.name === d.name)?.description || "")
        });
      })
      .on("mouseleave", () => {
        setHoveredPlanet(null);
        setHoveredEntity(null);
      });

    // Stardust trail
    transitNodesEnter.append("circle").attr("class", "transit-stardust-3 fill-none").attr("opacity", 0.2);
    transitNodesEnter.append("circle").attr("class", "transit-stardust-2 fill-none").attr("opacity", 0.4);
    transitNodesEnter.append("circle").attr("class", "transit-stardust-1 fill-none").attr("opacity", 0.7);

    // Halo pulse ring
    transitNodesEnter.append("circle").attr("class", "transit-pulse-halo fill-none").attr("opacity", 0);

    // Planet Badge Body
    transitNodesEnter.append("circle").attr("class", "transit-badge-body").attr("fill", "#040814").attr("stroke-width", 1.8);
    transitNodesEnter.append("text").attr("class", "transit-badge-symbol font-bold select-none").attr("text-anchor", "middle").attr("dominant-baseline", "middle");
    transitNodesEnter.append("text").attr("class", "transit-badge-tag font-mono select-none font-semibold").attr("text-anchor", "middle").attr("dominant-baseline", "middle");

    const transitNodesMerge = transitNodesEnter.merge(transitNodes);

    // Stardust interpolation
    transitNodesMerge.select(".transit-stardust-3")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("cx", function(d) {
        const el = this as any;
        const prev = el._curAngle !== undefined ? el._curAngle : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngle = d.angle;
        return (t) => String(polarToCartesian(interp(t) - 8, d.radius).x);
      })
      .attrTween("cy", function(d) {
        const el = this as any;
        const prev = el._curAngleY !== undefined ? el._curAngleY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleY = d.angle;
        return (t) => String(polarToCartesian(interp(t) - 8, d.radius).y);
      })
      .attr("r", 1.5 * baseUnit)
      .attr("fill", d => d.color);

    transitNodesMerge.select(".transit-stardust-2")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("cx", function(d) {
        const el = this as any;
        const prev = el._curAngle !== undefined ? el._curAngle : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngle = d.angle;
        return (t) => String(polarToCartesian(interp(t) - 4, d.radius).x);
      })
      .attrTween("cy", function(d) {
        const el = this as any;
        const prev = el._curAngleY !== undefined ? el._curAngleY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleY = d.angle;
        return (t) => String(polarToCartesian(interp(t) - 4, d.radius).y);
      })
      .attr("r", 2.2 * baseUnit)
      .attr("fill", d => d.color);

    transitNodesMerge.select(".transit-stardust-1")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("cx", function(d) {
        const el = this as any;
        const prev = el._curAngle !== undefined ? el._curAngle : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngle = d.angle;
        return (t) => String(polarToCartesian(interp(t) - 2, d.radius).x);
      })
      .attrTween("cy", function(d) {
        const el = this as any;
        const prev = el._curAngleY !== undefined ? el._curAngleY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleY = d.angle;
        return (t) => String(polarToCartesian(interp(t) - 2, d.radius).y);
      })
      .attr("r", 3.0 * baseUnit)
      .attr("fill", d => d.color);

    // Pulse halo
    transitNodesMerge.select(".transit-pulse-halo")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("cx", function(d) {
        const el = this as any;
        const prev = el._curAngleH !== undefined ? el._curAngleH : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleH = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius).x);
      })
      .attrTween("cy", function(d) {
        const el = this as any;
        const prev = el._curAngleHY !== undefined ? el._curAngleHY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleHY = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius).y);
      })
      .attr("r", 15 * baseUnit)
      .attr("stroke", d => d.color)
      .attr("stroke-opacity", d => d.isFocused ? 0.4 : 0)
      .attr("fill", d => d.color)
      .attr("fill-opacity", d => d.isFocused ? 0.15 : 0);

    // Badge circle
    transitNodesMerge.select(".transit-badge-body")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("cx", function(d) {
        const el = this as any;
        const prev = el._curAngleC !== undefined ? el._curAngleC : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleC = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius).x);
      })
      .attrTween("cy", function(d) {
        const el = this as any;
        const prev = el._curAngleCY !== undefined ? el._curAngleCY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleCY = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius).y);
      })
      .attr("r", d => (d.isFocused ? 12 : 9.5) * baseUnit)
      .attr("stroke", d => d.color)
      .attr("filter", d => d.isFocused ? "url(#mandala-gold-glow)" : null);

    // Glyph text inside badge
    transitNodesMerge.select(".transit-badge-symbol")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("x", function(d) {
        const el = this as any;
        const prev = el._curAngleS !== undefined ? el._curAngleS : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleS = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius).x);
      })
      .attrTween("y", function(d) {
        const el = this as any;
        const prev = el._curAngleSY !== undefined ? el._curAngleSY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleSY = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius).y);
      })
      .attr("fill", d => d.color)
      .attr("font-size", d => `${(d.isFocused ? 11 : 9) * baseUnit}px`)
      .text(d => d.symbol);

    // Name tag
    transitNodesMerge.select(".transit-badge-tag")
      .transition().duration(transitionDuration).ease(transitionEase)
      .attrTween("x", function(d) {
        const el = this as any;
        const prev = el._curAngleT !== undefined ? el._curAngleT : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleT = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius + (14 * baseUnit)).x);
      })
      .attrTween("y", function(d) {
        const el = this as any;
        const prev = el._curAngleTY !== undefined ? el._curAngleTY : d.angle;
        const interp = d3.interpolate(prev, d.angle);
        el._curAngleTY = d.angle;
        return (t) => String(polarToCartesian(interp(t), d.radius + (14 * baseUnit)).y);
      })
      .attr("font-size", `${Math.max(6.5, 8 * baseUnit)}px`)
      .attr("fill", d => d.isFocused ? "#FFF" : d.color)
      .attr("fill-opacity", d => d.isFocused ? 1 : 0.8)
      .text(d => `${d.name.slice(0, 3).toUpperCase()}ⓣ`);

    // 8. Center Golden Focal Compass Point (Mandala HD Style)
    let centerPoint = chartGroup.select(".mandala-center-sun");
    if (centerPoint.empty()) {
      centerPoint = chartGroup.append("g").attr("class", "mandala-center-sun");
      centerPoint.append("circle")
        .attr("r", 6 * baseUnit)
        .attr("fill", "#F59E0B")
        .attr("filter", "url(#mandala-gold-glow)");
      centerPoint.append("circle")
        .attr("r", 2.5 * baseUnit)
        .attr("fill", "#FFFBEB");
    }

  }, [dimensions, simDays, hoveredPlanet, selectedPlanet, mapData, isPlaying, currentLang]);

  // Read current focused planet config
  const activePlanetConf = TRANSIT_METADATA.find(p => p.name === selectedPlanet) || TRANSIT_METADATA[0];
  const activeTransitAngle = getTransitAngle(activePlanetConf);
  const activeNatalAngle = getNatalAngle(selectedPlanet);

  const transitLabelInfo = getAstroLabel(activeTransitAngle);
  const natalLabelInfo = activeNatalAngle !== null ? getAstroLabel(activeNatalAngle) : null;

  // Active aspects for selected planet
  const currentTransitAspectRelations = activeAspects.filter(a => a.transit === selectedPlanet);

  return (
    <div 
      id="astrological-natal-mandala-card" 
      className="relative w-full max-w-7xl mx-auto rounded-3xl bg-[#040814] border border-amber-500/30 p-4 sm:p-6 md:p-8 text-slate-100 shadow-[0_0_50px_rgba(4,8,20,0.9)] overflow-hidden font-sans select-none transition-all duration-500 space-y-6"
    >
      {/* Subtle Starry Particle Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0C1838_0%,#040814_100%)] pointer-events-none opacity-90" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Brand & Live Simulation Controls */}
      <div className="relative z-10 flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-amber-500/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-amber-500/50 flex items-center justify-center bg-amber-500/10 text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Orbit className="w-4 h-4 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-widest text-amber-400 uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
                {t("Alinhamento de Trânsitos em Tempo Real")}
              </h1>
              <span className="text-[10px] font-mono text-amber-300/70 tracking-wider">
                {t("Mandala Astrológica HD • Trânsitos")}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300/80 max-w-2xl pt-1">
            {t("Analise trânsitos rotacionando dinamicamente e cruzando aspectos com suas casas de nascimento.")}
          </p>
        </div>

        {/* Live Simulation controls in gold luxury theme */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-amber-500/25 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? t("Pausar Fluxo") : t("Iniciar Fluxo")}
            className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition active:scale-95 cursor-pointer shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-400" />}
          </button>

          <button
            onClick={() => {
              setSimDays(0);
              setIsPlaying(false);
            }}
            title={t("Resetar data oficial (Tempo Real)")}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-200 border border-slate-800 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-amber-500/20 mx-1" />

          {/* Speed slider */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[9px] font-mono text-amber-300/80 uppercase font-bold">{t("Velocidade:")}</span>
            <input 
              type="range"
              min="0.1"
              max="15.0"
              step="0.1"
              value={simSpeed}
              onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[10px] font-mono text-amber-400 font-bold w-10">{simSpeed.toFixed(1)}d/s</span>
          </div>
        </div>
      </div>

      {/* Main Vector Mandala Canvas & Analysis Dashboard */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Interactive D3 Mandala Astrológica HD */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          
          <div ref={containerRef} className="w-full flex justify-center items-center relative aspect-square max-w-[620px]">
            <svg 
              ref={svgRef} 
              width={dimensions.width} 
              height={dimensions.height}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="w-full h-full select-none max-w-full drop-shadow-[0_0_35px_rgba(245,158,11,0.15)]"
            />

            {/* Interactive Tooltip Card on Hover */}
            {hoveredEntity && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3.5 rounded-2xl bg-slate-950/95 border border-amber-400/80 backdrop-blur-xl shadow-2xl text-center pointer-events-none max-w-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 font-serif font-bold text-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hoveredEntity.title}</span>
                </div>
                <p className="text-xs text-slate-200 font-mono mt-1">{hoveredEntity.detail}</p>
                {hoveredEntity.extra && (
                  <p className="text-[10px] text-amber-200/80 mt-1.5 italic border-t border-amber-500/20 pt-1">
                    {hoveredEntity.extra}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Compass labels */}
          <div className="flex justify-between w-full max-w-[500px] mt-2 px-4 text-[9px] font-mono text-amber-400/60 select-none">
            <span className="flex items-center gap-1"><Compass className="w-3 h-3 text-amber-400" /> [E] {t("LESTE / ASCENDENTE")}</span>
            <span className="flex items-center gap-1">{t("OESTE / DESCENDENTE")} [W] <Compass className="w-3 h-3 text-amber-400" /></span>
          </div>

          {/* Days simulated metrics badge */}
          {simDays !== 0 && (
            <div className="absolute top-2 left-2 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 shadow-lg">
              <Calendar className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t("Simulado:")} +{Math.round(simDays)} {t("dias de trânsito")}</span>
            </div>
          )}
        </div>

        {/* Right Column: High Definition Astrological Control Panels */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Major Aspects Legend in Mandala HD Style */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg space-y-2">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase border-b border-amber-500/10 pb-1 flex items-center justify-between">
              <span>{t("Aspectos Ativos")}</span>
              <span className="text-[9px] text-slate-400">ⓝ {t("Natal")} / ⓣ {t("Trânsito")}</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="font-bold">☌</span>
                <span className="text-slate-300 text-[9px]">{t("Conjunção (0°)")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="font-bold">☍</span>
                <span className="text-slate-300 text-[9px]">{t("Oposição (180°)")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400">
                <span className="font-bold">△</span>
                <span className="text-slate-300 text-[9px]">{t("Trígono (120°)")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="font-bold">□</span>
                <span className="text-slate-300 text-[9px]">{t("Quadratura (90°)")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="font-bold">⚹</span>
                <span className="text-slate-300 text-[9px]">{t("Sextil (60°)")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-slate-300 text-[9px]">{t("Órbitas em Movimento")}</span>
              </div>
            </div>
          </div>

          {/* Planet Orbit Selector Pills */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase block">{t("Navegar Órbitas")}</span>
            <div className="flex flex-wrap gap-1.5">
              {TRANSIT_METADATA.map((p) => {
                const active = selectedPlanet === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPlanet(p.name)}
                    className={`relative px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-300 cursor-pointer flex items-center gap-1 border ${
                      active 
                        ? 'text-amber-300 font-bold border-amber-500/50 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'text-slate-400 hover:text-slate-200 border-slate-800 bg-slate-900/60 hover:bg-slate-850'
                    }`}
                  >
                    <span>{p.symbol}</span>
                    <span>{t(p.name)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Planet Alignment Detail Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlanet}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/25 space-y-3 shadow-xl relative overflow-hidden backdrop-blur-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold font-serif uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-md" style={{ backgroundColor: activePlanetConf.color }} />
                    <span>{t(activePlanetConf.label)}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300/80 italic mt-0.5">{t(activePlanetConf.description)}</p>
                </div>
              </div>

              {/* Transit vs Natal Position Match */}
              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-amber-500/15">
                <div className="space-y-1 p-2 rounded-xl bg-slate-900/60 border border-amber-500/10">
                  <span className="text-[8.5px] font-mono text-amber-400/80 uppercase block font-bold">{t("Trânsito Atual ⓣ")}</span>
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                    <span style={{ color: transitLabelInfo.color }} className="font-bold text-sm">{transitLabelInfo.signSymbol}</span>
                    <span>{transitLabelInfo.degrees}° {t("de")} {t(transitLabelInfo.signName)}</span>
                  </div>
                </div>

                <div className="space-y-1 p-2 rounded-xl bg-slate-900/60 border border-amber-500/10">
                  <span className="text-[8.5px] font-mono text-amber-400/80 uppercase block font-bold">{t("Posição Natal ⓝ")}</span>
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-slate-200">
                    {natalLabelInfo ? (
                      <>
                        <span style={{ color: natalLabelInfo.color }} className="font-bold text-sm">{natalLabelInfo.signSymbol}</span>
                        <span>{natalLabelInfo.degrees}° {t("de")} {t(natalLabelInfo.signName)}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">{t("Não mapeado")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Aspect Connections for selected planet */}
              <div className="space-y-2 pt-2 border-t border-amber-500/15">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-amber-400/80 uppercase font-bold">{t("Aspectos Ativos deste planeta")}</span>
                  <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                    {currentTransitAspectRelations.length} {t("conexões")}
                  </span>
                </div>
                
                {currentTransitAspectRelations.length > 0 ? (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {currentTransitAspectRelations.map((asp, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.15 }}
                        className="p-2 rounded-xl bg-slate-900/70 border border-amber-500/15 flex items-start gap-2.5"
                      >
                        <span className="text-sm font-bold shrink-0 pt-0.5" style={{ color: asp.color }}>{asp.symbol}</span>
                        <div className="text-[10px] leading-relaxed">
                          <strong style={{ color: asp.color }}>{t(asp.type)}</strong> {t("de")} <strong className="text-amber-200"> {t(asp.transit)} ⓣ </strong> {t("com seu")} <strong className="text-amber-200"> {t(asp.natal)} ⓝ </strong>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">{t(asp.desc)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 leading-normal">
                    {t("Nenhum aspecto maior exato formado no momento com o seu mapa natal. Rotacione o tempo usando a velocidade de simulação para ver novos alinhamentos celestes dinamicamente!")}
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Active Alignment Insight */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-950/80 to-transparent border-l-2 border-amber-400 rounded-r-2xl flex gap-3 shadow-md">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] font-mono text-amber-400 uppercase font-bold tracking-wider block">{t("Insight do Alinhamento Ativo")}</span>
              <p className="text-[11px] text-slate-300 leading-normal pt-0.5">
                {selectedPlanet === "Sol" && t("O trânsito solar ilumina seu mapa atual estimulando renovações de identidade.")}
                {selectedPlanet === "Lua" && t("Sensibilidade acelerada em oscilações oníricas diárias. Excelente para journaling.")}
                {selectedPlanet === "Mercúrio" && t("Aceleração de contatos, excelente para reavaliar correspondências importantes.")}
                {selectedPlanet === "Vênus" && t("Magnetismo em alta facilitando entendimentos com parcerias e acordos estéticos.")}
                {selectedPlanet === "Marte" && t("Mantenha o foco ativo para evitar conflitos desnecessários, redirecione o impulso.")}
                {!["Sol", "Lua", "Mercúrio", "Vênus", "Marte"].includes(selectedPlanet) && t("Trânsitos de planetas geracionais influenciam as estruturas institucionais de sua jornada de longo prazo.")}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Slogan Sign-off */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center pt-2 border-t border-amber-500/15">
        <div className="flex items-center gap-2 text-amber-400/80 text-[11px] font-serif tracking-widest uppercase">
          <span>✦</span>
          <span>{t("Geometria Sagrada")} • {t("Alinhamento de Trânsitos em Tempo Real")}</span>
          <span>✦</span>
        </div>
        <div className="w-32 h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent mt-1.5" />
      </div>

    </div>
  );
}
