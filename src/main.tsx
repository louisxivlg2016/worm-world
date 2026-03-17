import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import { PlatformProvider } from '@/platform/PlatformContext'
import { AuthProvider } from '@/context/AuthContext'
import { AppInner } from '@/App'

import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </PlatformProvider>
  </StrictMode>,
)
