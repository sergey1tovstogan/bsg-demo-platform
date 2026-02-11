import { useState, useEffect, useCallback } from 'react'
import type { ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cpu,
  Puzzle,
  GitBranch,
  Plug,
  Activity,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

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

const STORAGE_KEY = 'bsg_has_seen_landing'
const AUTO_ADVANCE_MS = 5000

export function LandingPage() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % TECHNOLOGY_PILLARS.length)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + TECHNOLOGY_PILLARS.length) % TECHNOLOGY_PILLARS.length)
  }, [])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const t = setInterval(goNext, AUTO_ADVANCE_MS)
    return () => clearInterval(t)
  }, [isPaused, goNext])

  const handleEnterPlatform = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* ignore */
    }
    navigate('/platform')
  }

  const pillar = TECHNOLOGY_PILLARS[activeIndex]
  const Icon = pillar.icon

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-transparent to-violet-500" />
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/15 blur-[80px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          {/* Header */}
          <div
            className={`text-center mb-10 md:mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Temenos Technology
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white max-w-3xl mx-auto leading-tight">
              Cloud-native, event-driven architecture and extensible APIs
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto">
              Leading banking forward by embedding technology principles into our architecture, extensibility, and operations.
            </p>
          </div>

          {/* Dynamic Carousel - one pillar at a time */}
          <div
            className={`w-full mb-12 transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative">
              {/* Navigation arrows */}
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous pillar"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:left-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next pillar"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Featured card */}
              <div
                key={pillar.id}
                className={`relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-md p-8 md:p-12
                  shadow-2xl ${pillar.glow}
                  transition-all duration-500 ease-out
                  hover:border-white/30 hover:scale-[1.01] hover:shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)]`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-4">
                      {pillar.title}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                      {pillar.tagline}
                    </h2>
                    <ul className="space-y-3 text-slate-400">
                      {pillar.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-cyan-400/80 mt-0.5 flex-shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {pillar.techs.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-slate-400 border border-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden lg:flex justify-center items-center">
                    <div
                      className={`w-48 h-48 rounded-3xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shadow-2xl opacity-90`}
                    >
                      <Icon className="w-24 h-24 text-white/95" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pill selector */}
              <div className="flex justify-center gap-3 mt-6 flex-wrap">
                {TECHNOLOGY_PILLARS.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                      ${activeIndex === i
                        ? 'bg-white/20 text-white ring-2 ring-white/40'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                      }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enter Platform CTA */}
          <div
            className={`text-center transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={handleEnterPlatform}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-100"
            >
              Enter Platform
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-sm text-slate-500">
              Explore the BSG Demo Platform modules
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
