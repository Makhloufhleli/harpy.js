import AboutCounter from "./about-counter";
import ColorChangeComponent from "./color-change";

export interface PageProps {
  title: string;
  items: string[];
}

export default function Page({ title, items }: PageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-8xl mb-6">🦅</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            About Harpy
          </h1>
          <p className="text-xl text-slate-600">
            Named after nature's most powerful aerial predator
          </p>
        </div>

        {/* Why Harpy Section */}
        <section className="mb-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span>🦅</span>
            Why "Harpy"?
          </h2>
          <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
            <p>
              The <strong className="text-amber-600">Harpy Eagle</strong> is one
              of the most powerful birds of prey in the world, known for its
              unmatched strength, speed, and precision.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="text-3xl mb-2">💪</div>
                <h3 className="font-bold text-slate-800 mb-1">
                  Unmatched Power
                </h3>
                <p className="text-sm text-slate-600">
                  Strongest grip of any eagle
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold text-slate-800 mb-1">
                  Speed & Precision
                </h3>
                <p className="text-sm text-slate-600">
                  Swift and incredibly accurate
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="text-3xl mb-2">🌳</div>
                <h3 className="font-bold text-slate-800 mb-1">Adaptability</h3>
                <p className="text-sm text-slate-600">
                  Thrives in complex environments
                </p>
              </div>
            </div>
            <p>
              Just like its namesake,{" "}
              <strong className="text-amber-600">Harpy framework</strong>{" "}
              combines power, performance, and precision to help you build
              exceptional web applications.
            </p>
          </div>
        </section>

        {/* Links Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://github.com/Makhloufhleli/harpy.js"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">
                  GitHub Repository
                </h3>
                <p className="text-slate-600 text-sm">
                  View source code and contribute
                </p>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                →
              </span>
            </a>

            <a
              href="https://www.npmjs.com/package/@hepta-solutions/harpy-core"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform text-red-600">
                📦
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">
                  NPM - Core Package
                </h3>
                <p className="text-slate-600 text-sm">
                  @hepta-solutions/harpy-core
                </p>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                →
              </span>
            </a>

            <a
              href="https://www.npmjs.com/package/@hepta-solutions/harpy-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform text-red-600">
                📦
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">
                  NPM - CLI Package
                </h3>
                <p className="text-slate-600 text-sm">
                  @hepta-solutions/harpy-cli
                </p>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                →
              </span>
            </a>

            <a
              href="https://github.com/Makhloufhleli"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all group"
            >
              <div className="text-4xl group-hover:scale-110 transition-transform">
                👨‍💻
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">
                  GitHub Profile
                </h3>
                <p className="text-slate-600 text-sm">@Makhloufhleli</p>
              </div>
              <span className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                →
              </span>
            </a>
          </div>
        </section>

        {/* Interactive Components Demo */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            More Interactive Examples
          </h2>
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Counter Example
              </h3>
              <AboutCounter />
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Color Picker Example
              </h3>
              <ColorChangeComponent />
            </div>
          </div>
        </section>

        {/* Back Navigation */}
        <nav className="flex justify-center border-t border-slate-200 pt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <span>←</span>
            Back to Home
          </a>
        </nav>
      </div>
    </div>
  );
}
