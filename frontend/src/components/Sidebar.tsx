import {
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  Network,
  Database,
  Cloud,
  Shield,
  Eye,
  Palette,
  Layout,
  Grid,
  PenTool,
  LogIn,
  LogOut,
  Users,
  type LucideIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ComponentId } from '../types'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

interface SidebarProps {
  currentComponent: ComponentId | null
  onComponentChange?: (componentId: ComponentId) => void
  onHomeClick?: () => void
  onSettingsClick?: () => void
  onCollapseRef?: (collapseFn: () => void) => void
  /** Optional top offset when used below a top nav (e.g. "3.5rem") */
  topOffset?: string
}

interface ComponentCard {
  id: ComponentId
  name: string
  description: string
  icon: LucideIcon
  color: string
  gradient: string
}

const components: ComponentCard[] = [
  {
    id: 'integration',
    name: 'Integration',
    description: 'APIs & Events',
    icon: Network,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'data-architecture',
    name: 'Data',
    description: 'Architecture & Models',
    icon: Database,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'deployment',
    name: 'Deployment',
    description: 'Cloud & DevOps',
    icon: Cloud,
    color: 'text-violet-500',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Auth & Protection',
    icon: Shield,
    color: 'text-red-500',
    gradient: 'from-red-500 to-rose-400',
  },
  {
    id: 'observability',
    name: 'Observability',
    description: 'Monitor & Trace',
    icon: Eye,
    color: 'text-amber-500',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    id: 'design-time',
    name: 'DevOps',
    description: 'CI/CD & Automation',
    icon: Palette,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500 to-blue-400',
  },
  {
    id: 'layout-showcase',
    name: 'Design System',
    description: 'Unified Layout',
    icon: Layout,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-violet-400',
  },
  {
    id: 'gallery',
    name: 'Card Gallery',
    description: 'Browse Cards',
    icon: Grid,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-violet-400',
  },
  {
    id: 'editor',
    name: 'Visual Editor',
    description: 'Create & Edit',
    icon: PenTool,
    color: 'text-cyan-500',
    gradient: 'from-cyan-500 to-blue-400',
  },
]

export function Sidebar({
  currentComponent,
  onComponentChange,
  onHomeClick,
  onSettingsClick,
  onCollapseRef,
  topOffset
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true) // Start collapsed
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const { logout, hasRole, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Expose collapse function to parent component
  useEffect(() => {
    if (onCollapseRef) {
      onCollapseRef(() => {
        setIsCollapsed(true)
      })
    }
  }, [onCollapseRef])

  // Auto-hide after 5 seconds of inactivity
  useEffect(() => {
    if (!isCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isCollapsed, lastInteractionTime])

  // Reset auto-hide timer when sidebar is expanded
  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (!newState) {
      setLastInteractionTime(Date.now())
    }
  }

  // Track interactions to reset auto-hide timer
  const handleInteraction = () => {
    if (!isCollapsed) {
      setLastInteractionTime(Date.now())
    }
  }

  const isExpanded = !isCollapsed

  // Update body data attribute to adjust main content margin
  useEffect(() => {
    document.body.setAttribute('data-sidebar', isExpanded ? 'expanded' : 'collapsed')
  }, [isExpanded])

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full z-50 transition-all duration-500 ease-in-out",
        "bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl",
        isExpanded ? "w-72" : "w-20"
      )}
      style={topOffset ? { top: topOffset, height: `calc(100vh - ${topOffset})` } : undefined}
      onClick={handleInteraction}
    >
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleToggle()
        }}
        className="absolute -right-3 top-20 bg-blue-600 text-white p-1.5 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all z-10 border-2 border-slate-900"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isExpanded ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* Logo */}
      <div className={clsx("px-6 py-8 transition-all duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          {isExpanded && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-white font-bold text-lg tracking-tight">BSG Demo</span>
              <span className="text-slate-400 text-xs font-medium">Platform</span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Logo (when collapsed) */}
      {!isExpanded && (
        <div className="absolute top-0 left-0 w-full pt-8 flex justify-center pointer-events-none">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">B</span>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col px-3 space-y-2 overflow-y-auto custom-scrollbar mt-4">
        {/* Home Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleInteraction()
            onHomeClick?.()
          }}
          className={clsx(
            "group relative flex items-center rounded-xl transition-all duration-200",
            isExpanded ? "px-4 py-3 space-x-3" : "justify-center p-3",
            !currentComponent
              ? "bg-blue-600/10 text-blue-400"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}
          title="Home"
        >
          <Home className={clsx("w-5 h-5 flex-shrink-0 transition-colors", !currentComponent ? "text-blue-400" : "group-hover:text-white")} />
          {isExpanded && <span className="text-sm font-medium">Home</span>}
          {!isExpanded && !currentComponent && (
            <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
          )}
        </button>

        <div className="my-4 border-t border-white/10 mx-2" />

        {/* Component Cards */}
        <div className="space-y-1">
          {isExpanded && (
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-4 mb-2">
              Modules
            </p>
          )}
          {components.filter(component => {
            const adminOnlyIds = ['layout-showcase', 'gallery', 'editor'];
            if (adminOnlyIds.includes(component.id)) {
              return hasRole('admin');
            }
            return true;
          }).map((component) => {
            const Icon = component.icon
            const isActive = currentComponent === component.id
            return (
              <button
                key={component.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleInteraction()
                  onComponentChange?.(component.id)
                }}
                className={clsx(
                  "group relative w-full flex items-center rounded-xl transition-all duration-200",
                  isExpanded ? "px-4 py-3 text-left" : "justify-center p-3",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-black/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
                title={component.name}
              >
                {isActive && !isExpanded && (
                  <div className={clsx("absolute left-0 w-1 h-8 rounded-r-full bg-gradient-to-b", component.gradient)} />
                )}

                <div className={clsx(
                  "flex items-center justify-center rounded-lg transition-all duration-300",
                  isExpanded ? "w-8 h-8 mr-3" : "w-6 h-6",
                  isActive ? `bg-gradient-to-br ${component.gradient}` : "bg-transparent group-hover:bg-white/10"
                )}>
                  <Icon className={clsx(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : component.color
                  )} />
                </div>

                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <span className={clsx("block text-sm font-medium truncate", isActive ? "text-white" : "text-slate-300 group-hover:text-white")}>
                      {component.name}
                    </span>
                  </div>
                )}
              </button>
            )
          })}

          {/* Admin Section */}
          {hasRole('admin') && (
            <>
              {isExpanded && (
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-4 mt-4 mb-2">
                  Administration
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleInteraction()
                  navigate('/admin/users')
                }}
                className={clsx(
                  "group relative w-full flex items-center rounded-xl transition-all duration-200",
                  isExpanded ? "px-4 py-3 text-left" : "justify-center p-3",
                  "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
                title="User Management"
              >
                <div className={clsx(
                  "flex items-center justify-center rounded-lg transition-all duration-300",
                  isExpanded ? "w-8 h-8 mr-3" : "w-6 h-6",
                  "bg-transparent group-hover:bg-white/10"
                )}>
                  <Users className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>

                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-slate-300 group-hover:text-white truncate">
                      Users
                    </span>
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* Login/Logout Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleInteraction()
            if (isAuthenticated) {
              logout()
              navigate('/')
            } else {
              navigate('/login')
            }
          }}
          className={clsx(
            "w-full flex items-center rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white",
            isExpanded ? "px-4 py-3 space-x-3" : "justify-center p-3"
          )}
          title={isAuthenticated ? "Log Out" : "Log In"}
        >
          {isAuthenticated ? (
            <LogOut className="w-5 h-5 flex-shrink-0" />
          ) : (
            <LogIn className="w-5 h-5 flex-shrink-0" />
          )}
          {isExpanded && <span className="text-sm font-medium">{isAuthenticated ? "Log Out" : "Log In"}</span>}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleInteraction()
            onSettingsClick?.()
          }}
          className={clsx(
            "w-full flex items-center rounded-xl transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white",
            isExpanded ? "px-4 py-3 space-x-3" : "justify-center p-3"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  )
}
