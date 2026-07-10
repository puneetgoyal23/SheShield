/**
 * main.jsx — Application bootstrap.
 *
 * Important: Leaflet's default marker icons break with Vite's asset
 * bundling. The fix below must run before any Leaflet map renders.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';



/* ── Global Styles (design system) ── */
import './styles/index.css';

/* ── App ── */
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
