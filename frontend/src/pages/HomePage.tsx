import { useState, useEffect } from 'react'
import { Network, Database, Cloud, Shield, Eye, Palette, Settings, Layout } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComponentId } from '../types'
import { useAuth } from '../contexts/AuthContext'

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
  onSettingsClick?: () => void
  searchBar?: React.ReactNode
}

const ALL_COMPONENTS: ComponentCard[] = [
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
  {
    id: 'layout-showcase',
    name: 'Design System Showcase',
    description: 'Comprehensive unified layout and component demonstrations',
    icon: Layout,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-violet-400/20',
    delay: 'animation-delay-600',
  },
]

const STORAGE_KEY = 'bsg_selected_categories'

export function HomePage({ onSelectComponent, onSettingsClick, searchBar }: HomePageProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<ComponentId>>(new Set())
  const { user } = useAuth()
  
  // Display name: prefer context username (set at login), fallback to email local part; capitalize
  const getDisplayName = (): string | null => {
    const name = user?.username ?? (user?.email ? (user.email.split('@')[0] || '').split('.')[0]?.trim() || user.email.split('@')[0] : null)
    if (!name) return null
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const displayName = getDisplayName()

  // Load selected categories from localStorage on mount and when storage changes
  const loadCategories = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ComponentId[]
        setSelectedCategories(new Set(parsed))
      } else {
        // Default: show all categories
        setSelectedCategories(new Set(ALL_COMPONENTS.map(c => c.id)))
      }
    } catch (error) {
      console.error('Failed to load category preferences:', error)
      // Default: show all categories
      setSelectedCategories(new Set(ALL_COMPONENTS.map(c => c.id)))
    }
  }

  useEffect(() => {
    loadCategories()
    
    // Listen for custom event dispatched by SettingsModal when categories change
    const handleCategoryUpdate = () => {
      loadCategories()
    }
    
    window.addEventListener('categoriesUpdated', handleCategoryUpdate)
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate)
    }
  }, [])

  // Filter components based on selected categories
  const visibleComponents = ALL_COMPONENTS.filter(component => 
    selectedCategories.has(component.id)
  )

  return (
    <div className="space-y-8">
      <div className="space-y-6 mb-12 animate-fade-in">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight whitespace-nowrap">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              BSG Demo Platform
            </span>
          </h1>
          <div className="flex items-center gap-4 ml-auto">
            {displayName && (
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Welcome {displayName}
              </div>
            )}
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                title="Customize Categories"
              >
                <Settings className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed whitespace-nowrap">
          Explore interactive demonstrations across multiple technical domains. Select a module below to get started.
        </p>
        {searchBar && <div className="mt-4">{searchBar}</div>}
      </div>

      {visibleComponents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            No categories selected. Please select categories in Settings to view modules.
          </p>
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Settings
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleComponents.map((component, index) => {
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
      )}
    </div>
  )
}
