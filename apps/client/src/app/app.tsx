// App.tsx
import { Launch } from './Launch';
import { startPolling } from './poller';
import React from "react"
import {ToastContainer} from "react-toastify"

startPolling(); // ⏱️ starts immediately

export default function App() {
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
