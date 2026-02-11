
import React, { useState } from 'react';
import { generateActivities } from './services/gemini';
import { createActivityPDF } from './services/pdf';
import { ActivityConfig, Level, ActivityType } from './types';

// Components
const Header = () => (
  <header className="text-center py-12 px-4">
    <h1 className="text-5xl font-extrabold text-blue-600 mb-2 drop-shadow-sm">
      Fábrica de <span className="text-amber-500">Atividades</span>
    </h1>
    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
      Gere atividades pedagógicas prontas para imprimir em segundos. 
      Personalize o nível, tema e quantidade.
    </p>
  </header>
);

const Footer = () => (
  <footer className="mt-20 py-8 border-t border-blue-100 text-center text-slate-400 text-sm">
    <p>&copy; {new Date().getFullYear()} Fábrica de Atividades - Educação com Criatividade</p>
  </footer>
);

export default function App() {
  const [config, setConfig] = useState<ActivityConfig>({
    level: 'Educação Infantil',
    type: 'Alfabetização',
    theme: '',
    pages: 3,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const levels: Level[] = ['Educação Infantil', '1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];
  const types: ActivityType[] = [
    'Alfabetização', 
    'Matemática', 
    'Coordenação motora', 
    'Cores e formas', 
    'Leitura e interpretação', 
    'Jogos pedagógicos'
  ];
  const pageOptions = [3, 5, 10];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.theme.trim()) {
      setError("Por favor, digite um tema para a atividade.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const activities = await generateActivities(config);
      if (activities.length === 0) throw new Error("Nenhuma atividade gerada.");
      
      createActivityPDF(activities, config);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao gerar suas atividades. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-12">
      <Header />

      <main className="w-full max-w-3xl px-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Nível */}
            <section>
              <label className="block text-lg font-semibold text-slate-700 mb-4">Selecione o Nível:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {levels.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setConfig({ ...config, level: l })}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                      config.level === l 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-100 hover:border-blue-200 text-slate-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </section>

            {/* Tipo */}
            <section>
              <label className="block text-lg font-semibold text-slate-700 mb-4">Tipo de Atividade:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setConfig({ ...config, type: t })}
                    className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 text-sm text-left font-medium ${
                      config.type === t 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-100 hover:border-blue-200 text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            {/* Tema */}
            <section>
              <label htmlFor="theme" className="block text-lg font-semibold text-slate-700 mb-2">Tema da Atividade:</label>
              <input
                id="theme"
                type="text"
                placeholder="Ex: Dinossauros, Natureza, Família, Números..."
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 text-slate-700 text-lg"
              />
            </section>

            {/* Quantidade */}
            <section>
              <label className="block text-lg font-semibold text-slate-700 mb-4">Quantidade de Páginas:</label>
              <div className="flex gap-4">
                {pageOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setConfig({ ...config, pages: p })}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-sm font-bold ${
                      config.pages === p 
                        ? 'border-amber-500 bg-amber-50 text-amber-700' 
                        : 'border-slate-100 hover:border-amber-200 text-slate-500'
                    }`}
                  >
                    {p} páginas
                  </button>
                ))}
              </div>
            </section>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-lg transition-all duration-300 ${
                isLoading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02] active:scale-95 shadow-blue-200'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando atividades mágicas...
                </span>
              ) : (
                'Gerar Atividades em PDF'
              )}
            </button>
          </form>
        </div>

        {/* Benefits Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl text-center">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-slate-700">100% Original</h3>
            <p className="text-sm text-slate-500">Conteúdo único gerado por IA pedagógica.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl text-center">
            <div className="text-3xl mb-3">🖨️</div>
            <h3 className="font-bold text-slate-700">Pronto para Imprimir</h3>
            <p className="text-sm text-slate-500">Formato A4 com margens perfeitas.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-slate-700">Instantâneo</h3>
            <p className="text-sm text-slate-500">Economize horas de planejamento.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
