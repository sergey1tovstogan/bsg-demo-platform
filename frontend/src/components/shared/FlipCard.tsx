import { useState } from 'react'
import { motion } from 'framer-motion'

interface FlipCardProps {
  frontContent: React.ReactNode
  backContent: React.ReactNode
  frontGradient?: string
  backGradient?: string
  height?: string
  width?: string
}

export function FlipCard({
  frontContent,
  backContent,
  frontGradient,
  backGradient,
  height = '400px',
  width = '320px',
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative"
      style={{
        height,
        width: '100%',
        maxWidth: width,
        margin: '0 auto',
      }}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {frontContent}
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {backContent}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
