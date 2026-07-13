import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './lib/i18n.ts';
import App from './App.tsx';
import './index.css';
import { IdiomaProvider } from './context/IdiomaContext.tsx';

// Register PWA Service Worker
const registerServiceWorker = () => {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('PWA Service Worker registrado com sucesso:', registration.scope);
    })
    .catch((error) => {
      console.error('Falha ao registrar o PWA Service Worker:', error);
    });
};

if ('serviceWorker' in navigator) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IdiomaProvider>
      <App />
    </IdiomaProvider>
  </StrictMode>,
);

