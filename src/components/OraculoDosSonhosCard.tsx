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

interface OraculoDosSonhosCardProps {
  newDreamDesc: string;
  setNewDreamDesc: (val: string) => void;
  isInterpretingDream: boolean;
  handleRecordAndInterpretDream: (e: React.FormEvent) => Promise<void>;
  dreamsHistory: OracleDreamEntry[];
  selectedDreamDisplay: OracleDreamEntry | null;
  setSelectedDreamDisplay: (val: OracleDreamEntry | null) => void;
}

export default function OraculoDosSonhosCard({
  newDreamDesc,
  setNewDreamDesc,
  isInterpretingDream,
  handleRecordAndInterpretDream,
  dreamsHistory,
  selectedDreamDisplay,
  setSelectedDreamDisplay
}: OraculoDosSonhosCardProps) {
  // Search state inside dreams list sidebar
  const [dreamSearch, setDreamSearch] = useState('');

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
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">🔮 Oráculo dos Sonhos</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Sintonize os segredos do seu subconsciente com a IA.</p>
            </div>
          </div>

          <form onSubmit={handleRecordAndInterpretDream} className="space-y-4 mt-4" id="dream-scribe-form">
            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Conte seu sonho em detalhes
              </label>
              <p className="text-[9px] text-slate-500 leading-normal">
                Descreva tudo o que aconteceu no sonho. Pessoas, animais, lugares, emoções, objetos, cores, números e acontecimentos importantes.
              </p>
              <textarea 
                rows={6}
                required
                placeholder="Exemplo: Sonhei que estava correndo em uma floresta escura e encontrei uma cobra dourada perto de um rio fiquei com medo vim um homem que me socorrer eu caí em uma rio fundo a cor da água era Rosa eu começava a andar sobre as águas..."
                value={newDreamDesc}
                onChange={(e) => setNewDreamDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all font-sans leading-relaxed resize-none"
                id="dream-input-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={isInterpretingDream}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-slate-100 font-sans font-extrabold text-xs uppercase tracking-widest transition duration-500 shadow-lg shadow-rose-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group-hover:scale-[1.01]"
              id="dream-submit-btn"
            >
              {isInterpretingDream ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-200" />
                  <span>Decifrando Dimensão Astral...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Revelar Significado</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Directory/Portal of Revelations sidebar */}
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805/40 flex flex-col h-[380px]" id="dream-history-sidebar">
          
          <div className="pb-3 border-b border-slate-850 flex items-center justify-between shrink-0" id="dream-history-header">
            <h4 className="text-[10.5px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              📁 Cofre de Sonhos ({dreamsHistory.length})
            </h4>
          </div>

          {/* Quick Search */}
          <div className="relative mt-3 mb-2 shrink-0" id="dream-history-search">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-600" />
            <input 
              type="text"
              placeholder="Pesquisar sonhos..."
              value={dreamSearch}
              onChange={(e) => setDreamSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-[10px] text-slate-300 placeholder:text-slate-600 focus:outline-hidden"
              id="dream-search-input"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-1" id="dream-history-list">
            {filteredDreams.length > 0 ? (
              filteredDreams.map((d) => {
                const isSelected = selectedDreamDisplay?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDreamDisplay(d)}
                    className={`w-full text-left p-3 rounded-2xl flex flex-col space-y-1.5 border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-rose-950/20 border-rose-500/30' 
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                    }`}
                    id={`dream-history-item-${d.id}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] font-mono text-slate-500">{d.date}</span>
                      {d.interpretation?.dreamEnergyType && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[7px] font-mono font-bold text-slate-400 capitalize">
                          {d.interpretation.dreamEnergyType}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1 italic font-serif leading-relaxed">
                      "{d.description}"
                    </p>
                    {d.interpretation?.mainMeaning && (
                      <span className="text-[8.5px] font-mono font-bold text-rose-455 line-clamp-1 tracking-wide">
                        🔍 Significado: {d.interpretation.mainMeaning}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-[10px] text-slate-600 font-mono">Nenhum sonho arquivado encontrado.</p>
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
              <div className="w-16 h-16 rounded-full border border-dashed border-rose-500/20 animate-spin-slow flex items-center justify-center" />
              <Moon className="w-8 h-8 text-rose-500 animate-pulse absolute top-4 left-4" />
            </div>
            
            <h4 className="text-sm font-extrabold font-mono tracking-widest text-slate-100 uppercase animate-pulse">
              Consultando o Reino de Netuno...
            </h4>
            <p className="text-xs text-slate-500 mt-2.5 max-w-xs mx-auto leading-relaxed font-sans">
              Orbia está interpretando as mensagens cifradas enviadas do seu inconsciente, conectando aos arquétipos do seu Mapa Astral. Aguarde um instante...
            </p>
          </div>
        ) : selectedDreamDisplay ? (
          
          <div className="bg-slate-900/30 p-6 rounded-[32px] border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden" id="dream-display-board">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Display Header details */}
            <div className="pb-4 border-b border-slate-800 flex justify-between items-start sm:flex-nowrap flex-wrap gap-3" id="dream-display-header">
              <div className="space-y-1">
                <span className="text-[8.5px] font-mono text-rose-400 font-bold uppercase tracking-widest block">
                  Cofre de Sonhos · Arquivado em {selectedDreamDisplay.date}
                </span>
                <h3 className="text-xs font-mono font-bold text-slate-400">
                  Relato do Scribe:
                </h3>
                <p className="text-xs text-slate-350 leading-relaxed font-serif bg-slate-950 border border-slate-850 p-3 rounded-xl italic">
                  "{selectedDreamDisplay.description}"
                </p>
              </div>
            </div>

            {/* Display Dream analysis */}
            <div className="space-y-4 animate-in fade-in duration-500" id="dream-display-content">
              
              {/* Main semantic and title interpretations */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Significance board */}
                <div className="md:col-span-8 p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-2" id="dream-meaning-pane">
                  <span className="text-[8.5px] font-mono font-bold text-rose-455 uppercase tracking-widest block">
                    🔍 Significado Primário do Sonho
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">
                    {selectedDreamDisplay.interpretation?.mainMeaning}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {selectedDreamDisplay.interpretation?.psychological}
                  </p>
                </div>

                {/* Energy index metrics card */}
                <div className="md:col-span-4 p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between items-center text-center relative overflow-hidden" id="dream-energy-card">
                  <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    ⚡ Índice de Energia
                  </span>
                  
                  {/* Circular indicator placeholder visualization */}
                  <div className="relative w-20 h-20 flex items-center justify-center my-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        className="stroke-slate-800 fill-none" 
                        strokeWidth="5" 
                      />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        className="stroke-rose-600 fill-none" 
                        strokeWidth="5" 
                        strokeDasharray={213}
                        strokeDashoffset={213 - (213 * (selectedDreamDisplay.interpretation?.dreamEnergyIndex || 50)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold font-mono text-slate-100">
                      {selectedDreamDisplay.interpretation?.dreamEnergyIndex}%
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-300 uppercase font-mono block">
                      {selectedDreamDisplay.interpretation?.dreamEnergyType}
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-550 block">Sintonizado Celestial</span>
                  </div>
                </div>

              </div>

              {/* Advice oracle block */}
              {selectedDreamDisplay.interpretation?.oracleAdvice && (
                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4" id="dream-oracle-advice">
                  <span className="text-2xl mt-1 select-none">📜</span>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">Conselho do Oráculo</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                      {selectedDreamDisplay.interpretation.oracleAdvice}
                    </p>
                  </div>
                </div>
              )}

              {/* Triad Areas of Life: Love, Finance, Professional details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="dream-triad-areas">
                
                {/* Love */}
                {selectedDreamDisplay.interpretation?.loveArea && (
                  <div className="p-4 bg-pink-950/10 border border-pink-500/10 rounded-2xl space-y-1.5" id="area-love">
                    <div className="flex items-center gap-1.5 text-pink-400">
                      <Heart className="w-3.5 h-3.5 fill-pink-400/20" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Área Amorosa</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                      {selectedDreamDisplay.interpretation.loveArea}
                    </p>
                  </div>
                )}

                {/* Financial */}
                {selectedDreamDisplay.interpretation?.financeArea && (
                  <div className="p-4 bg-emerald-950/10 border border-emerald-500/10 rounded-2xl space-y-1.5" id="area-finance">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Área Financeira</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                      {selectedDreamDisplay.interpretation.financeArea}
                    </p>
                  </div>
                )}

                {/* Professional */}
                {selectedDreamDisplay.interpretation?.careerArea && (
                  <div className="p-4 bg-indigo-950/10 border border-indigo-500/10 rounded-2xl space-y-1.5" id="area-career">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <Orbit className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Área Profissional</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                      {selectedDreamDisplay.interpretation.careerArea}
                    </p>
                  </div>
                )}

              </div>

              {/* Warnings and Opportunities: Attention, Opportunity, Protection */}
              <div className="space-y-3" id="dream-warnings-box">
                
                {/* Attention */}
                {selectedDreamDisplay.interpretation?.attention && (
                  <div className="p-4 bg-red-950/15 border border-red-500/15 rounded-2xl flex gap-3" id="attention-box">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider block">⚠️ Onde Você Deve Se Atentar</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedDreamDisplay.interpretation.attention}</p>
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {selectedDreamDisplay.interpretation?.opportunities && (
                  <div className="p-4 bg-teal-950/15 border border-teal-500/15 rounded-2xl flex gap-3" id="opportunities-box">
                    <Award className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-teal-400 uppercase tracking-wider block">🍀 Oportunidades Próximas</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedDreamDisplay.interpretation.opportunities}</p>
                    </div>
                  </div>
                )}

                {/* Protection */}
                {selectedDreamDisplay.interpretation?.protection && (
                  <div className="p-4 bg-blue-950/15 border border-blue-500/15 rounded-2xl flex gap-3" id="protection-box">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider block">🛡️ Proteção e Livramento</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{selectedDreamDisplay.interpretation.protection}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Sincronias Oráculares: Lucky numbers and favorable colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="dream-oracular-sincronias">
                
                {/* Lucky Numbers */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2">
                  <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    🔢 Números da Sorte Recomendados
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedDreamDisplay.interpretation?.luckyNumbers && selectedDreamDisplay.interpretation.luckyNumbers.map((num) => (
                      <span 
                        key={num} 
                        className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold font-mono text-rose-450 select-none shadow-md hover:border-rose-500/40 transition-colors"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Favorable Energy Colors */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2">
                  <span className="text-[8.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    🎨 Cores de Energia Sintonizadas
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedDreamDisplay.interpretation?.favorableColors && selectedDreamDisplay.interpretation.favorableColors.map((color) => {
                      const cLower = color.toLowerCase();
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-sm"
                        >
                          <span 
                            className="w-3 h-3 rounded-full border border-slate-700 block" 
                            style={{ backgroundColor: hexVal }}
                          />
                          <span className="text-[10px] font-mono font-bold text-slate-300">
                            {color}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Value adds: animals, mentioned variables & emotions */}
              <div className="space-y-4 pt-2 border-t border-slate-800" id="dream-archetypes-highlights">
                
                <h4 className="text-[9.5px] font-mono font-black text-slate-500 uppercase tracking-widest">
                  🔥 Elementos em Destaque Interpretados
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Predominant Emotion */}
                  {selectedDreamDisplay.interpretation?.predominantEmotion && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-1">
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span>🎭 Emoção Predominante:</span>
                        <span className="text-yellow-400 font-extrabold uppercase">
                          {selectedDreamDisplay.interpretation.predominantEmotion.emotion}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        {selectedDreamDisplay.interpretation.predominantEmotion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Detected Numbers if any */}
                  {selectedDreamDisplay.interpretation?.detectedNumbers && selectedDreamDisplay.interpretation.detectedNumbers.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2">
                      <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        🔢 Símbolos de Números Revelados
                      </span>
                      <div className="space-y-2">
                        {selectedDreamDisplay.interpretation.detectedNumbers.map((obj, idx) => (
                          <div key={idx} className="text-[11px] font-sans leading-relaxed">
                            <strong className="text-[10.5px] font-mono text-rose-455 block mb-0.5">Número {obj.number}:</strong>
                            <p className="text-slate-400">{obj.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Animals if any */}
                  {selectedDreamDisplay.interpretation?.detectedAnimals && selectedDreamDisplay.interpretation.detectedAnimals.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2 col-span-1 md:col-span-2">
                      <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        🦁 Arquétipos de Animais no Sonho
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedDreamDisplay.interpretation.detectedAnimals.map((obj, idx) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <strong className="text-[10.5px] font-mono text-amber-500 uppercase tracking-wider block">
                              🦊 {obj.animal}
                            </strong>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{obj.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Colors if any */}
                  {selectedDreamDisplay.interpretation?.detectedColors && selectedDreamDisplay.interpretation.detectedColors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850/80 space-y-2 col-span-1 md:col-span-2">
                      <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                        🎨 Simbolismo Estrito das Cores
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedDreamDisplay.interpretation.detectedColors.map((obj, idx) => (
                          <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                            <strong className="text-[10.5px] font-mono text-purple-400 uppercase tracking-wider block">
                              🖌️ {obj.color}
                            </strong>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{obj.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Universe mystical message section at the bottom */}
              {selectedDreamDisplay.interpretation?.universeMessage && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-inner space-y-2 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 blur-xl pointer-events-none" />
                  <span className="text-[8.5px] font-mono font-black text-indigo-400 uppercase tracking-widest block">
                    🌌 Mensagem do Universo
                  </span>
                  <p className="text-xs sm:text-[13px] leading-relaxed italic text-indigo-200 font-serif max-w-xl mx-auto">
                    "{selectedDreamDisplay.interpretation.universeMessage}"
                  </p>
                </div>
              )}

            </div>

          </div>

        ) : (
          /* If history is empty and nothing is selected */
          <div className="bg-slate-900/10 border border-dashed border-slate-800 rounded-[32px] p-12 text-center flex flex-col items-center justify-center min-h-[500px]" id="dream-empty-landing">
            <Moon className="w-12 h-12 text-slate-700 animate-pulse mb-4" />
            <h4 className="text-sm font-bold font-mono tracking-widest text-slate-500 uppercase">Aguardando seu Sonho</h4>
            <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
              Digite os acontecimentos do seu sonho no campo ao lado e clique em Revelar Significado para consultar o Oráculo Celestial.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
