import { useState } from 'react'
import {
  Type, Palette, MousePointer, Square, FileInput, Navigation,
  Package, Grid, Sparkles, Home, CheckCircle, AlertCircle,
  Info, XCircle, Settings, User, Mail, Lock, Search, Plus,
  ArrowRight, Download, Edit, Trash2, Eye, Heart, Star,
  Activity, BarChart3, TrendingUp, Zap
} from 'lucide-react'

type PageId = 'overview' | 'typography' | 'colors' | 'buttons' | 'cards' | 'forms' | 'navigation' | 'components' | 'spacing' | 'animations'

export function LayoutShowcaseContent() {
  const [selectedPage, setSelectedPage] = useState<PageId>('overview')
  const [demoButtonState, setDemoButtonState] = useState<'default' | 'loading' | 'success'>('default')
  const [formData, setFormData] = useState({ name: '', email: '', subscribe: false })

  const pages = [
    { id: 'overview' as PageId, title: 'Overview', icon: Home },
    { id: 'typography' as PageId, title: 'Typography', icon: Type },
    { id: 'colors' as PageId, title: 'Colors', icon: Palette },
    { id: 'buttons' as PageId, title: 'Buttons', icon: MousePointer },
    { id: 'cards' as PageId, title: 'Cards', icon: Square },
    { id: 'forms' as PageId, title: 'Forms', icon: FileInput },
    { id: 'navigation' as PageId, title: 'Navigation', icon: Navigation },
    { id: 'components' as PageId, title: 'Components', icon: Package },
    { id: 'spacing' as PageId, title: 'Spacing', icon: Grid },
    { id: 'animations' as PageId, title: 'Animations', icon: Sparkles },
  ]

  // ========== OVERVIEW PAGE ==========
  const renderOverview = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          BSG Unified <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003366] to-[#00A3E0]">Design System</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          A comprehensive design system built on Temenos brand identity, ensuring consistency, accessibility, and professional excellence across all components.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="bg-[#003366] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Brand Colors</h3>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
            Temenos Navy, Blue, and Cyan create a professional, trustworthy visual identity aligned with banking excellence.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="bg-[#0066CC] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Type className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Typography</h3>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
            Inter font family with carefully crafted type scale ensures optimal readability and clear hierarchy.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="bg-[#00A3E0] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Interactions</h3>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
            Smooth animations, clear hover states, and accessible focus indicators create delightful user experiences.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Design Principles</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#003366] rounded-full p-2 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Clarity Over Decoration</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Information should be immediately accessible</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-[#003366] rounded-full p-2 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Consistency Over Innovation</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Similar elements look and behave the same</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-[#003366] rounded-full p-2 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Professional Over Trendy</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Banking-grade reliability and trust</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-[#003366] rounded-full p-2 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Accessible By Default</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">WCAG 2.1 AA compliance for all users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ========== TYPOGRAPHY PAGE ==========
  const renderTypography = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Typography System</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Inter font family with a carefully crafted type scale for clear hierarchy and optimal readability
        </p>
      </div>

      {/* Headings */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Headings
        </h2>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              H1 - Page Title (32px / 2rem / Bold)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-3xl font-bold tracking-tight
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              H2 - Section Title (24px / 1.5rem / Semi-Bold)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-2xl font-semibold
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              H3 - Subsection Title (20px / 1.25rem / Semi-Bold)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-xl font-semibold
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              H4 - Component Title (18px / 1.125rem / Semi-Bold)
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-lg font-semibold
            </p>
          </div>
          <div>
            <h5 className="text-base font-semibold text-slate-600 dark:text-slate-300">
              H5 - Minor Heading (16px / 1rem / Semi-Bold)
            </h5>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-base font-semibold
            </p>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Body Text
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Body Large (18px) - Introductory text and important descriptions that need emphasis and readability
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-lg leading-relaxed
            </p>
          </div>
          <div>
            <p className="text-base leading-normal text-slate-600 dark:text-slate-300">
              Body Regular (16px) - Standard body text for paragraphs, the workhorse of content presentation
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-base leading-normal
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Body Small (14px) - Secondary information, metadata, and captions
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-sm
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Body Extra Small (12px) - Footnotes, timestamps, and auxiliary information
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-xs
            </p>
          </div>
        </div>
      </div>

      {/* Special Text */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Special Text Styles
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Label Text - Form Labels and Category Tags
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-sm font-medium uppercase tracking-wide
            </p>
          </div>
          <div>
            <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              inline code and technical identifiers
            </code>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded
            </p>
          </div>
          <div>
            <a href="#" className="text-[#0066CC] hover:text-[#00A3E0] underline transition-colors duration-200">
              Link Text - Clickable Links
            </a>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-mono">
              text-[#0066CC] hover:text-[#00A3E0] underline
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // ========== COLORS PAGE ==========
  const renderColors = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Color System</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Temenos brand colors combined with functional and neutral palettes for comprehensive design coverage
        </p>
      </div>

      {/* Temenos Brand Colors */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Temenos Brand Colors
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="bg-[#003366] h-32 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold">Temenos Navy</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm text-slate-700 dark:text-slate-300">#003366</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Primary Brand / Actions</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#0066CC] h-32 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold">Temenos Blue</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm text-slate-700 dark:text-slate-300">#0066CC</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Links / Secondary Actions</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#00A3E0] h-32 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold">Temenos Cyan</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm text-slate-700 dark:text-slate-300">#00A3E0</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accents / Hover States</p>
            </div>
          </div>
        </div>
      </div>

      {/* Functional Colors */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Functional Colors
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div className="bg-[#10B981] h-24 rounded-lg flex items-center justify-center shadow-md">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Success</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">#10B981</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#F59E0B] h-24 rounded-lg flex items-center justify-center shadow-md">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Warning</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">#F59E0B</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#EF4444] h-24 rounded-lg flex items-center justify-center shadow-md">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Error</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">#EF4444</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#60A5FA] h-24 rounded-lg flex items-center justify-center shadow-md">
              <Info className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Info</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">#60A5FA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Category Colors */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Component Category Colors
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Each component maintains its identity color for icons and accents, providing visual wayfinding
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center space-y-2">
            <div className="bg-[#3B82F6] h-16 rounded-lg shadow-md"></div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Integration</p>
            <p className="text-xs font-mono text-slate-500">#3B82F6</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-[#10B981] h-16 rounded-lg shadow-md"></div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Data Arch</p>
            <p className="text-xs font-mono text-slate-500">#10B981</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-[#8B5CF6] h-16 rounded-lg shadow-md"></div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Deployment</p>
            <p className="text-xs font-mono text-slate-500">#8B5CF6</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-[#EF4444] h-16 rounded-lg shadow-md"></div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Security</p>
            <p className="text-xs font-mono text-slate-500">#EF4444</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-[#F59E0B] h-16 rounded-lg shadow-md"></div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Observability</p>
            <p className="text-xs font-mono text-slate-500">#F59E0B</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-[#6366F1] h-16 rounded-lg shadow-md"></div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Design Time</p>
            <p className="text-xs font-mono text-slate-500">#6366F1</p>
          </div>
        </div>
      </div>

      {/* Neutral Palette */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Neutral Palette (Slate Scale)
        </h2>
        <div className="space-y-2">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="flex items-center gap-4">
              <div className={`bg-slate-${shade} h-12 flex-1 rounded-lg shadow-sm border border-slate-300 dark:border-slate-600`}></div>
              <div className="w-32 text-right">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Slate {shade}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ========== BUTTONS PAGE ==========
  const renderButtons = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Button System</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Primary, secondary, and icon buttons with comprehensive state handling
        </p>
      </div>

      {/* Primary Buttons */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Primary Buttons
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Default State</p>
            <button className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200">
              Primary Button
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">With Icon</p>
            <div className="flex gap-3 flex-wrap">
              <button className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New
              </button>
              <button className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                Download
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Loading State</p>
            <button
              className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md flex items-center gap-2 cursor-wait opacity-80"
              disabled
            >
              <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
              Processing...
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Disabled State</p>
            <button
              className="bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold px-6 py-3 rounded-lg cursor-not-allowed opacity-60"
              disabled
            >
              Disabled Button
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Buttons */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Secondary Buttons
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Default State</p>
            <button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#0066CC] hover:text-[#0066CC] dark:hover:text-[#00A3E0] transition-all duration-200">
              Secondary Button
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">With Icons</p>
            <div className="flex gap-3 flex-wrap">
              <button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#0066CC] hover:text-[#0066CC] transition-all duration-200 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#0066CC] hover:text-[#0066CC] transition-all duration-200 flex items-center gap-2">
                Learn More
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Icon Buttons */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Icon Buttons
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button className="w-10 h-10 bg-transparent text-slate-600 dark:text-slate-400 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#003366] dark:hover:text-[#00A3E0] transition-all duration-200">
            <Edit className="w-6 h-6" />
          </button>
          <button className="w-10 h-10 bg-transparent text-slate-600 dark:text-slate-400 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#003366] dark:hover:text-[#00A3E0] transition-all duration-200">
            <Trash2 className="w-6 h-6" />
          </button>
          <button className="w-10 h-10 bg-transparent text-slate-600 dark:text-slate-400 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#003366] dark:hover:text-[#00A3E0] transition-all duration-200">
            <Eye className="w-6 h-6" />
          </button>
          <button className="w-10 h-10 bg-transparent text-slate-600 dark:text-slate-400 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#003366] dark:hover:text-[#00A3E0] transition-all duration-200">
            <Heart className="w-6 h-6" />
          </button>
          <button className="w-10 h-10 bg-transparent text-slate-600 dark:text-slate-400 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#003366] dark:hover:text-[#00A3E0] transition-all duration-200">
            <Star className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Interactive Button Demo</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => {
              setDemoButtonState('loading')
              setTimeout(() => setDemoButtonState('success'), 2000)
              setTimeout(() => setDemoButtonState('default'), 4000)
            }}
            disabled={demoButtonState !== 'default'}
            className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-wait"
          >
            {demoButtonState === 'default' && <>Click Me</>}
            {demoButtonState === 'loading' && (
              <>
                <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
                Loading...
              </>
            )}
            {demoButtonState === 'success' && (
              <>
                <CheckCircle className="w-5 h-5" />
                Success!
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // ========== CARDS PAGE ==========
  const renderCards = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Card Components</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Various card styles with different elevations and interaction patterns
        </p>
      </div>

      {/* Standard Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Standard Cards</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Basic Card
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-normal mb-4">
              This is a standard card with hover effects. Notice the subtle elevation and border changes on hover.
            </p>
            <div className="flex gap-2">
              <button className="text-sm text-[#0066CC] hover:text-[#00A3E0] font-medium transition-colors">
                Learn More →
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#003366] w-12 h-12 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                Card with Icon
              </h3>
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
              Cards can include icons, images, and various content types while maintaining consistent styling.
            </p>
          </div>
        </div>
      </div>

      {/* Cards with Headers and Footers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Cards with Headers & Footers</h2>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Card Header</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Subtitle or metadata goes here</p>
          </div>
          <div className="p-6">
            <p className="text-base text-slate-600 dark:text-slate-300 leading-normal mb-4">
              This card demonstrates the header and footer pattern with clear visual separation using borders.
            </p>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
              The content area maintains consistent padding and spacing throughout.
            </p>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">Last updated: Just now</span>
            <button className="text-sm text-[#0066CC] hover:text-[#00A3E0] font-medium transition-colors">
              View Details →
            </button>
          </div>
        </div>
      </div>

      {/* Gradient Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Gradient Accent Cards</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
            <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Growth</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">+24%</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">vs last month</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm">
            <div className="bg-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Revenue</h4>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">$45.2K</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">This quarter</p>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-6 shadow-sm">
            <div className="bg-violet-500 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Performance</h4>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">98.5%</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Uptime</p>
          </div>
        </div>
      </div>

      {/* Interactive Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Interactive Selection Cards</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {['Option A', 'Option B', 'Option C'].map((option) => (
            <button
              key={option}
              className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-[#0066CC] transition-all duration-300 text-left group"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#003366] group-hover:scale-110 transition-all duration-300">
                <Package className="w-8 h-8 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{option}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Click to select this option
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ========== FORMS PAGE ==========
  const renderForms = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Form Elements</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Input fields, selects, checkboxes, and other form controls with comprehensive states
        </p>
      </div>

      {/* Input Fields */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Text Inputs
        </h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Input
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20 transition-all duration-200 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Input with Icon
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20 transition-all duration-200 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password Input
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Disabled Input
            </label>
            <input
              type="text"
              placeholder="This field is disabled"
              disabled
              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-base text-slate-400 dark:text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Input with Error
            </label>
            <input
              type="text"
              placeholder="Invalid input"
              className="w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 outline-none"
            />
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">This field is required</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Input with Success
            </label>
            <input
              type="text"
              value="Valid input"
              className="w-full bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 outline-none"
              readOnly
            />
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Input is valid
            </p>
          </div>
        </div>
      </div>

      {/* Select Dropdown */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Select Dropdown
        </h2>
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select an option
          </label>
          <select className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20 transition-all duration-200 outline-none">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
            <option>Option 4</option>
          </select>
        </div>
      </div>

      {/* Checkboxes and Radios */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Checkboxes & Radio Buttons
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Checkboxes</h3>
            <div className="space-y-3">
              {['Subscribe to newsletter', 'Accept terms and conditions', 'Enable notifications'].map((label) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-[#003366] focus:ring-4 focus:ring-[#0066CC]/20 transition-all"
                    checked={formData.subscribe}
                    onChange={(e) => setFormData({...formData, subscribe: e.target.checked})}
                  />
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Radio Buttons</h3>
            <div className="space-y-3">
              {['Small', 'Medium', 'Large'].map((size) => (
                <label key={size} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="size"
                    className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 text-[#003366] focus:ring-4 focus:ring-[#0066CC]/20 transition-all"
                  />
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Textarea
        </h2>
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message
          </label>
          <textarea
            rows={4}
            placeholder="Enter your message here..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20 transition-all duration-200 outline-none resize-none"
          ></textarea>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Search Input
        </h2>
        <div className="max-w-2xl">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg pl-10 pr-3 py-2.5 text-base text-slate-900 dark:text-slate-50 focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20 transition-all duration-200 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )

  // ========== NAVIGATION PAGE ==========
  const renderNavigation = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Navigation Patterns</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Tabs, page buttons, and breadcrumb navigation patterns
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Horizontal Tab Navigation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reference pattern from Security SaaS Services</p>
        </div>
        <div className="flex flex-row bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto">
          <button className="bg-[#003366] text-white font-semibold text-base px-5 py-3 rounded-t-lg border-b-3 border-[#00A3E0] shadow-md scale-105 flex items-center gap-2 transition-all duration-200">
            <Home className="w-5 h-5" />
            Overview
          </button>
          <button className="bg-transparent text-slate-600 dark:text-slate-300 font-medium text-base px-5 py-3 rounded-t-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-200 cursor-pointer">
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button className="bg-transparent text-slate-600 dark:text-slate-300 font-medium text-base px-5 py-3 rounded-t-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-200 cursor-pointer">
            <User className="w-5 h-5" />
            Profile
          </button>
          <button className="bg-transparent text-slate-600 dark:text-slate-300 font-medium text-base px-5 py-3 rounded-t-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-200 cursor-pointer">
            <Activity className="w-5 h-5" />
            Analytics
          </button>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-[200px]">
          <p className="text-slate-600 dark:text-slate-300">
            Active tab content appears here with smooth fade-in animation. The active tab features Temenos Navy background with Cyan accent border.
          </p>
        </div>
      </div>

      {/* Page Button Navigation */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Page Button Navigation
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Sequential content navigation pattern</p>
        <div className="flex flex-wrap gap-2 mb-8">
          <button className="bg-[#003366] text-white font-medium px-4 py-2 rounded-lg border-2 border-[#00A3E0] shadow-md transition-all duration-200">
            1. Introduction
          </button>
          <button className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200">
            2. Getting Started
          </button>
          <button className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200">
            3. Advanced Topics
          </button>
          <button className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200">
            4. Best Practices
          </button>
        </div>
        <div className="flex justify-between">
          <button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 rotate-180" />
            Previous
          </button>
          <button className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Breadcrumb Navigation
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[#0066CC] dark:hover:text-[#00A3E0] transition-colors">
            Home
          </a>
          <span className="text-slate-400">/</span>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[#0066CC] dark:hover:text-[#00A3E0] transition-colors">
            Components
          </a>
          <span className="text-slate-400">/</span>
          <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[#0066CC] dark:hover:text-[#00A3E0] transition-colors">
            Navigation
          </a>
          <span className="text-slate-400">/</span>
          <span className="text-[#003366] dark:text-[#00A3E0] font-semibold">Breadcrumbs</span>
        </div>
      </div>
    </div>
  )

  // ========== COMPONENTS PAGE ==========
  const renderComponents = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">UI Components</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Badges, tags, tooltips, and loading indicators
        </p>
      </div>

      {/* Status Badges */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Status Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Success
          </span>
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Warning
          </span>
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Error
          </span>
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Info
          </span>
          <span className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Neutral
          </span>
        </div>
      </div>

      {/* Category Tags */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Category Tags
        </h2>
        <div className="flex flex-wrap gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-200/50 dark:border-blue-800/50">
            Integration
          </span>
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-200/50 dark:border-emerald-800/50">
            Data Architecture
          </span>
          <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-2.5 py-1 rounded-md text-xs font-medium border border-violet-200/50 dark:border-violet-800/50">
            Deployment
          </span>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-md text-xs font-medium border border-red-200/50 dark:border-red-800/50">
            Security
          </span>
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-200/50 dark:border-amber-800/50">
            Observability
          </span>
        </div>
      </div>

      {/* Loading States */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Loading Indicators
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="border-4 border-slate-200 dark:border-slate-700 border-t-[#003366] dark:border-t-[#00A3E0] rounded-full w-10 h-10 animate-spin"></div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Spinner</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#003366] dark:bg-[#00A3E0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#003366] dark:bg-[#00A3E0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#003366] dark:bg-[#00A3E0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Dots</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#003366] to-[#00A3E0] animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Progress Bar</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Alert Messages
        </h2>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Success!</h4>
                <p className="text-sm text-green-700 dark:text-green-400">Your changes have been saved successfully.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Warning</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">Please review your input before continuing.</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-400">An error occurred while processing your request.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Information</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">Here's some helpful information for you to review.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ========== SPACING PAGE ==========
  const renderSpacing = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Spacing & Layout</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          4px baseline grid with consistent spacing scale
        </p>
      </div>

      {/* Spacing Scale */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Spacing Scale
        </h2>
        <div className="space-y-4">
          {[
            { name: 'xs', size: '4px', class: 'p-1' },
            { name: 'sm', size: '8px', class: 'p-2' },
            { name: 'md', size: '16px', class: 'p-4' },
            { name: 'lg', size: '24px', class: 'p-6' },
            { name: 'xl', size: '32px', class: 'p-8' },
            { name: '2xl', size: '48px', class: 'p-12' },
            { name: '3xl', size: '64px', class: 'p-16' },
          ].map((space) => (
            <div key={space.name} className="flex items-center gap-4">
              <div className="w-32 text-sm font-mono text-slate-600 dark:text-slate-400">
                {space.name}: {space.size}
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded">
                <div className={`bg-[#003366] ${space.class} rounded`}>
                  <div className="h-8 bg-[#00A3E0] rounded"></div>
                </div>
              </div>
              <div className="w-24 text-sm font-mono text-slate-500 dark:text-slate-400">
                {space.class}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layouts */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Grid Systems
        </h2>
        <div className="space-y-8">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">2-Column Grid (gap-6)</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#003366] h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                Column 1
              </div>
              <div className="bg-[#003366] h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                Column 2
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">3-Column Grid (gap-6)</p>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-[#0066CC] h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                Col 1
              </div>
              <div className="bg-[#0066CC] h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                Col 2
              </div>
              <div className="bg-[#0066CC] h-24 rounded-lg flex items-center justify-center text-white font-semibold">
                Col 3
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">4-Column Grid (gap-4)</p>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-[#00A3E0] h-20 rounded-lg flex items-center justify-center text-white font-semibold">
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Rhythm */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Vertical Rhythm
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Heading with 12px margin
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-normal mb-4">
              This paragraph follows with 16px bottom margin (mt-4).
            </p>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
              Another paragraph with consistent spacing.
            </p>
          </div>

          <div className="space-y-2 pt-12 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">List with 8px spacing (space-y-2):</p>
            <ul className="space-y-2">
              <li className="text-slate-600 dark:text-slate-300">• First list item</li>
              <li className="text-slate-600 dark:text-slate-300">• Second list item</li>
              <li className="text-slate-600 dark:text-slate-300">• Third list item</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // ========== ANIMATIONS PAGE ==========
  const renderAnimations = () => (
    <div className="px-6 py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Animations & Interactions</h1>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          Hover states, transitions, and interactive feedback
        </p>
      </div>

      {/* Hover Effects */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Hover Effects
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-lg hover:bg-[#003366] hover:text-white transition-all duration-300 cursor-pointer group">
            <Package className="w-8 h-8 mb-3 text-slate-600 group-hover:text-white transition-colors" />
            <h3 className="font-semibold mb-2">Color Change</h3>
            <p className="text-sm opacity-75">Hover to see color transition</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-6 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
            <Sparkles className="w-8 h-8 mb-3 text-[#00A3E0]" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Scale Up</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Hover to scale</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-6 rounded-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <Activity className="w-8 h-8 mb-3 text-[#0066CC]" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Lift Effect</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Hover to lift</p>
          </div>
        </div>
      </div>

      {/* Animated Cards */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Animated Interactions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-[#003366] to-[#00A3E0] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-white transition-colors mb-2">
                Gradient Overlay
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-white/90 transition-colors">
                Hover to reveal gradient background
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-[#00A3E0] transition-all duration-300 group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <Star className="w-6 h-6 text-slate-500 group-hover:text-[#F59E0B] transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Icon Rotation
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Hover to rotate and scale icon
            </p>
          </div>
        </div>
      </div>

      {/* Focus States */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Focus States (Keyboard Navigation)
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Press Tab to navigate and see focus indicators
        </p>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0066CC]/50 focus:ring-offset-2 transition-all">
            Focusable Button 1
          </button>
          <button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-6 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0066CC]/50 focus:ring-offset-2 transition-all">
            Focusable Button 2
          </button>
          <input
            type="text"
            placeholder="Focusable Input"
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-[#0066CC]/50 focus:ring-offset-2 focus:border-[#0066CC] transition-all"
          />
        </div>
      </div>

      {/* Transition Speeds */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
          Transition Speeds
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-[#003366] h-16 rounded-lg hover:bg-[#00A3E0] transition-all duration-100 mb-2 cursor-pointer"></div>
            <p className="text-xs text-slate-600 dark:text-slate-400">100ms - Fast</p>
          </div>
          <div className="text-center">
            <div className="bg-[#003366] h-16 rounded-lg hover:bg-[#00A3E0] transition-all duration-200 mb-2 cursor-pointer"></div>
            <p className="text-xs text-slate-600 dark:text-slate-400">200ms - Standard</p>
          </div>
          <div className="text-center">
            <div className="bg-[#003366] h-16 rounded-lg hover:bg-[#00A3E0] transition-all duration-300 mb-2 cursor-pointer"></div>
            <p className="text-xs text-slate-600 dark:text-slate-400">300ms - Smooth</p>
          </div>
          <div className="text-center">
            <div className="bg-[#003366] h-16 rounded-lg hover:bg-[#00A3E0] transition-all duration-500 mb-2 cursor-pointer"></div>
            <p className="text-xs text-slate-600 dark:text-slate-400">500ms - Slow</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ========== MAIN RENDER ==========
  const renderContent = () => {
    switch (selectedPage) {
      case 'overview': return renderOverview()
      case 'typography': return renderTypography()
      case 'colors': return renderColors()
      case 'buttons': return renderButtons()
      case 'cards': return renderCards()
      case 'forms': return renderForms()
      case 'navigation': return renderNavigation()
      case 'components': return renderComponents()
      case 'spacing': return renderSpacing()
      case 'animations': return renderAnimations()
      default: return renderOverview()
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Design System Showcase</h2>
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

      {/* Content Area */}
      <div className="min-h-[600px] bg-slate-50 dark:bg-slate-900">
        {renderContent()}
      </div>
    </div>
  )
}
