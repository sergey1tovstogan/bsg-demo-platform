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
          <div className="relative h-48 lg:h-64 lg:min-h-[280px] flex items-center justify-center bg-white dark:bg-slate-800 p-4">
            <img
              src="/images/devops-infinity-loop.png"
              alt="DevOps infinity loop - Code, Build, Test, Plan, Release, Deploy, Operate, Monitor"
              className="max-h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Static Content - Temenos DevOps Framework */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-emerald-500/50 dark:border-emerald-400/50">
          Temenos Transact DevOps Framework
        </h2>
        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Temenos Transact supports a comprehensive DevOps framework centered around <strong className="text-emerald-700 dark:text-emerald-400">Temenos Packager</strong>, which manages the business configuration software development lifecycle (SDLC) across Temenos products. This framework enables consistent promotion of business configurations from development through to production environments, ensuring reliable and repeatable deployments. It covers all business configurations requiring SDLC management, excluding routine business activities like payment creation.
          </p>
          <p>
            Temenos Packager includes a data packager that stores business configurations in a readable format suitable for source control. It also provides scripted deployment capabilities through APIs, facilitating automated promotion of configurations across environments such as SIT, UAT, and production. This approach minimizes manual errors and enhances deployment consistency.
          </p>
          <p>
            For observability and monitoring, Temenos Transact integrates with industry-standard tools. It supports <strong className="text-emerald-700 dark:text-emerald-400">OpenTelemetry</strong> for metrics collection and distributed tracing, allowing banks to integrate with existing monitoring stacks like Prometheus, InfluxDB, and tracing tools such as Jaeger. Additionally, Temenos offers an out-of-the-box observability accelerator including Prometheus and Grafana with pre-built dashboards tailored for Transact, enabling rapid setup of monitoring and alerting systems.
          </p>
          <p>
            This DevOps support ensures that banks can maintain operational excellence, achieve rapid issue resolution, and optimize system performance while leveraging familiar tools and automated deployment pipelines.
          </p>
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-3">Business Benefit</h3>
            <p className="text-emerald-900/90 dark:text-emerald-100/90">
              This DevOps framework streamlines configuration management and deployment, reducing errors and accelerating delivery. Combined with robust observability tools, it empowers banks to maintain high system reliability and quickly respond to issues, supporting continuous innovation and operational efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

