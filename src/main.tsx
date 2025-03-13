import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/css/index.css'
import { initializeStorage } from './lib/storage/setup'
import { appLogger } from './lib/logger'

// Initialize storage service
initializeStorage().catch(error => {
  appLogger.error('Failed to initialize storage service:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)