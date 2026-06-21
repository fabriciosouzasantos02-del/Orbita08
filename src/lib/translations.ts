export type Language = 'pt' | 'en' | 'es' | 'de';

export function getDeviceLanguage(): Language {
  if (typeof window === 'undefined' || !navigator) return 'pt';
  const systemLang = navigator.language || (navigator as any).userLanguage || '';
  const langLower = systemLang.toLowerCase();
  
  if (langLower.startsWith('de')) return 'de';
  if (langLower.startsWith('es')) return 'es';
  if (langLower.startsWith('en')) return 'en';
  return 'pt'; // Default is Portuguese
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'pt';
  const saved = localStorage.getItem('orbi_preferred_language');
  if (saved === 'pt' || saved === 'en' || saved === 'es' || saved === 'de') {
    return saved;
  }
  return getDeviceLanguage();
}

export const translationDict: Record<Language, Record<string, string>> = {
  pt: {
    // Menus
    menu_map: 'Mapa Astral',
    menu_stars: 'Constelações',
    menu_planets: 'Planetas & Orbia',
    menu_tarot: 'Tarot Cósmico',
    menu_settings: 'Configurações',
    
    // Buttons
    btn_download_apk: '📱 Baixar Aplicativo (APK)',
    btn_download_desc: 'Instale a versão móvel Android premium para receber notificações celestes instantâneas!',
    btn_share_app: '🔗 Compartilhar Aplicativo',
    btn_share_web: '🌌 Compartilhar Web App',
    btn_share_apk: '📱 Compartilhar Link APK',
    btn_upgrade: 'Continuar Minha Jornada',
    btn_save: 'Salvar Configurações',
    btn_logout: 'Sair do Portal',
    btn_back: 'Voltar ao Portal',
    btn_calculate: 'Recalcular Meu Mapa',
    
    // Common text
    trial_active: 'Acesso Premium Ativo',
    user_area: 'Área do Usuário',
    welcome_title: 'Seja bem-vindo, Buscador!',
    language: 'Idioma da Plataforma',
    notif_copied_web: 'Link do Web App copiado com sucesso!',
    notif_copied_apk: 'Link de download do APK copiado com sucesso!',
    notif_copied_share: 'Link de convite do Portal copiado! Envie aos seus amigos celestes.',
    
    // Premium Blocking info text
    conversion_headline: 'ALINHAMENTO CÓSMICO PREMIUM REQUERIDO',
    conversion_sub: 'Sua assinatura mantém nossa inteligência cósmica e análises planetárias de alta precisão funcionando.',
    conversion_p1: 'Durante os últimos dias você teve acesso à nossa tecnologia avançada de interpretação astrológica personalizada em tempo real.',
    conversion_p2: 'Por trás de cada análise existe uma avançada tecnologia astrológica e de inteligência artificial que processa continuamente milhares de cálculos personalizados com base no seu mapa astral, trânsitos planetários, posições celestes, casas astrológicas, aspectos ativos, Lua, Sol, ascendente e ciclos cósmicos que influenciam sua jornada neste exato momento.',
    conversion_p3: 'Diferente de aplicativos genéricos, o Orbita não entrega interpretações padronizadas. Nossa tecnologia monitora constantemente as movimentações celestes e cruza essas informações com a sua configuração astral exclusiva, gerando orientações altamente personalizadas, alinhadas à sua frequência energética atual.',
    conversion_p4: 'Sua assinatura contribui para manter toda essa estrutura funcionando: servidores de processamento em tempo real, sistemas avançados de inteligência artificial, atualização contínua dos dados astrológicos globais e o desenvolvimento constante de novos recursos exclusivos.',
    conversion_p5: 'Ao continuar sua jornada, você mantém acesso ilimitado a uma plataforma criada para oferecer autoconhecimento, clareza, direcionamento e uma leitura cósmica profundamente personalizada, algo que nenhum mapa genérico consegue entregar.',
    conversion_p6: 'Milhares de cálculos astrológicos são processados continuamente para gerar suas previsões, análises e recomendações diárias.',
    conversion_price: 'Continue sua jornada com acesso ilimitado por apenas 8 EUR por mês.',
    conversion_card_title: 'Sua Mandala Ancestral está Pronta',
    conversion_card_desc: 'Sua configuração do Mapa Astral permanece disponível. Para acessar o Tarot, Oráculo dos Sonhos, Biorritmo, Sinastria e nossa Inteligência Artificial Orbia, sintonize sua assinatura premium.',
    
    // UI parts
    header_title: 'PORTAL ÓRBITA',
    header_sub: 'PLATAFORMA PREMIUM DE ASTROLOGIA PERSONALIZADA',
    sec_natal_chart: 'Mapa Astral Tradicional Plácidus',
    sec_natal_chart_desc: 'Posições e graus calculados via efemérides físicas de alta precisão.',
    
    // Admin / Billing Simulation
    sub_status: 'Status da Assinatura',
    sub_expires: 'Válido até',
    sub_billing_info: 'Faturamento via Stripe Subscription',
    sub_manage: 'Gerenciar Cobrança',
    sub_created_at: 'Membro desde',
    trial_remaining: 'Seu período de sintonia inicial gratuita está ativo de forma ilimitada.',
    sub_sim_pay_success: 'Acesso Premium renovado com sucesso via Stripe!'
  },
  en: {
    menu_map: 'Birth Chart',
    menu_stars: 'Constellations',
    menu_planets: 'Planets & Orbia',
    menu_tarot: 'Cosmic Tarot',
    menu_settings: 'Settings',
    
    btn_download_apk: '📱 Download Mobile App (APK)',
    btn_download_desc: 'Install the premium Android mobile version to receive instant cosmic notifications!',
    btn_share_app: '🔗 Share Portal App',
    btn_share_web: '🌌 Share Web App',
    btn_share_apk: '📱 Share APK Link',
    btn_upgrade: 'Continue My Journey',
    btn_save: 'Save Settings',
    btn_logout: 'Log Out of Portal',
    btn_back: 'Back to Portal',
    btn_calculate: 'Recalculate My Chart',
    
    trial_active: 'Premium Access Active',
    user_area: 'User Dashboard',
    welcome_title: 'Welcome, Seeker!',
    language: 'Platform Language',
    notif_copied_web: 'Web App link copied to clipboard!',
    notif_copied_apk: 'APK download link copied to clipboard!',
    notif_copied_share: 'Portal invitation link copied! Share it with your friends.',
    
    conversion_headline: 'PREMIUM COSMIC ALIGNMENT REQUIRED',
    conversion_sub: 'Your subscription keeps our high-precision celestial intelligence and planetary calculations running.',
    conversion_p1: 'During the last few days you had unlimited access to our advanced real-time personalized astrological interpretation technology.',
    conversion_p2: 'Behind each analysis lies a highly sophisticated engine of astrology and artificial intelligence that continuously processes thousands of custom calculations based on your birth chart, planetary transits, astronomical positions, active aspects, Moon, Sun, Ascendant, and cosmic cycles influencing your journey at this exact moment.',
    conversion_p3: 'Unlike generic horoscope applications, Orbita does not deliver standardized readings. Our technology constantly monitors celestial movements and intersects this data with your unique birth pattern, generating deeply personalized guidance, aligned with your current frequency.',
    conversion_p4: 'Your subscription directly supports this global infrastructure: real-time processing servers, advanced AI models, continuous updating of astronomical and geographical databases, and the constant development of new exclusive features.',
    conversion_p5: 'By continuing your journey, you retain full, unlimited access to a platform built to offer self-knowledge, absolute mental clarity, and tailored direction—something no generic chart can ever provide.',
    conversion_p6: 'Thousands of astronomical computations are calculated continuously to power your forecasts, daily recommendations, and interpretations.',
    conversion_price: 'Continue your journey with unlimited premium access for only 8 EUR per month.',
    conversion_card_title: 'Your Ancestral Mandala is Ready',
    conversion_card_desc: 'Your core Birth Chart remains accessible. To unlock Tarot, Dream Oracle, Biorhythm, Synastry, and our advanced AI Orbia, synchronize your premium subscription.',
    
    header_title: 'ORBITA PORTAL',
    header_sub: 'PREMIUM PERSONALIZED ASTROLOGY PLATFORM',
    sec_natal_chart: 'Traditional Placidus Natal Chart',
    sec_natal_chart_desc: 'Astronomical positions calculated with high-precision physical ephemerides.',
    
    sub_status: 'Subscription Status',
    sub_expires: 'Expiration Date',
    sub_billing_info: 'Billing via Stripe Subscription',
    sub_manage: 'Manage Billing',
    sub_created_at: 'Member since',
    trial_remaining: 'Your initial free synchronization is fully active with unlimited access.',
    sub_sim_pay_success: 'Premium access successfully activated via Stripe!'
  },
  es: {
    menu_map: 'Carta Astral',
    menu_stars: 'Constelaciones',
    menu_planets: 'Planetas & Orbia',
    menu_tarot: 'Tarot Cósmico',
    menu_settings: 'Configuración',
    
    btn_download_apk: '📱 Descargar Aplicación (APK)',
    btn_download_desc: '¡Instala la versión móvil premium de Android para recibir notificaciones cósmicas instantáneas!',
    btn_share_app: '🔗 Compartir Aplicación',
    btn_share_web: '🌌 Compartir Web App',
    btn_share_apk: '📱 Compartir Enlace APK',
    btn_upgrade: 'Continuar Mi Viaje',
    btn_save: 'Guardar Configuración',
    btn_logout: 'Cerrar Sesión',
    btn_back: 'Volver al Portal',
    btn_calculate: 'Recalcular Mi Carta',
    
    trial_active: 'Acceso Premium Activo',
    user_area: 'Panel del Usuario',
    welcome_title: '¡Bienvenido, Buscador!',
    language: 'Idioma de la Plataforma',
    notif_copied_web: '¡Enlace de Web App copiado al portapapeles!',
    notif_copied_apk: '¡Enlace de descarga de APK copiado al portapapeles!',
    notif_copied_share: '¡Enlace de invitación celestial copiado! Envíaselo a tus amigos.',
    
    conversion_headline: 'SE REQUIERE ALINEACIÓN CÓSMICA PREMIUM',
    conversion_sub: 'Tu suscripción mantiene en funcionamiento nuestra inteligencia cósmica de alta precisión y análisis planetarios continuos.',
    conversion_p1: 'Durante los últimos días has tenido acceso ilimitado a nuestra tecnología avanzada de interpretación astrológica personalizada en tiempo real.',
    conversion_p2: 'Detrás de cada análisis se encuentra un motor altamente sofisticado de astrología e inteligencia artificial que procesa continuamente miles de cálculos personalizados con base en tu carta natal, tránsitos planetarios, posiciones astronómicas, aspectos activos, Sol, Luna, Ascendente y ciclos cósmicos que influyen en tu camino en este preciso instante.',
    conversion_p3: 'A diferencia de las aplicaciones genéricas, Orbita no ofrece interpretaciones estandarizadas. Nuestra tecnología monitorea constantemente los movimientos celestes y los combina con tu configuración exclusiva de nacimiento, generando una guía de alta sintonía.',
    conversion_p4: 'Tu suscripción contribuye directamente a mantener toda esta infraestructura: servidores de procesamiento, modelos de IA de última generación, actualización constante de efemérides y el desarrollo ininterrumpido de nuevas herramientas.',
    conversion_p5: 'Al continuar tu viaje, aseguras el acceso ilimitado a una plataforma diseñada para dar claridad, conocimiento espiritual y dirección profunda a tu vida—algo que ningún mapa genérico puede lograr.',
    conversion_p6: 'Se procesan continuamente miles de cálculos celestes para generar tus predicciones, recomendaciones y horóscopos diarios.',
    conversion_price: 'Continúa tu viaje cósmico con acceso ilimitado por solo 8 EUR al mes.',
    conversion_card_title: 'Tu Mandala Ancestral está Listo',
    conversion_card_desc: 'Tu Carta Natal principal sigue disponible de forma gratuita. Para acceder al Tarot, Oráculo de Sueños, Biorritmo, Sinastría y nuestra Inteligencia Artificial Orbia, sincroniza tu suscripción premium.',
    
    header_title: 'PORTAL ÓRBITA',
    header_sub: 'PLATAFORMA PREMIUM DE ASTROLOGÍA PERSONALIZADA',
    sec_natal_chart: 'Carta Natal Plácidus Tradicional',
    sec_natal_chart_desc: 'Posiciones planetarias calculadas usando efemérides físicas de alta precisión.',
    
    sub_status: 'Estado de la Suscripción',
    sub_expires: 'Fecha de Expiración',
    sub_billing_info: 'Facturación mediante Stripe Subscription',
    sub_manage: 'Gestionar Facturación',
    sub_created_at: 'Miembro desde',
    trial_remaining: 'Tu sintonización inicial gratuita está activa con acceso ilimitado.',
    sub_sim_pay_success: '¡Acceso Premium activado con éxito vía Stripe!'
  },
  de: {
    menu_map: 'Geburtshoroskop',
    menu_stars: 'Konstellationen',
    menu_planets: 'Planeten & Orbia',
    menu_tarot: 'Kosmisches Tarot',
    menu_settings: 'Einstellungen',
    
    btn_download_apk: '📱 App Herunterladen (APK)',
    btn_download_desc: 'Installieren Sie die Premium-Android-Version, um sofortige kosmische Benachrichtigungen zu erhalten!',
    btn_share_app: '🔗 App Teilen',
    btn_share_web: '🌌 Web-App Teilen',
    btn_share_apk: '📱 APK-Link Teilen',
    btn_upgrade: 'Meine Reise Fortsetzen',
    btn_save: 'Einstellungen Speichern',
    btn_logout: 'Sitzung Beenden',
    btn_back: 'Zurück zum Portal',
    btn_calculate: 'Horoskop Neu Berechnen',
    
    trial_active: 'Premium-Zugang Aktiv',
    user_area: 'Benutzerbereich',
    welcome_title: 'Willkommen, Suchender!',
    language: 'Plattform-Sprache',
    notif_copied_web: 'Web-App-Link in die Zwischenablage kopiert!',
    notif_copied_apk: 'APK-Download-Link in die Zwischenablage kopiert!',
    notif_copied_share: 'Einladungslink kopiert! Senden Sie ihn an Ihre astronomischen Freunde.',
    
    conversion_headline: 'KOSMISCHE PREMIUM-AUSRICHTUNG ERFORDERLICH',
    conversion_sub: 'Ihr Abonnement sichert die kontinuierliche Berechnung unserer hochpräzisen kosmischen Daten und astronomischen Algorithmen.',
    conversion_p1: 'In den vergangenen Tagen hatten Sie uneingeschränkten Zugriff auf unsere fortschrittliche Echtzeit-Technologie zur personalisierten astrologischen Interpretation.',
    conversion_p2: 'Hinter jeder Analyse steht eine hochentwickelte Kombination aus Astrologie und künstlicher Intelligenz, die kontinuierlich Tausende von Berechnungen basierend auf Ihrem Geburtshoroskop, planetarischen Transiten, Himmelspositionen, Aspekten, Mond, Sonne, Aszendent und den Zyklen berechnet, die Ihr Leben in diesem Augenblick beeinflussen.',
    conversion_p3: 'Im Gegensatz zu Standard-Horoskopen liefert Orbita keine pauschalen Deutungen. Unsere Technologie scannt laufend die Himmelsbewegungen, gleicht sie mit Ihrem kosmischen Code ab und generiert hochgradig maßgeschneiderte Ratschläge.',
    conversion_p4: 'Ihr Jahres- oder Monatsbeitrag unterstützt den Erhalt dieser Infrastruktur direkt: Rechenleistung in Echtzeit, führende KI-Modelle, tägliche Datenbank-Updates und die Entwicklung neuer exklusiver Features.',
    conversion_p5: 'Mit der Fortsetzung Ihrer Reise sichern Sie sich dauerhaften Zugriff auf eine Plattform, die für Selbsterkenntnis, Klarheit, Orientierung und tiefe kosmische Einblicke entwickelt wurde—etwas, das kein Standard-Horoskop bieten kann.',
    conversion_p6: 'Tausende von astrologischen Berechnungen werden ununterbrochen durchgeführt, um Ihre Prognosen, Empfehlungen und Tagesradare zu berechnen.',
    conversion_price: 'Setzen Sie Ihre Reise mit unbegrenztem Premium-Zugriff für nur 8 EUR pro Monat fort.',
    conversion_card_title: 'Ihr Ahnen-Mandala ist Bereit',
    conversion_card_desc: 'Ihr grundlegendes Geburtshoroskop bleibt kostenlos verfügbar. Um Tarot, Trauorakel, Biorhythmus, Synastrie und unsere intelligente Orbia freizuschalten, aktivieren Sie Ihr Premium-Abonnement.',
    
    header_title: 'ORBITA PORTAL',
    header_sub: 'PREMIUM-PLATTFORM FÜR PERSONALISIERTE ASTROLOGIE',
    sec_natal_chart: 'Traditionelles Placidus-Geburtshoroskop',
    sec_natal_chart_desc: 'Planetenpositionen berechnet mit hochpräzisen physikalischen Ephemeriden.',
    
    sub_status: 'Abonnement-Status',
    sub_expires: 'Ablaufdatum',
    sub_billing_info: 'Abrechnung über Stripe Subscription',
    sub_manage: 'Abrechnung Verwalten',
    sub_created_at: 'Mitglied seit',
    trial_remaining: 'Ihre kostenlose Einführungsphase ist aktiv mit uneingeschränktem Zugriff.',
    sub_sim_pay_success: 'Premium-Zugang erfolgreich über Stripe freigeschaltet!'
  }
};

export function getTranslation(lang: Language, key: string, fallback?: string): string {
  const langSet = translationDict[lang] || translationDict['pt'];
  return langSet[key] || fallback || key;
}
