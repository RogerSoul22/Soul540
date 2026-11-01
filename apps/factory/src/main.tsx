import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../../packages/pentagono/src/styles/pentagono.css';
import './styles/global.scss';
import App from './App';
import { getFactoryBasePath } from './factory-path';
import { registerServiceWorker } from '../../../packages/pwa/src/register-service-worker';

// Instalável só sob /fabrica; fora disso (porta direta) não há escopo próprio.
const factoryBase = getFactoryBasePath();
if (factoryBase) registerServiceWorker({ swUrl: `${import.meta.env.BASE_URL}sw.js`, scope: `${factoryBase}/` });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
