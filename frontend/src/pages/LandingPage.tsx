import { useState, useEffect, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Cpu,
  Puzzle,
  GitBranch,
  Plug,
  Activity,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SettingsModal } from '../components/SettingsModal'
import { Footer } from '../components/Footer'
import type { ComponentId } from '../types'

export const TECHNOLOGY_PILLARS: Array<{
  id: string
  title: string
  icon: ComponentType<{ className?: string }>
  color: string
  glow: string
  tagline: string
  bullets: string[]
  techs: string[]
}> = [
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/40',
    tagline: 'Embedded, distributed event-driven and cloud-native',
    bullets: [
      'Embedded / distributed event-driven',
      'Cloud native & cloud agnostic (platform choice)',
      'Gen AI, Agentic AI, AI Platform (vision)',
    ],
    techs: ['Azure', 'AWS', 'OpenShift', 'GCP'],
  },
  {
    id: 'extensibility',
    title: 'Extensibility',
    icon: Puzzle,
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/40',
    tagline: 'Breadth & depth configurable, extensible by bank or partner',
    bullets: [
      'Breadth & depth configurable functionality',
      'Graphical low-code configuration tool',
      'Extensible by the bank / partner',
    ],
    techs: ['Temenos Workbench'],
  },
  {
    id: 'devops',
    title: 'DevOps',
    icon: GitBranch,
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/40',
    tagline: 'Automated testing, CI/CD, continuous update and upgrade',
    bullets: [
      'Automated testing & source control management',
      'Continuous Integration and Continuous Deployment',
      'Continuous update and annual upgrade',
    ],
    techs: ['Jenkins', 'GitLab', 'Git', 'Bitbucket'],
  },
  {
    id: 'integration',
    title: 'Integration',
    icon: Plug,
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/40',
    tagline: 'Extensible APIs, events, and real-time data streaming',
    bullets: [
      'Published catalogue of Extensible APIs & Events',
      'Large developer community enhanced by learning paths',
      'Real-time data streaming',
    ],
    techs: ['OpenAPI', 'Swagger', 'Kafka', 'Event Hubs'],
  },
  {
    id: 'observability',
    title: 'Observability',
    icon: Activity,
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/40',
    tagline: 'Industry-standard instrumentation and pre-configured dashboards',
    bullets: [
      'Industry-standard instrumentation across software',
      'Pre-configured dashboards for technology operations',
    ],
    techs: ['Grafana', 'Prometheus', 'OpenTelemetry'],
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    color: 'from-indigo-500 to-blue-600',
    glow: 'shadow-indigo-500/40',
    tagline: 'Certified for ISO, CSA & SOC, security built into SDLC',
    bullets: [
      'Certified for ISO, CSA & SOC security standards',
      'Security built into software development life cycle',
      'Data protection at rest and transit, protecting PII',
    ],
    techs: ['SOC', 'ISO', 'CSA'],
  },
]

const PLATFORM_MODULES: Array<{ id: ComponentId; name: string }> = [
  { id: 'integration', name: 'Integration, APIs & Events' },
  { id: 'data-architecture', name: 'Data Architecture' },
  { id: 'deployment', name: 'Deployment & Cloud' },
  { id: 'security', name: 'Security' },
  { id: 'observability', name: 'Observability' },
  { id: 'design-time', name: 'Design Time' },
]

const AUTO_ADVANCE_MS = 5000
const CATEGORIES_STORAGE_KEY = 'bsg_selected_categories'

interface LandingPageProps {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

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

export function LandingPage({ theme, onThemeChange }: LandingPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, hasRole } = useAuth()
  const [platformOpen, setPlatformOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [activePillarIndex, setActivePillarIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
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

  const goNext = useCallback(() => {
    setActivePillarIndex((i) => (i + 1) % TECHNOLOGY_PILLARS.length)
  }, [])

  const goPrev = useCallback(() => {
    setActivePillarIndex((i) => (i - 1 + TECHNOLOGY_PILLARS.length) % TECHNOLOGY_PILLARS.length)
  }, [])

  useEffect(() => setIsVisible(true), [])
  useEffect(() => {
    if (isPaused) return
    const t = setInterval(goNext, AUTO_ADVANCE_MS)
    return () => clearInterval(t)
  }, [isPaused, goNext])

  const handleModuleSelect = (id: ComponentId) => {
    navigate(`/platform/${id}`)
    setPlatformOpen(false)
    setMobileMenuOpen(false)
  }

  const pillar = TECHNOLOGY_PILLARS[activePillarIndex]
  const Icon = pillar.icon

  return (
    <div className={`min-h-screen flex flex-col w-full ${isDark ? 'bg-[#0a0e1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={onThemeChange}
      />
      {/* Top Nav - full width */}
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
              onClick={() => setSettingsOpen(true)}
              title="Settings (API token, categories)"
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-500 hidden sm:inline">{user?.email?.split('@')[0] || user?.username}</span>
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
              <button onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false) }} className="block w-full text-left py-2 flex items-center gap-2">
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

      {/* Main Content - full width layout */}
      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8 md:py-12 lg:py-16">
          {/* Hero - full width */}
          <div className={`mb-8 lg:mb-12 transition-all duration-700 text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>Temenos Technology</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cloud-native, event-driven architecture and extensible APIs
            </h1>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Leading banking forward by embedding technology principles into our architecture, extensibility, and operations.
            </p>
          </div>

          {/* Architecture Pillars Carousel - central menu */}
          <div
            className={`w-full mb-12 lg:mb-16 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative w-full">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous"
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-white/10 hover:bg-white/20 border border-white/20' : 'bg-slate-200 hover:bg-slate-300 border border-slate-300'}`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next"
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-white/10 hover:bg-white/20 border border-white/20' : 'bg-slate-200 hover:bg-slate-300 border border-slate-300'}`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div
                className={`w-full rounded-3xl border p-8 md:p-12 lg:p-16 transition-all duration-500 ${isDark ? 'bg-white/[0.04] border-white/15 backdrop-blur-md' : 'bg-white border-slate-200 shadow-xl'} ${pillar.glow}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? 'text-white/70' : 'text-slate-500'}`}>{pillar.title}</div>
                    <h2 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{pillar.tagline}</h2>
                    <ul className="space-y-3 mb-6">
                      {pillar.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-cyan-400/80 mt-0.5 flex-shrink-0">•</span>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {pillar.techs.map((t) => (
                        <span key={t} className={`px-3 py-1.5 rounded-full text-sm ${isDark ? 'bg-white/5 text-slate-400 border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden lg:flex justify-center items-center">
                    <div className={`w-40 h-40 lg:w-48 lg:h-48 rounded-3xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shadow-2xl opacity-90`}>
                      <Icon className="w-20 h-20 lg:w-24 lg:h-24 text-white/95" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pill selector - central menu */}
              <div className="flex justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
                {TECHNOLOGY_PILLARS.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePillarIndex(i)}
                    onMouseEnter={() => setActivePillarIndex(i)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activePillarIndex === i
                        ? isDark ? 'bg-white/20 text-white ring-2 ring-white/40' : 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                        : isDark ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer theme={theme} />
    </div>
  )
}
