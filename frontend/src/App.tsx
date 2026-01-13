import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { SettingsModal } from './components/SettingsModal'
import { ComingSoonModal } from './components/ComingSoonModal'
import { HomePage } from './pages/HomePage'
import { ComponentPage } from './pages/ComponentPage'
import { LoginPage } from './pages/LoginPage'
import { UserManagement } from './pages/UserManagement'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import type { ComponentId } from './types'
import type { SearchResult } from './utils/searchMapping'

interface DashboardProps {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

function Dashboard({ theme, onThemeChange }: DashboardProps) {
  const [currentComponent, setCurrentComponent] = useState<ComponentId | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<'content' | 'video' | 'demo' | 'chatbot' | undefined>(undefined)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingFeature, setPendingFeature] = useState<string | null>(null)
  const collapseSidebarRef = useRef<(() => void) | null>(null)

  const handleComponentChange = (componentId: ComponentId) => {
    setCurrentComponent(componentId)
    setSelectedCard(undefined) // Reset selected card when changing components
    setActiveTab(undefined) // Reset active tab when changing components
  }

  const handleHomeClick = () => {
    setCurrentComponent(null)
    setSelectedCard(undefined)
    setActiveTab(undefined)
  }

  const handleSearch = (result: SearchResult) => {
    setCurrentComponent(result.componentId)
    setSelectedCard(result.selectedCard)
    setActiveTab(result.tab)
    // Collapse sidebar when navigating via search
    if (collapseSidebarRef.current) {
      collapseSidebarRef.current()
    }
  }

  return (
    <>
      <Sidebar
        currentComponent={currentComponent}
        onComponentChange={handleComponentChange}
        onHomeClick={handleHomeClick}
        onSettingsClick={() => setSettingsOpen(true)}
        onCollapseRef={(collapseFn) => {
          collapseSidebarRef.current = collapseFn
        }}
      />

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

      <main
        className="flex-1 ml-20 relative overflow-hidden transition-all duration-300"
        onClick={() => {
          // Collapse sidebar immediately when clicking anywhere on main content
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
        <div className="relative z-10 px-8 py-8 h-full overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in">
              {currentComponent ? (
                <ComponentPage
                  componentId={currentComponent}
                  initialSelectedCard={selectedCard}
                  initialTab={activeTab}
                />
              ) : (
                <HomePage
                  onSelectComponent={handleComponentChange}
                  onSettingsClick={() => setSettingsOpen(true)}
                  searchBar={<Header onSearch={handleSearch} showSearch={true} />}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('dark') // Default to dark
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

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes (Catch-all) */}
        <Route
          path="/*"
          element={
            <Dashboard
              theme={theme}
              onThemeChange={handleThemeChange}
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App