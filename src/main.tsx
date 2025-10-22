import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext'
import { LoginPage } from './features/auth/components/LoginPage'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { StreaksProvider } from './features/kamehameha/context/StreaksContext'
import { KamehamehaPage } from './features/kamehameha/pages/KamehamehaPage'
import { ChatPage } from './features/kamehameha/pages/ChatPage'
import { BadgesPage } from './features/kamehameha/pages/BadgesPage'

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
          
          {/* Kamehameha routes (protected) - wrapped with StreaksProvider */}
          <Route
            path="/kamehameha"
            element={
              <ProtectedRoute>
                <StreaksProvider>
                  <KamehamehaPage />
                </StreaksProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kamehameha/chat"
            element={
              <ProtectedRoute>
                <StreaksProvider>
                  <ChatPage />
                </StreaksProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kamehameha/badges"
            element={
              <ProtectedRoute>
                <StreaksProvider>
                  <BadgesPage />
                </StreaksProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

