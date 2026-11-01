import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../packages/pentagono/src/styles/pentagono.css';
import './styles/global.scss';
import App from './App';
import { registerServiceWorker } from '../../../packages/pwa/src/register-service-worker';

registerServiceWorker({ swUrl: `${import.meta.env.BASE_URL}sw.js`, scope: '/' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
