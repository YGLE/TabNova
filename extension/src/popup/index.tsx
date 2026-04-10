import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import '../index.css';
import { Popup } from './Popup';
import { ErrorBoundary } from '@components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('[TabNova] Root element not found');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Popup />
      <Toaster
        position="bottom-center"
        toastOptions={{ style: { background: '#1F2937', color: '#fff' } }}
      />
    </ErrorBoundary>
  </React.StrictMode>
);
