import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { NewsProvider } from './context/NewsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NewsProvider>
      <App />
    </NewsProvider>
  </StrictMode>
);