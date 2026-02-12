
import React, { useState } from 'react';
import { generateActivities } from './services/gemini';
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
      Gere atividades pedagógicas prontas para imprimir em segundos.
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.theme.trim()) {
      setError("Por favor, selecione ou digite um tema.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMsg('Iniciando fábrica...');

    try {
      const pack = await generateActivities(config, (msg) => setLoadingMsg(msg));
      createActivityPDF(pack, config);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Ops! Algo deu errado. Verifique sua conexão e tente novamente.");
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
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-blue-900/10 border-4 border-white p-8 md:p-14 relative overflow-hidden">
          
          <form onSubmit={handleGenerate} className="space-y-12">
            
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
                    className={`py-4 px-4 rounded-2xl border-2 transition-all font-bold text-sm ${
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
                    className={`py-4 px-6 rounded-2xl border-2 transition-all text-left font-bold text-sm ${
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

            {/* Passo 3: Tema */}
            <section>
              <label className="block text-xl font-black text-slate-800 mb-6 flex items-center gap-4">
                <span className="bg-green-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-green-200">3</span>
                Qual será o tema?
              </label>
              
              <div className="space-y-4">
                <div className="relative">
                  <select
                    onChange={handleThemeChange}
                    className={`w-full px-8 py-6 rounded-[2rem] border-4 outline-none transition-all text-xl bg-slate-50 focus:bg-white font-black appearance-none cursor-pointer ${
                      error ? 'border-red-300' : 'border-slate-50 focus:border-blue-500'
                    }`}
                  >
                    {themeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.emoji} &nbsp; {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {isCustomTheme && (
                  <input
                    type="text"
                    autoFocus
                    placeholder="Digite o tema..."
                    value={config.theme}
                    onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                    className="w-full px-8 py-6 rounded-[2rem] border-4 border-blue-200 focus:border-blue-500 outline-none text-xl font-black shadow-md"
                  />
                )}
              </div>
              
              {error && (
                <p className="mt-4 text-red-500 font-black text-sm flex items-center gap-2 pl-2">
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
                    className={`flex-1 py-5 rounded-2xl border-2 transition-all font-black text-2xl ${
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
              className={`w-full py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all transform ${
                isLoading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed scale-95' 
                  : 'bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:scale-[1.02] active:scale-95'
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
                "Gerar atividade em PDF"
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="mt-20 py-12 w-full text-center border-t border-slate-200">
        <p className="text-slate-400 text-xs font-black tracking-[0.3em] uppercase mb-2">Fábrica de Atividades v3.1</p>
        <p className="text-slate-300 text-[10px] font-bold">Inteligência Artificial aplicada à Educação</p>
      </footer>
    </div>
  );
}
