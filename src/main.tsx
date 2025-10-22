import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext'
import { LoginPage } from './features/auth/components/LoginPage'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { KamehamehaPage } from './features/kamehameha/pages/KamehamehaPage'
import { ChatPage } from './features/kamehameha/pages/ChatPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Timer routes (public) */}
          <Route path="/" element={<App />} />
          <Route path="/timer" element={<App />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Kamehameha routes (protected) */}
          <Route
            path="/kamehameha"
            element={
              <ProtectedRoute>
                <KamehamehaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kamehameha/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

