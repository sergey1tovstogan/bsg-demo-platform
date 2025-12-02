import { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { SettingsModal } from './components/SettingsModal'
import { ComingSoonModal } from './components/ComingSoonModal'
import { HomePage } from './pages/HomePage'
import { ComponentPage } from './pages/ComponentPage'
import type { ComponentId } from './types'

function App() {
  const [currentComponent, setCurrentComponent] = useState<ComponentId | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingFeature, setPendingFeature] = useState<string | null>(null)
  const collapseSidebarRef = useRef<(() => void) | null>(null)

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

  const handleComponentChange = (componentId: ComponentId) => {
    setCurrentComponent(componentId)
  }

  const handleHomeClick = () => {
    setCurrentComponent(null)
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <Sidebar
        currentComponent={currentComponent}
        onComponentChange={handleComponentChange}
        onHomeClick={handleHomeClick}
        onSettingsClick={() => setSettingsOpen(true)}
        onCollapseRef={(collapseFn) => {
          collapseSidebarRef.current = collapseFn
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
      />
      <ComingSoonModal
        isOpen={Boolean(pendingFeature)}
        featureName={pendingFeature || ''}
        onClose={() => setPendingFeature(null)}
      />

      {/* Main Content Area */}
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
            <Header />

            <div className="mt-8 animate-fade-in">
              {currentComponent ? (
                <ComponentPage componentId={currentComponent} />
              ) : (
                <HomePage onSelectComponent={handleComponentChange} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App