import React, { useState, useMemo, useRef } from 'react';
import { AstroAstroPosition, AstroHouse, AstroAspect, AstroElementDistribution, AstroQualityDistribution, UserProfile, AstrologyMap } from '../types';
import { useTranslation } from 'react-i18next';
import { 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Flame, 
  Leaf, 
  Wind, 
  Droplets, 
  User, 
  Share2, 
  Info, 
  Layers, 
  CircleDot 
} from 'lucide-react';

interface CircularChartProps {
  astros?: AstroAstroPosition[];
  houses?: AstroHouse[];
  aspects?: AstroAspect[];
  distribution?: {
    elements?: AstroElementDistribution;
    qualities?: AstroQualityDistribution;
  };
  user?: UserProfile;
  mapData?: AstrologyMap;
  className?: string;
}

// 12 Zodiac signs configuration in counter-clockwise order
const ZODIAC_DEFINITIONS = [
  { id: "aries", namePt: "Áries", nameEn: "Aries", nameEs: "Aries", nameDe: "Widder", nameFr: "Bélier", symbol: "♈", element: "fire", color: "#F43F5E", textColor: "text-rose-400" },
  { id: "taurus", namePt: "Touro", nameEn: "Taurus", nameEs: "Tauro", nameDe: "Stier", nameFr: "Taureau", symbol: "♉", element: "earth", color: "#10B981", textColor: "text-emerald-400" },
  { id: "gemini", namePt: "Gêmeos", nameEn: "Gemini", nameEs: "Géminis", nameDe: "Zwillinge", nameFr: "Gémeaux", symbol: "♊", element: "air", color: "#FBBF24", textColor: "text-amber-300" },
  { id: "cancer", namePt: "Câncer", nameEn: "Cancer", nameEs: "Cáncer", nameDe: "Krebs", nameFr: "Cancer", symbol: "♋", element: "water", color: "#38BDF8", textColor: "text-sky-400" },
  { id: "leo", namePt: "Leão", nameEn: "Leo", nameEs: "Leo", nameDe: "Löwe", nameFr: "Lion", symbol: "♌", element: "fire", color: "#FB923C", textColor: "text-orange-400" },
  { id: "virgo", namePt: "Virgem", nameEn: "Virgo", nameEs: "Virgo", nameDe: "Jungfrau", nameFr: "Vierge", symbol: "♍", element: "earth", color: "#34D399", textColor: "text-emerald-300" },
  { id: "libra", namePt: "Libra", nameEn: "Libra", nameEs: "Libra", nameDe: "Waage", nameFr: "Balance", symbol: "♎", element: "air", color: "#2DD4BF", textColor: "text-teal-300" },
  { id: "scorpio", namePt: "Escorpião", nameEn: "Scorpio", nameEs: "Escorpio", nameDe: "Skorpion", nameFr: "Scorpion", symbol: "♏", element: "water", color: "#A855F7", textColor: "text-purple-400" },
  { id: "sagittarius", namePt: "Sagitário", nameEn: "Sagittarius", nameEs: "Sagitario", nameDe: "Schütze", nameFr: "Sagittaire", symbol: "♐", element: "fire", color: "#F43F5E", textColor: "text-rose-400" },
  { id: "capricorn", namePt: "Capricórnio", nameEn: "Capricorn", nameEs: "Capricornio", nameDe: "Steinbock", nameFr: "Capricorne", symbol: "♑", element: "earth", color: "#FACC15", textColor: "text-yellow-400" },
  { id: "aquarius", namePt: "Aquário", nameEn: "Aquarius", nameEs: "Acuario", nameDe: "Wassermann", nameFr: "Verseau", symbol: "♒", element: "air", color: "#06B6D4", textColor: "text-cyan-400" },
  { id: "pisces", namePt: "Peixes", nameEn: "Pisces", nameEs: "Piscis", nameDe: "Fische", nameFr: "Poissons", symbol: "♓", element: "water", color: "#818CF8", textColor: "text-indigo-400" },
];

// Planet configuration with glyphs and theme colors
const PLANET_CONFIG: Record<string, { symbol: string; color: string; ringColor: string }> = {
  "Sol": { symbol: "☉", color: "#FACC15", ringColor: "#EAB308" },
  "Sun": { symbol: "☉", color: "#FACC15", ringColor: "#EAB308" },
  "Sonne": { symbol: "☉", color: "#FACC15", ringColor: "#EAB308" },
  "Soleil": { symbol: "☉", color: "#FACC15", ringColor: "#EAB308" },
  "Lua": { symbol: "☽", color: "#38BDF8", ringColor: "#0284C7" },
  "Moon": { symbol: "☽", color: "#38BDF8", ringColor: "#0284C7" },
  "Luna": { symbol: "☽", color: "#38BDF8", ringColor: "#0284C7" },
  "Mond": { symbol: "☽", color: "#38BDF8", ringColor: "#0284C7" },
  "Lune": { symbol: "☽", color: "#38BDF8", ringColor: "#0284C7" },
  "Mercúrio": { symbol: "☿", color: "#4ADE80", ringColor: "#16A34A" },
  "Mercury": { symbol: "☿", color: "#4ADE80", ringColor: "#16A34A" },
  "Mercurio": { symbol: "☿", color: "#4ADE80", ringColor: "#16A34A" },
  "Merkur": { symbol: "☿", color: "#4ADE80", ringColor: "#16A34A" },
  "Mercure": { symbol: "☿", color: "#4ADE80", ringColor: "#16A34A" },
  "Vênus": { symbol: "♀", color: "#2DD4BF", ringColor: "#0D9488" },
  "Venus": { symbol: "♀", color: "#2DD4BF", ringColor: "#0D9488" },
  "Vénus": { symbol: "♀", color: "#2DD4BF", ringColor: "#0D9488" },
  "Marte": { symbol: "♂", color: "#F43F5E", ringColor: "#E11D48" },
  "Mars": { symbol: "♂", color: "#F43F5E", ringColor: "#E11D48" },
  "Júpiter": { symbol: "♃", color: "#FB923C", ringColor: "#EA580C" },
  "Jupiter": { symbol: "♃", color: "#FB923C", ringColor: "#EA580C" },
  "Saturno": { symbol: "♄", color: "#FDE047", ringColor: "#CA8A04" },
  "Saturn": { symbol: "♄", color: "#FDE047", ringColor: "#CA8A04" },
  "Saturne": { symbol: "♄", color: "#FDE047", ringColor: "#CA8A04" },
  "Urano": { symbol: "♅", color: "#38BDF8", ringColor: "#0284C7" },
  "Uranus": { symbol: "♅", color: "#38BDF8", ringColor: "#0284C7" },
  "Netuno": { symbol: "♆", color: "#2DD4BF", ringColor: "#0F766E" },
  "Neptune": { symbol: "♆", color: "#2DD4BF", ringColor: "#0F766E" },
  "Neptuno": { symbol: "♆", color: "#2DD4BF", ringColor: "#0F766E" },
  "Neptun": { symbol: "♆", color: "#2DD4BF", ringColor: "#0F766E" },
  "Plutão": { symbol: "♇", color: "#C084FC", ringColor: "#9333EA" },
  "Pluto": { symbol: "♇", color: "#C084FC", ringColor: "#9333EA" },
  "Plutón": { symbol: "♇", color: "#C084FC", ringColor: "#9333EA" },
  "Pluton": { symbol: "♇", color: "#C084FC", ringColor: "#9333EA" },
  "Quíron": { symbol: "⚷", color: "#94A3B8", ringColor: "#64748B" },
  "Chiron": { symbol: "⚷", color: "#94A3B8", ringColor: "#64748B" },
  "Nodo Norte": { symbol: "☊", color: "#E2E8F0", ringColor: "#94A3B8" },
  "North Node": { symbol: "☊", color: "#E2E8F0", ringColor: "#94A3B8" },
  "Lilith": { symbol: "⚸", color: "#F43F5E", ringColor: "#881337" },
  "Ascendente": { symbol: "AC", color: "#EAB308", ringColor: "#CA8A04" },
  "Meio do Céu": { symbol: "MC", color: "#EAB308", ringColor: "#CA8A04" }
};

export default function CircularChart({
  astros: propAstros,
  houses: propHouses,
  aspects: propAspects,
  distribution: propDistribution,
  user: propUser,
  mapData,
  className = ""
}: CircularChartProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'pt').toLowerCase().slice(0, 2);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'planet' | 'sign' | 'house' | 'aspect';
    title: string;
    detail: string;
    extra?: string;
  } | null>(null);

  // Consolidated data with safe fallbacks
  const rawAstros = propAstros || mapData?.astros || [];
  const rawHouses = propHouses || mapData?.houses || [];
  const rawAspects = propAspects || mapData?.aspects || [];
  const distribution = propDistribution || mapData?.distribution || {
    elements: { fire: 25, earth: 31, air: 25, water: 19 },
    qualities: { cardinal: 33, fixed: 33, mutable: 34 }
  };
  const user = propUser || {
    name: "USUÁRIO",
    birthDate: "1990-03-15",
    birthTime: "14:30",
    birthCity: "São Paulo, SP – Brasil",
    latitude: -23.5505,
    longitude: -46.6333
  };

  // Multilingual UI Dictionary matching the uploaded design
  const UI = useMemo(() => {
    const dict: Record<string, Record<string, string>> = {
      pt: {
        title: "MAPA ASTRAL",
        subtitle: "Seu Mapa | Único e Pessoal",
        userLabel: "USUÁRIO",
        elementsTitle: "ELEMENTOS",
        modalitiesTitle: "MODALIDADES",
        fire: "Fogo",
        earth: "Terra",
        air: "Ar",
        water: "Água",
        cardinal: "Cardinal",
        fixed: "Fixo",
        mutable: "Mutável",
        mainAspectsTitle: "ASPECTOS PRINCIPAIS",
        trine: "Trígono",
        sextile: "Sextil",
        square: "Quadratura",
        opposition: "Oposição",
        conjunction: "Conjunção",
        housePositionsTitle: "POSIÇÕES DAS CASAS",
        mcTitle: "MEIO DO CÉU",
        fcTitle: "FUNDO DO CÉU",
        acTitle: "ASCENDENTE",
        dcTitle: "DESCENDENTE",
        slogan: "CONECTE-SE • COMPRENDA-SE • TRANSFORME-SE",
        portalBrand: "PORTAL ÓRBITA",
        portalSub: "CIÊNCIA, ESPIRITUALIDADE E CONSCIÊNCIA",
        downloadBtn: "Baixar Vetor HD",
        fullscreenBtn: "Visualizar em Tela Cheia",
        exitFullscreenBtn: "Sair da Tela Cheia",
        house: "Casa",
        degMin: "Grau",
        inSign: "em"
      },
      en: {
        title: "NATAL CHART",
        subtitle: "Your Chart | Unique & Personal",
        userLabel: "USER",
        elementsTitle: "ELEMENTS",
        modalitiesTitle: "MODALITIES",
        fire: "Fire",
        earth: "Earth",
        air: "Air",
        water: "Water",
        cardinal: "Cardinal",
        fixed: "Fixed",
        mutable: "Mutable",
        mainAspectsTitle: "MAJOR ASPECTS",
        trine: "Trine",
        sextile: "Sextile",
        square: "Square",
        opposition: "Opposition",
        conjunction: "Conjunction",
        housePositionsTitle: "HOUSE POSITIONS",
        mcTitle: "MIDHEAVEN",
        fcTitle: "IMMUM COELI",
        acTitle: "ASCENDANT",
        dcTitle: "DESCENDANT",
        slogan: "CONNECT • UNDERSTAND • TRANSFORM",
        portalBrand: "PORTAL ORBITA",
        portalSub: "SCIENCE, SPIRITUALITY & CONSCIOUSNESS",
        downloadBtn: "Download HD Vector",
        fullscreenBtn: "Fullscreen View",
        exitFullscreenBtn: "Exit Fullscreen",
        house: "House",
        degMin: "Degree",
        inSign: "in"
      },
      es: {
        title: "MAPA ASTRAL",
        subtitle: "Tu Carta | Única y Personal",
        userLabel: "USUARIO",
        elementsTitle: "ELEMENTOS",
        modalitiesTitle: "MODALIDADES",
        fire: "Fuego",
        earth: "Tierra",
        air: "Aire",
        water: "Agua",
        cardinal: "Cardinal",
        fixed: "Fijo",
        mutable: "Mutable",
        mainAspectsTitle: "ASPECTOS PRINCIPALES",
        trine: "Trígono",
        sextile: "Sextil",
        square: "Cuadratura",
        opposition: "Oposición",
        conjunction: "Conjunción",
        housePositionsTitle: "POSICIONES DE LAS CASAS",
        mcTitle: "MEDIO CIELO",
        fcTitle: "FONDO DEL CIELO",
        acTitle: "ASCENDENTE",
        dcTitle: "DESCENDENTE",
        slogan: "CONÉCTATE • COMPRÉNDETE • TRANSFÓRMATE",
        portalBrand: "PORTAL ÓRBITA",
        portalSub: "CIENCIA, ESPIRITUALIDAD Y CONCIENCIA",
        downloadBtn: "Descargar Vector HD",
        fullscreenBtn: "Ver en Pantalla Completa",
        exitFullscreenBtn: "Salir de Pantalla Completa",
        house: "Casa",
        degMin: "Grado",
        inSign: "en"
      },
      de: {
        title: "GEBURTSHOROSKOP",
        subtitle: "Ihr Horoskop | Einzigartig & Persönlich",
        userLabel: "BENUTZER",
        elementsTitle: "ELEMENTE",
        modalitiesTitle: "MODALITÄTEN",
        fire: "Feuer",
        earth: "Erde",
        air: "Luft",
        water: "Wasser",
        cardinal: "Kardinal",
        fixed: "Fix",
        mutable: "Veränderlich",
        mainAspectsTitle: "HAUPTASPEKTE",
        trine: "Trigon",
        sextile: "Sextil",
        square: "Quadrat",
        opposition: "Opposition",
        conjunction: "Konjunktion",
        housePositionsTitle: "HÄUSERPOSITIONEN",
        mcTitle: "HIMMELSMITTE",
        fcTitle: "IMMUM COELI",
        acTitle: "ASZENDENT",
        dcTitle: "DESZENDENT",
        slogan: "VERBINDE DICH • VERSTEHE DICH • TRANSFORMIERE DICH",
        portalBrand: "PORTAL ORBITA",
        portalSub: "WISSENSCHAFT, SPIRITUALITÄT & BEWUSSTSEIN",
        downloadBtn: "HD-Vektor Herunterladen",
        fullscreenBtn: "Vollbildansicht",
        exitFullscreenBtn: "Vollbild Beenden",
        house: "Haus",
        degMin: "Grad",
        inSign: "in"
      },
      fr: {
        title: "THÈME ASTRAL",
        subtitle: "Votre Thème | Unique et Personnel",
        userLabel: "UTILISATEUR",
        elementsTitle: "ÉLÉMENTS",
        modalitiesTitle: "MODALITÉS",
        fire: "Feu",
        earth: "Terre",
        air: "Air",
        water: "Eau",
        cardinal: "Cardinal",
        fixed: "Fixe",
        mutable: "Mutable",
        mainAspectsTitle: "ASPECTS MAJEURS",
        trine: "Trigone",
        sextile: "Sextile",
        square: "Carré",
        opposition: "Opposition",
        conjunction: "Conjonction",
        housePositionsTitle: "POSITIONS DES MAISONS",
        mcTitle: "MILIEU DU CIEL",
        fcTitle: "FOND DU CIEL",
        acTitle: "ASCENDANT",
        dcTitle: "DESCENDANT",
        slogan: "CONNECTEZ-VOUS • COMPRENEZ-VOUS • TRANSFORMEZ-VOUS",
        portalBrand: "PORTAL ORBITA",
        portalSub: "SCIENCE, SPIRITUALITÉ ET CONSCIENCE",
        downloadBtn: "Télécharger Vecteur HD",
        fullscreenBtn: "Mode Plein Écran",
        exitFullscreenBtn: "Quitter Plein Écran",
        house: "Maison",
        degMin: "Degré",
        inSign: "en"
      }
    };
    return dict[currentLang] || dict.pt;
  }, [currentLang]);

  // Planet name translation helper
  const translatePlanet = (name: string): string => {
    const dict: Record<string, Record<string, string>> = {
      en: {
        Sol: 'Sun', Lua: 'Moon', Mercúrio: 'Mercury', Vênus: 'Venus', Marte: 'Mars',
        Júpiter: 'Jupiter', Saturno: 'Saturn', Urano: 'Uranus', Netuno: 'Neptune',
        Plutão: 'Pluto', Quíron: 'Chiron', Ascendente: 'Ascendant', 'Meio do Céu': 'Midheaven'
      },
      es: {
        Sol: 'Sol', Lua: 'Luna', Mercúrio: 'Mercurio', Vênus: 'Venus', Marte: 'Marte',
        Júpiter: 'Júpiter', Saturno: 'Saturno', Urano: 'Urano', Netuno: 'Neptuno',
        Plutão: 'Plutón', Quíron: 'Quirón', Ascendente: 'Ascendente', 'Meio do Céu': 'Medio Cielo'
      },
      de: {
        Sol: 'Sonne', Lua: 'Mond', Mercúrio: 'Merkur', Vênus: 'Venus', Marte: 'Mars',
        Júpiter: 'Jupiter', Saturno: 'Saturn', Urano: 'Uranus', Netuno: 'Neptun',
        Plutão: 'Pluto', Quíron: 'Chiron', Ascendente: 'Aszendent', 'Meio do Céu': 'Himmelsmitte'
      },
      fr: {
        Sol: 'Soleil', Lua: 'Lune', Mercúrio: 'Mercure', Vênus: 'Vénus', Marte: 'Mars',
        Júpiter: 'Jupiter', Saturno: 'Saturne', Urano: 'Uranus', Netuno: 'Neptune',
        Plutão: 'Pluton', Quíron: 'Chiron', Ascendente: 'Ascendant', 'Meio do Céu': 'Milieu du Ciel'
      }
    };
    return dict[currentLang]?.[name] || name;
  };

  // Sign name translation helper
  const translateSign = (sign: string): string => {
    const item = ZODIAC_DEFINITIONS.find(
      s => s.namePt.toLowerCase() === sign.toLowerCase() || s.nameEn.toLowerCase() === sign.toLowerCase()
    );
    if (!item) return sign;
    if (currentLang === 'en') return item.nameEn;
    if (currentLang === 'es') return item.nameEs;
    if (currentLang === 'de') return item.nameDe;
    if (currentLang === 'fr') return item.nameFr;
    return item.namePt;
  };

  // Format Birth Date localized
  const formattedBirthDate = useMemo(() => {
    try {
      if (!user.birthDate) return "15 de Março de 1990";
      const parts = user.birthDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const localeMap: Record<string, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES', de: 'de-DE', fr: 'fr-FR' };
        return d.toLocaleDateString(localeMap[currentLang] || 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      return user.birthDate;
    } catch {
      return user.birthDate || "15 de Março de 1990";
    }
  }, [user.birthDate, currentLang]);

  // Format Latitude and Longitude to D°M' notation
  const formattedCoordinates = useMemo(() => {
    const lat = user.latitude ?? -23.5505;
    const lon = user.longitude ?? -46.6333;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : (currentLang === 'pt' || currentLang === 'es' ? 'O' : 'W');
    const latAbs = Math.abs(lat);
    const lonAbs = Math.abs(lon);
    const latDeg = Math.floor(latAbs);
    const latMin = Math.floor((latAbs - latDeg) * 60);
    const lonDeg = Math.floor(lonAbs);
    const lonMin = Math.floor((lonAbs - lonDeg) * 60);
    return `${latDeg}°${latMin}'${latDir} | ${lonDeg}°${lonMin}'${lonDir}`;
  }, [user.latitude, user.longitude, currentLang]);

  // Calculations for Natal Wheel Geometry (ViewBox 1000 x 1000)
  const size = 1000;
  const center = 500;
  const outerBorderRadius = 450;
  const zodiacOuterRadius = 430;
  const zodiacInnerRadius = 350;
  const planetsTrackRadius = 310;
  const housesOuterRadius = 260;
  const housesInnerRadius = 180;
  const aspectsCenterRadius = 175;

  // Degrees mapping for Zodiac Segments
  // In the chart matching the image, Aries is on the left (East / 180°), Counter-clockwise
  const ascDegree = useMemo(() => {
    const asc = rawAstros.find(a => a.name === "Ascendente");
    if (!asc) return 12.75;
    const degMatch = String(asc.degree).match(/(\d+)/);
    return degMatch ? parseInt(degMatch[0], 10) : 12.75;
  }, [rawAstros]);

  const mcDegree = useMemo(() => {
    const mc = rawAstros.find(a => a.name === "Meio do Céu");
    if (!mc) return 18.38;
    const degMatch = String(mc.degree).match(/(\d+)/);
    return degMatch ? parseInt(degMatch[0], 10) : 18.38;
  }, [rawAstros]);

  // Convert zodiac position (0° Aries to 360°) to SVG polar coordinates
  const getCoordinates = (angleDeg: number, radius: number): [number, number] => {
    // 0 deg = Right, 90 deg = Bottom in SVG, so subtract 180 to align Ascendant to 9 o'clock (Left)
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);
    return [x, y];
  };

  // Convert sign + degree to total 360 absolute degree
  const getAbsoluteDegree = (signName: string, degStr: string | number): number => {
    const sIndex = ZODIAC_DEFINITIONS.findIndex(
      s => s.namePt.toLowerCase() === String(signName).toLowerCase() || 
           s.nameEn.toLowerCase() === String(signName).toLowerCase() ||
           s.id.toLowerCase() === String(signName).toLowerCase()
    );
    const index = sIndex >= 0 ? sIndex : 0;
    let degree = 15;
    if (typeof degStr === 'number') {
      degree = degStr;
    } else if (degStr) {
      const match = String(degStr).match(/(\d+)/);
      if (match) degree = parseInt(match[0], 10);
    }
    return (index * 30 + degree) % 360;
  };

  // Clean planet list for rendering
  const mappedPlanets = useMemo(() => {
    const corePlanets = ["Sol", "Lua", "Mercúrio", "Vênus", "Marte", "Júpiter", "Saturno", "Urano", "Netuno", "Plutão"];
    
    // Default fallback planets matching high precision if empty
    const defaultData: AstroAstroPosition[] = [
      { name: "Saturno", sign: "Capricórnio", degree: "21°18'", description: "" },
      { name: "Júpiter", sign: "Sagitário", degree: "11°07'", description: "" },
      { name: "Plutão", sign: "Escorpião", degree: "17°32'", description: "" },
      { name: "Vênus", sign: "Libra", degree: "24°51'", description: "" },
      { name: "Lua", sign: "Câncer", degree: "2°34'", description: "" },
      { name: "Sol", sign: "Gêmeos", degree: "24°16'", description: "" },
      { name: "Mercúrio", sign: "Touro", degree: "5°27'", description: "" },
      { name: "Marte", sign: "Áries", degree: "18°03'", description: "" },
      { name: "Netuno", sign: "Aquário", degree: "9°41'", description: "" },
      { name: "Urano", sign: "Peixes", degree: "14°20'", description: "" }
    ];

    const source = rawAstros.length >= 7 ? rawAstros : defaultData;

    return source
      .filter(a => a.name !== "Ascendente" && a.name !== "Meio do Céu")
      .map(p => {
        const absDeg = getAbsoluteDegree(p.sign, p.degree);
        const [x, y] = getCoordinates(absDeg, planetsTrackRadius);
        const [aspectNodeX, aspectNodeY] = getCoordinates(absDeg, aspectsCenterRadius);
        const config = PLANET_CONFIG[p.name] || { symbol: "★", color: "#FBBF24", ringColor: "#D97706" };
        const signItem = ZODIAC_DEFINITIONS.find(s => s.namePt.toLowerCase() === p.sign.toLowerCase()) || ZODIAC_DEFINITIONS[0];

        return {
          ...p,
          absDeg,
          x,
          y,
          aspectNodeX,
          aspectNodeY,
          symbol: config.symbol,
          color: config.color,
          ringColor: config.ringColor,
          signSymbol: signItem.symbol,
          signColor: signItem.color
        };
      });
  }, [rawAstros]);

  // House positions list (1 to 12)
  const mappedHouses = useMemo(() => {
    const defaultSigns = [
      "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
      "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
    ];
    const defaultDegrees = [
      "12°45'", "15°22'", "17°48'", "18°23'", "15°22'", "12°45'",
      "12°45'", "15°22'", "17°48'", "18°23'", "15°22'", "12°45'"
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const houseNum = i + 1;
      const found = rawHouses.find(h => h.number === houseNum);
      const sign = found?.sign || defaultSigns[i];
      const degree = defaultDegrees[i];
      return {
        number: houseNum,
        sign,
        degree
      };
    });
  }, [rawHouses]);

  // Aspect Lines Calculation
  const computedAspects = useMemo(() => {
    const list: Array<{
      p1: any;
      p2: any;
      type: "trine" | "sextile" | "square" | "opposition" | "conjunction";
      color: string;
      dash?: string;
      symbol: string;
    }> = [];

    // Calculate geometric angles between every pair of mapped planets
    for (let i = 0; i < mappedPlanets.length; i++) {
      for (let j = i + 1; j < mappedPlanets.length; j++) {
        const p1 = mappedPlanets[i];
        const p2 = mappedPlanets[j];
        
        let diff = Math.abs(p1.absDeg - p2.absDeg);
        if (diff > 180) diff = 360 - diff;

        // Trine (120 deg, orb 8) - Blue Solid Line
        if (Math.abs(diff - 120) <= 7.5) {
          list.push({
            p1,
            p2,
            type: "trine",
            color: "#38BDF8", // Vibrant Sky/Cyan
            symbol: "△"
          });
        }
        // Sextile (60 deg, orb 6) - Green Dashed Line
        else if (Math.abs(diff - 60) <= 5.5) {
          list.push({
            p1,
            p2,
            type: "sextile",
            color: "#10B981", // Emerald
            dash: "5,4",
            symbol: "✳"
          });
        }
        // Square (90 deg, orb 7) - Red Dashed Line
        else if (Math.abs(diff - 90) <= 6.5) {
          list.push({
            p1,
            p2,
            type: "square",
            color: "#F43F5E", // Rose/Coral
            dash: "4,4",
            symbol: "□"
          });
        }
        // Opposition (180 deg, orb 8) - Red Dashed Line
        else if (Math.abs(diff - 180) <= 7.5) {
          list.push({
            p1,
            p2,
            type: "opposition",
            color: "#E11D48", // Crimson
            dash: "6,4",
            symbol: "○"
          });
        }
      }
    }
    return list;
  }, [mappedPlanets]);

  return (
    <div 
      ref={containerRef}
      id="astrological-natal-mandala-card" 
      className={`relative w-full max-w-5xl mx-auto rounded-3xl bg-[#040814] border border-amber-500/30 p-4 sm:p-6 md:p-8 text-slate-100 shadow-[0_0_50px_rgba(4,8,20,0.9)] overflow-hidden font-sans select-none transition-all duration-500 ${
        isFullscreen ? 'fixed inset-0 z-50 max-w-none rounded-none overflow-y-auto p-4 md:p-10' : ''
      } ${className}`}
    >
      {/* Subtle Starry Particle Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0C1838_0%,#040814_100%)] pointer-events-none opacity-90" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Action Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? UI.exitFullscreenBtn : UI.fullscreenBtn}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-400 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ========================================================
          TOP HEADER: Brand, User Identity & Elements / Modalities
          ======================================================== */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start pb-6 border-b border-amber-500/15">
        {/* Left Column: Title & User Natal Data */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-widest text-amber-400 uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
              {UI.title}
            </h1>
            <p className="text-xs sm:text-sm font-serif tracking-wide text-amber-200/70 mt-0.5">
              {UI.subtitle}
            </p>
          </div>

          {/* User Profile Card */}
          <div className="flex items-start gap-3.5 pt-2">
            <div className="w-11 h-11 rounded-full border-2 border-amber-400/80 flex items-center justify-center bg-amber-500/10 text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-0.5 text-xs text-slate-300">
              <h2 className="text-sm font-bold text-amber-300 tracking-wider uppercase font-serif">
                {user.name || UI.userLabel}
              </h2>
              <p className="text-slate-300/90 font-mono text-[11px]">{formattedBirthDate}</p>
              <p className="text-slate-400 font-mono text-[11px]">
                {user.birthTime ? `${user.birthTime} (GMT-3)` : "14:30 (GMT-3)"}
              </p>
              <p className="text-slate-300 font-sans text-[11px]">
                {user.birthCity || "São Paulo, SP – Brasil"}
              </p>
              <p className="text-amber-400/70 font-mono text-[10px] tracking-wider pt-0.5">
                {formattedCoordinates}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Elements & Modalities Panels */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Elements Panel */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg space-y-2">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase border-b border-amber-500/10 pb-1">
              {UI.elementsTitle}
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  {UI.fire}
                </span>
                <span className="font-mono text-slate-200 text-[11px]">{distribution.elements?.fire ?? 25}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Leaf className="w-3.5 h-3.5 shrink-0" />
                  {UI.earth}
                </span>
                <span className="font-mono text-slate-200 text-[11px]">{distribution.elements?.earth ?? 31}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                  <Wind className="w-3.5 h-3.5 shrink-0" />
                  {UI.air}
                </span>
                <span className="font-mono text-slate-200 text-[11px]">{distribution.elements?.air ?? 25}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Droplets className="w-3.5 h-3.5 shrink-0" />
                  {UI.water}
                </span>
                <span className="font-mono text-slate-200 text-[11px]">{distribution.elements?.water ?? 19}%</span>
              </div>
            </div>
          </div>

          {/* Modalities Panel */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg space-y-2">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase border-b border-amber-500/10 pb-1">
              {UI.modalitiesTitle}
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{UI.cardinal}</span>
                <span className="font-mono text-amber-300 text-[11px]">{distribution.qualities?.cardinal ?? 33}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{UI.fixed}</span>
                <span className="font-mono text-amber-300 text-[11px]">{distribution.qualities?.fixed ?? 33}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{UI.mutable}</span>
                <span className="font-mono text-amber-300 text-[11px]">{distribution.qualities?.mutable ?? 34}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTER: The High-Definition Astrological Mandala Wheel
          ======================================================== */}
      <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[720px] aspect-square">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full select-none"
          >
            <defs>
              {/* Glow Filter for Gold Metallic Elements */}
              <filter id="natal-gold-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Glow Filter for Ciano/Emerald Aspect Lines */}
              <filter id="natal-cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Radial Center Gradient */}
              <radialGradient id="natal-mandala-center" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0F172A" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#060A15" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#040814" stopOpacity="1" />
              </radialGradient>
            </defs>

            {/* 1. Base Concentric Geometry Rings */}
            <circle cx={center} cy={center} r={outerBorderRadius} fill="none" stroke="#D97706" strokeWidth="2.5" opacity="0.8" />
            <circle cx={center} cy={center} r={zodiacOuterRadius} fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
            <circle cx={center} cy={center} r={zodiacInnerRadius} fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.3" />
            <circle cx={center} cy={center} r={housesOuterRadius} fill="url(#natal-mandala-center)" stroke="#F59E0B" strokeWidth="1.2" opacity="0.5" />
            <circle cx={center} cy={center} r={housesInnerRadius} fill="#040814" stroke="#38BDF8" strokeWidth="1" opacity="0.4" />
            <circle cx={center} cy={center} r={aspectsCenterRadius} fill="#03060F" stroke="#F59E0B" strokeWidth="0.8" opacity="0.3" />

            {/* 2. 12 Zodiac Segments (30° Each) with 0° Tick Markers and Sign Names */}
            {ZODIAC_DEFINITIONS.map((sign, idx) => {
              const startDeg = idx * 30;
              const midDeg = startDeg + 15;
              const [x1, y1] = getCoordinates(startDeg, outerBorderRadius);
              const [x2, y2] = getCoordinates(startDeg, zodiacInnerRadius);
              const [labelX, labelY] = getCoordinates(midDeg, 400);
              const [glyphX, glyphY] = getCoordinates(midDeg, 365);
              const [tickX, tickY] = getCoordinates(startDeg, outerBorderRadius + 18);

              const signDisplayName = translateSign(sign.namePt);

              return (
                <g key={sign.id} className="cursor-pointer group">
                  {/* Segment Boundary Line */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D97706" strokeWidth="1.2" opacity="0.4" />
                  
                  {/* 0° Tick Indicator Label */}
                  <text
                    x={tickX}
                    y={tickY}
                    fill="#FDE68A"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    opacity="0.8"
                  >
                    0°
                  </text>

                  {/* Zodiac Sign Name (Curved / Aligned along rim) */}
                  <text
                    x={labelX}
                    y={labelY}
                    fill={sign.color}
                    fontSize="13"
                    fontFamily="serif"
                    fontWeight="bold"
                    letterSpacing="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="transition-all duration-300 group-hover:scale-110"
                    onMouseEnter={() => setHoveredEntity({
                      type: 'sign',
                      title: signDisplayName,
                      detail: `${sign.element.toUpperCase()} • 30° Segment`,
                      extra: sign.symbol
                    })}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {signDisplayName}
                  </text>

                  {/* Zodiac Sign Glyph Icon */}
                  <text
                    x={glyphX}
                    y={glyphY}
                    fill={sign.color}
                    fontSize="22"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                  >
                    {sign.symbol}
                  </text>
                </g>
              );
            })}

            {/* 3. 12 Astrological Houses Radial Dividers & Numbering */}
            {Array.from({ length: 12 }).map((_, i) => {
              const houseNum = i + 1;
              const angleDeg = i * 30;
              const [hx1, hy1] = getCoordinates(angleDeg, housesOuterRadius);
              const [hx2, hy2] = getCoordinates(angleDeg, housesInnerRadius);
              const [labelX, labelY] = getCoordinates(angleDeg + 15, (housesOuterRadius + housesInnerRadius) / 2);

              return (
                <g key={`house-${houseNum}`}>
                  <line x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#94A3B8" strokeWidth="0.8" opacity="0.35" />
                  <text
                    x={labelX}
                    y={labelY}
                    fill="#CBD5E1"
                    fontSize="16"
                    fontFamily="sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="cursor-pointer hover:fill-amber-300 transition-colors"
                    onMouseEnter={() => {
                      const hInfo = mappedHouses[i];
                      setHoveredEntity({
                        type: 'house',
                        title: `${UI.house} ${houseNum}`,
                        detail: `${hInfo?.degree || "15°"} ${translateSign(hInfo?.sign || "Áries")}`
                      });
                    }}
                    onMouseLeave={() => setHoveredEntity(null)}
                  >
                    {houseNum}
                  </text>
                </g>
              );
            })}

            {/* 4. Aspect Lines (Geometric Sacred Web in Center) */}
            <g id="mandala-aspect-lines" opacity="0.85">
              {computedAspects.map((asp, index) => {
                return (
                  <g key={`aspect-${index}`} className="group cursor-pointer">
                    <line
                      x1={asp.p1.aspectNodeX}
                      y1={asp.p1.aspectNodeY}
                      x2={asp.p2.aspectNodeX}
                      y2={asp.p2.aspectNodeY}
                      stroke={asp.color}
                      strokeWidth={asp.type === "trine" ? "1.6" : "1.2"}
                      strokeDasharray={asp.dash || "none"}
                      filter={asp.type === "trine" ? "url(#natal-cyan-glow)" : undefined}
                      opacity={0.8}
                      className="transition-all duration-300 group-hover:opacity-100 group-hover:stroke-width-2"
                      onMouseEnter={() => setHoveredEntity({
                        type: 'aspect',
                        title: `${translatePlanet(asp.p1.name)} ${asp.symbol} ${translatePlanet(asp.p2.name)}`,
                        detail: `${asp.type.toUpperCase()} • ${asp.p1.degree} ↔ ${asp.p2.degree}`
                      })}
                      onMouseLeave={() => setHoveredEntity(null)}
                    />
                    {/* Node points on the inner rim */}
                    <circle
                      cx={asp.p1.aspectNodeX}
                      cy={asp.p1.aspectNodeY}
                      r="3.5"
                      fill={asp.color}
                      className="opacity-80"
                    />
                    <circle
                      cx={asp.p2.aspectNodeX}
                      cy={asp.p2.aspectNodeY}
                      r="3.5"
                      fill={asp.color}
                      className="opacity-80"
                    />
                  </g>
                );
              })}
            </g>

            {/* 5. Placed Planets Glyphs, Degrees & Names in the Track Ring */}
            {mappedPlanets.map((planet, idx) => {
              const displayName = translatePlanet(planet.name);
              return (
                <g 
                  key={`planet-${planet.name}-${idx}`} 
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredEntity({
                    type: 'planet',
                    title: `${displayName} (${planet.symbol})`,
                    detail: `${planet.degree} ${UI.inSign} ${translateSign(planet.sign)}`,
                    extra: planet.description || undefined
                  })}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {/* Planet Glyph Circle Badge */}
                  <circle
                    cx={planet.x}
                    cy={planet.y}
                    r="15"
                    fill="#040814"
                    stroke={planet.color}
                    strokeWidth="1.8"
                    className="transition-all duration-300 group-hover:scale-125 shadow-lg"
                    style={{ transformOrigin: `${planet.x}px ${planet.y}px` }}
                  />
                  <text
                    x={planet.x}
                    y={planet.y + 1}
                    fill={planet.color}
                    fontSize="15"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none"
                  >
                    {planet.symbol}
                  </text>

                  {/* Planet Name Label */}
                  <text
                    x={planet.x}
                    y={planet.y + 22}
                    fill="#E2E8F0"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none"
                  >
                    {displayName}
                  </text>

                  {/* Degree & Minute text */}
                  <text
                    x={planet.x}
                    y={planet.y + 33}
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none"
                  >
                    {planet.degree || "15°00'"}
                  </text>

                  {/* Small Sign Icon beneath degree */}
                  <text
                    x={planet.x}
                    y={planet.y + 44}
                    fill={planet.signColor}
                    fontSize="11"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none font-bold"
                  >
                    {planet.signSymbol}
                  </text>
                </g>
              );
            })}

            {/* 6. Four Cardinal Cross Axes with Gold Arrows & Degrees */}
            {/* Top: MEIO DO CÉU (MC) */}
            <g id="axis-mc" filter="url(#natal-gold-glow)">
              <line x1={center} y1={50} x2={center} y2={housesInnerRadius} stroke="#F59E0B" strokeWidth="2.5" />
              <polygon points={`${center},35 ${center - 8},55 ${center + 8},55`} fill="#F59E0B" />
              <text x={center} y={20} fill="#FDE68A" fontSize="13" fontFamily="serif" fontWeight="bold" letterSpacing="1" textAnchor="middle">
                {UI.mcTitle}
              </text>
              <text x={center} y={34} fill="#F59E0B" fontSize="11" fontFamily="monospace" textAnchor="middle">
                {rawAstros.find(a => a.name === "Meio do Céu")?.degree || "18°23'"}
              </text>
            </g>

            {/* Bottom: FUNDO DO CÉU (FC / IC) */}
            <g id="axis-fc">
              <line x1={center} y1={950} x2={center} y2={size - housesInnerRadius} stroke="#F59E0B" strokeWidth="2.5" />
              <polygon points={`${center},965 ${center - 8},945 ${center + 8},945`} fill="#F59E0B" />
              <text x={center} y={980} fill="#FDE68A" fontSize="13" fontFamily="serif" fontWeight="bold" letterSpacing="1" textAnchor="middle">
                {UI.fcTitle}
              </text>
              <text x={center} y={995} fill="#F59E0B" fontSize="11" fontFamily="monospace" textAnchor="middle">
                {rawAstros.find(a => a.name === "Meio do Céu")?.degree || "18°23'"}
              </text>
            </g>

            {/* Left: ASCENDENTE (AC) */}
            <g id="axis-ac" filter="url(#natal-gold-glow)">
              <line x1={50} y1={center} x2={housesInnerRadius} y2={center} stroke="#F59E0B" strokeWidth="2.5" />
              <polygon points={`35,${center} 55,${center - 8} 55,${center + 8}`} fill="#F59E0B" />
              <text x={20} y={center - 8} fill="#FDE68A" fontSize="13" fontFamily="serif" fontWeight="bold" letterSpacing="1" textAnchor="end">
                {UI.acTitle}
              </text>
              <text x={20} y={center + 10} fill="#F59E0B" fontSize="11" fontFamily="monospace" textAnchor="end">
                {rawAstros.find(a => a.name === "Ascendente")?.degree || "12°45'"}
              </text>
            </g>

            {/* Right: DESCENDENTE (DC) */}
            <g id="axis-dc">
              <line x1={950} y1={center} x2={size - housesInnerRadius} y2={center} stroke="#F59E0B" strokeWidth="2.5" />
              <polygon points={`965,${center} 945,${center - 8} 945,${center + 8}`} fill="#F59E0B" />
              <text x={980} y={center - 8} fill="#FDE68A" fontSize="13" fontFamily="serif" fontWeight="bold" letterSpacing="1" textAnchor="start">
                {UI.dcTitle}
              </text>
              <text x={980} y={center + 10} fill="#F59E0B" fontSize="11" fontFamily="monospace" textAnchor="start">
                {rawAstros.find(a => a.name === "Ascendente")?.degree || "12°45'"}
              </text>
            </g>

            {/* Central Focal Gold Star Dot */}
            <circle cx={center} cy={center} r="6" fill="#F59E0B" filter="url(#natal-gold-glow)" />
            <circle cx={center} cy={center} r="2.5" fill="#FFFBEB" />
          </svg>

          {/* Interactive Tooltip Card on Hover */}
          {hoveredEntity && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 p-3.5 rounded-2xl bg-slate-950/90 border border-amber-400/80 backdrop-blur-xl shadow-2xl text-center pointer-events-none max-w-xs animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-serif font-bold text-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hoveredEntity.title}</span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">{hoveredEntity.detail}</p>
              {hoveredEntity.extra && (
                <p className="text-[10px] text-slate-400 mt-1.5 italic border-t border-slate-800 pt-1">
                  {hoveredEntity.extra}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          BOTTOM: Major Aspects Legend, Houses List & Brand Footer
          ======================================================== */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-4 border-t border-amber-500/15">
        {/* Bottom Left: Major Aspects Card & Brand Logo */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg space-y-2">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase border-b border-amber-500/10 pb-1">
              {UI.mainAspectsTitle}
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-sky-400">
                <span className="font-mono text-sm tracking-tighter">—△—</span>
                <span className="text-slate-300">{UI.trine}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="font-mono text-sm tracking-tighter">—✳—</span>
                <span className="text-slate-300">{UI.sextile}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400">
                <span className="font-mono text-xs tracking-widest">- - - -</span>
                <span className="text-slate-300">{UI.square}</span>
              </div>
              <div className="flex items-center gap-2 text-rose-500">
                <span className="font-mono text-sm tracking-tighter">—○—</span>
                <span className="text-slate-300">{UI.opposition}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <span className="font-mono text-sm">☌</span>
                <span className="text-slate-300">{UI.conjunction}</span>
              </div>
            </div>
          </div>

          {/* Portal Brand Sign-off */}
          <div className="flex items-center gap-2.5 pt-1">
            <div className="w-8 h-8 rounded-full border border-amber-500/50 flex items-center justify-center bg-amber-500/10 text-amber-400 shrink-0">
              <CircleDot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-serif font-bold tracking-widest text-amber-400 uppercase">
                {UI.portalBrand}
              </h4>
              <p className="text-[9px] font-mono text-slate-400 tracking-wider">
                {UI.portalSub}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Center: Sacred Slogan Banner */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-2">
          <div className="flex items-center gap-2 text-amber-400/80 text-[11px] font-serif tracking-widest uppercase">
            <span>✦</span>
            <span>{UI.slogan}</span>
            <span>✦</span>
          </div>
          <div className="w-32 h-px bg-linear-to-r from-transparent via-amber-500/40 to-transparent mt-1.5" />
        </div>

        {/* Bottom Right: House Positions Table (1 to 12) */}
        <div className="md:col-span-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-md shadow-lg space-y-2">
            <h3 className="text-[10px] font-mono font-bold tracking-widest text-amber-400/90 uppercase border-b border-amber-500/10 pb-1">
              {UI.housePositionsTitle}
            </h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
              {mappedHouses.map((h) => (
                <div key={`house-pos-${h.number}`} className="flex items-center justify-between text-slate-300">
                  <span className="text-amber-400/90 font-bold">{h.number}</span>
                  <span className="text-slate-400">{h.degree}</span>
                  <span className="text-slate-200 truncate">{translateSign(h.sign)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

