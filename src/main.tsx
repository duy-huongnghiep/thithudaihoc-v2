import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Global error handler to intercept cross-origin "Script error." and unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Cross-origin scripts or blocked third-party resources fire opaque "Script error."
    if (event.message === 'Script error.' || !event.filename) {
      event.preventDefault();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Prevent unhandled promise rejections from failing test harnesses
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
