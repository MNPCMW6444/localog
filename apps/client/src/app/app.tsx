// App.tsx
import { InteractionTester } from './InteractionTester';
import { Launch } from './Launch';
import { startPolling } from './poller';
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

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
      'Slow response from server.',
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

  useEffect(() => {
    // 🔁 CPU Load: lower to ~80%
    let cpuActive = true;
    function cpuBurn() {
      const now = performance.now();
      while (performance.now() - now < 6) {
        Math.atan(Math.random() * Math.random());
      }      
      if (cpuActive) requestAnimationFrame(cpuBurn);
    }
    cpuBurn();
  
    const memoryChunks: any[] = [];
    const maxHeapMB = 500;
    const chunkSize = 1 * 1024 * 1024; // 1MB
    let seed = 0;
    
    const memoryInterval = setInterval(() => {
      const uniqueChunk = new Array(chunkSize).fill(String.fromCharCode(65 + (seed++ % 26))).join('');
      memoryChunks.push({ data: uniqueChunk, nested: [uniqueChunk, { x: uniqueChunk }] });
    
      if (memoryChunks.length * chunkSize > maxHeapMB * 1024 * 1024) {
        memoryChunks.shift();
      }
    }, 50);
    
          
    // 🌐 Network flood
    const ping = async () => {
      try {
        await fetch('https://jsonplaceholder.typicode.com/posts');
      } catch {}
      setTimeout(ping, 200);
    };
    ping();
  
    // 🧱 DOM Container Mount (still targeting 300k–400k nodes max)
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.marginTop = '2rem';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(100, 1fr)';
    container.style.gap = '1px';
    document.getElementById('asd')?.appendChild(container);
  
    const maxNodes = 400000;
    const minNodes = 300000;
    
    const domInterval = setInterval(() => {
      const current = container.childNodes.length;
      const target = Math.floor(Math.random() * (maxNodes - minNodes)) + minNodes;
    
      if (current < target) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < target - current; i++) {
          const el = document.createElement('div');
          el.style.width = '2px';
          el.style.height = '2px';
          el.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
          fragment.appendChild(el);
        }
        container.appendChild(fragment);
      } else if (current > target) {
        const toRemove = Math.min(current - target, 10000);
        for (let i = 0; i < toRemove; i++) {
          container.removeChild(container.lastChild!);
        }
      }
    }, 300);
            
  
    // 🎨 Repaint pulse
    const paintInterval = setInterval(() => {
      container.style.outline = `1px solid hsl(${Math.random() * 360}, 100%, 50%)`;
    }, 1000);
  
    return () => {
      cpuActive = false;
      clearInterval(memoryInterval);
      clearInterval(domInterval);
      clearInterval(paintInterval);
      container.remove();
    };
  }, []);
  
  return (
    <>
      <ToastContainer />
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">🚀 Random SpaceX Launch</h1>{' '}
        <InteractionTester />
        <Launch />
      </div>
      <div id="asd" />
    </>
  );
}
