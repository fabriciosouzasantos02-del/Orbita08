import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Moon, 
  Eye, 
  BookOpen, 
  Heart, 
  DollarSign, 
  Orbit, 
  AlertCircle, 
  Award, 
  ShieldCheck, 
  Search 
} from 'lucide-react';
import { OracleDreamEntry } from '../types';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import { normalizeDreamsList, normalizeOracleDreamEntry } from '../utils/dreamsNormalizer';

interface OraculoDosSonhosCardProps {
  newDreamDesc: string;
  setNewDreamDesc: (val: string) => void;
  isInterpretingDream: boolean;
  handleRecordAndInterpretDream: (e: React.FormEvent) => Promise<void>;
  dreamsHistory: OracleDreamEntry[];
  selectedDreamDisplay: OracleDreamEntry | null;
  setSelectedDreamDisplay: (val: OracleDreamEntry | null) => void;
  preferredLanguage?: string;
}

interface OracleUI {
  oracleTitle: string;
  oracleSubtitle: string;
  tellDream: string;
  describeHint: string;
  revealBtn: string;
  decipheringBtn: string;
  dreamVault: string;
  downloadDream: string;
  searchPlaceholder: string;
  meaningPrefix: string;
  noArchived: string;
  archivedOn: string;
  atTime: string;
  scribeReport: string;
  downloadPDF: string;
  primaryMeaning: string;
  energyIndex: string;
  tuned: string;
  oracleAdvice: string;
  loveArea: string;
  financeArea: string;
  careerArea: string;
  attentionLabel: string;
  opportunitiesLabel: string;
  protectionLabel: string;
  luckyNumbers: string;
  energyColors: string;
  highlights: string;
  predominantEmotion: string;
  numberSymbols: string;
  numberPrefix: string;
  animalArchetypes: string;
  colorSymbolism: string;
  universeMessage: string;
  waitingDream: string;
  waitingDesc: string;
  downloadModal: string;
  downloadModalDesc: string;
  noArchivedDownload: string;
  close: string;
  dreamsCount: (n: number) => string;
  loadingTitle: string;
  loadingDesc: string;
  placeholderText: string;
}

// UI string dictionary for OraculoDosSonhosCard
const ORACLE_UI: Record<string, OracleUI> = {
  pt: {
    oracleTitle: "🔮 Oráculo dos Sonhos",
    oracleSubtitle: "Sintonize os segredos do seu subconsciente com a IA.",
    tellDream: "Conte seu sonho em detalhes",
    describeHint: "Descreva tudo o que aconteceu no sonho. Pessoas, animais, lugares, emoções, objetos, cores, números e acontecimentos importantes.",
    revealBtn: "Revelar Significado",
    decipheringBtn: "Decifrando Dimensão Astral...",
    dreamVault: "📁 Cofre de Sonhos",
    downloadDream: "📥 Baixar Sonho",
    searchPlaceholder: "Pesquisar sonhos...",
    meaningPrefix: "🔍 Significado:",
    noArchived: "Nenhum sonho arquivado encontrado.",
    archivedOn: "Cofre de Sonhos · Arquivado em",
    atTime: "às",
    scribeReport: "Relato do Scribe:",
    downloadPDF: "📥 Baixar PDF",
    primaryMeaning: "🔍 Significado Primário do Sonho",
    energyIndex: "⚡ Índice de Energia",
    tuned: "Sintonizado Celestial",
    oracleAdvice: "Conselho do Oráculo",
    loveArea: "Área Amorosa",
    financeArea: "Área Financeira",
    careerArea: "Área Profissional",
    attentionLabel: "⚠️ Onde Você Deve Se Atentar",
    opportunitiesLabel: "🍀 Oportunidades Próximas",
    protectionLabel: "🛡️ Proteção e Livramento",
    luckyNumbers: "🔢 Números da Sorte Recomendados",
    energyColors: "🎨 Cores de Energia Sintonizadas",
    highlights: "🔥 Elementos em Destaque Interpretados",
    predominantEmotion: "🎭 Emoção Predominante:",
    numberSymbols: "🔢 Símbolos de Números Revelados",
    numberPrefix: "Número",
    animalArchetypes: "🦁 Arquétipos de Animais no Sonho",
    colorSymbolism: "🎨 Simbolismo Estrito das Cores",
    universeMessage: "🌌 Mensagem do Universo",
    waitingDream: "Aguardando seu Sonho",
    waitingDesc: "Digite os acontecimentos do seu sonho no campo ao lado e clique em Revelar Significado para consultar o Oráculo Celestial.",
    downloadModal: "📥 BAIXAR REGISTRO DE SONHO",
    downloadModalDesc: "Selecione um sonho do seu cofre para baixar a interpretação em PDF localmente no seu dispositivo.",
    noArchivedDownload: "Nenhum sonho arquivado para download.",
    close: "Fechar",
    dreamsCount: (n: number) => `📁 Cofre de Sonhos (${n})`,
    loadingTitle: "Consultando o Reino de Netuno...",
    loadingDesc: "Orbia está interpretando as mensagens cifradas enviadas do seu inconsciente, conectando aos arquétipos do seu Mapa Astral. Aguarde um instante...",
    placeholderText: "Exemplo: Sonhei que estava correndo em uma floresta escura e encontrei uma cobra dourada perto de um rio fiquei com medo vim um homem que me socorrer eu caí em uma rio fundo a cor da água era Rosa eu começava a andar sobre as águas...",
  },
  en: {
    oracleTitle: "🔮 Dream Oracle",
    oracleSubtitle: "Tune into your subconscious secrets with AI.",
    tellDream: "Tell your dream in detail",
    describeHint: "Describe everything that happened in the dream: people, animals, places, emotions, objects, colors, numbers and important events.",
    revealBtn: "Reveal Meaning",
    decipheringBtn: "Deciphering Astral Dimension...",
    dreamVault: "📁 Dream Vault",
    downloadDream: "📥 Download Dream",
    searchPlaceholder: "Search dreams...",
    meaningPrefix: "🔍 Meaning:",
    noArchived: "No archived dreams found.",
    archivedOn: "Dream Vault · Archived on",
    atTime: "at",
    scribeReport: "Scribe Report:",
    downloadPDF: "📥 Download PDF",
    primaryMeaning: "🔍 Primary Dream Meaning",
    energyIndex: "⚡ Energy Index",
    tuned: "Celestially Tuned",
    oracleAdvice: "Oracle Advice",
    loveArea: "Love Area",
    financeArea: "Finance Area",
    careerArea: "Career Area",
    attentionLabel: "⚠️ Where You Should Pay Attention",
    opportunitiesLabel: "🍀 Upcoming Opportunities",
    protectionLabel: "🛡️ Protection & Sanctuary",
    luckyNumbers: "🔢 Recommended Lucky Numbers",
    energyColors: "🎨 Tuned Energy Colors",
    highlights: "🔥 Highlighted Interpreted Elements",
    predominantEmotion: "🎭 Predominant Emotion:",
    numberSymbols: "🔢 Revealed Number Symbols",
    numberPrefix: "Number",
    animalArchetypes: "🦁 Animal Archetypes in the Dream",
    colorSymbolism: "🎨 Cosmic Color Symbolism",
    universeMessage: "🌌 Universe Message",
    waitingDream: "Awaiting Your Dream",
    waitingDesc: "Type the events of your dream in the field beside and click Reveal Meaning to consult the Celestial Oracle.",
    downloadModal: "📥 DOWNLOAD DREAM RECORD",
    downloadModalDesc: "Select a dream from your vault to download its interpretation as a PDF to your device.",
    noArchivedDownload: "No archived dreams available for download.",
    close: "Close",
    dreamsCount: (n: number) => `📁 Dream Vault (${n})`,
    loadingTitle: "Consulting the Realm of Neptune...",
    loadingDesc: "Orbia is interpreting the ciphered messages sent by your subconscious, connecting them to the archetypes of your Birth Chart. Please wait a moment...",
    placeholderText: "Example: I dreamed I was running in a dark forest and found a golden snake near a river, I felt afraid, then a man came to rescue me, I fell into a deep river, the water color was Pink, and I started walking on water...",
  },
  de: {
    oracleTitle: "🔮 Traumorakel",
    oracleSubtitle: "Stimme dich mit deinen unbewussten Geheimnissen durch KI ab.",
    tellDream: "Erzähle deinen Traum im Detail",
    describeHint: "Beschreibe alles, was im Traum passiert ist: Personen, Tiere, Orte, Gefühle, Objekte, Farben, Zahlen und wichtige Ereignisse.",
    revealBtn: "Bedeutung enthüllen",
    decipheringBtn: "Astrale Dimension entschlüsseln...",
    dreamVault: "📁 Traumtresor",
    downloadDream: "📥 Traum herunterladen",
    searchPlaceholder: "Träume suchen...",
    meaningPrefix: "🔍 Bedeutung:",
    noArchived: "Keine archivierten Träume gefunden.",
    archivedOn: "Traumtresor · Archiviert am",
    atTime: "um",
    scribeReport: "Schreiberbericht:",
    downloadPDF: "📥 PDF herunterladen",
    primaryMeaning: "🔍 Primäre Traumbedeutung",
    energyIndex: "⚡ Energieindex",
    tuned: "Himmlisch abgestimmt",
    oracleAdvice: "Orakelrat",
    loveArea: "Liebesbereich",
    financeArea: "Finanzbereich",
    careerArea: "Berufsbereich",
    attentionLabel: "⚠️ Worauf du achten solltest",
    opportunitiesLabel: "🍀 Bevorstehende Chancen",
    protectionLabel: "🛡️ Schutz & Erlösung",
    luckyNumbers: "🔢 Empfohlene Glückszahlen",
    energyColors: "🎨 Abgestimmte Energiefarben",
    highlights: "🔥 Hervorgehobene interpretierte Elemente",
    predominantEmotion: "🎭 Vorherrschende Emotion:",
    numberSymbols: "🔢 Enthüllte Zahlensymbole",
    numberPrefix: "Zahl",
    animalArchetypes: "🦁 Tierarchetypen im Traum",
    colorSymbolism: "🎨 Strikte Farbsymbolik",
    universeMessage: "🌌 Botschaft des Universums",
    waitingDream: "Warte auf deinen Traum",
    waitingDesc: "Gib die Ereignisse deines Traums im Feld daneben ein und klicke auf Bedeutung enthüllen, um das himmlische Orakel zu befragen.",
    downloadModal: "📥 TRAUMAUFZEICHNUNG HERUNTERLADEN",
    downloadModalDesc: "Wähle einen Traum aus deinem Tresor, um die Interpretation als PDF auf dein Gerät herunterzuladen.",
    noArchivedDownload: "Keine archivierten Träume zum Herunterladen verfügbar.",
    close: "Schließen",
    dreamsCount: (n: number) => `📁 Traumtresor (${n})`,
    loadingTitle: "Konsultiere das Reich von Neptun...",
    loadingDesc: "Orbia interpretiert die verschlüsselten Botschaften Ihres Unterbewusstseins und verbindet sie mit den Archetypen Ihres Geburtshoroskops. Bitte warten Sie einen Moment...",
    placeholderText: "Beispiel: Ich habe geträumt, ich liefe durch einen dunklen Wald und fand eine goldene Schlange an einem Fluss. Ich hatte Angst, dann kam ein Mann, um mich zu retten. Ich fiel in einen tiefen Fluss, die Wasserfarbe war Rosa und ich fing an, auf dem Wasser zu gehen...",
  },
  es: {
    oracleTitle: "🔮 Oráculo de los Sueños",
    oracleSubtitle: "Sintoniza los secretos de tu subconsciente con la IA.",
    tellDream: "Cuéntanos tu sueño en detalle",
    describeHint: "Describe todo lo que sucedió en el sueño: personas, animales, lugares, emociones, objetos, colores, números y eventos importantes.",
    revealBtn: "Revelar Significado",
    decipheringBtn: "Descifrando Dimensão Astral...",
    dreamVault: "📁 Cofre de Sueños",
    downloadDream: "📥 Descargar Sueño",
    searchPlaceholder: "Buscar sueños...",
    meaningPrefix: "🔍 Significado:",
    noArchived: "No se encontraron sueños archivados.",
    archivedOn: "Cofre de Sueños · Archivado el",
    atTime: "a las",
    scribeReport: "Relato del Escriba:",
    downloadPDF: "📥 Descargar PDF",
    primaryMeaning: "🔍 Significado Primario del Sueño",
    energyIndex: "⚡ Índice de Energía",
    tuned: "Sintonizado Celestial",
    oracleAdvice: "Consejo del Oráculo",
    loveArea: "Área Amorosa",
    financeArea: "Área Financiera",
    careerArea: "Área Profesional",
    attentionLabel: "⚠️ Donde Debes Prestar Atención",
    opportunitiesLabel: "🍀 Oportunidades Próximas",
    protectionLabel: "🛡️ Protección y Liberación",
    luckyNumbers: "🔢 Números de la Suerte Recomendados",
    energyColors: "🎨 Colores de Energía Sintonizados",
    highlights: "🔥 Elementos Destacados Interpretados",
    predominantEmotion: "🎭 Emoción Predominante:",
    numberSymbols: "🔢 Símbolos de Números Revelados",
    numberPrefix: "Número",
    animalArchetypes: "🦁 Arquetipos de Animales en el Sueño",
    colorSymbolism: "🎨 Simbolismo Estricto de los Colores",
    universeMessage: "🌌 Mensaje del Universo",
    waitingDream: "Esperando tu Sueño",
    waitingDesc: "Escribe los acontecimentos de tu sueño en el campo al lado y haz clic en Revelar Significado para consultar el Oráculo Celestial.",
    downloadModal: "📥 DESCARGAR REGISTRO DE SUEÑO",
    downloadModalDesc: "Selecciona un sueño de tu cofre para descargar la interpretación en PDF a tu dispositivo.",
    noArchivedDownload: "No hay sueños archivados para descargar.",
    close: "Cerrar",
    dreamsCount: (n: number) => `📁 Cofre de Sueños (${n})`,
    loadingTitle: "Consultando el Reino de Neptuno...",
    loadingDesc: "Orbia está interpretando los mensajes cifrados enviados desde tu subconsciente, conectándolos con los arquetipos de tu Carta Astral. Espera un momento...",
    placeholderText: "Ejemplo: Soñé que corría por un bosque oscuro y encontraba una serpiente dorada cerca de un río, sentí miedo, luego vino un hombre a rescatarme, me caí en un río profundo, el color de agua era Rosa y yo empezaba a caminar sobre las aguas...",
  },
  fr: {
    oracleTitle: "🔮 Oracle des Rêves",
    oracleSubtitle: "Accordez-vous aux secrets de votre subconscient grâce à l'IA.",
    tellDream: "Racontez votre rêve en détail",
    describeHint: "Décrivez tout ce qui s'est passé dans le rêve : personnes, animaux, lieux, émotions, objets, couleurs, nombres et événements importants.",
    revealBtn: "Révéler la Signification",
    decipheringBtn: "Déchiffrement de la Dimension Astrale...",
    dreamVault: "📁 Coffre des Rêves",
    downloadDream: "📥 Télécharger le Rêve",
    searchPlaceholder: "Rechercher des rêves...",
    meaningPrefix: "🔍 Signification :",
    noArchived: "Aucun rêve archivé trouvé.",
    archivedOn: "Coffre des Rêves · Archivé le",
    atTime: "à",
    scribeReport: "Rapport du Scribe :",
    downloadPDF: "📥 Télécharger le PDF",
    primaryMeaning: "🔍 Signification Primaire du Rêve",
    energyIndex: "⚡ Indice d'Énergie",
    tuned: "Harmonisé Céleste",
    oracleAdvice: "Conseil de l'Oracle",
    loveArea: "Zone Amoureuse",
    financeArea: "Zone Financière",
    careerArea: "Zone Professionnelle",
    attentionLabel: "⚠️ Points d'Attention",
    opportunitiesLabel: "🍀 Opportunités Proches",
    protectionLabel: "🛡️ Protection et Libération",
    luckyNumbers: "🔢 Numéros de Chance Recommandés",
    energyColors: "🎨 Couleurs d'Énergie Harmonisées",
    highlights: "🔥 Éléments Marquants Interprétés",
    predominantEmotion: "🎭 Émotion Prédominante :",
    numberSymbols: "🔢 Symboles de Nombres Révélés",
    numberPrefix: "Nombre",
    animalArchetypes: "🦁 Archétypes d'Animaux dans le Rêve",
    colorSymbolism: "🎨 Symbolisme Strict des Couleurs",
    universeMessage: "🌌 Message de l'Univers",
    waitingDream: "En attente de votre Rêve",
    waitingDesc: "Saisissez les événements de votre rêve dans le champ ci-contre et cliquez sur Révéler la Signification pour consulter l'Oracle Céleste.",
    downloadModal: "📥 TÉLÉCHARGER LE REGISTRE DE RÊVE",
    downloadModalDesc: "Sélectionnez un rêve dans votre coffre pour télécharger son interprétation en PDF localement sur votre appareil.",
    noArchivedDownload: "Aucun rêve archivé disponible pour le téléchargement.",
    close: "Fermer",
    dreamsCount: (n: number) => `📁 Coffre des Rêves (${n})`,
    loadingTitle: "Consultation du Royaume de Neptune...",
    loadingDesc: "Orbia interprète les messages chiffrés envoyés par votre subconscient, les connectant aux archétypes de votre Carte du Ciel. Veuillez patienter un instant...",
    placeholderText: "Exemple : J'ai rêvé que je courais dans une forêt sombre et que je trouvais un serpent doré près d'une rivière, j'ai eu peur, puis un homme est venu me secourir, je suis tombé dans une rivière profonde, la couleur de l'eau était Rose et je commençais à marcher sur les eaux...",
  },
};

export default function OraculoDosSonhosCard({
  newDreamDesc,
  setNewDreamDesc,
  isInterpretingDream,
  handleRecordAndInterpretDream,
  dreamsHistory,
  selectedDreamDisplay,
  setSelectedDreamDisplay,
  preferredLanguage = "pt"
}: OraculoDosSonhosCardProps) {
  const { i18n, t } = useTranslation();
  const langKey = (i18n.language || preferredLanguage || 'pt').toLowerCase().split('-')[0];
  
  // Dynamic UI dictionary driven by i18next with robust embedded fallback
  const fallbackDict = (ORACLE_UI as any)[langKey] || ORACLE_UI.pt;
  const getUiStr = (key: string, defaultVal?: string) => {
    const val = t(key);
    if (val && val !== key) return val;
    return fallbackDict[key] || defaultVal || key;
  };

  const ui = {
    oracleTitle: getUiStr('oracleTitle', fallbackDict.oracleTitle),
    oracleSubtitle: getUiStr('oracleSubtitle', fallbackDict.oracleSubtitle),
    tellDream: getUiStr('tellDream', fallbackDict.tellDream),
    describeHint: getUiStr('describeHint', fallbackDict.describeHint),
    revealBtn: getUiStr('revealBtn', fallbackDict.revealBtn),
    decipheringBtn: getUiStr('decipheringBtn', fallbackDict.decipheringBtn),
    dreamVault: getUiStr('dreamVault', fallbackDict.dreamVault),
    downloadDream: getUiStr('downloadDream', fallbackDict.downloadDream),
    searchPlaceholder: getUiStr('searchPlaceholder', fallbackDict.searchPlaceholder),
    meaningPrefix: getUiStr('meaningPrefix', fallbackDict.meaningPrefix),
    noArchived: getUiStr('noArchived', fallbackDict.noArchived),
    archivedOn: getUiStr('archivedOn', fallbackDict.archivedOn),
    atTime: getUiStr('atTime', fallbackDict.atTime),
    scribeReport: getUiStr('scribeReport', fallbackDict.scribeReport),
    downloadPDF: getUiStr('downloadPDF', fallbackDict.downloadPDF),
    primaryMeaning: getUiStr('primaryMeaning', fallbackDict.primaryMeaning),
    energyIndex: getUiStr('energyIndex', fallbackDict.energyIndex),
    tuned: getUiStr('tuned', fallbackDict.tuned),
    oracleAdvice: getUiStr('oracleAdvice', fallbackDict.oracleAdvice),
    loveArea: getUiStr('loveArea', fallbackDict.loveArea),
    financeArea: getUiStr('financeArea', fallbackDict.financeArea),
    careerArea: getUiStr('careerArea', fallbackDict.careerArea),
    attentionLabel: getUiStr('attentionLabel', fallbackDict.attentionLabel),
    opportunitiesLabel: getUiStr('opportunitiesLabel', fallbackDict.opportunitiesLabel),
    protectionLabel: getUiStr('protectionLabel', fallbackDict.protectionLabel),
    luckyNumbers: getUiStr('luckyNumbers', fallbackDict.luckyNumbers),
    energyColors: getUiStr('energyColors', fallbackDict.energyColors),
    highlights: getUiStr('highlights', fallbackDict.highlights),
    predominantEmotion: getUiStr('predominantEmotion', fallbackDict.predominantEmotion),
    numberSymbols: getUiStr('numberSymbols', fallbackDict.numberSymbols),
    numberPrefix: getUiStr('numberPrefix', fallbackDict.numberPrefix),
    animalArchetypes: getUiStr('animalArchetypes', fallbackDict.animalArchetypes),
    colorSymbolism: getUiStr('colorSymbolism', fallbackDict.colorSymbolism),
    universeMessage: getUiStr('universeMessage', fallbackDict.universeMessage),
    waitingDream: getUiStr('waitingDream', fallbackDict.waitingDream),
    waitingDesc: getUiStr('waitingDesc', fallbackDict.waitingDesc),
    downloadModal: getUiStr('downloadModal', fallbackDict.downloadModal),
    downloadModalDesc: getUiStr('downloadModalDesc', fallbackDict.downloadModalDesc),
    noArchivedDownload: getUiStr('noArchivedDownload', fallbackDict.noArchivedDownload),
    close: getUiStr('close', fallbackDict.close),
    dreamsCount: (n: number) => {
      const val = t('dreamsCount', { count: n });
      if (val && val !== 'dreamsCount') return val;
      if (typeof fallbackDict.dreamsCount === 'function') return fallbackDict.dreamsCount(n);
      return `📁 Cofre de Sonhos (${n})`;
    },
    loadingTitle: getUiStr('loadingTitle', fallbackDict.loadingTitle),
    loadingDesc: getUiStr('loadingDesc', fallbackDict.loadingDesc),
    placeholderText: getUiStr('placeholderText', fallbackDict.placeholderText),
  };
  // Search state inside dreams list sidebar
  const [dreamSearch, setDreamSearch] = useState('');
  const [isDownloadListOpen, setIsDownloadListOpen] = useState(false);

  // Normalize list & selection safely so this component is 100% resilient
  const safeDreamsHistory = Array.isArray(dreamsHistory) ? normalizeDreamsList(dreamsHistory) : [];
  const safeSelectedDream = selectedDreamDisplay 
    ? normalizeOracleDreamEntry(selectedDreamDisplay) 
    : (safeDreamsHistory.length > 0 ? safeDreamsHistory[0] : null);

  // Helper to trigger direct on-device PDF generation of a dream entry
  const handleDeviceDownloadDreamPDF = (dream: OracleDreamEntry) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const language = dream.language || preferredLanguage || "pt";

      // Margins
      const marginX = 20;
      let currentY = 15;
      const contentWidth = 170; // 210 - 40

      // 1. Header block
      doc.setFillColor(15, 23, 42); // slate-900 background
      doc.rect(0, 0, 210, 40, "F");

      // Header Text
      doc.setTextColor(229, 193, 88); // Amber gold
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.text("ORBI - ORÁCULO CELESTE", marginX, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(10);
      const subtitleMap: Record<string, string> = {
        pt: "Interpretação e Análise Consciencial de Sonhos",
        en: "Dream Interpretation & Consciousness Analysis",
        es: "Interpretación de Sueños y Análisis de la Conciencia",
        de: "Traumdeutung und Bewusstseinsanalyse",
        fr: "Interprétation des Rêves & Analyse de la Conscience"
      };
      doc.text(subtitleMap[language] || subtitleMap.pt, marginX, 26);

      currentY = 52;

      // Metadata section (Date & Time)
      doc.setTextColor(115, 115, 115); // neutral-400
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      
      const dateLabel = language === "pt" ? "DATA" : language === "es" ? "FECHA" : language === "de" ? "DATUM" : language === "fr" ? "DATE" : "DATE";
      const timeLabel = language === "pt" ? "HORÁRIO" : language === "es" ? "HORA" : language === "de" ? "UHRZEIT" : language === "fr" ? "HEURE" : "TIME";
      doc.text(`${dateLabel}: ${dream.date}  |  ${timeLabel}: ${dream.time || "N/A"}`, marginX, currentY);
      
      doc.setDrawColor(244, 63, 94); // rose-500 border line below metadata
      doc.setLineWidth(0.4);
      doc.line(marginX, currentY + 3, marginX + contentWidth, currentY + 3);

      currentY += 12;

      // Title of the Dream
      doc.setTextColor(244, 63, 94); // rose-500
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text(dream.title || (language === "pt" ? "Relato de Sonho" : language === "es" ? "Registro de Sueño" : language === "de" ? "Traumaufzeichnung" : language === "fr" ? "Registre de Rêve" : "Dream Log"), marginX, currentY);

      currentY += 8;

      // User Description heading
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      const descHeadingMap: Record<string, string> = {
        pt: "RELAÇÃO DOS FATOS (SUBCONSCIENTE):",
        en: "RELATION OF THE FACTS (SUBSCIOUS):",
        es: "RELACIÓN DE LOS HECHOS (SUBCONSCIENTE):",
        de: "DARSTELLUNG DER FAKTEN (UNTERBEWUSSTSEIN):",
        fr: "RELATION DES FAITS (SUBCONSCIENT) :"
      };
      doc.text(descHeadingMap[language] || descHeadingMap.pt, marginX, currentY);

      currentY += 6;

      // User Description content
      doc.setTextColor(82, 82, 82); // gray-600
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9.5);
      const wrappedDesc = doc.splitTextToSize(`"${dream.description}"`, contentWidth);
      doc.text(wrappedDesc, marginX, currentY);

      currentY += (wrappedDesc.length * 5) + 8;

      // Thin separator line
      doc.setDrawColor(226, 232, 240); // gray-200
      doc.line(marginX, currentY - 2, marginX + contentWidth, currentY - 2);

      if (dream.interpretation) {
        const interp = dream.interpretation;

        // Significance heading
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        const meaningHeadingMap: Record<string, string> = {
          pt: "SIGNIFICADO PRIMÁRIO & ANÁLISE:",
          en: "PRIMARY MEANING & ANALYSIS:",
          es: "SIGNIFICADO PRIMARIO Y ANÁLISIS:",
          de: "PRIMÄRE BEDEUTUNG & ANALYSE:",
          fr: "SIGNIFICATION PRIMAIRE & ANALYSE :"
        };
        doc.text(meaningHeadingMap[language] || meaningHeadingMap.pt, marginX, currentY);

        currentY += 6;

        // Significance title
        doc.setTextColor(244, 63, 94); // rose-500
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.text(interp.mainMeaning || "", marginX, currentY);

        currentY += 6;

        // Significance body
        doc.setTextColor(64, 64, 64); // gray-700
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        const wrappedPsych = doc.splitTextToSize(interp.psychological || "", contentWidth);
        
        if (currentY + wrappedPsych.length * 5 > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(wrappedPsych, marginX, currentY);
        currentY += (wrappedPsych.length * 5) + 8;

        // Oracular advice section
        if (interp.oracleAdvice) {
          if (currentY + 28 > 280) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFillColor(254, 243, 199); // amber 100 wrapper background
          doc.rect(marginX - 2, currentY - 4, contentWidth + 4, 28, "F");

          doc.setTextColor(180, 83, 9); // amber-700
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9.5);
          const adviceTitleMap: Record<string, string> = {
            pt: "CONSELHO DO ORÁCULO CELESTE",
            en: "CELESTIAL ORACLE ADVICE",
            es: "CONSEJO DEL ORÁCULO CELESTIAL",
            de: "RATSCHLAG DES HIMMLISCHEN ORAKELS",
            fr: "CONSEIL DE L'ORACLE CÉLESTE"
          };
          doc.text(adviceTitleMap[language] || adviceTitleMap.pt, marginX, currentY);

          doc.setTextColor(120, 53, 4); // amber-900
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(9);
          const wrappedAdvice = doc.splitTextToSize(interp.oracleAdvice, contentWidth - 4);
          doc.text(wrappedAdvice, marginX, currentY + 5);

          currentY += 32;
        }

        // Three areas of life detailed
        const loveTitle = language === "pt" ? "Área Amorosa" : language === "es" ? "Área de Amor" : language === "de" ? "Liebesbereich" : language === "fr" ? "Zone Amoureuse" : "Love Area";
        const financeTitle = language === "pt" ? "Área Financeira" : language === "es" ? "Área Financiera" : language === "de" ? "Finanzbereich" : language === "fr" ? "Zone Financière" : "Finance Area";
        const careerTitle = language === "pt" ? "Área Profissional" : language === "es" ? "Área Profesional" : language === "de" ? "Berufsbereich" : language === "fr" ? "Zone Professionnelle" : "Career Area";

        const areas = [
          { t: loveTitle, b: interp.loveArea },
          { t: financeTitle, b: interp.financeArea },
          { t: careerTitle, b: interp.careerArea }
        ].filter(a => !!a.b);

        if (areas.length > 0) {
          if (currentY + 20 > 280) {
            doc.addPage();
            currentY = 20;
          }

          doc.setTextColor(15, 23, 42);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(11);
          const lifeAreasHeadingMap: Record<string, string> = {
            pt: "INFLUÊNCIA NAS ÁREAS DA VIDA:",
            en: "INFLUENCE ON LIFE AREAS:",
            es: "INFLUENCIA EN ÁREAS DE LA VIDA:",
            de: "EINFLUSS AUF LEBENSBEREICHE:",
            fr: "INFLUENCE SUR LES ZONES DE VIE :"
          };
          doc.text(lifeAreasHeadingMap[language] || lifeAreasHeadingMap.pt, marginX, currentY);
          currentY += 6;

          areas.forEach(area => {
            const wrappedAreaBody = doc.splitTextToSize(area.b || "", contentWidth - 6);
            if (currentY + (wrappedAreaBody.length * 4.5) + 10 > 280) {
              doc.addPage();
              currentY = 20;
            }

            doc.setFillColor(248, 250, 252); // slate-50
            doc.rect(marginX, currentY - 3, contentWidth, (wrappedAreaBody.length * 4.5) + 6, "F");

            doc.setTextColor(15, 23, 42);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text(area.t, marginX + 3, currentY + 1);

            doc.setTextColor(71, 85, 105);
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(9);
            doc.text(wrappedAreaBody, marginX + 3, currentY + 5.5);

            currentY += (wrappedAreaBody.length * 4.5) + 10;
          });
          currentY += 4;
        }

        // Lucky numbers and colors
        if (interp.luckyNumbers?.length || interp.favorableColors?.length) {
          if (currentY + 16 > 280) {
            doc.addPage();
            currentY = 20;
          }

          const luckyNumbersLabel = language === "pt" ? "Números Recomendados:" : language === "es" ? "Números Recomendados:" : language === "de" ? "Empfohlene Zahlen:" : language === "fr" ? "Numéros Recommandés :" : "Lucky Numbers:";
          const favorableColorsLabel = language === "pt" ? "Cores de Energia:" : language === "es" ? "Colores de Energía:" : language === "de" ? "Energiefarben:" : language === "fr" ? "Couleurs d'Énergie :" : "Energy Colors:";

          doc.setTextColor(15, 23, 42);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          doc.text(luckyNumbersLabel, marginX, currentY);
          
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(244, 63, 94);
          doc.text(interp.luckyNumbers?.join(", ") || "N/A", marginX + 48, currentY);

          currentY += 5;

          doc.setTextColor(15, 23, 42);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          doc.text(favorableColorsLabel, marginX, currentY);
          
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(79, 70, 229);
          doc.text(interp.favorableColors?.join(", ") || "N/A", marginX + 48, currentY);

          currentY += 10;
        }

        // Sincronias Oráculares (Attention, Opportunity, Protection) if they exist
        const warningElements = [
          { label: language === "pt" ? "⚠️ ATENÇÃO:" : language === "es" ? "⚠️ ATENCIÓN:" : language === "de" ? "⚠️ ACHTUNG:" : language === "fr" ? "⚠️ ATTENTION :" : "⚠️ ATTENTION:", content: interp.attention },
          { label: language === "pt" ? "🍀 OPORTUNIDADES:" : language === "es" ? "🍀 OPORTUNIDADES:" : language === "de" ? "🍀 CHANCEN:" : language === "fr" ? "🍀 OPPORTUNITÉS :" : "🍀 OPPORTUNITIES:", content: interp.opportunities },
          { label: language === "pt" ? "🛡️ PROTEÇÃO e LIVRAMENTO:" : language === "es" ? "🛡️ PROTECCIÓN Y LIBERACIÓN:" : language === "de" ? "🛡️ SCHUTZ & ERLÖSUNG:" : language === "fr" ? "🛡️ PROTECTION ET LIBÉRATION :" : "🛡️ PROTECTION & SANCTUARY:", content: interp.protection }
        ].filter(w => !!w.content);

        if (warningElements.length > 0) {
          warningElements.forEach(item => {
            const wrappedWarning = doc.splitTextToSize(item.content || "", contentWidth);
            if (currentY + (wrappedWarning.length * 4.5) + 8 > 280) {
              doc.addPage();
              currentY = 20;
            }

            doc.setTextColor(15, 23, 42);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text(item.label, marginX, currentY);

            currentY += 4.5;

            doc.setTextColor(71, 85, 105);
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(9);
            doc.text(wrappedWarning, marginX, currentY);

            currentY += (wrappedWarning.length * 4.5) + 6;
          });
        }

        // Universe Message
        if (interp.universeMessage) {
          if (currentY + 22 > 280) {
            doc.addPage();
            currentY = 20;
          }

          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.4);
          doc.rect(marginX - 1, currentY - 4, contentWidth + 2, 22, "D");

          doc.setTextColor(79, 70, 229);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9);
          const universeTitleMap: Record<string, string> = {
            pt: "SINTONIA CÓSMICA & MENSAGEM DO UNIVERSO",
            en: "COSMIC HARMONY & UNIVERSE MESSAGE",
            es: "SINTONÍA CÓSMICA Y MENSAJE DEL UNIVERSO",
            de: "KOSMISCHE HARMONIE & BOTSCHAFT DES UNIVERSUMS",
            fr: "HARMONIE COSMIQUE & MESSAGE DE L'UNIVERS"
          };
          doc.text(universeTitleMap[language] || universeTitleMap.pt, marginX + 4, currentY);

          doc.setTextColor(49, 46, 129);
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(9);
          const wrappedUniv = doc.splitTextToSize(interp.universeMessage, contentWidth - 8);
          doc.text(wrappedUniv, marginX + 4, currentY + 5);
        }
      }

      // Add page numbers
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(163, 163, 163);
        const footerMap: Record<string, string> = {
          pt: "Gerado pelo Astra Orbi - Seu portal de inteligência mística e autoconhecimento cósmico.",
          en: "Generated by Astra Orbi - Your mystical intelligence portal & cosmic self-knowledge.",
          es: "Generado por Astra Orbi - Tu portal de inteligencia mística y autoconocimiento cósmico.",
          de: "Generiert von Astra Orbi - Ihr mystisches Intelligenzportal & kosmisches Selbsterkenntnis.",
          fr: "Généré par Astra Orbi - Votre portail d'intelligence mystique et d'autoconnaissance cosmique."
        };
        doc.text(footerMap[language] || footerMap.pt, marginX, 287);
        doc.text(`${i}/` + pageCount, 190, 287);
      }

      const slugifiedTitle = (dream.title || "sonho")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "_")
        .substring(0, 30);
      doc.save(`orbi_sonho_${slugifiedTitle}_${dream.date}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  // Filter history list based on search Input
  const filteredDreams = dreamsHistory.filter(d => 
    d.description.toLowerCase().includes(dreamSearch.toLowerCase()) || 
    (d.interpretation?.mainMeaning && d.interpretation.mainMeaning.toLowerCase().includes(dreamSearch.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="dream-oracle-view-root">
      
      {/* Left Pane: Input fields & Oracular History Directory */}
      <div className="lg:col-span-5 space-y-6" id="dream-left-pane">
        
        {/* The Dream Scribe input form */}
        <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden group" id="dream-scribe-box">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/10 transition-colors duration-500" />
          
          <div className="pb-4 border-b border-slate-800 flex items-center gap-3" id="dream-scribe-header">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 tracking-wide">{ui.oracleTitle}</h3>
              <p className="text-sm text-slate-400 mt-0.5 leading-normal">{ui.oracleSubtitle}</p>
            </div>
          </div>

          <form onSubmit={handleRecordAndInterpretDream} className="space-y-5 mt-4" id="dream-scribe-form">
            <div className="space-y-2.5">
              <label className="block text-sm font-mono font-semibold text-slate-300 uppercase tracking-wider">
                {ui.tellDream}
              </label>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                {ui.describeHint}
              </p>
              
              {/* Orientation Alert Block */}
              <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-2xl space-y-1.5 my-2 text-slate-300 leading-relaxed font-sans text-sm" id="dream-orientation-alert">
                <span className="font-bold text-rose-400 block text-sm font-mono uppercase tracking-widest">📝 {t('dreamOrientationTitle') || 'Orientação Onírica'}</span>
                <p className="text-slate-350 leading-relaxed font-sans text-sm">
                  {t('dreamOrientationMessage')}
                </p>
              </div>

              <textarea 
                rows={5}
                required
                placeholder={ui.placeholderText}
                value={newDreamDesc}
                onChange={(e) => setNewDreamDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-850 text-base text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all font-sans leading-relaxed resize-none"
                id="dream-input-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={isInterpretingDream}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-slate-100 font-sans font-semibold text-base transition duration-500 shadow-lg shadow-rose-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:scale-[1.01] cursor-pointer whitespace-normal"
              id="dream-submit-btn"
            >
              {isInterpretingDream ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-200" />
                  <span>{ui.decipheringBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{ui.revealBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Directory/Portal of Revelations sidebar */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805/40 flex flex-col min-h-[400px]" id="dream-history-sidebar">
          
          <div className="pb-3 border-b border-slate-850 flex items-center justify-between gap-2 shrink-0" id="dream-history-header">
            <h4 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              {ui.dreamsCount(dreamsHistory.length)}
            </h4>
            {dreamsHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setIsDownloadListOpen(true)}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/30 text-rose-400 hover:text-rose-350 rounded-xl text-sm font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 font-semibold shrink-0"
              >
                {ui.downloadDream}
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative mt-3 mb-2 shrink-0" id="dream-history-search">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input 
              type="text"
              placeholder={ui.searchPlaceholder}
              value={dreamSearch}
              onChange={(e) => setDreamSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-hidden"
              id="dream-search-input"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2 max-h-[300px]" id="dream-history-list">
            {filteredDreams.length > 0 ? (
              filteredDreams.map((d) => {
                const isSelected = safeSelectedDream?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDreamDisplay(d)}
                    className={`w-full text-left p-3.5 rounded-2xl flex flex-col space-y-1.5 border transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-950/30 border-rose-500/40' 
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                    }`}
                    id={`dream-history-item-${d.id}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-mono text-slate-400">{d.date}</span>
                      {d.interpretation?.dreamEnergyType && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 capitalize">
                          {d.interpretation.dreamEnergyType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 italic font-serif leading-relaxed line-clamp-2">
                      "{d.description || ''}"
                    </p>
                    {d.interpretation?.mainMeaning && (
                      <span className="text-sm font-mono font-bold text-rose-400 line-clamp-1 tracking-wide">
                        {ui.meaningPrefix} {d.interpretation.mainMeaning}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-slate-500 font-mono">{ui.noArchived}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Pane: Detailed dream interactive boards dashboard */}
      <div className="lg:col-span-7" id="dream-right-pane">
        
        {isInterpretingDream ? (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-[32px] p-16 text-center flex flex-col items-center justify-center min-h-[500px]" id="dream-loader-card">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border border-dashed border-rose-500/30 animate-spin-slow flex items-center justify-center" />
              <Moon className="w-10 h-10 text-rose-500 animate-pulse absolute top-5 left-5" />
            </div>
            
            <h4 className="text-lg font-bold font-serif text-slate-100 animate-pulse">
              {ui.loadingTitle}
            </h4>
            <p className="text-sm text-slate-400 mt-2.5 max-w-sm mx-auto leading-relaxed font-sans">
              {ui.loadingDesc}
            </p>
          </div>
        ) : safeSelectedDream ? (
          
          <div className="bg-slate-900/30 p-6 rounded-[32px] border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden" id="dream-display-board">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Display Header details */}
            <div className="pb-4 border-b border-slate-800 flex justify-between items-start sm:flex-nowrap flex-wrap gap-3" id="dream-display-header">
              <div className="space-y-2 flex-1">
                <span className="text-sm font-mono text-rose-400 font-bold uppercase tracking-widest block">
                  {ui.archivedOn} {safeSelectedDream.date} {safeSelectedDream.time ? ` ${ui.atTime} ${safeSelectedDream.time}` : ''}
                </span>
                <h3 className="text-base font-mono font-bold text-slate-300">
                  {ui.scribeReport}
                </h3>
                <p className="text-base text-slate-200 leading-relaxed font-serif bg-slate-950 border border-slate-850 p-4 rounded-2xl italic block [overflow-wrap:anywhere] break-words max-w-[65ch]">
                  "{safeSelectedDream.description}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeviceDownloadDreamPDF(safeSelectedDream)}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/30 text-rose-400 hover:text-rose-350 rounded-xl text-sm font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 font-medium whitespace-normal"
                title={ui.downloadPDF}
              >
                {ui.downloadPDF}
              </button>
            </div>

            {/* Display Dream analysis */}
            <div className="space-y-5 animate-in fade-in duration-500" id="dream-display-content">
              
              {/* Main semantic and title interpretations */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Significance board */}
                <div className="md:col-span-8 p-6 bg-slate-950 border border-slate-850 rounded-2xl space-y-2.5" id="dream-meaning-pane">
                  <span className="text-sm font-mono font-bold text-rose-400 uppercase tracking-widest block">
                    {ui.primaryMeaning}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 leading-snug">
                    {safeSelectedDream.interpretation?.mainMeaning}
                  </h4>
                  <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words max-w-[65ch]">
                    {safeSelectedDream.interpretation?.psychological}
                  </p>
                </div>

                {/* Energy index metrics card */}
                <div className="md:col-span-4 p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between items-center text-center relative overflow-hidden" id="dream-energy-card">
                  <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    {ui.energyIndex}
                  </span>
                  
                  {/* Circular indicator placeholder visualization */}
                  <div className="relative w-24 h-24 flex items-center justify-center my-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        className="stroke-slate-800 fill-none" 
                        strokeWidth="6" 
                      />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        className="stroke-rose-500 fill-none" 
                        strokeWidth="6" 
                        strokeDasharray={251}
                        strokeDashoffset={251 - (251 * (safeSelectedDream.interpretation?.dreamEnergyIndex || 50)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-lg font-extrabold font-mono text-slate-100">
                      {safeSelectedDream.interpretation?.dreamEnergyIndex}%
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-slate-200 uppercase font-mono block">
                      {safeSelectedDream.interpretation?.dreamEnergyType}
                    </span>
                    <span className="text-xs font-mono text-slate-400 block">{ui.tuned}</span>
                  </div>
                </div>

              </div>

              {/* Advice oracle block */}
              {safeSelectedDream.interpretation?.oracleAdvice && (
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 items-start" id="dream-oracle-advice">
                  <span className="text-3xl select-none shrink-0">📜</span>
                  <div className="space-y-2">
                    <h4 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-widest">{ui.oracleAdvice}</h4>
                    <p className="text-base text-slate-200 leading-relaxed font-serif italic [overflow-wrap:anywhere] break-words max-w-[65ch]">
                      {safeSelectedDream.interpretation.oracleAdvice}
                    </p>
                  </div>
                </div>
              )}

              {/* Triad Areas of Life: Love, Finance, Professional details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dream-triad-areas">
                
                {/* Love */}
                {safeSelectedDream.interpretation?.loveArea && (
                  <div className="p-5 bg-pink-950/20 border border-pink-500/20 rounded-2xl space-y-2" id="area-love">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Heart className="w-4 h-4 fill-pink-400/20" />
                      <span className="text-sm font-mono font-bold uppercase tracking-widest">{ui.loveArea}</span>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words">
                      {safeSelectedDream.interpretation.loveArea}
                    </p>
                  </div>
                )}

                {/* Financial */}
                {safeSelectedDream.interpretation?.financeArea && (
                  <div className="p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2" id="area-finance">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-mono font-bold uppercase tracking-widest">{ui.financeArea}</span>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words">
                      {safeSelectedDream.interpretation.financeArea}
                    </p>
                  </div>
                )}

                {/* Professional */}
                {safeSelectedDream.interpretation?.careerArea && (
                  <div className="p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-2" id="area-career">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Orbit className="w-4 h-4" />
                      <span className="text-sm font-mono font-bold uppercase tracking-widest">{ui.careerArea}</span>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words">
                      {safeSelectedDream.interpretation.careerArea}
                    </p>
                  </div>
                )}

              </div>

              {/* Warnings and Opportunities: Attention, Opportunity, Protection */}
              <div className="space-y-3.5" id="dream-warnings-box">
                
                {/* Attention */}
                {safeSelectedDream.interpretation?.attention && (
                  <div className="p-5 bg-red-950/20 border border-red-500/25 rounded-2xl flex gap-3.5 items-start" id="attention-box">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-sm font-mono font-bold text-red-400 uppercase tracking-wider block">{ui.attentionLabel}</span>
                      <p className="text-base text-slate-200 leading-relaxed font-sans [overflow-wrap:anywhere] break-words max-w-[65ch]">{safeSelectedDream.interpretation.attention}</p>
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {safeSelectedDream.interpretation?.opportunities && (
                  <div className="p-5 bg-teal-950/20 border border-teal-500/25 rounded-2xl flex gap-3.5 items-start" id="opportunities-box">
                    <Award className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-sm font-mono font-bold text-teal-400 uppercase tracking-wider block">{ui.opportunitiesLabel}</span>
                      <p className="text-base text-slate-200 leading-relaxed font-sans [overflow-wrap:anywhere] break-words max-w-[65ch]">{safeSelectedDream.interpretation.opportunities}</p>
                    </div>
                  </div>
                )}

                {/* Protection */}
                {safeSelectedDream.interpretation?.protection && (
                  <div className="p-5 bg-blue-950/20 border border-blue-500/25 rounded-2xl flex gap-3.5 items-start" id="protection-box">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-sm font-mono font-bold text-blue-400 uppercase tracking-wider block">{ui.protectionLabel}</span>
                      <p className="text-base text-slate-200 leading-relaxed font-sans [overflow-wrap:anywhere] break-words max-w-[65ch]">{safeSelectedDream.interpretation.protection}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Sincronias Oráculares: Lucky numbers and favorable colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="dream-oracular-sincronias">
                
                {/* Lucky Numbers */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2.5">
                  <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    {ui.luckyNumbers}
                  </span>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {Array.isArray(safeSelectedDream.interpretation?.luckyNumbers) && safeSelectedDream.interpretation.luckyNumbers.map((num) => (
                      <span 
                        key={num} 
                        className="w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold font-mono text-rose-400 select-none shadow-md hover:border-rose-500/40 transition-colors"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Favorable Energy Colors */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2.5">
                  <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    {ui.energyColors}
                  </span>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {Array.isArray(safeSelectedDream.interpretation?.favorableColors) && safeSelectedDream.interpretation.favorableColors.map((color) => {
                      const cLower = String(color || '').toLowerCase();
                      let hexVal = "#e2e8f0";
                      if (cLower.includes("dourado") || cLower.includes("ouro")) hexVal = "#fbbf25";
                      else if (cLower.includes("azul")) hexVal = "#3b82f6";
                      else if (cLower.includes("branco") || cLower.includes("neve")) hexVal = "#ffffff";
                      else if (cLower.includes("rosa")) hexVal = "#f43f5e";
                      else if (cLower.includes("verde")) hexVal = "#10b981";
                      else if (cLower.includes("preto") || cLower.includes("escura")) hexVal = "#020617";
                      else if (cLower.includes("vermelho")) hexVal = "#ef4444";
                      else if (cLower.includes("roxo") || cLower.includes("púrpura") || cLower.includes("violeta")) hexVal = "#8b5cf6";
                      
                      return (
                        <div 
                          key={color}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 border border-slate-800 shadow-sm"
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 block" 
                            style={{ backgroundColor: hexVal }}
                          />
                          <span className="text-sm font-mono font-bold text-slate-200">
                            {color}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Value adds: animals, mentioned variables & emotions */}
              <div className="space-y-4 pt-3 border-t border-slate-800" id="dream-archetypes-highlights">
                
                <h4 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest">
                  {ui.highlights}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Predominant Emotion */}
                  {safeSelectedDream.interpretation?.predominantEmotion && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2">
                      <div className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span>{ui.predominantEmotion}</span>
                        <span className="text-yellow-400 font-extrabold uppercase">
                          {safeSelectedDream.interpretation.predominantEmotion.emotion}
                        </span>
                      </div>
                      <p className="text-base text-slate-300 font-sans leading-relaxed [overflow-wrap:anywhere] break-words">
                        {safeSelectedDream.interpretation.predominantEmotion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Detected Numbers if any */}
                  {Array.isArray(safeSelectedDream.interpretation?.detectedNumbers) && safeSelectedDream.interpretation.detectedNumbers.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2">
                      <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        {ui.numberSymbols}
                      </span>
                      <div className="space-y-2">
                        {safeSelectedDream.interpretation.detectedNumbers.map((obj, idx) => (
                          <div key={idx} className="text-base font-sans leading-relaxed [overflow-wrap:anywhere] break-words">
                            <strong className="text-sm font-mono text-rose-400 block mb-0.5">{ui.numberPrefix} {obj.number}:</strong>
                            <p className="text-slate-300">{obj.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Animals if any */}
                  {Array.isArray(safeSelectedDream.interpretation?.detectedAnimals) && safeSelectedDream.interpretation.detectedAnimals.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2 col-span-1 md:col-span-2">
                      <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        {ui.animalArchetypes}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {safeSelectedDream.interpretation.detectedAnimals.map((obj, idx) => (
                          <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                            <strong className="text-sm font-mono text-amber-400 uppercase tracking-wider block">
                              🦊 {obj.animal}
                            </strong>
                            <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words">{obj.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Colors if any */}
                  {Array.isArray(safeSelectedDream.interpretation?.detectedColors) && safeSelectedDream.interpretation.detectedColors.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2 col-span-1 md:col-span-2">
                      <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        {ui.colorSymbolism}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {safeSelectedDream.interpretation.detectedColors.map((obj, idx) => (
                          <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                            <strong className="text-sm font-mono text-purple-400 uppercase tracking-wider block">
                              🖌️ {obj.color}
                            </strong>
                            <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words">{obj.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Universe mystical message section at the bottom */}
              {safeSelectedDream.interpretation?.universeMessage && (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/25 shadow-inner space-y-3 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 blur-xl pointer-events-none" />
                  <span className="text-sm font-mono font-bold text-indigo-300 uppercase tracking-widest block">
                    {ui.universeMessage}
                  </span>
                  <p className="text-base sm:text-lg leading-relaxed italic text-indigo-100 font-serif max-w-[65ch] mx-auto [overflow-wrap:anywhere] break-words">
                    "{safeSelectedDream.interpretation.universeMessage}"
                  </p>
                </div>
              )}

            </div>

          </div>

        ) : (
          /* If history is empty and nothing is selected */
          <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-[32px] p-12 text-center flex flex-col items-center justify-center min-h-[500px]" id="dream-empty-landing">
            <Moon className="w-14 h-14 text-slate-700 animate-pulse mb-4" />
            <h4 className="text-lg font-bold font-serif tracking-wide text-slate-400">{ui.waitingDream}</h4>
            <p className="text-base text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              {ui.waitingDesc}
            </p>
          </div>
        )}

      </div>

      {/* Beautiful PDF Download List Modal Popup */}
      {isDownloadListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden" id="download-list-modal">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-2">
                  {ui.downloadModal}
                </h3>
                <p className="text-sm text-slate-400 mt-1 leading-normal font-sans">
                  {ui.downloadModalDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadListOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm transition duration-200 cursor-pointer font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 my-4 pr-1">
              {safeDreamsHistory.length > 0 ? (
                safeDreamsHistory.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      handleDeviceDownloadDreamPDF(d);
                      setIsDownloadListOpen(false);
                    }}
                    className="w-full text-left p-4 rounded-2xl bg-slate-950 border border-slate-850 hover:border-rose-500/40 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-rose-400 transition-colors font-mono">
                        {d.title || d.interpretation?.mainMeaning || (d.description ? d.description.slice(0, 35) + "..." : "Sonho")}
                      </h4>
                      <p className="text-sm text-slate-400 italic [overflow-wrap:anywhere] break-words">
                        "{d.description || ''}"
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono text-rose-400 font-bold block">{d.date}</span>
                      {d.time && (
                        <span className="text-xs font-mono text-slate-500 block mt-0.5">{d.time}</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-sm">
                  {ui.noArchivedDownload}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDownloadListOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-mono uppercase tracking-wider transition-all cursor-pointer font-medium"
              >
                {ui.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
