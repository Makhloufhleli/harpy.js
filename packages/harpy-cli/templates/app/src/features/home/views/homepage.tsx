import React from 'react';
import { t } from '@hepta-solutions/harpy-core';
import { Dictionary } from '../../../i18n/get-dictionary';
import Counter from './counter';
import { LanguageSwitcher } from '../../../components/language-switcher';

export interface PageProps {
  items: string[];
  dict: Dictionary;
  locale: string;
}

export default function Page({ items, dict, locale }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Language Switcher */}
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-9xl mb-6">🦅</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            {t(dict, 'hero.title')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t(dict, 'hero.subtitle')}<br/>
            {t(dict, 'hero.description')}
          </p>
        </div>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            {t(dict, 'features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: t(dict, 'features.lightning.title'), desc: t(dict, 'features.lightning.description') },
              { icon: '🎯', title: t(dict, 'features.zeroConfig.title'), desc: t(dict, 'features.zeroConfig.description') },
              { icon: '🏗️', title: t(dict, 'features.nestjs.title'), desc: t(dict, 'features.nestjs.description') },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            {t(dict, 'demo.title')}
          </h2>
          <Counter />
        </section>

        {/* Navigation */}
        <nav className="flex justify-center gap-4 border-t border-slate-200 pt-8">
          <a
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            {t(dict, 'navigation.learnMore')}
            <span>→</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
