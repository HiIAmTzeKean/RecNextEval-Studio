import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles.css'
import { ToastContainer } from 'react-toastify'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <ToastContainer position="top-center" autoClose={3500} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </ThemeProvider>
  </React.StrictMode>
)
