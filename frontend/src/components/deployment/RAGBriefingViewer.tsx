/**
 * RAG Briefing Viewer Component
 * 
 * Renders structured briefing JSON in a tabbed, human-friendly UI.
 */

import { useState } from 'react'
import { 
  FileText, Copy, AlertTriangle, CheckCircle2, 
  XCircle, BookOpen, Shield, Cpu, Network, Settings, 
  BarChart3, AlertCircle
} from 'lucide-react'
import { Briefing, validateBriefing, checkCitationCoverage } from '../../schemas/briefingSchema'

interface RAGBriefingViewerProps {
  briefing: Briefing
  onClose?: () => void
}

export function RAGBriefingViewer({ briefing, onClose }: RAGBriefingViewerProps) {
  const [activeTab, setActiveTab] = useState('executive')
  const [copied, setCopied] = useState(false)

  // Validate briefing
  const validation = validateBriefing(briefing)
  const citationCheck = checkCitationCoverage(briefing)

  const tabs = [
    { id: 'executive', label: 'Executive Summary', icon: FileText },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'functional', label: 'Functional Overview', icon: BarChart3 },
    { id: 'interfaces', label: 'Interfaces', icon: Network },
    { id: 'deployment', label: 'Deployment & Ops', icon: Settings },
    { id: 'security', label: 'Security & Compliance', icon: Shield },
    { id: 'gaps', label: 'Limitations & Gaps', icon: AlertCircle },
    { id: 'sources', label: 'Sources', icon: BookOpen }
  ]

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(briefing, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderCitationTags = (citations: string[]) => {
    if (citations.length === 0) return null
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {citations.map((citation, idx) => (
          <span
            key={idx}
            className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
            title={`Citation: ${citation}`}
          >
            [c:{citation.substring(0, 8)}]
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {briefing.meta.component_name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {briefing.meta.product_family} • Generated {new Date(briefing.meta.generated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyJSON}
            className="btn-secondary flex items-center space-x-2"
            title="Copy briefing JSON"
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : ''}`} />
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-secondary">
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quality Gates Banner */}
      {(!validation.valid || !citationCheck.passed) && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                Data Quality Warning
              </div>
              {!validation.valid && (
                <div className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                  Schema validation failed. Some sections may be incomplete.
                </div>
              )}
              {!citationCheck.passed && (
                <div className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {citationCheck.warnings.length} items missing citations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'executive' && <ExecutiveSummaryTab briefing={briefing} />}
        {activeTab === 'architecture' && <ArchitectureTab briefing={briefing} renderCitationTags={renderCitationTags} />}
        {activeTab === 'functional' && <FunctionalOverviewTab briefing={briefing} renderCitationTags={renderCitationTags} />}
        {activeTab === 'interfaces' && <InterfacesTab briefing={briefing} renderCitationTags={renderCitationTags} />}
        {activeTab === 'deployment' && <DeploymentOpsTab briefing={briefing} renderCitationTags={renderCitationTags} />}
        {activeTab === 'security' && <SecurityComplianceTab briefing={briefing} renderCitationTags={renderCitationTags} />}
        {activeTab === 'gaps' && <LimitationsGapsTab briefing={briefing} />}
        {activeTab === 'sources' && <SourcesTab briefing={briefing} />}
      </div>
    </div>
  )
}

// Executive Summary Tab
function ExecutiveSummaryTab({ briefing }: { briefing: Briefing }) {
  const { executive_summary } = briefing
  const confidenceColors = {
    high: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {executive_summary.one_liner}
        </h3>
        <div className={`text-sm font-medium ${confidenceColors[executive_summary.confidence]}`}>
          Confidence: {executive_summary.confidence.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What It Does</h4>
          <ul className="space-y-2">
            {executive_summary.what_it_does.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Why It Matters</h4>
          <ul className="space-y-2">
            {executive_summary.why_it_matters.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Where It Fits</h4>
          <ul className="space-y-2">
            {executive_summary.where_it_fits.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Architecture Tab
function ArchitectureTab({ briefing, renderCitationTags }: { briefing: Briefing; renderCitationTags: (citations: string[]) => JSX.Element | null }) {
  const { architecture } = briefing

  return (
    <div className="space-y-6">
      {/* Responsibilities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Responsibilities</h3>
        <ul className="space-y-2">
          {architecture.responsibilities.map((resp, idx) => (
            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
              <span className="mr-2">•</span>
              <span>{resp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Core Patterns Table */}
      {architecture.core_patterns.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Core Patterns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Pattern</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">What It Ensures</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Why It Matters</th>
                </tr>
              </thead>
              <tbody>
                {architecture.core_patterns.map((pattern, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{pattern.pattern}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{pattern.what_it_ensures}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {pattern.why_it_matters}
                      {renderCitationTags(pattern.citations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Components Table */}
      {architecture.key_components.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Components</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Component</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Responsibility</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Notes</th>
                </tr>
              </thead>
              <tbody>
                {architecture.key_components.map((component, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{component.name}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{component.responsibility}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {component.notes}
                      {renderCitationTags(component.citations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactions */}
      {architecture.interactions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interactions</h3>
          <div className="space-y-3">
            {architecture.interactions.map((interaction, idx) => (
              <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{interaction.with}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{interaction.type}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{interaction.description}</p>
                {renderCitationTags(interaction.citations)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Lifecycle */}
      {architecture.event_lifecycle.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Event Lifecycle</h3>
          <ol className="space-y-2 list-decimal list-inside">
            {architecture.event_lifecycle.map((step, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

// Functional Overview Tab
function FunctionalOverviewTab({ briefing, renderCitationTags }: { briefing: Briefing; renderCitationTags: (citations: string[]) => JSX.Element | null }) {
  const { functional_overview } = briefing

  return (
    <div className="space-y-6">
      {/* Capabilities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capabilities</h3>
        <div className="space-y-4">
          {functional_overview.capabilities.map((capability, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{capability.capability}</h4>
              <ul className="space-y-1">
                {capability.details.map((detail, detailIdx) => (
                  <li key={detailIdx} className="text-sm text-gray-700 dark:text-gray-300">
                    • {detail}
                  </li>
                ))}
              </ul>
              {renderCitationTags(capability.citations)}
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      {functional_overview.primary_use_cases.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Use Cases</h3>
          <div className="space-y-4">
            {functional_overview.primary_use_cases.map((useCase, idx) => (
              <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{useCase.use_case}</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  {useCase.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="text-sm text-gray-700 dark:text-gray-300">{step}</li>
                  ))}
                </ol>
                {renderCitationTags(useCase.citations)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Interfaces Tab
function InterfacesTab({ briefing, renderCitationTags }: { briefing: Briefing; renderCitationTags: (citations: string[]) => JSX.Element | null }) {
  const { interfaces } = briefing

  return (
    <div className="space-y-6">
      {/* APIs Table */}
      {interfaces.apis.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">APIs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Purpose</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Inputs/Outputs</th>
                </tr>
              </thead>
              <tbody>
                {interfaces.apis.map((api, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{api.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded">{api.type}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{api.purpose}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {api.inputs && <div className="text-xs">In: {api.inputs}</div>}
                      {api.outputs && <div className="text-xs">Out: {api.outputs}</div>}
                      {renderCitationTags(api.citations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Table */}
      {interfaces.events.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Direction</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Schema</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Topics</th>
                </tr>
              </thead>
              <tbody>
                {interfaces.events.map((event, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{event.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">{event.direction}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{event.schema}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {event.topics}
                      {renderCitationTags(event.citations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Deployment & Ops Tab
function DeploymentOpsTab({ briefing, renderCitationTags }: { briefing: Briefing; renderCitationTags: (citations: string[]) => JSX.Element | null }) {
  const { deployment_and_ops } = briefing

  return (
    <div className="space-y-6">
      {/* Runtime */}
      {deployment_and_ops.runtime.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Runtime</h3>
          <div className="flex flex-wrap gap-2">
            {deployment_and_ops.runtime.map((rt, idx) => (
              <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                {rt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies Table */}
      {deployment_and_ops.dependencies.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dependencies</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Dependency</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Notes</th>
                </tr>
              </thead>
              <tbody>
                {deployment_and_ops.dependencies.map((dep, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{dep.dependency}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{dep.category}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {dep.notes}
                      {renderCitationTags(dep.citations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scaling Cards */}
      {deployment_and_ops.scaling.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scaling</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deployment_and_ops.scaling.map((scale, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{scale.dimension}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{scale.how}</p>
                {scale.limits_or_notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{scale.limits_or_notes}</p>
                )}
                {renderCitationTags(scale.citations)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resilience Cards */}
      {deployment_and_ops.resilience.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resilience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deployment_and_ops.resilience.map((resilience, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{resilience.mechanism}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{resilience.why}</p>
                {renderCitationTags(resilience.citations)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observability */}
      {deployment_and_ops.observability.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Observability</h3>
          <div className="space-y-4">
            {deployment_and_ops.observability.map((obs, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{obs.signal}</span>
                </div>
                <ul className="space-y-1">
                  {obs.what_to_monitor.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-gray-700 dark:text-gray-300">
                      • {item}
                    </li>
                  ))}
                </ul>
                {renderCitationTags(obs.citations)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Security & Compliance Tab
function SecurityComplianceTab({ briefing, renderCitationTags }: { briefing: Briefing; renderCitationTags: (citations: string[]) => JSX.Element | null }) {
  const { security_and_compliance } = briefing

  return (
    <div className="space-y-6">
      {/* Controls */}
      {security_and_compliance.controls.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Controls</h3>
          <div className="space-y-3">
            {security_and_compliance.controls.map((control, idx) => (
              <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{control.control}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{control.details}</p>
                {renderCitationTags(control.citations)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Protection Table */}
      {security_and_compliance.data_protection.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Protection</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Area</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Approach</th>
                </tr>
              </thead>
              <tbody>
                {security_and_compliance.data_protection.map((protection, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white capitalize">{protection.area.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                      {protection.approach}
                      {renderCitationTags(protection.citations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Limitations & Gaps Tab
function LimitationsGapsTab({ briefing }: { briefing: Briefing }) {
  const { limitations_and_gaps } = briefing

  if (limitations_and_gaps.length === 0) {
    return (
      <div className="card text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">No known limitations or gaps identified</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {limitations_and_gaps.map((gap, idx) => (
        <div key={idx} className="card border-l-4 border-yellow-500">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{gap.gap}</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-medium">Impact:</span> {gap.impact}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span className="font-medium">Reason:</span> {gap.reason}
          </p>
          {gap.recommended_follow_up_questions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recommended Follow-up Questions:</p>
              <ul className="space-y-1">
                {gap.recommended_follow_up_questions.map((question, qIdx) => (
                  <li key={qIdx} className="text-sm text-gray-700 dark:text-gray-300">
                    • {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Sources Tab
function SourcesTab({ briefing }: { briefing: Briefing }) {
  const { sources } = briefing

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sources</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Chunk ID</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Title</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Snippet</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-900 dark:text-white">Relevance</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-3 font-mono text-xs text-gray-600 dark:text-gray-400">{source.chunk_id}</td>
                <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{source.title || 'N/A'}</td>
                <td className="py-3 px-3 text-gray-700 dark:text-gray-300 max-w-md">
                  <div className="truncate" title={source.snippet}>{source.snippet}</div>
                </td>
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-xs">{source.relevance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

