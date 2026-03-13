import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Fix for "Uncaught TypeError: Cannot set property fetch of #<Window> which has only a getter"
// This error can occur if a library (like a fetch polyfill) tries to assign to window.fetch
// in an environment where it is read-only.
if (typeof window !== 'undefined') {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && !descriptor.set && (descriptor.configurable || descriptor.writable === undefined)) {
      const originalFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => originalFetch,
        set: (v) => {
          console.warn('Attempted to overwrite window.fetch with:', v);
        }
      });
    }
  } catch {
    // Ignore errors during patching
  }
}

// Global error listener to catch and display errors that might cause a "blank screen"
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', { message, source, lineno, colno, error });
    const root = document.getElementById('root');
    if (root && root.innerHTML === '') {
      root.innerHTML = `
        <div style="background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; font-family: sans-serif; text-align: center;">
          <h1 style="color: #ef4444; margin-bottom: 10px;">Erro Crítico de Inicialização</h1>
          <p style="color: #94a3b8; max-width: 500px; margin-bottom: 20px;">Ocorreu um erro que impediu o carregamento do aplicativo.</p>
          <div style="background: #1e293b; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; text-align: left; max-width: 800px; overflow: auto; border: 1px solid #334155;">
            ${message}
          </div>
          <button onclick="window.location.reload()" style="margin-top: 20px; background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Tentar Recarregar</button>
        </div>
      `;
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
