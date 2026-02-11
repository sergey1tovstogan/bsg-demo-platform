import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import type { ComponentId } from '../types'

const PLATFORM_MODULES: Array<{ id: ComponentId; name: string }> = [
  { id: 'integration', name: 'Integration, APIs & Events' },
  { id: 'data-architecture', name: 'Data Architecture' },
  { id: 'deployment', name: 'Deployment & Cloud' },
  { id: 'security', name: 'Security' },
  { id: 'observability', name: 'Observability' },
  { id: 'design-time', name: 'DevOps' },
]

const CATEGORIES_STORAGE_KEY = 'bsg_selected_categories'

function loadSelectedCategories(): Set<ComponentId> {
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ComponentId[]
      return new Set(parsed)
    }
  } catch {
    /* ignore */
  }
  return new Set(PLATFORM_MODULES.map(m => m.id))
}

interface TopNavProps {
  theme: 'light' | 'dark'
  onSettingsClick: () => void
}

export function TopNav({ theme, onSettingsClick }: TopNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, hasRole } = useAuth()
  const [platformOpen, setPlatformOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Set<ComponentId>>(loadSelectedCategories)

  useEffect(() => {
    const handleCategoryUpdate = () => setSelectedCategories(loadSelectedCategories())
    window.addEventListener('categoriesUpdated', handleCategoryUpdate)
    return () => window.removeEventListener('categoriesUpdated', handleCategoryUpdate)
  }, [])

  const adminModules: Array<{ id: ComponentId; name: string }> = [
    { id: 'layout-showcase', name: 'Design System Showcase' },
    { id: 'gallery', name: 'Card Gallery' },
    { id: 'editor', name: 'Visual Editor' },
  ]
  const allModules = [...PLATFORM_MODULES, ...(hasRole('admin') ? adminModules : [])]
  const isDark = theme === 'dark'

  const displayName = (() => {
    if (user?.profile?.first_name) return user.profile.first_name
    const local = user?.email?.split('@')[0]
    if (local) {
      const first = local.split('.')[0]?.trim() || local
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
    }
    if (user?.username) return user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()
    return null
  })()

  const handleModuleSelect = (id: ComponentId) => {
    navigate(`/platform/${id}`)
    setPlatformOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <nav className={`sticky top-0 z-40 w-full border-b ${isDark ? 'border-white/10 bg-[#0a0e1a]/95 backdrop-blur' : 'border-slate-200 bg-white/95 backdrop-blur'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold hidden sm:inline">BSG Demo</span>
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 -ml-2" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium ${location.pathname === '/' ? 'text-blue-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Home
            </button>
            <div className="relative">
              <button
                onClick={() => setPlatformOpen(!platformOpen)}
                className={`flex items-center gap-1 text-sm font-medium ${platformOpen ? 'text-blue-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Technology Pillars
                <ChevronDown className={`w-4 h-4 transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
              </button>
              {platformOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPlatformOpen(false)} />
                  <div className={`absolute top-full left-0 mt-1 w-64 py-2 rounded-lg shadow-xl z-50 ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-200'}`}>
                    {allModules.map((m) => {
                      const isCategoryModule = PLATFORM_MODULES.some(pm => pm.id === m.id)
                      const isSelected = !isCategoryModule || selectedCategories.has(m.id)
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleModuleSelect(m.id)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            isSelected
                              ? isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                              : isDark ? 'text-slate-500 opacity-60 cursor-not-allowed' : 'text-slate-400 opacity-60 cursor-not-allowed'
                          }`}
                          disabled={!isSelected}
                        >
                          {m.name}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onSettingsClick}
            title="Settings (API token, categories)"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500 hidden sm:inline">{displayName ? `Welcome ${displayName}` : user?.email}</span>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white/10">
              Sign In
            </button>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="px-4 py-4 space-y-2">
            <button onClick={() => { navigate('/'); setMobileMenuOpen(false) }} className="block w-full text-left py-2">Home</button>
            <button onClick={() => { onSettingsClick(); setMobileMenuOpen(false) }} className="block w-full text-left py-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings (API token, categories)
            </button>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs uppercase text-slate-500 mb-2">Technology Pillars</p>
              {allModules.map((m) => {
                const isCategoryModule = PLATFORM_MODULES.some(pm => pm.id === m.id)
                const isSelected = !isCategoryModule || selectedCategories.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModuleSelect(m.id)}
                    disabled={!isSelected}
                    className={`block w-full text-left py-2 text-sm ${!isSelected ? 'opacity-60 text-slate-500 cursor-not-allowed' : ''}`}
                  >
                    {m.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
