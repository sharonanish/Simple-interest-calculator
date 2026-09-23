import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { TopNav } from './components/layout/TopNav.jsx'
import { AuthLandingPage } from './pages/AuthLandingPage.jsx'
import { CalculatorPage } from './pages/CalculatorPage.jsx'
import { HistoryPage } from './pages/HistoryPage.jsx'
import { InsightsPage } from './pages/InsightsPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ReportsPage } from './pages/ReportsPage.jsx'
import { SignupPage } from './pages/SignupPage.jsx'
import { getAuthState } from './services/authService.js'
import './App.css'

const defaultTheme = 'dark'

function AppShell() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('simpleInterest_theme')
    if (storedTheme) {
      return storedTheme
    }

    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }

    return defaultTheme
  })

  const authState = getAuthState()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('simpleInterest_theme', theme)
  }, [theme])

  const isAuthRoute = ['/', '/login', '/signup'].includes(location.pathname)

  return (
    <div className="app-shell">
      <div className="background-glow glow-one" aria-hidden="true" />
      <div className="background-glow glow-two" aria-hidden="true" />

      {!isAuthRoute && (
        <TopNav
          theme={theme}
          isAuthenticated={authState.isAuthenticated}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />
      )}

      <main className={`page-content ${isAuthRoute ? 'auth-page-content' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={authState.isAuthenticated ? <Navigate to="/calculator" replace /> : <AuthLandingPage />}
          />
          <Route path="/login" element={authState.isAuthenticated ? <Navigate to="/calculator" replace /> : <LoginPage />} />
          <Route path="/signup" element={authState.isAuthenticated ? <Navigate to="/calculator" replace /> : <SignupPage />} />
          <Route
            path="/calculator"
            element={authState.isAuthenticated ? <CalculatorPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/history"
            element={authState.isAuthenticated ? <HistoryPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/insights"
            element={authState.isAuthenticated ? <InsightsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/reports"
            element={authState.isAuthenticated ? <ReportsPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
