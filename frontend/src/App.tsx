import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Sidebar } from './components/Sidebar'
import { TopNav } from './components/TopNav'
import { SettingsModal } from './components/SettingsModal'
import { ComingSoonModal } from './components/ComingSoonModal'
import { BSGGuruFloating } from './components/BSGGuruFloating'
import { LandingPage } from './pages/LandingPage'
import { ComponentPage } from './pages/ComponentPage'
import { ContentBackProvider } from './contexts/ContentBackContext'
import { LoginPage } from './pages/LoginPage'
import { UserManagement } from './pages/UserManagement'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import type { ComponentId } from './types'

const VALID_COMPONENT_IDS: ComponentId[] = [
  'integration', 'data-architecture', 'deployment', 'security',
  'observability', 'design-time', 'layout-showcase', 'gallery', 'editor'
]

function isValidComponentId(id: string | undefined): id is ComponentId {
  return !!id && VALID_COMPONENT_IDS.includes(id as ComponentId)
}

interface DashboardProps {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

function Dashboard({ theme, onThemeChange }: DashboardProps) {
  const navigate = useNavigate()
  const { componentId: paramId } = useParams<{ componentId: string }>()
  const componentId = isValidComponentId(paramId) ? paramId : null
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingFeature, setPendingFeature] = useState<string | null>(null)
  const collapseSidebarRef = useRef<(() => void) | null>(null)

  const handleComponentChange = (id: ComponentId) => {
    navigate(`/platform/${id}`)
  }

  const handleHomeClick = () => {
    navigate('/')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopNav theme={theme} onThemeChange={onThemeChange} onSettingsClick={() => setSettingsOpen(true)} />
      <div className="flex flex-1 min-h-0 relative">
        <Sidebar
          currentComponent={componentId}
          onComponentChange={handleComponentChange}
          onHomeClick={handleHomeClick}
          onSettingsClick={() => setSettingsOpen(true)}
          onCollapseRef={(collapseFn) => {
            collapseSidebarRef.current = collapseFn
          }}
          topOffset="3.5rem"
        />

        <main
          className="flex-1 ml-20 relative overflow-hidden transition-all duration-300"
          onClick={() => {
            if (collapseSidebarRef.current) {
              collapseSidebarRef.current()
            }
          }}
        >
        {/* Modern Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Main Gradient Orb */}
          <div className={`absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 animate-pulse-slow ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-400'
            }`}></div>

          {/* Secondary Gradient Orb */}
          <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-pulse-slow animation-delay-400 ${theme === 'dark' ? 'bg-violet-600' : 'bg-violet-400'
            }`}></div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <span className="text-[400px] font-bold select-none tracking-tighter">
              BSG
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {componentId ? (
              <ContentBackProvider>
                <div className="animate-fade-in">
                  <ComponentPage componentId={componentId} onOpenSettings={() => setSettingsOpen(true)} />
                </div>
              </ContentBackProvider>
            ) : (
              <Navigate to="/" replace />
            )}
          </div>
        </div>
        </main>
      </div>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={onThemeChange}
      />
      <ComingSoonModal
        isOpen={Boolean(pendingFeature)}
        featureName={pendingFeature || ''}
        onClose={() => setPendingFeature(null)}
      />
    </div>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const guruComponentId = ((): ComponentId => {
    const match = location.pathname.match(/^\/platform\/([^/]+)/)
    const id = match?.[1]
    return isValidComponentId(id) ? id : 'integration'
  })()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('dark')
    }
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-theme')
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('app-theme', newTheme)
    applyTheme(newTheme)
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <Routes>
        <Route path="/login" element={<LoginPage theme={theme} onThemeChange={handleThemeChange} />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAuth requireRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Landing page (Home) - main page for authenticated users */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <LandingPage theme={theme} onThemeChange={handleThemeChange} />
            ) : (
              <LoginPage theme={theme} onThemeChange={handleThemeChange} />
            )
          }
        />

        {/* Redirect /platform to home */}
        <Route path="/platform" element={<Navigate to="/" replace />} />

        {/* Platform module - at /platform/:componentId */}
        <Route
          path="/platform/:componentId"
          element={
            isAuthenticated ? (
              <Dashboard
                theme={theme}
                onThemeChange={handleThemeChange}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      {isAuthenticated && <BSGGuruFloating componentId={guruComponentId} />}
    </div>
  )
}

export default App
