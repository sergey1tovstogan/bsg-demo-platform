import { useState, useEffect } from 'react'
import { Activity, FileText, GitBranch, Server, Database, BarChart3, Box, Lightbulb, Layers, AlertCircle, Wrench, ArrowRight, ArrowDown } from 'lucide-react'
import { apiService } from '../../services/api'
import type { Content } from '../../types'

interface ContentPage {
  content_id: string
  title: string
  type: string
  order: number
  body: any
  metadata: any
}

type PageName = 'intro' | 'big-picture' | 'pillars' | 'stack' | 'temenos-stack'

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
    { id: 'temenos-stack' as PageName, title: 'Temenos Stack', icon: Box }
  ]

  const renderIntroduction = () => {
    const page = content['intro']
    if (!page?.body) return <div className="text-gray-600">Loading content...</div>

    return (
      <div className="px-6 py-8 text-center space-y-8">
        <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Understanding <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Observability</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">{page.body.subtitle}</p>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 mt-8 text-left shadow-sm">
          <p className="mb-6 text-3xl font-bold text-slate-900 dark:text-slate-100">
            <span className="text-teal-600 dark:text-teal-400">Imagine:</span> {page.body.story.scenario.replace('Imagine: ', '')}
          </p>
          <div className="border-l-4 border-red-500 pl-6 mb-6 bg-red-50 dark:bg-red-900/20 py-4 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:z-10 cursor-pointer">
            <p className="text-xl text-red-700 dark:text-red-300"><span className="font-semibold">Monitoring</span> {page.body.story.monitoring.replace('Monitoring tells you: ', 'tells you: ')}</p>
          </div>
          <div className="border-l-4 border-teal-600 pl-6 mb-6 bg-teal-50 dark:bg-teal-900/20 py-4 transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:z-10 cursor-pointer">
            <p className="text-xl text-teal-700 dark:text-teal-300"><span className="font-semibold">Observability</span> {page.body.story.observability.replace('Observability tells you: ', 'tells you: ')}</p>
          </div>
          <p className="italic text-xl text-slate-500 dark:text-slate-400">{page.body.story.analogy}</p>
        </div>

        <button
          onClick={() => setSelectedPage('big-picture')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2 mx-auto font-semibold"
        >
          Start Exploring <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderBigPicture = () => {
    const page = content['big-picture']
    if (!page?.body) return <div className="text-gray-600">Loading content...</div>

    return (
      <div className="px-6 py-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Monitoring Card */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Monitoring</h3>
            </div>
            <p className="text-xl italic mb-6 text-slate-600 dark:text-slate-300">{page.body.monitoring.question}</p>
            <ul className="space-y-3">
              {page.body.monitoring.points.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-red-500 mt-1">•</span> {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Observability Card */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <Wrench className="w-12 h-12 text-teal-600" />
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Observability</h3>
            </div>
            <p className="text-xl italic mb-6 text-slate-600 dark:text-slate-300">{page.body.observability.question}</p>
            <ul className="space-y-3">
              {page.body.observability.points.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <span className="text-teal-500 mt-1">•</span> {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Analogy Section */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">{page.body.analogy.heading}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <p className="text-slate-600 dark:text-slate-300">{page.body.analogy.dashboard}</p>
            </div>
            <div className="flex gap-4">
              <Wrench className="w-8 h-8 text-teal-500 flex-shrink-0" />
              <p className="text-slate-600 dark:text-slate-300">{page.body.analogy.toolkit}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelectedPage('pillars')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2 mx-auto font-semibold"
        >
          Explore the Core Pillars <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderPillars = () => {
    const page = content['pillars']
    if (!page?.body) return <div className="text-gray-600">Loading content...</div>

    const iconMap: Record<string, any> = {
      'Metrics': Activity,
      'Logs': FileText,
      'Traces': GitBranch
    }

    const colorMap: Record<string, string> = {
      'red': 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
      'blue': 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      'green': 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'
    }

    const borderColorMap: Record<string, string> = {
      'red': 'border-red-200 dark:border-red-800',
      'blue': 'border-blue-200 dark:border-blue-800',
      'green': 'border-teal-200 dark:border-teal-800'
    }

    return (
      <div className="px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.title}</h1>
          <p className="text-lg max-w-3xl mx-auto dark:text-slate-300" style={{ color: '#475569' }}>{page.body.subtitle}</p>
        </div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-8">
          {page.body.pillars.map((pillar: any, i: number) => {
            const Icon = iconMap[pillar.name]
            return (
              <div key={i} className={`bg-gradient-to-br ${colorMap[pillar.color]} border-2 ${borderColorMap[pillar.color]} rounded-lg p-6 shadow-sm`}>
                <div className={`bg-${pillar.color}-500 w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 dark:text-slate-100" style={{ color: '#1e293b' }}>{pillar.name}</h3>
                <p className="mb-4 dark:text-slate-300" style={{ color: '#475569' }}>{pillar.description}</p>
                <div className="space-y-2 mb-4">
                  {pillar.examples.map((example: string, j: number) => (
                    <div key={j} className="text-sm flex items-start gap-2 dark:text-slate-400" style={{ color: '#64748b' }}>
                      <span className="text-teal-500 mt-0.5">•</span> {example}
                    </div>
                  ))}
                </div>
                <div className="text-sm italic border-t border-gray-200 dark:border-slate-700 pt-4 dark:text-slate-400" style={{ color: '#64748b' }}>
                  {pillar.summary}
                </div>
              </div>
            )
          })}
        </div>

        {/* How They Work Together */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.together.heading}</h2>
          <div className="space-y-4">
            {page.body.together.steps.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className="text-3xl">{['1️⃣', '2️⃣', '3️⃣'][i]}</div>
                <p className="text-lg dark:text-slate-300" style={{ color: '#475569' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSelectedPage('stack')}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center gap-2 mx-auto font-semibold"
        >
          See the Observability Stack <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  const renderStack = () => {
    const page = content['stack']
    if (!page?.body) return <div className="text-gray-600">Loading content...</div>

    return (
      <div className="px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.title}</h1>
          <p className="text-lg dark:text-slate-300" style={{ color: '#475569' }}>{page.body.subtitle}</p>
        </div>

        {/* Three Tiers */}
        <div className="space-y-8">
          {page.body.tiers.map((tier: any, i: number) => {
            const icons: Record<string, any> = { 'Collector': Server, 'Storage': Database, 'Visualization': BarChart3 }
            const Icon = icons[tier.name]
            const colors: Record<string, any> = {
              'purple': { bg: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20', border: 'border-purple-200 dark:border-purple-800', icon: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
              'blue': { bg: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
              'pink': { bg: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20', border: 'border-rose-200 dark:border-rose-800', icon: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' }
            }
            const color = colors[tier.color]

            return (
              <div key={i}>
                <div className={`bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-lg p-8 shadow-sm`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${color.icon} p-3 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold dark:text-slate-100" style={{ color: '#1e293b' }}>{tier.name}</h3>
                      <p className={color.text}>{tier.subheading}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tier.items.map((item: string, j: number) => (
                      <span key={j} className={`${color.badge} px-3 py-1 rounded-md text-sm font-medium`}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm dark:text-slate-400" style={{ color: '#64748b' }}>Examples: {tier.examples.join(', ')}</p>
                </div>
                {i < page.body.tiers.length - 1 && (
                  <div className="flex justify-center my-4">
                    <ArrowDown className="w-8 h-8 text-teal-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Data Flow */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.flow.heading}</h2>
          <div className="space-y-4">
            {page.body.flow.steps.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-teal-100 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {i + 1}
                </div>
                <p className="dark:text-slate-300" style={{ color: '#475569' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg p-8 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-4">You've Mastered the Basics!</h2>
          <p className="mb-6 text-teal-50">You now understand the fundamentals of observability and how the stack works together.</p>
          <button
            onClick={() => setSelectedPage('intro')}
            className="bg-white dark:bg-slate-800 text-teal-600 px-8 py-3 rounded-md hover:bg-teal-50 transition-all inline-flex items-center gap-2 font-semibold"
          >
            Back to Introduction
          </button>
        </div>
      </div>
    )
  }

  const renderTemenosStack = () => {
    const page = content['temenos-stack']
    if (!page?.body) return <div className="text-gray-600">Loading content...</div>

    return (
      <div className="px-6 py-8 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.title}</h1>
          <p className="text-lg max-w-4xl mx-auto dark:text-slate-300" style={{ color: '#475569' }}>{page.body.subtitle}</p>
        </div>

        {/* Three Column Architecture */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product Container */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Box className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.architecture.product_container.name}</h3>
            </div>
            <div className="space-y-4 mb-6">
              {page.body.architecture.product_container.components.map((comp: any, i: number) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm dark:text-slate-100" style={{ color: '#1e293b' }}>{comp.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${comp.library === 'OTEL libraries' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {comp.library}
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${comp.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 space-y-2">
              {page.body.architecture.product_container.info.map((info: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-600">✓</span> {info}
                </div>
              ))}
            </div>
          </div>

          {/* Side-car Container */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-teal-600" />
              <h3 className="text-xl font-bold dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.architecture.sidecar_container.name}</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <Database className="w-16 h-16 text-teal-600 mb-4" />
              <h4 className="text-lg font-bold mb-2 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.architecture.sidecar_container.component.name}</h4>
              <p className="text-center mb-4 text-sm dark:text-slate-300" style={{ color: '#475569' }}>{page.body.architecture.sidecar_container.component.description}</p>
              <ArrowRight className="w-8 h-8 text-teal-600" />
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-sm text-teal-900">
              {page.body.architecture.sidecar_container.info.map((info: string, i: number) => (
                <p key={i} className="mb-2">{info}</p>
              ))}
            </div>
          </div>

          {/* Aggregation & Visualization */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              <h3 className="text-xl font-bold dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.architecture.aggregation.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {page.body.architecture.aggregation.tools.map((tool: any, i: number) => {
                const toolColors: Record<string, string> = {
                  'orange': 'bg-orange-100 border-orange-200',
                  'blue': 'bg-blue-100 border-blue-200 dark:border-blue-800',
                  'yellow': 'bg-yellow-100 border-yellow-200',
                  'orange-600': 'bg-orange-100 border-orange-200'
                }
                return (
                  <div key={i} className={`bg-white border ${toolColors[tool.color] || 'border-slate-200'} rounded-lg p-4 text-center`}>
                    <div className={`w-12 h-12 ${toolColors[tool.color] || 'bg-slate-100'} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Server className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="font-semibold text-sm dark:text-slate-100" style={{ color: '#1e293b' }}>{tool.name}</div>
                    <div className="text-xs" style={{ color: '#059669' }}>{tool.type}</div>
                  </div>
                )
              })}
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-emerald-900">
              {page.body.architecture.aggregation.info.map((info: string, i: number) => (
                <p key={i}>{info}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {page.body.features.map((feature: any, i: number) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-bold mb-3 dark:text-slate-100" style={{ color: '#1e293b' }}>{feature.title}</h4>
              <p className="text-sm dark:text-slate-300" style={{ color: '#475569' }}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Architecture Flow */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 dark:text-slate-100" style={{ color: '#1e293b' }}>{page.body.flow.heading}</h2>
          <div className="space-y-4">
            {page.body.flow.steps.map((step: any, i: number) => {
              const colorMap: Record<string, string> = {
                'blue': 'bg-blue-100 text-blue-700 border border-blue-200 dark:border-blue-800',
                'purple': 'bg-purple-100 text-purple-700 border border-purple-200 dark:border-purple-800',
                'green': 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:border-emerald-800',
                'orange': 'bg-orange-100 text-orange-700 border border-orange-200'
              }
              return (
                <div key={i} className="flex items-start gap-4">
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold ${colorMap[step.color]}`}>
                    Step {i + 1}
                  </span>
                  <p className="dark:text-slate-300" style={{ color: '#475569' }}>{step.text}</p>
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="dark:text-slate-300" style={{ color: '#475569' }}>Loading observability content...</p>
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
      default: return <div className="dark:text-slate-300" style={{ color: '#475569' }}>Select a page</div>
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
      {/* Navigation - Inside the component */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 border-b border-slate-700">
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-white">Observability Explained</h2>
            <div className="flex flex-wrap gap-2">
              {pages.map((page) => {
                const Icon = page.icon
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page.id)}
                    className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 font-medium ${selectedPage === page.id
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'text-white hover:bg-slate-800 border border-slate-600'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{page.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Below the navigation */}
      <div className="min-h-[600px] bg-white">
        {renderContent()}
      </div>
    </div>
  )
}

