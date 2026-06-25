import React, { useState, useRef, useEffect } from "react";
import { Send, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, translations } from "../translations";
import { UserProfile, NatalChartData, Message, Assistant } from "../types";

interface AiAssistantTabProps {
  userProfile: UserProfile;
  natalChart: NatalChartData;
  lang: Language;
}

// Roles e descrições dos assistentes por idioma
const assistantData: Record<Language, { roles: string[]; descriptions: string[]; chooseLabel: string; howItWorksTitle: string; howItWorksBody: string; typingLabel: string; inputPlaceholder: (name: string) => string }> = {
  pt: {
    roles: ["Mentor Astrológico", "Sábio da Numerossofia", "Tecelã da Noite", "Guia dos Arcanos"],
    descriptions: [
      "Especialista em trânsitos celestes, mapas natais complexos e caminhos do Sol nas Casas astrológicas.",
      "Resolve mistérios com a grade de Pitágoras, vetores do Caminho de Vida e destino matemático de nomes.",
      "Navegadora de símbolos Jungianos. Desmistifica pesadelos complexos e treina lucidez nos sonhos.",
      "Canalizador das virtudes do Tarot. Ensina lições sobre escolhas cruciais através das polaridades das cartas."
    ],
    chooseLabel: "Escolha seu Mentor",
    howItWorksTitle: "Como funciona?",
    howItWorksBody: "Eles têm pleno discernimento do seu mapa natal de nascimento e data cósmica. Pergunte sem restrições em português, inglês, espanhol ou alemão!",
    typingLabel: "Sintonizando mentes cósmicas...",
    inputPlaceholder: (name) => `Fale com ${name}...`,
  },
  en: {
    roles: ["Astrological Mentor", "Sage of Numerosophy", "Weaver of the Night", "Guide of the Arcana"],
    descriptions: [
      "Specialist in celestial transits, complex natal charts and the Sun's paths through the astrological Houses.",
      "Unravels mysteries with Pythagoras' grid, Life Path vectors and the mathematical destiny of names.",
      "Navigator of Jungian symbols. Demystifies complex nightmares and trains lucid dreaming.",
      "Channeler of Tarot virtues. Teaches lessons on crucial choices through the polarities of cards."
    ],
    chooseLabel: "Choose your Guide",
    howItWorksTitle: "How does it work?",
    howItWorksBody: "They have full insight into your natal birth chart and cosmic date. Ask freely in English, Portuguese, Spanish or German!",
    typingLabel: "Tuning cosmic minds...",
    inputPlaceholder: (name) => `Talk to ${name}...`,
  },
  de: {
    roles: ["Astrologischer Mentor", "Weiser der Numerosophie", "Weberin der Nacht", "Führer der Arkana"],
    descriptions: [
      "Spezialist für Himmelspassagen, komplexe Geburtshoroskope und die Sonnenwege durch die astrologischen Häuser.",
      "Löst Geheimnisse mit dem Gitter des Pythagoras, Lebenswegvektoren und dem mathematischen Schicksal von Namen.",
      "Navigatorin jungianischer Symbole. Entmystifiziert komplexe Albträume und trainiert luzides Träumen.",
      "Kanal der Tarot-Tugenden. Lehrt Lektionen über entscheidende Entscheidungen durch die Polaritäten der Karten."
    ],
    chooseLabel: "Wähle deinen Mentor",
    howItWorksTitle: "Wie funktioniert es?",
    howItWorksBody: "Sie kennen deinen Geburtshoroskop und dein kosmisches Datum vollständig. Frag ohne Einschränkungen auf Deutsch, Englisch, Portugiesisch oder Spanisch!",
    typingLabel: "Kosmische Gedanken abstimmen...",
    inputPlaceholder: (name) => `Sprich mit ${name}...`,
  },
  es: {
    roles: ["Mentor Astrológico", "Sabio de la Numerosofía", "Tejedora de la Noche", "Guía de los Arcanos"],
    descriptions: [
      "Especialista en tránsitos celestiales, mapas natales complejos y los caminos del Sol en las Casas astrológicas.",
      "Resuelve misterios con la cuadrícula de Pitágoras, vectores del Camino de Vida y el destino matemático de los nombres.",
      "Navegadora de símbolos Jungianos. Desmitifica pesadillas complejas y entrena la lucidez en los sueños.",
      "Canalizador de las virtudes del Tarot. Enseña lecciones sobre elecciones cruciales a través de las polaridades de las cartas."
    ],
    chooseLabel: "Elige tu Mentor",
    howItWorksTitle: "¿Cómo funciona?",
    howItWorksBody: "Tienen pleno discernimiento de tu carta natal de nacimiento y fecha cósmica. ¡Pregunta sin restricciones en español, inglés, portugués o alemán!",
    typingLabel: "Sintonizando mentes cósmicas...",
    inputPlaceholder: (name) => `Habla con ${name}...`,
  },
};

// Mensagens iniciais por idioma
const initMessages: Record<Language, (name: string, city: string) => Record<string, string>> = {
  pt: (name, city) => ({
    astro_mentor: `Saudações, ${name}. Sob o teto estelar de ${city}, cada curva do seu trajeto kármico foi desenhada. Como posso guiar seus trânsitos e Sol hoje?`,
    numerosophist: "A matemática é o tear silencioso da criação! Diga-me, quer calcular as matrizes do seu nome completo ou decifrar os segredos de um número que te persegue?",
    dream_analyst: "As visões noturnas são correspondências secretas do seu eu superior. Que símbolos ou sentimentos intrigaram você durante o descanso profundo hoje?",
    tarot_guide: "As polaridades das cartas revelam os espelhos de sua mente profunda. Qual questão crucial de vida ou de carreira colocaremos sobre a mesa hoje?"
  }),
  en: (name, city) => ({
    astro_mentor: `Greetings, ${name}. Under the stellar canopy of ${city}, every curve of your karmic path was drawn. How can I guide your transits and Sun today?`,
    numerosophist: "Mathematics is the silent loom of creation! Tell me, shall we calculate the matrices of your full name or decipher the secrets of a number that haunts you?",
    dream_analyst: "Nocturnal visions are secret correspondences from your higher self. What symbols or feelings intrigued you during deep rest today?",
    tarot_guide: "The polarities of the cards reveal the mirrors of your deep mind. What crucial life or career question shall we place on the table today?"
  }),
  de: (name, city) => ({
    astro_mentor: `Grüße, ${name}. Unter dem Sternenzelt von ${city} wurde jede Kurve deines karmischen Weges gezeichnet. Wie kann ich deine Transite und deine Sonne heute leiten?`,
    numerosophist: "Mathematik ist der stille Webstuhl der Schöpfung! Sag mir, sollen wir die Matrizen deines vollständigen Namens berechnen oder die Geheimnisse einer dich verfolgenden Zahl entschlüsseln?",
    dream_analyst: "Nächtliche Visionen sind geheime Botschaften deines höheren Ichs. Welche Symbole oder Gefühle haben dich heute während der Tiefenruhe fasziniert?",
    tarot_guide: "Die Polaritäten der Karten enthüllen die Spiegel deines tiefen Geistes. Welche entscheidende Lebens- oder Karrierefrage legen wir heute auf den Tisch?"
  }),
  es: (name, city) => ({
    astro_mentor: `Saludos, ${name}. Bajo el techo estelar de ${city}, cada curva de tu trayecto kármico fue trazada. ¿Cómo puedo guiar tus tránsitos y Sol hoy?`,
    numerosophist: "¡Las matemáticas son el telar silencioso de la creación! Dime, ¿quieres calcular las matrices de tu nombre completo o descifrar los secretos de un número que te persigue?",
    dream_analyst: "Las visiones nocturnas son correspondencias secretas de tu yo superior. ¿Qué símbolos o sentimientos te intrigaron durante el descanso profundo hoy?",
    tarot_guide: "Las polaridades de las cartas revelan los espejos de tu mente profunda. ¿Qué cuestión crucial de vida o carrera pondremos sobre la mesa hoy?"
  }),
};

export default function AiAssistantTab({ userProfile, natalChart, lang }: AiAssistantTabProps) {
  const ui = assistantData[lang] || assistantData['pt'];
  const t = translations[lang];

  const assistants: Assistant[] = [
    { id: "astro_mentor",     name: "Alistair", role: ui.roles[0], avatar: "🔮", description: ui.descriptions[0] },
    { id: "numerosophist",    name: "Pytha",    role: ui.roles[1], avatar: "📐", description: ui.descriptions[1] },
    { id: "dream_analyst",    name: "Oneiria",  role: ui.roles[2], avatar: "🌙", description: ui.descriptions[2] },
    { id: "tarot_guide",      name: "Arcanum",  role: ui.roles[3], avatar: "🃏", description: ui.descriptions[3] },
  ];

  const userName = userProfile.name;
  const birthCity = userProfile.birthDetails?.birthCity || "";
  const initMsgs = initMessages[lang] ? initMessages[lang](userName, birthCity) : initMessages['pt'](userName, birthCity);

  const [activeAssistant, setActiveAssistant] = useState<string>("astro_mentor");
  const [messagesByAssistant, setMessagesByAssistant] = useState<Record<string, Message[]>>({
    astro_mentor:   [{ id: "init_1", role: "assistant", content: initMsgs.astro_mentor,   timestamp: new Date().toLocaleTimeString() }],
    numerosophist:  [{ id: "init_2", role: "assistant", content: initMsgs.numerosophist,  timestamp: new Date().toLocaleTimeString() }],
    dream_analyst:  [{ id: "init_3", role: "assistant", content: initMsgs.dream_analyst,  timestamp: new Date().toLocaleTimeString() }],
    tarot_guide:    [{ id: "init_4", role: "assistant", content: initMsgs.tarot_guide,    timestamp: new Date().toLocaleTimeString() }],
  });

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByAssistant, activeAssistant]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue("");

    const currentHistory = messagesByAssistant[activeAssistant] || [];
    const newUserMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...currentHistory, newUserMessage];
    setMessagesByAssistant({ ...messagesByAssistant, [activeAssistant]: updatedHistory });
    setLoading(true);

    try {
      const response = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistant,
          messages: updatedHistory,
          userProfile,
          chartData: natalChart,
          lang
        }),
      });
      const data = await response.json();

      const newAssistantMessage: Message = {
        id: `msg_asst_${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessagesByAssistant(prev => ({
        ...prev,
        [activeAssistant]: [...(prev[activeAssistant] || []), newAssistantMessage]
      }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedAssistantObj = assistants.find(a => a.id === activeAssistant)!;
  const currentMessages = messagesByAssistant[activeAssistant] || [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-display font-semibold text-neutral-900">{t.aiAssistant}</h2>
        <p className="text-neutral-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          {ui.howItWorksBody}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Left Side: Guide selectors */}
        <section className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-sm md:col-span-4 space-y-3">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block px-1.5 border-b border-neutral-50 pb-2">
            {ui.chooseLabel}
          </span>

          <div className="space-y-2">
            {assistants.map((asst) => (
              <button
                key={asst.id}
                onClick={() => setActiveAssistant(asst.id)}
                className={`w-full text-left p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  activeAssistant === asst.id
                    ? "bg-indigo-50/45 border-indigo-200 ring-1 ring-indigo-200/50"
                    : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50"
                }`}
              >
                <div className="text-2xl p-1.5 bg-neutral-50/50 rounded-lg select-all border border-neutral-100">
                  {asst.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-xs sm:text-sm">{asst.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-bold block">{asst.role}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 mt-4">
            <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed">
              <strong>{ui.howItWorksTitle}</strong> {ui.howItWorksBody}
            </p>
          </div>
        </section>

        {/* Right Side: Chat */}
        <section className="bg-white border border-neutral-200/90 rounded-2xl shadow-sm md:col-span-8 flex flex-col justify-between h-[520px] overflow-hidden">

          {/* Header */}
          <div className="p-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedAssistantObj.avatar}</span>
              <div>
                <span className="font-bold text-neutral-800 text-xs sm:text-sm leading-none block">
                  {selectedAssistantObj.name}
                </span>
                <span className="text-[10px] text-indigo-700 font-bold">
                  {selectedAssistantObj.role}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-neutral-400 font-semibold max-w-xs text-right hidden sm:block truncate">
              {selectedAssistantObj.description}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/25">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm relative space-y-1 shadow-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-neutral-900 text-white rounded-tr-none"
                    : "bg-white border border-neutral-150 text-neutral-800 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className={`block text-[9px] text-right ${msg.role === "user" ? "text-slate-300" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-neutral-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-neutral-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>{ui.typingLabel}</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-neutral-50 border-t border-neutral-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={ui.inputPlaceholder(selectedAssistantObj.name)}
              className="flex-1 px-4 py-2.5 bg-white border border-neutral-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 placeholder-neutral-400 font-sans transition"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2.5 bg-neutral-900 hover:bg-neutral-805 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </section>
      </div>
    </div>
  );
}
