import React from 'react';
import Counter from './counter';

export interface PageProps {
  items: string[];
}

// We can use functions here
function formatItem(item: string) {
  return item.toLocaleLowerCase();
}

export default function Page({ items }: PageProps) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold text-red-900 mb-8">Welcome</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Items</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <li
              key={item}
              className="p-4 bg-white rounded-lg shadow border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <span className="text-lg font-medium text-slate-700">
                {formatItem(item)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Interactive Component
        </h2>
        <Counter />
      </section>

      <nav className="border-t border-slate-200 pt-8">
        <a
          href="/about"
          className="inline-block px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          About us →
        </a>
      </nav>
    </div>
  );
}
