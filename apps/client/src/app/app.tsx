// App.tsx
import { Launch } from './Launch';
import { startPolling } from './poller';
import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";

startPolling(); // ⏱️ starts immediately

export default function App() {
  useEffect(() => {
    const levels = ['log', 'warn', 'error', 'info', 'debug'];
    const messages = [
      'Fetching data...',
      'API call complete.',
      'Something went wrong!',
      'User clicked button.',
      'Connection stable.',
      'Retrying request...',
      'Rendering component...',
      'Auth token refreshed.',
      'Unexpected input received.',
      'Slow response from server.'
    ];

    function randomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function emitRandomLog() {
      const level = levels[randomInt(0, levels.length - 1)] as keyof Console;
      const msg = messages[randomInt(0, messages.length - 1)];
      console[level](`[APP LOG] ${msg}`);
      const nextDelay = randomInt(3000, 6000); // 3–6s
      setTimeout(emitRandomLog, nextDelay);
    }

    emitRandomLog(); // Start it once when component mounts
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">🚀 Random SpaceX Launch</h1>
        <Launch />
      </div>
    </>
  );
}
