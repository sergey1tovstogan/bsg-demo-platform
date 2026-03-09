import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, MessageSquare, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import type { ComponentId } from '../types'

const PLATFORM_MODULES: Array<{ id: ComponentId; name: string }> = [
  { id: 'architecture', name: 'Architecture' },
  { id: 'integration', name: 'Integration' },
  { id: 'extensibility', name: 'Extensibility' },
  { id: 'data-architecture', name: 'Data Architecture' },
  { id: 'security', name: 'Security' },
  { id: 'observability', name: 'Observability' },
  { id: 'devops', name: 'DevOps' },
]

const CATEGORIES_STORAGE_KEY = 'bsg_selected_categories'

function loadSelectedCategories(): Set<ComponentId> {
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      const migrated = parsed.map(id => id === 'deployment' ? 'architecture' : id)
      if (migrated.some((id, i) => id !== parsed[i])) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(migrated))
      }
      return new Set(migrated as ComponentId[])
    }
  } catch {
    /* ignore */
  }
  return new Set(PLATFORM_MODULES.map(m => m.id))
}

interface TopNavProps {
  theme: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
  onSettingsClick: () => void
}

export function TopNav({ theme, onThemeChange, onSettingsClick }: TopNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, hasRole } = useAuth()
  const [platformOpen, setPlatformOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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
    if (user?.profile?.first_name && user?.profile?.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`
    }
    if (user?.profile?.first_name) return user.profile.first_name
    const local = user?.email?.split('@')[0]
    if (local) {
      const first = local.split('.')[0]?.trim() || local
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
    }
    if (user?.username) return user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase()
    return null
  })()

  const userInitials = (() => {
    if (user?.profile?.first_name && user?.profile?.last_name) {
      return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
    }
    if (user?.profile?.first_name) return user.profile.first_name.slice(0, 2).toUpperCase()
    const local = user?.email?.split('@')[0]
    if (local) {
      const parts = local.split('.')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return local.slice(0, 2).toUpperCase()
    }
    if (user?.username) return user.username.slice(0, 2).toUpperCase()
    return 'U'
  })()

  const handleModuleSelect = (id: ComponentId) => {
    navigate(`/platform/${id}`)
    setPlatformOpen(false)
    setMobileMenuOpen(false)
  }

  const feedbackUrl = (() => {
    const repo = typeof __GITHUB_REPO__ !== 'undefined' ? __GITHUB_REPO__ : 'georgasa/bsg-demo-platform'
    const body = [
      '**Describe the issue or suggestion:**',
      '[Please describe what you encountered - bug, misbehaviour, or feature idea]',
      '',
      '**Current URL:** ' + (typeof window !== 'undefined' ? window.location.href : ''),
      '**Browser:** ' + (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
    ].join('\n')
    const params = new URLSearchParams({
      title: 'Feedback: Bug report or suggestion',
      body,
      labels: 'feedback',
    })
    return `https://github.com/${repo}/issues/new?${params.toString()}`
  })()

  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'

  return (
    <nav className={`sticky top-0 z-40 w-full border-b ${isDark ? 'border-white/10 bg-[#0a0e1a]/95 backdrop-blur' : 'border-slate-200 bg-white/95 backdrop-blur'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold hidden sm:inline">BSG Demo Platform</span>
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
                              : isDark ? 'text-slate-600 opacity-50 cursor-not-allowed' : 'text-slate-400 opacity-50 cursor-not-allowed'
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
            <a
              href="https://developer.bsg.temenos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              API Developer portal
            </a>
            <button
              onClick={() => navigate('/platform/temenos-components')}
              className={`text-sm font-medium ${location.pathname === '/platform/temenos-components' ? 'text-blue-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Temenos Components
            </button>
            <button
              onClick={() => navigate('/platform/bian-landscape')}
              className={`text-sm font-medium ${location.pathname === '/platform/bian-landscape' ? 'text-blue-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              BIAN Landscape
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {onThemeChange && (
            <>
              <div className="flex items-center">
                <ThemeToggle theme={theme} onThemeChange={onThemeChange} className="shrink-0" />
              </div>
              <div className={`w-px h-6 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
            </>
          )}
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${isDark ? 'bg-slate-700/80 text-slate-300 border border-slate-600/50' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
            title="Software version"
          >
            v{appVersion}
          </span>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors shrink-0"
            title="Report a bug or suggest an improvement"
          >
            <MessageSquare className="w-4 h-4" />
            Feedback
          </a>
          {isAuthenticated && (
            <div className={`w-px h-6 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
          )}
          {isAuthenticated ? (
            <div className="relative flex items-center">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-semibold text-sm">{userInitials}</span>
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {displayName || user?.email || 'User'}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'} transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className={`absolute right-0 top-full mt-1 w-64 py-2 rounded-lg shadow-xl z-50 ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white border border-slate-200'}`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName || 'User'}</p>
                      {user?.email && <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>}
                    </div>
                    <button
                      onClick={() => { onSettingsClick(); setUserMenuOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                      <Settings className="w-4 h-4" />
                      Settings & Keys
                    </button>
                    <button
                      onClick={() => { logout(); navigate('/login'); setUserMenuOpen(false) }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
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
                    className={`block w-full text-left py-2 text-sm ${!isSelected ? 'opacity-50 text-slate-400 cursor-not-allowed' : ''}`}
                  >
                    {m.name}
                  </button>
                )
              })}
            </div>
            <a href="https://developer.bsg.temenos.com/" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-2">API Developer portal</a>
            <button onClick={() => { navigate('/platform/temenos-components'); setMobileMenuOpen(false) }} className="block w-full text-left py-2">Temenos Components</button>
            <button onClick={() => { navigate('/platform/bian-landscape'); setMobileMenuOpen(false) }} className="block w-full text-left py-2">BIAN Landscape</button>
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <span className="text-xs text-slate-500">v{appVersion}</span>
              <a href={feedbackUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-red-400 hover:text-red-300 font-medium">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
