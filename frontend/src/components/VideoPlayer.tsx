import { useState, useEffect } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import { apiService } from '../services/api'
import type { Video, ComponentId } from '../types'

interface VideoPlayerProps {
  componentId: ComponentId
}

export function VideoPlayer({ componentId }: VideoPlayerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await apiService.getVideos(componentId)
      setVideos(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedVideo(response.data[0])
      }
    } catch (err: unknown) {
      // Error suppressed - SharePoint videos are shown as primary content
      console.error('Failed to load videos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const videoUrl = selectedVideo
    ? apiService.getVideoStreamUrl(componentId, selectedVideo.video_id)
    : null

  const videoCards = componentId === 'integration' ? [
    { title: 'New API creation (Customer) via Workbench', description: 'Watch the comprehensive demo video on SharePoint', url: 'https://temenosgroup.sharepoint.com/:v:/g/temenosteams/Technical_BSG/ESgc8dewQ_ZPhZnVzTTyXYsBg9F74YtaGagFOCl1CJrBpQ?e=xSPAtQ&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D', label: 'Watch on SharePoint' },
    { title: 'New API creation (Payment) via Workbench with RVT and GIT', description: 'Complete walkthrough of Payment API implementation', url: 'https://temenosgroup.sharepoint.com/temenosteams/technology/def/DS%20%20Documents/Design%20Framework/Presentations/Workbench2.0/WB24_EF_PaymentAPI_full.webm', label: 'Watch on SharePoint' },
    { title: 'API Extension with Workbench Copilot', description: 'Leveraging the Workbench AI to build python script and release validation test (RVT)', url: 'https://temenosgroup.sharepoint.com/sites/MDS277/_layouts/15/stream.aspx?id=%2Fsites%2FMDS277%2FShared%20Documents%2FGeneral%2Fcopilot%2FTCF2025%5FTechnologyBreaktout%5Fvideo%2Emp4&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E33850bd9%2D3812%2D4aec%2D8fe8%2D8ff81b9f571a', label: 'Watch on MDS' },
  ] : []

  return (
    <div className="space-y-6">
      {/* SharePoint Video Links - Only for Integration component */}
      {videoCards.length > 0 && (
        <div className="space-y-4">
          {videoCards.map((card, idx) => (
            <div
              key={idx}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600/80 transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                {card.label}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 dark:text-slate-400" strokeWidth={2} />
        </div>
      )}

      {/* Error State - Suppressed as SharePoint videos are shown above */}

      {/* No Videos Message - Suppressed as SharePoint videos are shown above */}

      {/* Video Player */}
      {!loading && selectedVideo && videoUrl && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{selectedVideo.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              <span>Duration: {formatDuration(selectedVideo.duration)}</span>
              {selectedVideo.resolution && <span>Resolution: {selectedVideo.resolution}</span>}
            </div>
            {selectedVideo.chapters && selectedVideo.chapters.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Chapters</h4>
                <ul className="space-y-1.5">
                  {selectedVideo.chapters.map((chapter, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDuration(chapter.timestamp)} — {chapter.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video List */}
      {!loading && videos.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">Available Videos</h3>
          <div className="space-y-2">
            {videos.map((video) => (
              <button
                key={video.video_id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selectedVideo?.video_id === video.video_id
                    ? 'border-slate-400 dark:border-slate-500 bg-slate-200/60 dark:bg-slate-700/60'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-700/40'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                    {formatDuration(video.duration)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

