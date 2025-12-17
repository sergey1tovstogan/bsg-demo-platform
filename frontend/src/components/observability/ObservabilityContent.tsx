import { useState, useEffect } from 'react'
import { Activity, FileText, GitBranch, Server, Database, BarChart3, Box, Lightbulb, Layers, AlertCircle, Wrench, ArrowRight, ArrowDown, Workflow } from 'lucide-react'
import { apiService } from '../../services/api'
import type { Content } from '../../types'
import { TemenosMonitoringFlow } from './TemenosMonitoringFlow'

interface ContentPage {
  content_id: string
  title: string
  type: string
  order: number
  body: any
  metadata: any
}

type PageName = 'intro' | 'big-picture' | 'pillars' | 'stack' | 'temenos-stack' | 'monitoring-flow'

export function ObservabilityContent() {
  const [selectedPage, setSelectedPage] = useState<PageName>('intro')
  const [content, setContent] = useState<Record<string, ContentPage>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getContent('observability')
      if (response.success) {
        const contentMap: Record<string, ContentPage> = {}
        // Cast the generic Content type to our specific ContentPage structure if needed, 
        // or just use the response data as is if it matches. 
        // The API returns Content[], and we map it by ID.
        response.data.forEach((item: Content) => {
          // Extract page name from content_id (e.g. 'obs-intro' -> 'intro')
          const pageName = item.content_id.replace('obs-', '')
          // We assume the body structure matches what we need
          contentMap[pageName] = item as unknown as ContentPage
        })
        setContent(contentMap)
      } else {
        setError('Failed to load content')
      }
    } catch (error) {
      console.error('Error fetching observability content:', error)
      setError('Failed to load content. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const pages = [
    { id: 'intro' as PageName, title: 'Introduction', icon: Lightbulb },
    { id: 'big-picture' as PageName, title: 'Big Picture', icon: Lightbulb },
    { id: 'pillars' as PageName, title: 'Core Pillars', icon: Layers },
    { id: 'stack' as PageName, title: 'The Stack', icon: Server },
    { id: 'temenos-stack' as PageName, title: 'Temenos Stack', icon: Box },
    { id: 'monitoring-flow' as PageName, title: 'Temenos Monitoring Flow', icon: Workflow }
  ]

  const renderIntroduction = () => {
    const page = content['intro']
    if (!page?.body) return <div className="text-slate-600 dark:text-slate-400">Loading content...</div>

    return (
      <div className="px-6 py-8 text-center space-y-8">
        <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-slate-50">
          Understanding <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003366] to-[#00A3E0]">Observability</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">{page.body.subtitle}</p>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 mt-8 text-left shadow-md hover:shadow-lg transition-all duration-200">
          <p className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-50">
            <span className="text-[#00A3E0]">Imagine:</span> {page.body.story.scenario.replace('Imagine: ', '')}
          </p>
          <div className="border-l-4 border-red-500 pl-6 mb-6 bg-red-50 dark:bg-red-900/20 py-4 rounded-r-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer">
            <p className="text-lg text-red-700 dark:text-red-300"><span className="font-semibold">Monitoring</span> {page.body.story.monitoring.replace('Monitoring tells you: ', 'tells you: ')}</p>
          </div>
          <div className="border-l-4 border-[#00A3E0] pl-6 mb-6 bg-blue-50 dark:bg-blue-900/20 py-4 rounded-r-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer">
            <p className="text-lg text-[#003366] dark:text-[#00A3E0]"><span className="font-semibold">Observability</span> {page.body.story.observability.replace('Observability tells you: ', 'tells you: ')}</p>
          </div>
          <p className="italic text-lg text-slate-500 dark:text-slate-400">{page.body.story.analogy}</p>
        </div>

        <button
          onClick={() => setSelectedPage('big-picture')}
          className="bg-[#003366] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200 flex items-center gap-2 mx-auto font-semibold"
        >
          Start Exploring <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderBigPicture = () => {
    const page = content['big-picture']
    if (!page?.body) return <div className="text-slate-600 dark:text-slate-400">Loading content...</div>

    return (
      <div className="px-6 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monitoring Card */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Monitoring</h3>
            </div>
            <p className="text-lg italic mb-6 text-slate-600 dark:text-slate-300 leading-relaxed">{page.body.monitoring.question}</p>
            <ul className="space-y-3">
              {page.body.monitoring.points.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-base text-slate-600 dark:text-slate-300">
                  <span className="text-red-500 mt-1 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Observability Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#00A3E0] p-3 rounded-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Observability</h3>
            </div>
            <p className="text-lg italic mb-6 text-slate-600 dark:text-slate-300 leading-relaxed">{page.body.observability.question}</p>
            <ul className="space-y-3">
              {page.body.observability.points.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-base text-slate-600 dark:text-slate-300">
                  <span className="text-[#00A3E0] mt-1 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Analogy Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-50">{page.body.analogy.heading}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">{page.body.analogy.dashboard}</p>
            </div>
            <div className="flex gap-4">
              <Wrench className="w-8 h-8 text-[#00A3E0] flex-shrink-0 mt-1" />
              <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">{page.body.analogy.toolkit}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelectedPage('pillars')}
          className="bg-[#003366] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200 flex items-center gap-2 mx-auto font-semibold"
        >
          Explore the Core Pillars <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderPillars = () => {
    const page = content['pillars']
    if (!page?.body) return <div className="text-slate-600 dark:text-slate-400">Loading content...</div>

    const iconMap: Record<string, any> = {
      'Metrics': Activity,
      'Logs': FileText,
      'Traces': GitBranch
    }

    const colorMap: Record<string, string> = {
      'red': 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
      'blue': 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      'green': 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
    }

    const borderColorMap: Record<string, string> = {
      'red': 'border-red-200 dark:border-red-800',
      'blue': 'border-blue-200 dark:border-blue-800',
      'green': 'border-emerald-200 dark:border-emerald-800'
    }

    const iconBgMap: Record<string, string> = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'green': 'bg-emerald-500'
    }

    return (
      <div className="px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50 tracking-tight">{page.title}</h1>
          <p className="text-lg max-w-3xl mx-auto text-slate-600 dark:text-slate-300 leading-relaxed">{page.body.subtitle}</p>
        </div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-8">
          {page.body.pillars.map((pillar: any, i: number) => {
            const Icon = iconMap[pillar.name]
            return (
              <div key={i} className={`bg-gradient-to-br ${colorMap[pillar.color]} border-2 ${borderColorMap[pillar.color]} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200`}>
                <div className={`${iconBgMap[pillar.color]} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-50">{pillar.name}</h3>
                <p className="mb-4 text-base text-slate-600 dark:text-slate-300 leading-normal">{pillar.description}</p>
                <div className="space-y-2 mb-4">
                  {pillar.examples.map((example: string, j: number) => (
                    <div key={j} className="text-sm flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <span className="text-[#00A3E0] mt-0.5 font-bold">•</span>
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm italic border-t border-slate-200 dark:border-slate-700 pt-4 text-slate-600 dark:text-slate-300">
                  {pillar.summary}
                </div>
              </div>
            )
          })}
        </div>

        {/* How They Work Together */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-50">{page.body.together.heading}</h2>
          <div className="space-y-4">
            {page.body.together.steps.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-[#003366] text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-lg">
                  {i + 1}
                </div>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-normal pt-2">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSelectedPage('stack')}
          className="bg-[#003366] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200 flex items-center gap-2 mx-auto font-semibold"
        >
          See the Observability Stack <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderStack = () => {
    const page = content['stack']
    if (!page?.body) return <div className="text-slate-600 dark:text-slate-400">Loading content...</div>

    return (
      <div className="px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50 tracking-tight">{page.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{page.body.subtitle}</p>
        </div>

        {/* Three Tiers */}
        <div className="space-y-8">
          {page.body.tiers.map((tier: any, i: number) => {
            const icons: Record<string, any> = { 'Collector': Server, 'Storage': Database, 'Visualization': BarChart3 }
            const Icon = icons[tier.name]
            const colors: Record<string, any> = {
              'purple': { bg: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20', border: 'border-purple-200 dark:border-purple-800', icon: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
              'blue': { bg: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
              'pink': { bg: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20', border: 'border-rose-200 dark:border-rose-800', icon: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' }
            }
            const color = colors[tier.color]

            return (
              <div key={i}>
                <div className={`bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-200`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${color.icon} p-3 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{tier.name}</h3>
                      <p className={`${color.text} text-sm font-medium`}>{tier.subheading}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tier.items.map((item: string, j: number) => (
                      <span key={j} className={`${color.badge} px-3 py-1 rounded-md text-sm font-medium`}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">Examples:</span> {tier.examples.join(', ')}</p>
                </div>
                {i < page.body.tiers.length - 1 && (
                  <div className="flex justify-center my-4">
                    <ArrowDown className="w-8 h-8 text-[#00A3E0]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Data Flow */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-50">{page.body.flow.heading}</h2>
          <div className="space-y-4">
            {page.body.flow.steps.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-[#003366] text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-lg">
                  {i + 1}
                </div>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-normal pt-2">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#003366] to-[#0066CC] rounded-xl p-8 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-4">You've Mastered the Basics!</h2>
          <p className="mb-6 text-slate-100 text-lg">You now understand the fundamentals of observability and how the stack works together.</p>
          <button
            onClick={() => setSelectedPage('intro')}
            className="bg-white text-[#003366] px-8 py-3 rounded-lg hover:bg-slate-100 shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center gap-2 font-semibold"
          >
            Back to Introduction
          </button>
        </div>
      </div>
    )
  }

  const renderTemenosStack = () => {
    const page = content['temenos-stack']
    if (!page?.body) return <div className="text-slate-600 dark:text-slate-400">Loading content...</div>

    return (
      <div className="px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50 tracking-tight">{page.title}</h1>
          <p className="text-lg max-w-4xl mx-auto text-slate-600 dark:text-slate-300 leading-relaxed">{page.body.subtitle}</p>
        </div>

        {/* Three Column Architecture */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Container */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{page.body.architecture.product_container.name}</h3>
            </div>
            <div className="space-y-4 mb-6">
              {page.body.architecture.product_container.components.map((comp: any, i: number) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-50">{comp.name}</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${comp.library === 'OTEL libraries' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                      {comp.library}
                    </span>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${comp.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm space-y-2">
              {page.body.architecture.product_container.info.map((info: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-car Container */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#00A3E0] p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{page.body.architecture.sidecar_container.name}</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-[#00A3E0]/10 p-4 rounded-xl mb-4">
                <Database className="w-12 h-12 text-[#00A3E0]" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">{page.body.architecture.sidecar_container.component.name}</h4>
              <p className="text-center mb-4 text-sm text-slate-600 dark:text-slate-300 leading-normal">{page.body.architecture.sidecar_container.component.description}</p>
              <ArrowRight className="w-8 h-8 text-[#00A3E0]" />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300">
              {page.body.architecture.sidecar_container.info.map((info: string, i: number) => (
                <p key={i} className="mb-2 last:mb-0">{info}</p>
              ))}
            </div>
          </div>

          {/* Aggregation & Visualization */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{page.body.architecture.aggregation.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {page.body.architecture.aggregation.tools.map((tool: any, i: number) => {
                const toolColors: Record<string, string> = {
                  'orange': 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
                  'blue': 'bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
                  'yellow': 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
                  'orange-600': 'bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                }
                return (
                  <div key={i} className={`bg-white dark:bg-slate-800 border-2 ${toolColors[tool.color] || 'border-slate-200 dark:border-slate-700'} rounded-lg p-4 text-center`}>
                    <div className={`w-10 h-10 ${toolColors[tool.color] || 'bg-slate-100 dark:bg-slate-700'} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Server className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-50">{tool.name}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{tool.type}</div>
                  </div>
                )
              })}
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300">
              {page.body.architecture.aggregation.info.map((info: string, i: number) => (
                <p key={i} className="mb-1 last:mb-0">{info}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {page.body.features.map((feature: any, i: number) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
              <h4 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50">{feature.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-normal">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Architecture Flow */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-50">{page.body.flow.heading}</h2>
          <div className="space-y-4">
            {page.body.flow.steps.map((step: any, i: number) => {
              const colorMap: Record<string, string> = {
                'blue': 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
                'purple': 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
                'green': 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                'orange': 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
              }
              return (
                <div key={i} className="flex items-start gap-4">
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold ${colorMap[step.color]} whitespace-nowrap`}>
                    Step {i + 1}
                  </span>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">{step.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-lg max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error Loading Content</h4>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="border-4 border-slate-200 dark:border-slate-700 border-t-[#003366] dark:border-t-[#00A3E0] rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p className="text-base text-slate-600 dark:text-slate-300 font-medium">Loading observability content...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (selectedPage) {
      case 'intro': return renderIntroduction()
      case 'big-picture': return renderBigPicture()
      case 'pillars': return renderPillars()
      case 'stack': return renderStack()
      case 'temenos-stack': return renderTemenosStack()
      case 'monitoring-flow': return <TemenosMonitoringFlow />
      default: return <div className="text-slate-600 dark:text-slate-300">Select a page</div>
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Navigation - Inside the component */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Observability Explained</h2>
            <div className="flex flex-wrap gap-1 overflow-x-auto">
              {pages.map((page) => {
                const Icon = page.icon
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page.id)}
                    className={`px-5 py-3 rounded-t-lg transition-all duration-200 flex items-center gap-2 font-semibold text-base whitespace-nowrap ${
                      selectedPage === page.id
                        ? 'bg-[#003366] text-white border-b-3 border-[#00A3E0] shadow-md scale-105'
                        : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{page.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Below the navigation */}
      <div className="min-h-[600px] bg-slate-50 dark:bg-slate-900">
        {renderContent()}
      </div>
    </div>
  )
}

