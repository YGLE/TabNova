import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { Popup } from './Popup';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('[TabNova] Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
