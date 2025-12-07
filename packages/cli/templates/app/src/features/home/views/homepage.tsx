export interface PageProps {
  items?: string[];
}

export default function HomePage({ items = [] }: PageProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4 pt-20 pb-32">
        <div className="text-center mb-16">
          {/* Title */}
          <h1 className="text-7xl font-extrabold mb-6">
            <span className="bg-linear-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Harpy.js
            </span>
            <span className="inline-block ml-4 px-4 py-2 bg-amber-500/20 border border-amber-500 rounded-lg text-amber-400 text-2xl font-bold">
              BETA
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-slate-300 mb-4 font-light">
            Full-Stack NestJS Framework with React SSR
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="/getting-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-2xl transition-all hover:shadow-amber-500/50 hover:scale-105 text-lg"
            >
              📖 Get Started
              <span>→</span>
            </a>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: '🚀',
              title: 'NestJS Ecosystem',
              desc: 'Build on top of the powerful NestJS framework with all its features and modules',
            },
            {
              icon: '⚡',
              title: 'Lightning Fast',
              desc: 'Server-side rendering with 1-7ms render times and automatic client hydration',
            },
            {
              icon: '🎨',
              title: 'Modern Stack',
              desc: 'React 19, Tailwind CSS, TypeScript, and SWC for the best developer experience',
            },
            {
              icon: '🌍',
              title: 'Built-in i18n',
              desc: 'Advanced internationalization with dictionary caching and locale switching',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="card-wrapper w-full min-h-[250px] hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300"
              style={
                {
                  '--animation-delay': `${index * -1.75}s`,
                } as React.CSSProperties
              }
            >
              <div className="card-content p-6 flex flex-col">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
