import { useState, useEffect } from 'react'
import { BarChart3, Activity, ExternalLink } from 'lucide-react'
import { getGrafanaBaseUrl } from '../../services/api'

export function ObservabilityDemo() {
  const [grafanaBaseUrl, setGrafanaBaseUrl] = useState('https://mdsworkbench.temenos.com')

  useEffect(() => {
    // Load Grafana base URL from config
    getGrafanaBaseUrl().then(setGrafanaBaseUrl).catch(err => {
      console.error('Failed to load Grafana config, using default:', err)
    })
  }, [])

  const openGrafanaDashboards = () => {
    window.open(`${grafanaBaseUrl}/grafana/dashboards`, '_blank', 'noopener,noreferrer')
  }

  const openDashboard1 = () => {
    // Channel Transaction Summary
    window.open(`${grafanaBaseUrl}/grafana/d/mrtS77BGz/channel-transaction-summary?orgId=1`, '_blank', 'noopener,noreferrer,width=1400,height=900')
  }

  const openDashboard2 = () => {
    // IRIS Monitor
    window.open(`${grafanaBaseUrl}/grafana/d/dwgixTnnzj/iris-monitor?orgId=1`, '_blank', 'noopener,noreferrer,width=1400,height=900')
  }

  return (
    <div className="space-y-6">
      {/* Header - Primary Action Card */}
      <button
        onClick={openGrafanaDashboards}
        className="bg-[#003366] text-white rounded-xl p-6 shadow-md hover:shadow-lg hover:bg-[#004080] hover:-translate-y-1 transition-all duration-200 w-full text-left cursor-pointer group overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00A3E0] rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">Grafana Dashboard</h2>
              <p className="text-base text-slate-200">Enterprise-grade monitoring & analytics</p>
            </div>
            <ExternalLink className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </button>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={openDashboard1}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Channel Transaction Summary</h3>
              <p className="text-base text-slate-600 dark:text-slate-300">View transaction metrics and channel performance</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#003366] dark:group-hover:text-[#00A3E0] transition-colors flex-shrink-0" />
          </div>
        </button>

        <button
          onClick={openDashboard2}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 text-left cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">IRIS Monitor</h3>
              <p className="text-base text-slate-600 dark:text-slate-300">Monitor IRIS system metrics and health</p>
            </div>
            <ExternalLink className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-[#003366] dark:group-hover:text-[#00A3E0] transition-colors flex-shrink-0" />
          </div>
        </button>
      </div>
    </div>
  )
}
