import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch has both getter and setter in iframe environments
try {
  if (typeof window !== 'undefined') {
    const origFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let currFetch = origFetch;
    try {
      Object.defineProperty(window, 'fetch', {
        get: () => currFetch || origFetch,
        set: (fn: typeof fetch) => {
          currFetch = fn;
        },
        configurable: true,
        enumerable: true,
      });
    } catch {
      // ignore
    }
  }
} catch {
  // ignore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

