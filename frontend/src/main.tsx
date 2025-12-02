import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import AuthCallback from './auth/AuthCallback.tsx'
import LogoutCallback from './auth/LogoutCallback.tsx'
import { ApiTestPage } from './components/ApiTestPage.tsx'
import { Provider } from './components/ui/provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/logout" element={<LogoutCallback />} />
            <Route path="/api-test" element={<ApiTestPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
