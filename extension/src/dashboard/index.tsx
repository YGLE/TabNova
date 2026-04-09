import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { Dashboard } from './Dashboard';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('[TabNova] Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
