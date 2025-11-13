import { useState } from 'react'
import { Shield, FileText, Presentation, Lock, Server, Cloud, Key, UserCheck, Eye, X } from 'lucide-react'
import { apiService } from '../services/api'

export function SecurityContentViewer() {
  // Modal state for displaying HTML5 content
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  // Card palette data - 9 cards in 3 rows with names and colors
  const cards = [
    { 
      id: 1, 
      title: 'Authentication', 
      description: 'User authentication and identity verification', 
      icon: Key,
      color: '#3B82F6', // Blue
      bgColor: '#DBEAFE', // Light blue background
    },
    { 
      id: 2, 
      title: 'Authorization', 
      description: 'Access control and permissions management', 
      icon: UserCheck,
      color: '#10B981', // Green
      bgColor: '#D1FAE5', // Light green background
    },
    { 
      id: 3, 
      title: 'Privacy & Encryption', 
      description: 'Data protection and encryption standards', 
      icon: Lock,
      color: '#8B5CF6', // Purple
      bgColor: '#EDE9FE', // Light purple background
    },
    { 
      id: 4, 
      title: 'Segregation', 
      description: 'Data and network segregation policies', 
      icon: Shield,
      color: '#F59E0B', // Amber
      bgColor: '#FEF3C7', // Light amber background
    },
    { 
      id: 5, 
      title: 'Access Management', 
      description: 'User access and privilege management', 
      icon: Eye,
      color: '#EF4444', // Red
      bgColor: '#FEE2E2', // Light red background
    },
    { 
      id: 6, 
      title: 'Platform Management', 
      description: 'Platform security and configuration management', 
      icon: Server,
      color: '#06B6D4', // Cyan
      bgColor: '#CFFAFE', // Light cyan background
    },
    { 
      id: 7, 
      title: 'Card 7', 
      description: 'Description for card 7', 
      icon: Cloud,
      color: '#283054', // Default dark blue
      bgColor: '#F3F4F6', // Light gray background
    },
    { 
      id: 8, 
      title: 'Card 8', 
      description: 'Description for card 8', 
      icon: FileText,
      color: '#283054', // Default dark blue
      bgColor: '#F3F4F6', // Light gray background
    },
    { 
      id: 9, 
      title: 'Card 9', 
      description: 'Description for card 9', 
      icon: Presentation,
      color: '#283054', // Default dark blue
      bgColor: '#F3F4F6', // Light gray background
    },
  ]

  // Security categories column
  const securityCategories = [
    { id: 1, name: 'Application Security', icon: Shield },
    { id: 2, name: 'Infrastructure Security', icon: Server },
    { id: 3, name: 'SaaS Security', icon: Cloud },
  ]

  // Handle card click - Card 1 (Authentication)
  const handleCard1Click = async () => {
    setShowModal(true)
    setModalLoading(true)
    setModalError(null)
    setModalContent(null)
    
    try {
      // Get the static Authentication HTML5 page
      const response = await apiService.getAuthenticationHTML5Page()
      if (response.success && response.data && response.data.html) {
        setModalContent(response.data.html)
      } else {
        setModalError('Failed to load content')
      }
    } catch (err: any) {
      console.error('Error loading authentication content:', err)
      setModalError(err.message || 'Failed to load authentication content')
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#283054] mb-2">Security Content</h2>
          <p className="text-[#4A5568]">Select a security category and explore content</p>
        </div>

        {/* Layout: Column with categories + Card palette - Vertical center alignment */}
        <div className="flex gap-6">
          {/* Security Categories Column - Vertical */}
          <div className="w-64 flex-shrink-0 flex flex-col justify-center">
            <div className="space-y-4">
              {securityCategories.map((category) => {
                const IconComponent = category.icon
                return (
                  <div
                    key={category.id}
                    className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                    style={{ 
                      minHeight: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div className="flex flex-col items-center justify-center text-center p-6 w-full">
                      <div className="p-3 bg-[#283054]/10 rounded-lg mb-4">
                        <IconComponent className="w-8 h-8 text-[#283054]" />
                      </div>
                      <h3 className="text-base font-semibold text-[#283054]">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card Palette - 3 rows x 3 cards - Grouped by rows for alignment */}
          <div className="flex-1">
            <div className="space-y-4">
              {/* Row 1: Cards 1, 2, 3 */}
              <div className="grid grid-cols-3 gap-4">
                {cards.slice(0, 3).map((card) => {
                  const IconComponent = card.icon
                  const handleClick = card.id === 1 ? handleCard1Click : undefined
                  return (
                    <div
                      key={card.id}
                      onClick={handleClick}
                      className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                      style={{
                        borderColor: card.color,
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div className="flex flex-col items-center text-center p-6 w-full">
                        <div 
                          className="mb-4 p-4 rounded-lg"
                          style={{
                            backgroundColor: card.bgColor,
                          }}
                        >
                          <IconComponent 
                            className="w-8 h-8" 
                            style={{ color: card.color }}
                          />
                        </div>
                        <h3 
                          className="text-lg font-semibold mb-2"
                          style={{ color: card.color }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-sm text-[#4A5568]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Row 2: Cards 4, 5, 6 */}
              <div className="grid grid-cols-3 gap-4">
                {cards.slice(3, 6).map((card) => {
                  const IconComponent = card.icon
                  return (
                    <div
                      key={card.id}
                      className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                      style={{
                        borderColor: card.color,
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div className="flex flex-col items-center text-center p-6 w-full">
                        <div 
                          className="mb-4 p-4 rounded-lg"
                          style={{
                            backgroundColor: card.bgColor,
                          }}
                        >
                          <IconComponent 
                            className="w-8 h-8" 
                            style={{ color: card.color }}
                          />
                        </div>
                        <h3 
                          className="text-lg font-semibold mb-2"
                          style={{ color: card.color }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-sm text-[#4A5568]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Row 3: Cards 7, 8, 9 */}
              <div className="grid grid-cols-3 gap-4">
                {cards.slice(6, 9).map((card) => {
                  const IconComponent = card.icon
                  return (
                    <div
                      key={card.id}
                      className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-[#283054]"
                      style={{
                        borderColor: card.color,
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div className="flex flex-col items-center text-center p-6 w-full">
                        <div 
                          className="mb-4 p-4 rounded-lg"
                          style={{
                            backgroundColor: card.bgColor,
                          }}
                        >
                          <IconComponent 
                            className="w-8 h-8" 
                            style={{ color: card.color }}
                          />
                        </div>
                        <h3 
                          className="text-lg font-semibold mb-2"
                          style={{ color: card.color }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-sm text-[#4A5568]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for displaying HTML5 content */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#283054]">Authentication - Search Results</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setModalContent(null)
                  setModalError(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              {modalLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#283054] mx-auto mb-4"></div>
                    <p className="text-[#4A5568]">Loading content...</p>
                  </div>
                </div>
              )}

              {modalError && (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{modalError}</p>
                  </div>
                </div>
              )}

              {modalContent && !modalLoading && (
                <iframe
                  srcDoc={modalContent}
                  className="w-full h-full border-0"
                  title="Authentication Search Results"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
