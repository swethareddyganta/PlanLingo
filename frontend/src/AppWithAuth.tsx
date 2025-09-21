import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './components/LandingPage'
import { Login } from './components/Login'
import { Signup } from './components/Signup'
import { ShockedDuo } from './components/ShockedDuo'
import App from './App'

export const AppWithAuth: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Footer links - all redirect to ShockedDuo */}
          <Route path="/privacy" element={<ShockedDuo />} />
          <Route path="/terms" element={<ShockedDuo />} />
          <Route path="/support" element={<ShockedDuo />} />
          <Route path="/contact" element={<ShockedDuo />} />
          
          {/* Demo route - bypasses authentication */}
          <Route path="/demo" element={<App />} />
          
          {/* Protected app routes */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
