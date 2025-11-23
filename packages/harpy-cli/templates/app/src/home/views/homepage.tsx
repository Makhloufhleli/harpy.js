import Counter from './counter';

export interface PageProps {
  items: string[];
}

export default function Page({ items }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-9xl mb-6">🦅</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Welcome to Harpy
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A powerful NestJS + React framework with automatic hydration.<br/>
            Built for speed, precision, and adaptability.
          </p>
        </div>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            Why Choose Harpy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized SSR with automatic hydration' },
              { icon: '🎯', title: 'Zero Config', desc: 'Just add \'use client\' and go' },
              { icon: '🏗️', title: 'NestJS Powered', desc: 'Built on enterprise-ready architecture' },
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
            Try It Out
          </h2>
          <Counter />
        </section>

        {/* Navigation */}
        <nav className="flex justify-center gap-4 border-t border-slate-200 pt-8">
          <a
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Learn More About Harpy
            <span>→</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
