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

  return (
    <div className="space-y-6">
      {/* SharePoint Video Links - Only for Integration component */}
      {componentId === 'integration' && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">New API creation (Customer) via Workbench</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Watch the comprehensive demo video on SharePoint
              </p>
            </div>
            <a
              href="https://temenosgroup.sharepoint.com/:v:/g/temenosteams/Technical_BSG/ESgc8dewQ_ZPhZnVzTTyXYsBg9F74YtaGagFOCl1CJrBpQ?e=xSPAtQ&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transition-colors shadow-md hover:shadow-lg font-semibold"
            >
              <ExternalLink className="w-5 h-5" />
              <span style={{ color: '#FFFFFF' }}>Watch on SharePoint</span>
            </a>
          </div>

          <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">New API creation (Payment) via Workbench with RVT and GIT</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Complete walkthrough of Payment API implementation
                </p>
              </div>
              <a
                href="https://temenosgroup.sharepoint.com/temenosteams/technology/def/DS%20%20Documents/Design%20Framework/Presentations/Workbench2.0/WB24_EF_PaymentAPI_full.webm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transition-colors shadow-md hover:shadow-lg font-semibold"
              >
                <ExternalLink className="w-5 h-5" />
                <span style={{ color: '#FFFFFF' }}>Watch on SharePoint</span>
              </a>
            </div>
          </div>

          <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">API Extension with Workbench Copilot</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                  Leveraging the Workbench AI to build python script and release validation test (RVT)
                </p>
              </div>
              <a
                href="https://temenosgroup.sharepoint.com/sites/MDS277/_layouts/15/stream.aspx?id=%2Fsites%2FMDS277%2FShared%20Documents%2FGeneral%2Fcopilot%2FTCF2025%5FTechnologyBreaktout%5Fvideo%2Emp4&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E33850bd9%2D3812%2D4aec%2D8fe8%2D8ff81b9f571a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transition-colors shadow-md hover:shadow-lg font-semibold"
              >
                <ExternalLink className="w-5 h-5" />
                <span style={{ color: '#FFFFFF' }}>Watch on MDS</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
        </div>
      )}

      {/* Error State - Suppressed as SharePoint videos are shown above */}

      {/* No Videos Message - Suppressed as SharePoint videos are shown above */}

      {/* Video Player */}
      {!loading && selectedVideo && videoUrl && (
        <div className="card">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
            {selectedVideo.description && (
              <p className="text-[#4A5568] mb-2">{selectedVideo.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-[#4A5568]">
              <span>Duration: {formatDuration(selectedVideo.duration)}</span>
              {selectedVideo.resolution && <span>Resolution: {selectedVideo.resolution}</span>}
            </div>
            {selectedVideo.chapters && selectedVideo.chapters.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Chapters</h4>
                <ul className="space-y-1">
                  {selectedVideo.chapters.map((chapter, idx) => (
                    <li key={idx} className="text-sm text-[#4A5568]">
                      {formatDuration(chapter.timestamp)} - {chapter.title}
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
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Available Videos</h3>
          <div className="space-y-3">
            {videos.map((video) => (
              <button
                key={video.video_id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedVideo?.video_id === video.video_id
                    ? 'border-[#283054] bg-[#283054]/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#2D3748]">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-[#4A5568] mt-1 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                  <div className="ml-4 text-sm text-[#4A5568]">
                    {formatDuration(video.duration)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

