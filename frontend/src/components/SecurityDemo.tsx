import { Code2, ShieldCheck } from 'lucide-react'

type SecurityDemoProps = {
  mode: 'demo' | 'video'
}

export function SecurityDemo({ mode }: SecurityDemoProps) {
  const isVideo = mode === 'video'

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center text-gray-400">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          {isVideo ? (
            <ShieldCheck className="w-12 h-12 opacity-30" />
          ) : (
            <Code2 className="w-12 h-12 opacity-30" />
          )}
        </div>
        <p className="text-lg font-medium text-gray-500 mb-2">
          {isVideo ? 'Video Coming Soon' : 'Demo Coming Soon'}
        </p>
        <p className="text-sm">
          {isVideo ? 'Demo video content will be available here' : 'Demo content will be available here'}
        </p>
      </div>
    </div>
  )
}
