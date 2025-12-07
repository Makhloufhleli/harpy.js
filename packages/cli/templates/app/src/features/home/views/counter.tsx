"use client";

import { useState } from "react";

function Counter() {
  const [flights, setFlights] = useState(0);
  const [isFlying, setIsFlying] = useState(false);

  const handleFlight = () => {
    setIsFlying(true);
    setFlights((prev) => prev + 1);
    setTimeout(() => setIsFlying(false), 600);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-xl border border-slate-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Interactive Hydration Demo
        </h2>
        <p className="text-slate-600">
          Client-side interactivity powered by Harpy
        </p>
      </div>

      <div
        className={`text-8xl transition-all duration-500 ${
          isFlying
            ? "transform -translate-y-12 scale-110 opacity-80"
            : "transform translate-y-0 scale-100 opacity-100"
        }`}
      >
        🦅
      </div>

      <div className="text-center">
        <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          {flights}
        </p>
        <p className="text-lg text-slate-700 mt-2">
          {flights === 0 && "Ready to soar!"}
          {flights === 1 && "Harpy flew 1 time 🚀"}
          {flights > 1 && `Harpy flew ${flights} times 🚀`}
        </p>
      </div>

      <button
        onClick={handleFlight}
        disabled={isFlying}
        className={`px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 ${
          isFlying
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-xl hover:scale-105"
        }`}
      >
        {isFlying ? "✨ Flying..." : "🦅 Take Flight!"}
      </button>

      <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          This component is{" "}
          <span className="font-semibold text-amber-600">
            automatically hydrated
          </span>{" "}
          by Harpy.
          <br />
          No manual wrapping required - just add{" "}
          <code className="px-1 bg-slate-100 rounded">'use client'</code>
        </p>
      </div>
    </div>
  );
}

export default Counter;
