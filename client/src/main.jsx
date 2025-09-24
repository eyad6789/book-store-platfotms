import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2D1810',
                color: '#F5F5DC',
                fontFamily: 'Amiri, serif',
                fontSize: '16px',
                direction: 'rtl'
              },
              success: {
                iconTheme: {
                  primary: '#FFD700',
                  secondary: '#2D1810',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#2D1810',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
