import { createRoot } from 'react-dom/client'
import { QueryProvider } from './providers/QueryProvider'
import App from './App.tsx'
import './index.css'

// Global error listeners for diagnostics
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Diagnostics] Unhandled promise rejection:', (e as PromiseRejectionEvent).reason);
});
window.addEventListener('error', (e) => {
  const errEvt = e as ErrorEvent;
  console.error('[Diagnostics] Uncaught error:', errEvt.error || errEvt.message);
});

createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <App />
  </QueryProvider>
);
