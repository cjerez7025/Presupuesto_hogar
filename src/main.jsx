import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster position="bottom-center" toastOptions={{
      style: { background: '#1A1A2E', color: '#fff', fontSize: '14px' }
    }} />
  </BrowserRouter>
)
