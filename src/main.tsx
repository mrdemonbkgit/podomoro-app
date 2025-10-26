import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './features/auth/context/AuthContext'
import { LoginPage } from './features/auth/components/LoginPage'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { StreaksProvider } from './features/kamehameha/context/StreaksContext'
import { KamehamehaPage } from './features/kamehameha/pages/KamehamehaPage'
import { ChatPage } from './features/kamehameha/pages/ChatPage'
import { BadgesPage } from './features/kamehameha/pages/BadgesPage'
import { JourneyHistoryPage } from './features/kamehameha/pages/JourneyHistoryPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        {/* Single StreaksProvider at top level - prevents race conditions */}
        <StreaksProvider>
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
            <Route
              path="/kamehameha/badges"
              element={
                <ProtectedRoute>
                  <BadgesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kamehameha/history"
              element={
                <ProtectedRoute>
                  <JourneyHistoryPage />
                </ProtectedRoute>
              }
            />
            </Routes>
          </BrowserRouter>
        </StreaksProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

