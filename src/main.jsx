import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import global CSS files in main.jsx to prevent FOUC
// This ensures styles are loaded before React renders
import './index.css'
import './App.css'

// Preload component CSS files to prevent FOUC on lazy-loaded components
import './pages/client/MyInterests.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
