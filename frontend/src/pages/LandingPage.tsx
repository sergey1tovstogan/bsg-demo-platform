import { useState, useEffect } from 'react'
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
  Sparkles,
} from 'lucide-react'

export const TECHNOLOGY_PILLARS: Array<{
  id: string
  title: string
  icon: ComponentType<{ className?: string }>
  color: string
  glow: string
  bullets: string[]
  techs: string[]
}> = [
  {
    id: 'architecture',
    title: 'Architecture',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    glow: 'group-hover:shadow-blue-500/30',
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
    glow: 'group-hover:shadow-violet-500/30',
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
    glow: 'group-hover:shadow-emerald-500/30',
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
    glow: 'group-hover:shadow-amber-500/30',
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
    glow: 'group-hover:shadow-rose-500/30',
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
    glow: 'group-hover:shadow-indigo-500/30',
    bullets: [
      'Certified for ISO, CSA & SOC security standards',
      'Security built into software development life cycle',
      'Data protection at rest and transit, protecting PII',
    ],
    techs: ['SOC', 'ISO', 'CSA'],
  },
]

const STORAGE_KEY = 'bsg_has_seen_landing'

export function LandingPage() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleEnterPlatform = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* ignore */
    }
    navigate('/platform')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[100px] animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
          {/* Header */}
          <div
            className={`text-center mb-12 md:mb-14 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Technology Principles
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                Temenos Technology
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Leading banking forward with cloud-native, event-driven architecture
              and extensible APIs.
            </p>
          </div>

          {/* Static grid – all pillars displayed together */}
          <div
            className={`w-full mb-12 md:mb-14 transition-all duration-500 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TECHNOLOGY_PILLARS.map((pillar, i) => {
                const Icon = pillar.icon
                return (
                  <div
                    key={pillar.id}
                    className={`group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/20 ${pillar.glow} hover:shadow-xl flex flex-col min-h-[280px]`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-lg font-bold mb-3 text-white uppercase tracking-wide">
                      {pillar.title}
                    </h2>
                    <ul className="space-y-2 text-slate-400 text-sm flex-1">
                      {pillar.bullets.map((b, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {pillar.techs.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-slate-400 border border-white/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enter Platform CTA */}
          <div
            className={`text-center transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={handleEnterPlatform}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-100"
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
