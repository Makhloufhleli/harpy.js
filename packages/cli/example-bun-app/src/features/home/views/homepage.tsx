import React from 'react';
import Logo from '../../../components/logo';

interface HomePageProps {
  message: string;
  locale: string;
  t: Record<string, any>;
}

export default function HomePage({ message, locale, t }: HomePageProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 pt-20 pb-32">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Logo className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {t?.hero?.title || 'Harpy.js'}
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 font-light px-4">
            {t?.hero?.subtitle || 'Full-Stack Framework with Bun & React SSR'}
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-12 px-4">
            {t?.hero?.description || message}
          </p>

          <p className="text-sm text-slate-500 mb-8">
            Current locale: <span className="text-amber-400 font-mono">{locale}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <a href="https://harpyjs.org" target="_blank" rel="noopener noreferrer" 
               className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-2xl shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-105 text-lg">
              Get Started
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a href="https://github.com/AcroBytes/harpy.js" target="_blank" rel="noopener noreferrer"
               className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-white font-bold rounded-xl shadow-xl transition-all hover:scale-105 text-lg backdrop-blur-sm">
              GitHub
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all hover:bg-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-2">{t?.features?.fast?.title || 'Blazing Fast'}</h3>
              <p className="text-slate-400">{t?.features?.fast?.description || 'Built on Bun runtime'}</p>
            </div>
            <div className="group p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all hover:bg-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-2">{t?.features?.ssr?.title || 'React SSR'}</h3>
              <p className="text-slate-400">{t?.features?.ssr?.description || 'Server-side rendering'}</p>
            </div>
            <div className="group p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all hover:bg-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-2">{t?.features?.dx?.title || 'Great DX'}</h3>
              <p className="text-slate-400">{t?.features?.dx?.description || 'TypeScript-first'}</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      ` }} />
    </div>
  );
}
