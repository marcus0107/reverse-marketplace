import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context.jsx';
import '@fontsource-variable/inter';
import './style.css';
import './mobile.css';
import './theme.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
);
