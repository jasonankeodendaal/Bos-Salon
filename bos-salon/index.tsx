import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { isSupabaseConfigured } from './utils/supabaseClient';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <div 
      className={`fixed bottom-2 left-2 w-2 h-2 rounded-full z-[9999] animate-pulse ${
        isSupabaseConfigured ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
      }`}
      title={isSupabaseConfigured ? "Connected: Supabase Live" : "Disconnected: Mock Data Mode"}
      style={{ pointerEvents: 'none' }}
    />
  </React.StrictMode>
);