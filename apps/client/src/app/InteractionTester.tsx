// InteractionTester.tsx
import React, { useEffect, useState } from "react";

export function InteractionTester() {
  const [clicks, setClicks] = useState(0);
  const [text, setText] = useState("");
  const [slider, setSlider] = useState(50);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 500); // toggle color every 500ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl bg-gray-800 p-6 rounded-xl shadow-xl mt-6 space-y-4 text-white border border-gray-700">
      <h2 className="text-xl font-semibold mb-2">🧪 Interaction Test Panel</h2>

      <div className="space-y-2">
        <button
          onClick={() => setClicks((c) => c + 1)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md"
        >
          Click Me ({clicks})
        </button>

        <input
          type="text"
          placeholder="Type something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none"
        />

        <input
          type="range"
          min="0"
          max="100"
          value={slider}
          onChange={(e) => setSlider(Number(e.target.value))}
          className="w-full"
        />
        <div>Slider: {slider}</div>

        <div
          className={`w-full h-6 transition-all duration-300 ${
            pulse ? "bg-green-500" : "bg-pink-500"
          }`}
        >
          {/* Animated bar */}
        </div>
      </div>
    </div>
  );
}
