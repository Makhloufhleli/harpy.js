import React from 'react';
import { Link, type PageProps } from '@harpy-js/core';
import Logo from '../../../components/logo';

interface HomePageProps extends PageProps {
  translations?: any;
}

export default function HomePage({ translations: t }: HomePageProps) {
  if (!t) {
    return <div>Loading translations...</div>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4 pt-20 pb-32">
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo className="text-amber-500 group-hover:scale-110 transition-transform size-12" />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {t.hero.title}
            </span>
            <span className="inline-block ml-2 sm:ml-4 px-3 sm:px-4 py-1 sm:py-2 bg-amber-500/20 border border-amber-500 rounded-lg text-amber-400 text-lg sm:text-xl md:text-2xl font-bold">
              {t.hero.badge}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 font-light px-4">
            {t.hero.subtitle}
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-12 px-4">
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-2xl transition-all hover:shadow-amber-500/50 hover:scale-105 text-lg"
            >
              📖 {t.hero.cta.getStarted}
              <span>→</span>
            </Link>
          </div>

          {/* Version Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <img
              src="https://img.shields.io/npm/v/@harpy-js/core?label=harpy-core&style=for-the-badge&color=orange"
              alt="Core Version"
            />
            <img
              src="https://img.shields.io/npm/v/@harpy-js/cli?label=harpy-cli&style=for-the-badge&color=orange"
              alt="CLI Version"
            />
            <img
              src="https://img.shields.io/badge/render_time-1--7ms-success?style=for-the-badge"
              alt="Performance"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            {t.features.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(t.features)
              .filter(([key]) => key !== 'title')
              .map(([key, feature]: [string, any], index) => (
                <div
                  key={key}
                  className="card-wrapper w-full hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300"
                  style={
                    {
                      '--animation-delay': `${index * -1.75}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className="card-content p-6 flex flex-col h-full">
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2 break-words">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed break-words flex-grow">{feature.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Get Started Section */}
        <div className="mb-16 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">
            {t.getStarted.title}
          </h2>
          <p className="text-slate-400 text-center mb-8 px-4">
            {t.getStarted.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 rounded-lg p-4 sm:p-6 border border-slate-700">
              <div className="text-amber-500 text-2xl mb-2">1.</div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base break-words">{t.getStarted.install}</h3>
              <code className="text-xs sm:text-sm text-slate-400 bg-slate-950 px-2 sm:px-3 py-2 rounded block overflow-x-auto">
                npm i -g @harpy-js/cli
              </code>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 sm:p-6 border border-slate-700">
              <div className="text-amber-500 text-2xl mb-2">2.</div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base break-words">{t.getStarted.create}</h3>
              <code className="text-xs sm:text-sm text-slate-400 bg-slate-950 px-2 sm:px-3 py-2 rounded block overflow-x-auto">
                harpy create my-app
              </code>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 sm:p-6 border border-slate-700">
              <div className="text-amber-500 text-2xl mb-2">3.</div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base break-words">{t.getStarted.start}</h3>
              <code className="text-xs sm:text-sm text-slate-400 bg-slate-950 px-2 sm:px-3 py-2 rounded block overflow-x-auto">
                pnpm run dev
              </code>
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">
            {t.architecture.title}
          </h2>
          <p className="text-slate-400 text-center mb-8 px-4">
            {t.architecture.subtitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {Object.entries(t.architecture)
              .filter(([key]) => !['title', 'subtitle'].includes(key))
              .map(([key, section]: [string, any]) => (
                <div
                  key={key}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-700"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-amber-500 mb-4 break-words">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item: string, idx: number) => (
                      <li key={idx} className="text-slate-300 flex items-start gap-2 text-sm sm:text-base">
                        <span className="text-amber-500 mt-1 flex-shrink-0">✓</span>
                        <span className="break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>

        {/* Community Section */}
        <div className="text-center bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 sm:p-8 md:p-12 border border-amber-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t.community.title}
          </h2>
          <p className="text-slate-400 mb-8 px-4">
            {t.community.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="https://github.com/harpyjs/harpy"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base break-words"
            >
              ⭐ {t.community.github}
            </Link>
            <Link
              href="https://harpyjs.org/docs"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base break-words"
            >
              📚 {t.community.docs}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

