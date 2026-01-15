// ViewInArchitectureButton - Button to navigate to Content tab and view animations
import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Zap, Database } from 'lucide-react'
import type { ViewInArchitectureButtonProps } from './types'

/**
 * ViewInArchitectureButton Component
 * Provides navigation from Demo tab to Content tab to view animations
 */
export const ViewInArchitectureButton: React.FC<ViewInArchitectureButtonProps> = ({
  onNavigate,
  disabled = false,
  eventType
}) => {
  // Icon based on event type
  const getIcon = () => {
    if (eventType === 'business') {
      return <Zap className="w-4 h-4" />
    } else if (eventType === 'data') {
      return <Database className="w-4 h-4" />
    }
    return <Eye className="w-4 h-4" />
  }

  // Color scheme based on event type - Temenos brand colors
  const getColorClasses = () => {
    if (eventType === 'business') {
      return {
        bg: 'from-[#003366] to-[#004080]', // Temenos Navy
        bgHover: 'hover:from-[#004080] hover:to-[#003366]',
        shadow: 'hover:shadow-[#003366]/50'
      }
    } else if (eventType === 'data') {
      return {
        bg: 'from-[#00A3E0] to-[#0087bd]', // Temenos Cyan
        bgHover: 'hover:from-[#0087bd] hover:to-[#00A3E0]',
        shadow: 'hover:shadow-[#00A3E0]/50'
      }
    }
    return {
      bg: 'from-[#003366] to-[#00A3E0]', // Temenos gradient
      bgHover: 'hover:from-[#004080] hover:to-[#0087bd]',
      shadow: 'hover:shadow-[#003366]/50'
    }
  }

  const colors = getColorClasses()

  // Button text based on event type
  const getButtonText = () => {
    if (eventType === 'business') {
      return 'View Business Events in Architecture'
    } else if (eventType === 'data') {
      return 'View Data Events in Architecture'
    }
    return 'View in Architecture'
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onNavigate}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        bg-gradient-to-r ${colors.bg} ${colors.bgHover}
        text-white shadow-lg ${colors.shadow}
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
    </motion.button>
  )
}

export default ViewInArchitectureButton
