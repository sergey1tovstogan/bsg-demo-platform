import { Shield, Lock, Key, UserCheck, Eye, Server, Cloud, FileCheck, CheckCircle2 } from 'lucide-react'

export function SecurityContentViewer() {
  // Card palette data - 9 cards in 3 rows
  const cards = [
    { 
      id: 1, 
      title: 'Authentication', 
      icon: Key,
      color: '#3B82F6', // Blue
      bgColor: '#DBEAFE', // Light blue background
    },
    { 
      id: 2, 
      title: 'Authorization', 
      icon: UserCheck,
      color: '#10B981', // Green
      bgColor: '#D1FAE5', // Light green background
    },
    { 
      id: 3, 
      title: 'Privacy & Encryption', 
      icon: Lock,
      color: '#8B5CF6', // Purple
      bgColor: '#EDE9FE', // Light purple background
    },
    { 
      id: 4, 
      title: 'Segregation', 
      icon: Shield,
      color: '#F59E0B', // Amber
      bgColor: '#FEF3C7', // Light amber background
    },
    { 
      id: 5, 
      title: 'Access Management', 
      icon: Eye,
      color: '#EF4444', // Red
      bgColor: '#FEE2E2', // Light red background
    },
    { 
      id: 6, 
      title: 'Platform Management', 
      icon: Server,
      color: '#06B6D4', // Cyan
      bgColor: '#CFFAFE', // Light cyan background
    },
    { 
      id: 7, 
      title: 'SaaS Security Model', 
      icon: Cloud,
      color: '#6366F1', // Indigo
      bgColor: '#E0E7FF', // Light indigo background
    },
    { 
      id: 8, 
      title: 'SaaS Access Control', 
      icon: FileCheck,
      color: '#14B8A6', // Teal
      bgColor: '#CCFBF1', // Light teal background
    },
    { 
      id: 9, 
      title: 'Compliance and Risk Management', 
      icon: CheckCircle2,
      color: '#EC4899', // Pink
      bgColor: '#FCE7F3', // Light pink background
    },
  ]

  // Security categories column
  const securityCategories = [
    { id: 1, name: 'Application Security', icon: Shield },
    { id: 2, name: 'Infrastructure Security', icon: Server },
    { id: 3, name: 'SaaS Security', icon: Cloud },
  ]

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
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
