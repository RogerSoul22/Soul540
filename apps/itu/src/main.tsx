import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../../packages/pentagono/src/styles/pentagono.css';
import './styles/global.scss';
import App from './App';
import { setupFranchisePwa } from './franchise-pwa';

setupFranchisePwa();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
