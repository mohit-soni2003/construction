import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './i18n.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
);

// Makes the site installable as a phone app (only in the built/deployed version)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
