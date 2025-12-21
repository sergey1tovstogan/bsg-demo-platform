import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Import images from assets
import API1 from '../assets/api-wizards/API1.png'
import API2 from '../assets/api-wizards/API2.png'
import API3 from '../assets/api-wizards/API3.png'
import API4 from '../assets/api-wizards/API4.png'
import API5 from '../assets/api-wizards/API5.png'
import API6 from '../assets/api-wizards/API6.png'
import API7 from '../assets/api-wizards/API7.png'
import API8 from '../assets/api-wizards/API8.png'
import API10 from '../assets/api-wizards/API10.png'
import API19 from '../assets/api-wizards/API19.png'

interface ApiWizardsGalleryProps {
  onClose: () => void
}

export function ApiWizardsGallery({ onClose }: ApiWizardsGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Images in order
  const images = [
    { src: API1, title: 'API Wizard - Step 1' },
    { src: API2, title: 'API Wizard - Step 2' },
    { src: API3, title: 'API Wizard - Step 3' },
    { src: API4, title: 'API Wizard - Step 4' },
    { src: API5, title: 'API Wizard - Step 5' },
    { src: API6, title: 'API Wizard - Step 6' },
    { src: API7, title: 'API Wizard - Step 7' },
    { src: API8, title: 'API Wizard - Step 8' },
    { src: API19, title: 'API Wizard - Step 19' },
    { src: API10, title: 'API Wizard - Step 10' },
  ]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    // Focus the container for keyboard events
    const container = document.getElementById('gallery-container')
    container?.focus()
  }, [])

  return (
    <div
      id="gallery-container"
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-600 px-6 py-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-xl font-bold text-white">API Graphical Wizards</h2>
          <p className="text-sm text-slate-300 mt-1">
            {currentIndex + 1} of {images.length} - {images[currentIndex].title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative bg-slate-900 p-4" onClick={(e) => e.stopPropagation()}>
        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all shadow-lg z-20 backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        {/* Image Container */}
        <div className="w-full h-full flex items-center justify-center p-8">
          <img
            key={currentIndex}
            src={images[currentIndex].src}
            alt={images[currentIndex].title}
            className="max-w-full max-h-full object-contain"
            style={{
              maxHeight: 'calc(100vh - 200px)',
              display: 'block'
            }}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all shadow-lg z-20 backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* Thumbnail Navigation */}
      <div className="bg-slate-800 border-t border-slate-600 px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                  : 'border-slate-600 hover:border-slate-400'
              }`}
            >
              <img
                src={image.src}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover bg-slate-700"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard Hints */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800/80 px-4 py-2 rounded-lg text-xs text-slate-300 pointer-events-none">
        Use ← → arrow keys to navigate • ESC to close
      </div>

      {/* Close overlay on background click */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}
