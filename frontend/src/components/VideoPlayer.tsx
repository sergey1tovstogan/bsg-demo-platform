import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { apiService } from '../services/api'
import type { Video, ComponentId } from '../types'

interface VideoPlayerProps {
  componentId: ComponentId
}

export function VideoPlayer({ componentId }: VideoPlayerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVideos()
  }, [componentId])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getVideos(componentId)
      setVideos(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedVideo(response.data[0])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#283054]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="card">
        <p className="text-[#4A5568]">No videos available for this component.</p>
      </div>
    )
  }

  const videoUrl = selectedVideo
    ? apiService.getVideoStreamUrl(componentId, selectedVideo.video_id)
    : null

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {selectedVideo && videoUrl && (
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
    </div>
  )
}

