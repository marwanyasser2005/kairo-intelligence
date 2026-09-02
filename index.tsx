
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Migrate the legacy hash URLs to crawlable History API paths before React mounts.
const legacyRoute = window.location.hash.slice(1);
if (legacyRoute.startsWith('/')) {
  window.history.replaceState(null, '', legacyRoute);
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
