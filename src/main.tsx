import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Guard against native browser alert/confirm popups ("tauri.localhost says")
if (typeof window !== 'undefined') {
  window.confirm = (message?: string) => {
    console.warn('[Synapse Desktop Guard] Suppressed native window.confirm:', message);
    return false;
  };
  window.alert = (message?: string) => {
    console.warn('[Synapse Desktop Guard] Suppressed native window.alert:', message);
  };
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
