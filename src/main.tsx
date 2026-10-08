import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Safely suppress benign Vite preview HMR WebSocket errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (msg.includes('WebSocket') || msg.includes('closed without opened') || msg.includes('failed to connect to websocket')) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const msg = event?.message || String(event?.error || '');
    if (msg.includes('WebSocket') || msg.includes('closed without opened') || msg.includes('failed to connect to websocket')) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
