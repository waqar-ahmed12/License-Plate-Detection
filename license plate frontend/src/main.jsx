// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StatusProvider } from './context/statusContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StatusProvider>
    <App />
  </StatusProvider>
)
