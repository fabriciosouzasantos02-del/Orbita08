import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Orbit, Compass, Eye } from 'lucide-react';

interface PortalMandalaHeroProps {
  className?: string;
}

// 12 Zodiac signs configuration
const ZODIAC_SYMBOLS = [
  { id: "aries", namePt: "Áries", nameEn: "Aries", nameEs: "Aries", nameDe: "Widder", nameFr: "Bélier", symbol: "♈", element: "fire", color: "#F43F5E" },
  { id: "taurus", namePt: "Touro", nameEn: "Taurus", nameEs: "Tauro", nameDe: "Stier", nameFr: "Taureau", symbol: "♉", element: "earth", color: "#10B981" },
  { id: "gemini", namePt: "Gêmeos", nameEn: "Gemini", nameEs: "Géminis", nameDe: "Zwillinge", nameFr: "Gémeaux", symbol: "♊", element: "air", color: "#FBBF24" },
  { id: "cancer", namePt: "Câncer", nameEn: "Cancer", nameEs: "Cáncer", nameDe: "Krebs", nameFr: "Cancer", symbol: "♋", element: "water", color: "#38BDF8" },
  { id: "leo", namePt: "Leão", nameEn: "Leo", nameEs: "Leo", nameDe: "Löwe", nameFr: "Lion", symbol: "♌", element: "fire", color: "#FB923C" },
  { id: "virgo", namePt: "Virgem", nameEn: "Virgo", nameEs: "Virgo", nameDe: "Jungfrau", nameFr: "Vierge", symbol: "♍", element: "earth", color: "#34D399" },
  { id: "libra", namePt: "Libra", nameEn: "Libra", nameEs: "Libra", nameDe: "Waage", nameFr: "Balance", symbol: "♎", element: "air", color: "#2DD4BF" },
  { id: "scorpio", namePt: "Escorpião", nameEn: "Scorpio", nameEs: "Escorpio", nameDe: "Skorpion", nameFr: "Scorpion", symbol: "♏", element: "water", color: "#A855F7" },
  { id: "sagittarius", namePt: "Sagitário", nameEn: "Sagittarius", nameEs: "Sagitario", nameDe: "Schütze", nameFr: "Sagittaire", symbol: "♐", element: "fire", color: "#F43F5E" },
  { id: "capricorn", namePt: "Capricórnio", nameEn: "Capricorn", nameEs: "Capricornio", nameDe: "Steinbock", nameFr: "Capricorne", symbol: "♑", element: "earth", color: "#FACC15" },
  { id: "aquarius", namePt: "Aquário", nameEn: "Aquarius", nameEs: "Acuario", nameDe: "Wassermann", nameFr: "Verseau", symbol: "♒", element: "air", color: "#06B6D4" },
  { id: "pisces", namePt: "Peixes", nameEn: "Pisces", nameEs: "Piscis", nameDe: "Fische", nameFr: "Poissons", symbol: "♓", element: "water", color: "#818CF8" },
];

const PLANET_POINTS = [
  { namePt: "Sol", nameEn: "Sun", nameEs: "Sol", nameDe: "Sonne", nameFr: "Soleil", symbol: "☉", angle: 75, color: "#FACC15", ringColor: "#EAB308", deg: "24°16'" },
  { namePt: "Lua", nameEn: "Moon", nameEs: "Luna", nameDe: "Mond", nameFr: "Lune", symbol: "☽", angle: 102, color: "#38BDF8", ringColor: "#0284C7", deg: "2°34'" },
  { namePt: "Mercúrio", nameEn: "Mercury", nameEs: "Mercurio", nameDe: "Merkur", nameFr: "Mercure", symbol: "☿", angle: 42, color: "#4ADE80", ringColor: "#16A34A", deg: "5°27'" },
  { namePt: "Vênus", nameEn: "Venus", nameEs: "Venus", nameDe: "Venus", nameFr: "Vénus", symbol: "♀", angle: 195, color: "#2DD4BF", ringColor: "#0D9488", deg: "24°51'" },
  { namePt: "Marte", nameEn: "Mars", nameEs: "Marte", nameDe: "Mars", nameFr: "Mars", symbol: "♂", angle: 18, color: "#F43F5E", ringColor: "#E11D48", deg: "18°03'" },
  { namePt: "Júpiter", nameEn: "Jupiter", nameEs: "Júpiter", nameDe: "Jupiter", nameFr: "Jupiter", symbol: "♃", angle: 251, color: "#FB923C", ringColor: "#EA580C", deg: "11°07'" },
  { namePt: "Saturno", nameEn: "Saturn", nameEs: "Saturno", nameDe: "Saturn", nameFr: "Saturne", symbol: "♄", angle: 282, color: "#FDE047", ringColor: "#CA8A04", deg: "21°18'" },
  { namePt: "Urano", nameEn: "Uranus", nameEs: "Urano", nameDe: "Uranus", nameFr: "Uranus", symbol: "♅", angle: 344, color: "#38BDF8", ringColor: "#0284C7", deg: "14°20'" },
  { namePt: "Netuno", nameEn: "Neptune", nameEs: "Neptuno", nameDe: "Neptun", nameFr: "Neptune", symbol: "♆", angle: 310, color: "#2DD4BF", ringColor: "#0F766E", deg: "9°41'" },
  { namePt: "Plutão", nameEn: "Pluto", nameEs: "Plutón", nameDe: "Pluto", nameFr: "Pluton", symbol: "♇", angle: 228, color: "#C084FC", ringColor: "#9333EA", deg: "17°32'" },
];

export const PortalMandalaHero: React.FC<PortalMandalaHeroProps> = ({ className = "" }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'pt').toLowerCase().slice(0, 2);
  const [hoveredNode, setHoveredNode] = useState<{ title: string; subtitle: string; color: string } | null>(null);

  const size = 1000;
  const center = 500;
  const outerBorderRadius = 450;
  const zodiacOuterRadius = 430;
  const zodiacInnerRadius = 350;
  const planetsTrackRadius = 305;
  const housesOuterRadius = 255;
  const housesInnerRadius = 175;
  const aspectsCenterRadius = 170;

  const getCoordinates = (angleDeg: number, radius: number): [number, number] => {
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    const x = center + radius * Math.cos(rad);
    const y = center + radius * Math.sin(rad);
    return [x, y];
  };

  const getSignName = (sign: typeof ZODIAC_SYMBOLS[0]) => {
    switch (currentLang) {
      case 'en': return sign.nameEn;
      case 'es': return sign.nameEs;
      case 'de': return sign.nameDe;
      case 'fr': return sign.nameFr;
      default: return sign.namePt;
    }
  };

  const getPlanetName = (planet: typeof PLANET_POINTS[0]) => {
    switch (currentLang) {
      case 'en': return planet.nameEn;
      case 'es': return planet.nameEs;
      case 'de': return planet.nameDe;
      case 'fr': return planet.nameFr;
      default: return planet.namePt;
    }
  };

  // Geometric Aspect Lines between planets
  const aspectConnections = [
    { p1: PLANET_POINTS[0], p2: PLANET_POINTS[5], type: "trine", color: "#38BDF8", width: 1.8 }, // Sun - Jupiter (Trine 120°)
    { p1: PLANET_POINTS[1], p2: PLANET_POINTS[8], type: "trine", color: "#38BDF8", width: 1.8 }, // Moon - Neptune (Trine 120°)
    { p1: PLANET_POINTS[3], p2: PLANET_POINTS[6], type: "square", color: "#F43F5E", width: 1.4, dash: "4 4" }, // Venus - Saturn (Square 90°)
    { p1: PLANET_POINTS[4], p2: PLANET_POINTS[9], type: "opposition", color: "#E11D48", width: 1.6, dash: "6 4" }, // Mars - Pluto (Opposition 180°)
    { p1: PLANET_POINTS[2], p2: PLANET_POINTS[1], type: "sextile", color: "#10B981", width: 1.4, dash: "5 4" }, // Mercury - Moon (Sextile 60°)
    { p1: PLANET_POINTS[0], p2: PLANET_POINTS[4], type: "sextile", color: "#10B981", width: 1.4, dash: "5 4" }, // Sun - Mars (Sextile 60°)
  ];

  return (
    <div className={`w-full max-w-[460px] aspect-square rounded-3xl bg-[#040814] border border-amber-500/30 shadow-[0_0_50px_rgba(4,8,20,0.9)] relative overflow-hidden p-3 sm:p-4 group select-none transition-all duration-300 ${className}`}>
      {/* Background Cosmic Starfield Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0C1838_0%,#040814_100%)] pointer-events-none opacity-95" />
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:20px_20px] opacity-15 pointer-events-none" />

      {/* SVG HD Astrological Mandala Wheel */}
      <svg
        className="w-full h-full relative z-10 filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous Glow Filters */}
          <filter id="portal-mandala-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="portal-mandala-cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial Center Cosmic Gradient */}
          <radialGradient id="portal-mandala-center-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#060A15" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#040814" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* 1. Base Concentric Geometry Rings */}
        <circle cx={center} cy={center} r={outerBorderRadius} fill="none" stroke="#D97706" strokeWidth="2.5" opacity="0.85" />
        <circle cx={center} cy={center} r={zodiacOuterRadius} fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.65" />
        <circle cx={center} cy={center} r={zodiacInnerRadius} fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.35" />
        <circle cx={center} cy={center} r={housesOuterRadius} fill="url(#portal-mandala-center-grad)" stroke="#F59E0B" strokeWidth="1.2" opacity="0.55" />
        <circle cx={center} cy={center} r={housesInnerRadius} fill="#040814" stroke="#38BDF8" strokeWidth="1" opacity="0.45" />
        <circle cx={center} cy={center} r={aspectsCenterRadius} fill="#03060F" stroke="#F59E0B" strokeWidth="0.8" opacity="0.3" />

        {/* 2. 12 Zodiac Segments (30° each) */}
        {ZODIAC_SYMBOLS.map((sign, idx) => {
          const startDeg = idx * 30;
          const midDeg = startDeg + 15;
          const [x1, y1] = getCoordinates(startDeg, outerBorderRadius);
          const [x2, y2] = getCoordinates(startDeg, zodiacInnerRadius);
          const [labelX, labelY] = getCoordinates(midDeg, 395);
          const [glyphX, glyphY] = getCoordinates(midDeg, 360);
          const [tickX, tickY] = getCoordinates(startDeg, outerBorderRadius + 18);
          const signDisplayName = getSignName(sign);

          return (
            <g
              key={sign.id}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredNode({
                title: signDisplayName,
                subtitle: `${sign.element.toUpperCase()} • 30° ${t("Segmento", "Segment")}`,
                color: sign.color
              })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Segment Boundary Line */}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D97706" strokeWidth="1.2" opacity="0.45" />

              {/* 0° Degree Tick Marker */}
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

              {/* Zodiac Name */}
              <text
                x={labelX}
                y={labelY}
                fill={sign.color}
                fontSize="12.5"
                fontFamily="serif"
                fontWeight="bold"
                letterSpacing="1"
                textAnchor="middle"
                dominantBaseline="middle"
                className="transition-transform duration-300"
              >
                {signDisplayName}
              </text>

              {/* Zodiac Glyph */}
              <text
                x={glyphX}
                y={glyphY}
                fill={sign.color}
                fontSize="22"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]"
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
            <g
              key={`portal-house-${houseNum}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode({
                title: `${t("Casa", "House")} ${houseNum}`,
                subtitle: t("Placidus Cúspide", "Placidus Cusp"),
                color: "#E2E8F0"
              })}
              onMouseLeave={() => setHoveredNode(null)}
            >
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
                className="hover:fill-amber-300 transition-colors"
              >
                {houseNum}
              </text>
            </g>
          );
        })}

        {/* 4. Aspect Lines (Geometric Sacred Web in Center) */}
        <g id="portal-aspect-lines" opacity="0.88">
          {aspectConnections.map((asp, index) => {
            const [x1, y1] = getCoordinates(asp.p1.angle, aspectsCenterRadius);
            const [x2, y2] = getCoordinates(asp.p2.angle, aspectsCenterRadius);

            return (
              <line
                key={`portal-aspect-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={asp.color}
                strokeWidth={asp.width}
                strokeDasharray={asp.dash || "none"}
                filter={asp.type === "trine" ? "url(#portal-mandala-cyan-glow)" : undefined}
                opacity={0.8}
              />
            );
          })}
        </g>

        {/* 5. Cardinal Principal Axes (AC, MC, DC, IC) */}
        {/* Horizontal Axis: Ascendant (Left 180° / 0°) to Descendant (Right 0° / 180°) */}
        <line
          x1={center - outerBorderRadius}
          y1={center}
          x2={center + outerBorderRadius}
          y2={center}
          stroke="#EAB308"
          strokeWidth="1.8"
          opacity="0.85"
          filter="url(#portal-mandala-gold-glow)"
        />

        {/* Vertical Axis: MC (Top 270° / 90°) to IC (Bottom 90° / 270°) */}
        <line
          x1={center}
          y1={center - outerBorderRadius}
          x2={center}
          y2={center + outerBorderRadius}
          stroke="#EAB308"
          strokeWidth="1.8"
          opacity="0.85"
          filter="url(#portal-mandala-gold-glow)"
        />

        {/* Cardinal Axis Markers */}
        {/* AC - Ascendant */}
        <g className="cursor-pointer">
          <circle cx={center - outerBorderRadius + 18} cy={center} r="14" fill="#040814" stroke="#EAB308" strokeWidth="1.8" />
          <text x={center - outerBorderRadius + 18} y={center + 0.5} fill="#FDE047" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
            AC
          </text>
        </g>

        {/* DC - Descendant */}
        <g className="cursor-pointer">
          <circle cx={center + outerBorderRadius - 18} cy={center} r="14" fill="#040814" stroke="#EAB308" strokeWidth="1.8" />
          <text x={center + outerBorderRadius - 18} y={center + 0.5} fill="#FDE047" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
            DC
          </text>
        </g>

        {/* MC - Midheaven */}
        <g className="cursor-pointer">
          <circle cx={center} cy={center - outerBorderRadius + 18} r="14" fill="#040814" stroke="#EAB308" strokeWidth="1.8" />
          <text x={center} y={center - outerBorderRadius + 18.5} fill="#FDE047" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
            MC
          </text>
        </g>

        {/* IC - Imum Coeli / Fundo do Céu */}
        <g className="cursor-pointer">
          <circle cx={center} cy={center + outerBorderRadius - 18} r="14" fill="#040814" stroke="#EAB308" strokeWidth="1.8" />
          <text x={center} y={center + outerBorderRadius - 17.5} fill="#FDE047" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
            IC
          </text>
        </g>

        {/* 6. Active Planets Orbiting on the Track */}
        {PLANET_POINTS.map((planet) => {
          const [px, py] = getCoordinates(planet.angle, planetsTrackRadius);
          const [aspectX, aspectY] = getCoordinates(planet.angle, aspectsCenterRadius);
          const planetName = getPlanetName(planet);

          return (
            <g
              key={planet.namePt}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredNode({
                title: `${planetName} (${planet.symbol})`,
                subtitle: `${planet.deg} • ${t("Grau Exato", "Exact Degree")}`,
                color: planet.color
              })}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Radial Projection Tick Line */}
              <line
                x1={px}
                y1={py}
                x2={aspectX}
                y2={aspectY}
                stroke={planet.color}
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.6"
              />

              {/* Planet Glowing Node Circle */}
              <circle
                cx={px}
                cy={py}
                r="15"
                fill="#040814"
                stroke={planet.ringColor}
                strokeWidth="1.8"
                filter="url(#portal-mandala-gold-glow)"
              />

              {/* Planet Glyphs */}
              <text
                x={px}
                y={py + 0.5}
                fill={planet.color}
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {/* 7. Central Earth Pivot Core */}
        <circle cx={center} cy={center} r="16" fill="#040814" stroke="#F59E0B" strokeWidth="2" filter="url(#portal-mandala-gold-glow)" />
        <circle cx={center} cy={center} r="6" fill="#38BDF8" className="animate-pulse" />
      </svg>

      {/* Interactive Tooltip HUD Overlay */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 right-4 z-30 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md flex items-center justify-between text-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
            <span className="font-bold text-slate-100">{hoveredNode.title}</span>
          </div>
          <span className="font-mono text-[11px] text-amber-300 font-semibold">{hoveredNode.subtitle}</span>
        </div>
      )}

      {/* Information Readout Bottom Bar */}
      <div className="absolute bottom-2.5 left-4 right-4 z-20 flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-slate-400 border-t border-slate-900/60 pt-1.5 pointer-events-none">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-amber-400" />
          {t("PLACIDUS HD v2.4")}
        </span>
        <span className="text-amber-400 font-bold tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          {t("ALGORITMO GEOCÊNTRICO ATIVO")}
        </span>
      </div>
    </div>
  );
};

export default PortalMandalaHero;
