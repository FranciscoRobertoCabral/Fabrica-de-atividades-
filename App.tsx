
import React, { useState, useEffect } from 'react';
import { generateActivities, suggestActivityNames } from './services/gemini';
import { createActivityPDF } from './services/pdf';
import { ActivityConfig, Level, ActivityType } from './types';

const Header = () => (
  <header className="text-center py-12 px-4">
    <div className="inline-block bg-blue-100 text-blue-700 px-5 py-1.5 rounded-full text-xs font-black mb-4 tracking-widest uppercase shadow-sm">
      Inteligência Artificial Pedagógica
    </div>
    <h1 className="text-6xl font-black text-blue-600 mb-3 tracking-tight">
      Fábrica de <span className="text-amber-500">Atividades</span>
    </h1>
    <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
      Personalize o aprendizado dos seus pequenos com cadernos únicos e ilustrados.
    </p>
  </header>
);

export default function App() {
  const [config, setConfig] = useState<ActivityConfig>({
    level: 'Educação Infantil',
    type: 'Alfabetização',
    theme: '',
    pages: 3,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [showNameSelector, setShowNameSelector] = useState(false);
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  const levels: Level[] = ['Educação Infantil', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];
  const types: ActivityType[] = [
    'Alfabetização', 'Matemática', 'Coordenação motora', 
    'Cores e formas', 'Leitura e interpretação', 'Jogos pedagógicos'
  ];

  const themeOptions = [
    { value: '', label: 'Selecione um tema...', emoji: '🔍' },
    { value: 'Animais', label: 'Animais', emoji: '🐶' },
    { value: 'Cores', label: 'Cores', emoji: '🎨' },
    { value: 'Estações do Ano', label: 'Estações do Ano', emoji: '🍂' },
    { value: 'Meio Ambiente', label: 'Meio Ambiente', emoji: '🌿' },
    { value: 'Espaço Sideral', label: 'Espaço Sideral', emoji: '🚀' },
    { value: 'custom', label: '✍️ Outro (Digitar tema...)', emoji: '✏️' }
  ];

  const handleSuggestNames = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.theme.trim()) {
      setError("Por favor, selecione ou digite um tema.");
      return;
    }

    setIsLoading(true);
    setLoadingMsg('Consultando a criatividade da IA...');
    setError(null);

    try {
      const names = await suggestActivityNames(config);
      setSuggestedNames(names);
      setShowNameSelector(true);
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('name-options-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Ops! Algo deu errado ao sugerir nomes. Tente de novo.");
      setIsLoading(false);
    }
  };

  const handleSelectName = async (name: string) => {
    setIsLoading(true);
    setShowNameSelector(false);
    setError(null);

    try {
      const pack = await generateActivities(config, name, (msg) => setLoadingMsg(msg));
      createActivityPDF(pack, config);
      setIsLoading(false);
      setSuggestedNames([]);
    } catch (err) {
      setError("Erro ao gerar as atividades. Tente novamente.");
      setIsLoading(false);
    }
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setError(null);
    if (val === 'custom') {
      setIsCustomTheme(true);
      setConfig({ ...config, theme: '' });
    } else {
      setIsCustomTheme(false);
      setConfig({ ...config, theme: val });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-24 bg-[#f0f4f8]">
      <Header />

      <main className="w-full max-w-3xl px-6">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-blue-900/10 border-4 border-white p-8 md:p-14 relative overflow-hidden transition-all duration-500">
          
          {/* Seleção de Nomes Sugeridos */}
          {showNameSelector && !isLoading && (
            <div id="name-options-container" className="mb-12 p-8 bg-gradient-to-br from-blue-50 to-white rounded-[2.5rem] border-2 border-blue-100 shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <span className="text-4xl mb-2 block">🌟</span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Escolha o melhor título:</h3>
                <p className="text-slate-500 font-medium">Nossa IA sugeriu estas 5 opções para você:</p>
              </div>
              
              <div className="flex flex-col gap-3">
                {suggestedNames.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectName(name)}
                    className="group flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all text-left shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                      <span className="text-slate-700 font-black text-lg leading-tight">{name}</span>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 font-bold text-xs">USAR ESTE ✨</span>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowNameSelector(false)}
                className="w-full mt-8 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-blue-500 transition-colors"
              >
                ← Voltar e ajustar opções
              </button>
            </div>
          )}

          <form onSubmit={handleSuggestNames} className={`space-y-12 transition-all duration-700 ${showNameSelector ? 'opacity-20 pointer-events-none scale-95 blur-sm' : 'opacity-100'}`}>
            
            {/* Passo 1: Nível */}
            <section>
              <label className="block text-xl font-black text-slate-800 mb-6 flex items-center gap-4">
                <span className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-blue-200">1</span>
                Nível Escolar
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {levels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setConfig({ ...config, level: l })}
                    className={`py-4 px-4 rounded-2xl border-2 transition-all duration-300 font-bold text-sm ${
                      config.level === l 
                        ? 'border-blue-500 bg-blue-600 text-white shadow-xl' 
                        : 'border-slate-50 bg-slate-50 text-slate-500 hover:bg-white hover:border-blue-200 shadow-sm'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </section>

            {/* Passo 2: Tipo */}
            <section>
              <label className="block text-xl font-black text-slate-800 mb-6 flex items-center gap-4">
                <span className="bg-amber-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-amber-200">2</span>
                Objetivo Pedagógico
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setConfig({ ...config, type: t })}
                    className={`py-4 px-6 rounded-2xl border-2 transition-all duration-300 text-left font-bold text-sm ${
                      config.type === t 
                        ? 'border-amber-400 bg-amber-400 text-white shadow-xl' 
                        : 'border-slate-50 bg-slate-50 text-slate-500 hover:bg-white hover:border-amber-200 shadow-sm'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            {/* Passo 3: Tema (COM COMBO BOX / DROPDOWN) */}
            <section className="relative">
              <label htmlFor="theme-select" className="block text-xl font-black text-slate-800 mb-6 flex items-center gap-4">
                <span className="bg-green-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-green-200">3</span>
                Qual será o tema?
              </label>
              
              <div className="space-y-4">
                <div className="relative group">
                  <select
                    id="theme-select"
                    onChange={handleThemeChange}
                    className={`w-full px-8 py-6 rounded-[2rem] border-4 outline-none transition-all text-xl bg-slate-50 focus:bg-white font-black shadow-inner appearance-none cursor-pointer ${
                      error ? 'border-red-300' : 'border-slate-50 focus:border-blue-500'
                    }`}
                  >
                    {themeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.emoji} &nbsp; {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:rotate-180 transition-transform">
                    ▼
                  </div>
                </div>

                {isCustomTheme && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <input
                      id="theme"
                      type="text"
                      autoFocus
                      placeholder="Digite o tema desejado..."
                      value={config.theme}
                      onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                      className={`w-full px-8 py-6 rounded-[2rem] border-4 outline-none transition-all text-xl bg-white placeholder:text-slate-300 font-black shadow-md ${
                        error ? 'border-red-300 ring-4 ring-red-50' : 'border-blue-200 focus:border-blue-500'
                      }`}
                    />
                  </div>
                )}
              </div>
              
              {error && (
                <p className="mt-4 text-red-500 font-black text-sm animate-bounce flex items-center gap-2 pl-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              )}
            </section>

            {/* Passo 4: Páginas */}
            <section>
              <label className="block text-xl font-black text-slate-800 mb-6 flex items-center gap-4">
                <span className="bg-purple-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-purple-200">4</span>
                Número de Atividades
              </label>
              <div className="flex gap-4">
                {[3, 5, 10].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setConfig({ ...config, pages: p })}
                    className={`flex-1 py-5 rounded-2xl border-2 transition-all duration-300 font-black text-2xl ${
                      config.pages === p 
                        ? 'border-purple-500 bg-purple-600 text-white shadow-xl' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:bg-white shadow-sm'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all duration-500 transform ${
                isLoading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed scale-95' 
                  : 'bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white hover:scale-[1.02] active:scale-95 shadow-blue-300/50'
              }`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{loadingMsg}</span>
                  </div>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-4">
                  Gerar atividade em PDF
                </span>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="mt-20 py-12 w-full text-center border-t border-slate-200">
        <p className="text-slate-400 text-xs font-black tracking-[0.3em] uppercase mb-2">Fábrica de Atividades v3.0</p>
        <p className="text-slate-300 text-[10px] font-bold">Tecnologia Gemini AI aplicada à Educação Infantil</p>
      </footer>
    </div>
  );
}
