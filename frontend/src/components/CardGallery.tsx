/**
 * Card Gallery Component
 * 
 * Displays category cards on the home page (Data Hub, API, Cloud deployment, Security, etc.)
 */

import React from 'react'
import { 
  Database, 
  Cloud, 
  Shield, 
  Network, 
  Layers,
  Activity,
  Settings,
  Server
} from 'lucide-react'

interface CategoryCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  bgColor: string
}

const categories: CategoryCard[] = [
  {
    id: 'data-hub',
    title: 'Data Hub',
    description: 'Data architecture and management',
    icon: Database,
    gradient: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'api',
    title: 'API',
    description: 'API gateway and integration',
    icon: Network,
    gradient: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'cloud-deployment',
    title: 'Cloud Deployment',
    description: 'Cloud infrastructure and services',
    icon: Cloud,
    gradient: 'from-indigo-600 to-blue-700',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Security architecture and compliance',
    icon: Shield,
    gradient: 'from-red-600 to-rose-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  {
    id: 'observability',
    title: 'Observability',
    description: 'Monitoring, logging, and tracing',
    icon: Activity,
    gradient: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'architecture',
    title: 'Architecture',
    description: 'System architecture and design',
    icon: Layers,
    gradient: 'from-orange-600 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
]

export const CardGallery: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Categories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <div
              key={category.id}
              className={`${category.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${category.gradient} flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CardGallery
