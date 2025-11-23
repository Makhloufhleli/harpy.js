'use client';

import React from 'react';

function Counter() {
  const [count, setCount] = React.useState(0);

  const onIncrementCounter = () => {
    setCount((prevCount) => {
      return prevCount + 1;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800">Counter Component</h2>
      <p className="text-4xl font-bold text-blue-600">{count}</p>
      <button
        onClick={() => onIncrementCounter()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        Increment
      </button>
    </div>
  );
}

export default Counter;
