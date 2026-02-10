import { useState, useEffect } from 'react'
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

export const TECHNOLOGY_PILLARS = [
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
] as const

const STORAGE_KEY = 'bsg_has_seen_landing'

export function LandingPage() {
  const navigate = useNavigate()
  const [activePillar, setActivePillar] = useState<number>(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const len = TECHNOLOGY_PILLARS.length
    const t = setInterval(() => {
      setActivePillar((p) => (len > 0 ? (p + 1) % len : 0))
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const handleEnterPlatform = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* ignore */
    }
    navigate('/platform')
  }

  const pillar = TECHNOLOGY_PILLARS[activePillar]
  const Icon = pillar?.icon ?? Cpu

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[100px] animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Header */}
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
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

        {/* Dynamic pillar intro - responsive layout */}
        <div
          className={`mb-12 md:mb-16 transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex gap-2 mb-4 flex-wrap justify-center sm:justify-start">
                {TECHNOLOGY_PILLARS.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePillar(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activePillar === i
                        ? 'bg-white/15 text-white ring-1 ring-white/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <div
                className={`group p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/20 ${pillar?.glow} hover:shadow-xl`}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar?.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {pillar?.title}
                </h2>
                <ul className="space-y-2 text-slate-400">
                  {pillar?.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {pillar?.techs.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-400 border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div
                  className={`w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-gradient-to-br ${pillar?.color} flex items-center justify-center shadow-2xl transition-all duration-500`}
                >
                  <Icon className="w-24 h-24 md:w-32 md:h-32 text-white/90" />
                </div>
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-2xl -z-10" />
              </div>
            </div>
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
  )
}
