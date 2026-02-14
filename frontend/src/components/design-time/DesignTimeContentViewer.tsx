import { Rocket } from 'lucide-react'

interface DesignTimeContentViewerProps {
  onOpenSettings?: () => void
}

/** DevOps content - static only (Temenos Transact DevOps Framework). RAG Principles & Patterns section removed. */
export function DesignTimeContentViewer(_props: DesignTimeContentViewerProps = {}) {
  return (
    <div className="space-y-6">
      {/* DevOps Hero - Visual intro with imagery */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              DevOps & Continuous Delivery
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Automated testing, CI/CD pipelines, and continuous upgrade. Temenos leverages industry-standard tools for rapid, reliable deployments.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-200/80 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-sm font-medium">Jenkins</span>
              <span className="px-3 py-1.5 rounded-lg bg-blue-200/80 dark:bg-blue-800/40 text-blue-800 dark:text-blue-200 text-sm font-medium">GitLab CI</span>
              <span className="px-3 py-1.5 rounded-lg bg-amber-200/80 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200 text-sm font-medium">Azure DevOps</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-sm font-medium">Kubernetes</span>
            </div>
          </div>
          <div className="relative h-48 lg:h-64 lg:min-h-[280px] flex items-center justify-center bg-gradient-to-l from-teal-100 to-emerald-50 dark:from-slate-800 dark:to-slate-900 p-4">
            <Rocket className="w-36 h-36 sm:w-44 sm:h-44 lg:w-56 lg:h-56 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* DevOps & Automation - Capabilities overview */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">DevOps & Automation</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Temenos Banking Cloud offers robust DevOps, CI/CD, and automation capabilities designed to streamline development, deployment, and operational processes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Infrastructure as Code</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Helm charts for Kubernetes automate deployment and management of applications, ensuring consistent and repeatable deployments across environments.
            </p>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Define infrastructure through code templates</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Reduce manual errors and enforce consistency</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Accelerate environment setup and deployment</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CI/CD Pipelines</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Automated testing and source control management support continuous integration and deployment with minimal manual intervention.
            </p>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Frequent, reliable code integration</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Continuous delivery of updates and fixes</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>Reduced time-to-market and improved quality</li>
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Observability & Monitoring</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Industry-standard instrumentation and pre-configured dashboards provide comprehensive observability across all product components. This visibility supports proactive monitoring, rapid issue detection, and efficient troubleshooting.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Dynamic Scaling</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Kubernetes orchestration enables automatic scaling and self-healing capabilities.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">SecDevOps</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Security embedded throughout development lifecycle with continuous compliance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temenos Transact DevOps Framework - Packager focus */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-emerald-500/50 dark:border-emerald-400/50">
          Temenos Transact DevOps Framework
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Temenos Transact implements these capabilities through a comprehensive DevOps framework centered around <strong className="text-emerald-700 dark:text-emerald-400">Temenos Packager</strong>, which manages the business configuration software development lifecycle (SDLC) across Temenos products. This framework enables consistent promotion of business configurations from development through to production environments, ensuring reliable and repeatable deployments. It covers all business configurations requiring SDLC management, excluding routine business activities like payment creation.
          </p>
          <p>
            Temenos Packager includes a data packager that stores business configurations in a readable format suitable for source control. It also provides scripted deployment capabilities through APIs, facilitating automated promotion of configurations across environments such as SIT, UAT, and production. This approach minimizes manual errors and enhances deployment consistency.
          </p>
          <p>
            This DevOps support ensures that banks can maintain operational excellence, achieve rapid issue resolution, and optimize system performance while leveraging familiar tools and automated deployment pipelines.
          </p>
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-3">Business Benefit</h3>
            <p className="text-emerald-900/90 dark:text-emerald-100/90">
              This DevOps framework streamlines configuration management and deployment, reducing errors and accelerating delivery. It empowers banks to maintain high system reliability and quickly respond to issues, supporting continuous innovation and operational efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

