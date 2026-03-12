import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Info, X } from 'lucide-react'

const secDevOpsTooltip = {
  title: 'PSA Security Testing Program',
  description: 'Principles of DevSecOps are the following\n\n1. Automate All the Things: Automation is the cornerstone of successful DevSecOps. Automating routine tasks and processes helps to speed up the delivery process while enabling teams to focus on the more complex aspects of the development lifecycle.\n2. Shift Security Left: Shifting security left is the process of integrating security practices earlier in the development process. This helps to reduce the risks associated with the production environment.\n3. CI and CD ensure that code is tested, reviewed, and deployed quickly and consistently.\n4. Collaboration and Communication: Collaboration and communication are key to successful DevSecOps. It\'s important for teams to be able to share ideas, discuss challenges, and work together in order to ensure that security is properly implemented.\n5. Measure and Monitor: Measuring and monitoring are essential for DevSecOps. Teams should measure and monitor their systems, processes, and performance in order to identify potential security issues and address them quickly.\n\nThe PSA team conduct the following activities as part of the security testing program:\n•Security Design Review\n•Software Composition Analysis or Open-source library (OSL) security scanning\n•Secure Code Review\n•Dynamic Analysis & Penetration Testing\n•Security Vulnerability Remediation and communication\n\nTemenos Product Security incorporates continuous security assessment improvement through researching of the latest vulnerabilities and attack trends. Identifying vulnerabilities involves testing target applications using a variety of different methods and tools. The evaluation includes areas such as assessing encryption techniques, hashing mechanisms, session ID randomness and sensitive information storage to ensure that the tested application is effectively protected. All Product releases undergo security assessments covering\n\n•Secure Design Reviews and Threat Modeling\n•Static Application Security Testing (SAST)\n•Software Composition Analysis (SCA)\n•Dynamic Application Security Testing (DAST)\n•Manual Penetration Security Testing\n•Container Security Testing\n\nIn Temenos SDLC implemented Security Scan Container Images, Security Scan OSL, Security Scan SAST, Security Scan DAST'
}

interface DesignTimeContentViewerProps {
  onOpenSettings?: () => void
}

/** DevOps content - static only (Temenos Transact DevOps Framework). RAG Principles & Patterns section removed. */
export function DesignTimeContentViewer(_props: DesignTimeContentViewerProps = {}) {
  const [activeTooltip, setActiveTooltip] = useState(false)

  return (
    <div className="space-y-6 relative">
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

      {/* DevOps & Automation - Capabilities overview (concise, max 2 lines per section) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">DevOps & Automation</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            CI/CD, IaC, and observability for streamlined deployment and operations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Infrastructure as Code</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Helm charts for Kubernetes. Consistent, repeatable deployments.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">CI/CD Pipelines</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Automated testing and source control. Minimal manual intervention.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Observability & Monitoring</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Pre-configured dashboards. Proactive monitoring and rapid issue detection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Dynamic Scaling</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Kubernetes auto-scaling and self-healing.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4
                  className="font-semibold text-slate-900 dark:text-white mb-1 cursor-pointer transition-all duration-300 hover:opacity-80 flex items-center gap-2"
                  onClick={() => setActiveTooltip(prev => !prev)}
                  title="Click for additional information"
                >
                  SecDevOps
                  <Info className="w-4 h-4 text-emerald-500 opacity-70" />
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Security embedded in SDLC. OWASP, SANS, SAST, DAST.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop to close tooltip when clicking outside */}
      {activeTooltip && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setActiveTooltip(false)}
          aria-hidden
        />
      )}

      {/* Tooltip Popup */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-0 left-0 right-0 px-6 pb-4 z-50 pointer-events-auto"
          >
            <div className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/30 rounded-xl">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white text-left">
                      {secDevOpsTooltip.title}
                    </h4>
                    <button
                      onClick={() => setActiveTooltip(false)}
                      className="ml-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-tight text-left whitespace-pre-line">
                    {secDevOpsTooltip.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Temenos Transact DevOps Framework - Packager focus */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-emerald-500/50 dark:border-emerald-400/50">
          Temenos Transact DevOps Framework
        </h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm">
          <p>
            <strong className="text-emerald-700 dark:text-emerald-400">Temenos Packager</strong> manages business configuration SDLC. Promotes configs from dev to production.
          </p>
          <p>
            Data packager for source control. Scripted deployment APIs for SIT, UAT, production.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700/50">
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-2">Business Benefit</h3>
            <p className="text-emerald-900/90 dark:text-emerald-100/90 text-sm">
              Streamlines config management. Reduces errors, accelerates delivery, supports operational excellence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

