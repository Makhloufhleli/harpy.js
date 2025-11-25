'use client';

import { useState } from 'react';

function ColorChange() {
  const [color, setColor] = useState('text-blue-500');
  return (
    <div className="rounded-lg shadow-lg p-4">
      <h1>ColorChange</h1>
      <p className={color}>This text changes color.</p>
      <button
        className="inline-block px-6 py-2 bg-red-500 hover:bg-red-900 text-white font-semibold rounded-lg transition-colors duration-200"
        onClick={() => setColor('text-red-500')}
      >
        Red
      </button>
      <button
        className="inline-block px-6 py-2 bg-green-500 hover:bg-green-900 text-white font-semibold rounded-lg transition-colors duration-200"
        onClick={() => setColor('text-green-500')}
      >
        Green
      </button>
      <button
        className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors duration-200"
        onClick={() => setColor('text-blue-500')}
      >
        Blue
      </button>
    </div>
  );
}

export default ColorChange;
