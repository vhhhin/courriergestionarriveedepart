import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter future={{ 
      v7_relativeSplatPath: true,
      v7_startTransition: true 
    }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
