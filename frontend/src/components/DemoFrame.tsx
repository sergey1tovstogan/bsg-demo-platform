import { useState } from 'react'
import { Code2, Radio, Database as DatabaseIcon } from 'lucide-react'
import type { ComponentId } from '../types'
import { DatabaseRecords } from './DatabaseRecords'

interface DemoFrameProps {
  componentId: ComponentId
}

export function DemoFrame({ componentId }: DemoFrameProps) {
  // Only show Data Architecture specific content for data-architecture component
  if (componentId === 'data-architecture') {
    return (
      <div className="space-y-6">
        {/* Top Tier - APIs and Events */}
        <div className="grid grid-cols-2 gap-6">
          {/* APIs Section */}
          <div className="card min-h-[400px] flex flex-col">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#283054]">APIs</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Code2 className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">API content will appear here</p>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="card min-h-[400px] flex flex-col">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#283054]">Events</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Radio className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Event content will appear here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tier - Database Records */}
        <div className="card min-h-[500px] flex flex-col">
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <DatabaseIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#283054]">Database Records</h3>
          </div>
          <div className="flex-1">
            <DatabaseRecords componentId={componentId} />
          </div>
        </div>
      </div>
    )
  }

  // For all other components, show a generic demo placeholder
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center text-gray-400">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Code2 className="w-12 h-12 opacity-30" />
        </div>
        <p className="text-lg font-medium text-gray-500 mb-2">Demo Coming Soon</p>
        <p className="text-sm">Interactive demo content will be available here</p>
      </div>
    </div>
  )
}
