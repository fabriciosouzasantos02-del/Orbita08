import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { ChatMessage, DailyOracleResponse } from '../types';
import { Language } from '../lib/translations';

const LOCAL_ORACLE_TRANSLATIONS: Record<Language, Record<string, string>> = {
  pt: {
    "Orbia: Conselheira Pessoal Live": "Orbia: Conselheira Pessoal Live",
    "Inteligência Astrológica treinada com seu mapa.": "Inteligência Astrológica treinada com seu mapa.",
    "Você": "Você",
    "Pergunte sobre amor, emprego, mapa...": "Pergunte sobre amor, emprego, mapa...",
    "Oráculo do Dia": "Oráculo do Dia",
    "Limite de uma resposta profunda por dia.": "Limite de uma resposta profunda por dia.",
    "Consumido de hoje": "Consumido de hoje",
    "Disponível": "Disponível",
    "Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.": "Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.",
    "e.g. Devo focar em mudar de carreira este Semestre?": "e.g. Devo focar em mudar de carreira este Semestre?",
    "Consultando Sabedorias...": "Consultando Sabedorias...",
    "Evocar Conselho do Oráculo": "Evocar Conselho do Oráculo",
    "Reflexão Metafísica": "Reflexão Metafísica",
    "Incentivo de Sintonia": "Incentivo de Sintonia",
    "Conselho Ativo:": "Conselho Ativo:",
    "Fechar Oráculo de Hoje": "Fechar Oráculo de Hoje"
  },
  en: {
    "Orbia: Conselheira Pessoal Live": "Orbia: Personal Live Advisor",
    "Inteligência Astrológica treinada com seu mapa.": "Astrological Intelligence trained with your chart.",
    "Você": "You",
    "Pergunte sobre amor, emprego, mapa...": "Ask about love, job, chart...",
    "Oráculo do Dia": "Daily Oracle",
    "Limite de uma resposta profunda por dia.": "Limit of one deep answer per day.",
    "Consumido de hoje": "Used today",
    "Disponível": "Available",
    "Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.": "Attune your mind. What crucial doubt weighs on your energy today? Ask a question to receive deep astrological reflection.",
    "e.g. Devo focar em mudar de carreira este Semestre?": "e.g. Should I focus on changing careers this semester?",
    "Consultando Sabedorias...": "Consulting Wisdom...",
    "Evocar Conselho do Oráculo": "Evoke Oracle's Counsel",
    "Reflexão Metafísica": "Metaphysical Reflection",
    "Incentivo de Sintonia": "Alignment Encouragement",
    "Conselho Ativo:": "Active Counsel:",
    "Fechar Oráculo de Hoje": "Close Today's Oracle"
  },
  es: {
    "Orbia: Conselheira Pessoal Live": "Orbia: Consejera Personal en Vivo",
    "Inteligência Astrológica treinada com seu mapa.": "Inteligencia Astrológica entrenada con tu carta.",
    "Você": "Tú",
    "Pergunte sobre amor, emprego, mapa...": "Pregunta sobre amor, empleo, carta...",
    "Oráculo do Dia": "Oráculo del Día",
    "Limite de uma resposta profunda por dia.": "Límite de una resposta profunda por día.",
    "Consumido de hoje": "Consumido hoy",
    "Disponível": "Disponible",
    "Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.": "Sintoniza tu mente. ¿Qué duda crucial pesa sobre tu energía hoy? Haz una pregunta libre para recibir una profunda reflexión astrológica.",
    "e.g. Devo focar em mudar de carreira este Semestre?": "p. ej. ¿Debería enfocarme en cambiar de carrera este semestre?",
    "Consultando Sabedorias...": "Consultando Sabidurías...",
    "Evocar Conselho do Oráculo": "Evocar Consejo del Oráculo",
    "Reflexão Metafísica": "Reflexión Metafísica",
    "Incentivo de Sintonia": "Incentivo de Sintonía",
    "Conselho Ativo:": "Consejo Activo:",
    "Fechar Oráculo de Hoje": "Cerrar Oráculo de Hoy"
  },
  de: {
    "Orbia: Conselheira Pessoal Live": "Orbia: Persönliche Live-Beraterin",
    "Inteligência Astrológica treinada com seu mapa.": "Astrologische Intelligenz trainiert mit Ihrem Horoskop.",
    "Você": "Du",
    "Pergunte sobre amor, emprego, mapa...": "Fragen Sie nach Liebe, Beruf, Horoskop...",
    "Oráculo do Dia": "Tagesorakel",
    "Limite de uma resposta profunda por dia.": "Limit von einer tiefgehenden Antwort pro Tag.",
    "Consumido de hoje": "Heute aufgebraucht",
    "Disponível": "Verfügbar",
    "Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.": "Stimmen Sie Ihren Geist ein. Welcher entscheidende Zweifel lastet heute auf Ihrer Energie? Stellen Sie eine freie Frage, um eine tiefgehende astrologische Reflexion zu erhalten.",
    "e.g. Devo focar em mudar de carreira este Semestre?": "z. B. Sollte ich mich in diesem Semester auf einen Karrierewechsel konzentrieren?",
    "Consultando Sabedorias...": "Weisheiten werden konsultiert...",
    "Evocar Conselho do Oráculo": "Orakelrat beschwören",
    "Reflexão Metafísica": "Metaphysische Reflexion",
    "Incentivo de Sintonia": "Einstimmungsanreiz",
    "Conselho Ativo:": "Aktiver Rat:",
    "Fechar Oráculo de Hoje": "Heutiges Orakel schließen"
  },
  fr: {
    "Orbia: Conselheira Pessoal Live": "Orbia : Conseillère Personnelle en Direct",
    "Inteligência Astrológica treinada com seu mapa.": "Intelligence Astrologique entraînée avec votre carte du ciel.",
    "Você": "Vous",
    "Pergunte sobre amor, emprego, mapa...": "Posez des questions sur l'amour, l'emploi, la carte...",
    "Oráculo do Dia": "Oracle du Jour",
    "Limite de uma resposta profunda por dia.": "Limite d'une réponse profonde par jour.",
    "Consumido de hoje": "Utilisé aujourd'hui",
    "Disponível": "Disponible",
    "Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.": "Accordez votre esprit. Quel doute crucial pèse sur votre énergie aujourd'hui ? Posez une question libre pour recevoir une réflexion astrologique profonde.",
    "e.g. Devo focar em mudar de carreira este Semestre?": "ex. Dois-je me concentrer sur un changement de carrière ce semestre ?",
    "Consultando Sabedorias...": "Consultation des Sagesses...",
    "Evocar Conselho do Oráculo": "Évoquer le Conseil de l'Oracle",
    "Reflexão Metafísica": "Réflexion Métaphysique",
    "Incentivo de Sintonia": "Encouragement d'Harmonisation",
    "Conselho Ativo:": "Conseil Actif :",
    "Fechar Oráculo de Hoje": "Fermer l'Oracle d'Aujourd'hui"
  }
};

interface OrbiaAIAndOracleProps {
  chatMessages: ChatMessage[];
  currentChatInput: string;
  setCurrentChatInput: (val: string) => void;
  isSendingChat: boolean;
  handleSendChatMessage: (e: React.FormEvent) => Promise<void>;
  
  hasQueriedOracleToday: boolean;
  oracleQuestion: string;
  setOracleQuestion: (val: string) => void;
  oracleResponse: DailyOracleResponse | null;
  setOracleResponse: (val: DailyOracleResponse | null) => void;
  isQueryingOracle: boolean;
  handleAskOracle: (e: React.FormEvent) => Promise<void>;
  lang?: string;
}

export default function OrbiaAIAndOracle({
  chatMessages,
  currentChatInput,
  setCurrentChatInput,
  isSendingChat,
  handleSendChatMessage,
  hasQueriedOracleToday,
  oracleQuestion,
  setOracleQuestion,
  oracleResponse,
  setOracleResponse,
  isQueryingOracle,
  handleAskOracle,
  lang
}: OrbiaAIAndOracleProps) {
  const { t: i18nT } = useTranslation();
  const t = (text: string) => {
    if (!text) return "";
    const activeLang: Language = (lang as Language) || 'pt';
    const localDict = LOCAL_ORACLE_TRANSLATIONS[activeLang];
    if (localDict && localDict[text]) {
      return localDict[text];
    }
    return i18nT(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="orbia-oracle-grid">
      {/* Orbia AI Chat client */}
      <div className="lg:col-span-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[520px]" id="orbia-chat-container">
        <div className="space-y-1 pb-3 border-b border-slate-850 shrink-0" id="orbia-header">
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-200 tracking-wide flex items-center gap-2" id="orbia-title">
            <span className="w-2.5 h-2.5 bg-rose-450 rounded-full animate-ping shrink-0" />
            <span>{t("Orbia: Conselheira Pessoal Live")}</span>
          </h3>
          <p className="text-sm text-slate-400 leading-normal">{t("Inteligência Astrológica treinada com seu mapa.")}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 max-h-[340px] my-2" id="chat-messages-scroll">
          {chatMessages.map((msg) => (
            <div 
               key={msg.id} 
              className={`flex flex-col max-w-[90%] sm:max-w-[85%] space-y-1 ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
              id={`chat-msg-${msg.id}`}
            >
              <div className={`p-4 rounded-2xl text-base leading-relaxed font-sans [overflow-wrap:anywhere] break-words ${
                msg.sender === 'user' 
                  ? 'bg-rose-600 text-slate-100 rounded-tr-none' 
                  : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
              }`} id={`chat-bubble-${msg.id}`}>
                {msg.text}
              </div>
              <span className="text-sm font-mono text-slate-500 tracking-wider">
                {msg.sender === 'user' ? t('Você') : 'Orbia'} · {msg.timestamp}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-850 shrink-0" id="chat-input-form">
          <input 
            type="text" 
            required
            placeholder={t("Pergunte sobre amor, emprego, mapa...")}
            value={currentChatInput}
            onChange={(e) => setCurrentChatInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-base text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500/50"
            id="chat-input-field"
          />
          <button 
            type="submit"
            disabled={isSendingChat}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-slate-100 font-medium text-base rounded-xl transition flex items-center justify-center cursor-pointer shrink-0"
            id="chat-send-btn"
          >
            {isSendingChat ? "..." : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Oráculo do Dia Component (Limit 1 consult matching PDF) */}
      <div className="lg:col-span-6 bg-slate-900/40 p-6 rounded-3xl border border-rose-500/15 space-y-5 min-h-[520px] flex flex-col justify-between" id="daily-oracle-container">
        <div className="pb-3 border-b border-slate-850 flex justify-between items-start gap-2" id="oracle-header">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-200 tracking-wide">{t("Oráculo do Dia")}</h3>
            <p className="text-sm text-slate-400 mt-1 leading-normal">{t("Limite de uma resposta profunda por dia.")}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-sm font-mono text-amber-400 font-medium whitespace-normal text-center shrink-0" id="oracle-status-badge">
            {hasQueriedOracleToday ? t("Consumido de hoje") : t("Disponível")}
          </span>
        </div>

        {!oracleResponse ? (
          <form onSubmit={handleAskOracle} className="space-y-4 pt-1 flex-1 flex flex-col justify-between" id="oracle-query-form">
            <p className="text-base text-slate-300 leading-relaxed font-sans [overflow-wrap:anywhere] break-words max-w-[65ch]">
              {t("Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.")}
            </p>
            <div className="space-y-4">
              <input 
                type="text" 
                required
                disabled={hasQueriedOracleToday}
                placeholder={t("e.g. Devo focar em mudar de carreira este Semestre?")}
                value={oracleQuestion}
                onChange={(e) => setOracleQuestion(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-850 text-base text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500/50"
                id="oracle-question-input"
              />

              <button 
                type="submit"
                disabled={isQueryingOracle || hasQueriedOracleToday}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:bg-slate-900 disabled:from-transparent disabled:to-transparent disabled:text-slate-600 text-slate-950 font-medium text-base transition border border-amber-500/30 cursor-pointer whitespace-normal"
                id="oracle-submit-btn"
              >
                {isQueryingOracle ? t("Consultando Sabedorias...") : t("Evocar Conselho do Oráculo")}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-300 flex-1 flex flex-col justify-between" id="oracle-response-block">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4 font-sans [overflow-wrap:anywhere] break-words" id="oracle-response-card">
              <div className="space-y-1.5">
                <span className="text-sm font-mono uppercase text-slate-400 font-semibold block">{t("Reflexão Metafísica")}</span>
                <p className="text-base text-slate-200 leading-relaxed italic font-serif max-w-[65ch]">"{oracleResponse.reflection}"</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <span className="text-sm font-mono uppercase text-amber-400 font-semibold block">{t("Incentivo de Sintonia")}</span>
                <p className="text-base text-slate-300 leading-relaxed font-medium max-w-[65ch]">{oracleResponse.inspiringMessage}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-base text-slate-200 leading-relaxed max-w-[65ch]" id="oracle-counsel-box">
                <strong className="text-amber-300">{t("Conselho Ativo:")}</strong> {oracleResponse.counsel}
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setOracleResponse(null)}
              className="text-base text-slate-400 hover:text-slate-200 font-mono underline py-2 cursor-pointer transition"
              id="oracle-close-btn"
            >
              {t("Fechar Oráculo de Hoje")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
