import { Network, Database, Cloud, Shield, Eye, Palette } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComponentId } from '../types'

interface ComponentCard {
  id: ComponentId
  name: string
  description: string
  icon: LucideIcon
  color: string
  gradient: string
  delay: string
}

interface HomePageProps {
  onSelectComponent: (componentId: ComponentId) => void
}

const components: ComponentCard[] = [
  {
    id: 'integration',
    name: 'Integration, APIs & Events',
    description: 'Enterprise integration patterns and API design',
    icon: Network,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-400/20',
    delay: 'animation-delay-0',
  },
  {
    id: 'data-architecture',
    name: 'Data Architecture',
    description: 'Database design and data modeling',
    icon: Database,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-teal-400/20',
    delay: 'animation-delay-100',
  },
  {
    id: 'deployment',
    name: 'Deployment & Cloud',
    description: 'Container orchestration and cloud deployments',
    icon: Cloud,
    color: 'text-violet-500',
    gradient: 'from-violet-500/20 to-purple-400/20',
    delay: 'animation-delay-200',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Application security and vulnerability management',
    icon: Shield,
    color: 'text-red-500',
    gradient: 'from-red-500/20 to-rose-400/20',
    delay: 'animation-delay-300',
  },
  {
    id: 'observability',
    name: 'Observability',
    description: 'Monitoring, logging, and distributed tracing',
    icon: Eye,
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 to-orange-400/20',
    delay: 'animation-delay-400',
  },
  {
    id: 'design-time',
    name: 'Design Time',
    description: 'Software design principles and architecture patterns',
    icon: Palette,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500/20 to-blue-400/20',
    delay: 'animation-delay-500',
  },
]

export function HomePage({ onSelectComponent }: HomePageProps) {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left space-y-4 mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            BSG Demo Platform
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Explore interactive demonstrations across multiple technical domains.
          Select a module below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component, index) => {
          const Icon = component.icon
          return (
            <button
              key={component.id}
              onClick={() => onSelectComponent(component.id)}
              className={`group relative overflow-hidden modern-card text-left animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${component.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-md`}>
                  <Icon className={`w-7 h-7 ${component.color}`} />
                </div>

                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {component.name}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {component.description}
                </p>

                <div className="mt-6 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Explore Module <span className="ml-2">→</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
