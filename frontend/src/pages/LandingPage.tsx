import { useState, useEffect, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cpu,
  Database,
  Puzzle,
  GitBranch,
  Plug,
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { SettingsModal } from '../components/SettingsModal'
import { Footer } from '../components/Footer'
import { TopNav } from '../components/TopNav'

export const TECHNOLOGY_PILLARS: Array<{
  id: string
  title: string
  icon: ComponentType<{ className?: string }>
  color: string
  glow: string
  tagline: string
  bullets: string[]
  techs: string[]
  platformPath: string
}> = [
  {
    id: 'functional-architecture',
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
    platformPath: '/platform/architecture',
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
    platformPath: '/platform/integration',
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
    platformPath: '/platform/extensibility',
  },
  {
    id: 'data-architecture',
    title: 'Data Architecture',
    icon: Database,
    color: 'from-sky-500 to-blue-600',
    glow: 'shadow-sky-500/40',
    tagline: 'Event-driven data flow, streaming, and analytics',
    bullets: [
      'Real-time event streaming and data flow',
      'Data Hub, ODS, SDS integration patterns',
    ],
    techs: ['Kafka', 'Event Hubs', 'Azure SQL'],
    platformPath: '/platform/data-architecture',
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
    platformPath: '/platform/security',
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
    platformPath: '/platform/observability',
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
    platformPath: '/platform/devops',
  },
]

const AUTO_ADVANCE_MS = 5000

interface LandingPageProps {
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
}

export function LandingPage({ theme, onThemeChange }: LandingPageProps) {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [activePillarIndex, setActivePillarIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isDark = theme === 'dark'

  const handlePillarClick = () => {
    const path = TECHNOLOGY_PILLARS[activePillarIndex]?.platformPath
    if (path) navigate(path)
  }

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
      <TopNav theme={theme} onThemeChange={onThemeChange} onSettingsClick={() => setSettingsOpen(true)} />

      {/* Main Content - full width layout */}
      <main className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-8 md:py-12 lg:py-16">
          {/* Hero - full width */}
          <div className={`mb-8 lg:mb-12 transition-all duration-700 text-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-200/60 border border-slate-300'}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${isDark ? 'bg-sky-400' : 'bg-blue-500'}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>
                The Banking Cloud Standard
              </span>
            </div>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>Temenos</span>
              <span className={isDark ? 'bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'}>
                {' '}Technology
              </span>
            </h1>
            <p className={`text-xl sm:text-2xl font-medium mb-4 lowercase max-w-3xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Cloud-native, event-driven architecture and extensible APIs
            </p>
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
            <div className="relative w-full max-w-6xl mx-auto">
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

              {/* Fixed-size frame: same dimensions for all categories to avoid jumps on transition */}
              <div
                role="button"
                tabIndex={0}
                onClick={handlePillarClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePillarClick() } }}
                className={`group w-full rounded-3xl border p-8 md:p-12 lg:p-16 h-[400px] flex flex-col justify-center transition-[transform,box-shadow] duration-500 cursor-pointer hover:scale-[1.01] active:scale-[0.99] overflow-hidden ${isDark ? 'bg-white/[0.04] border-white/15 backdrop-blur-md hover:bg-white/[0.07]' : 'bg-white border-slate-200 shadow-xl hover:shadow-2xl'}`}
                aria-label={`Go to ${pillar.title} - ${pillar.tagline}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full min-h-0">
                  <div className="min-h-0 flex flex-col justify-center overflow-y-auto">
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
                  <div className="hidden lg:flex justify-center items-center flex-shrink-0">
                    <div className={`w-40 h-40 lg:w-48 lg:h-48 rounded-3xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shadow-2xl opacity-90 group-hover:scale-105 transition-transform duration-300`}>
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
