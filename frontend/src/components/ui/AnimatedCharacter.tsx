import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CharacterProps {
  type: 'owl' | 'cat' | 'rabbit' | 'bear' | 'fox'
  message?: string
  emotion: 'happy' | 'excited' | 'thinking' | 'sleepy' | 'celebrating'
  position: { x: number; y: number }
  onClose?: () => void
  autoClose?: boolean
  delay?: number
}

export const AnimatedCharacter: React.FC<CharacterProps> = ({
  type,
  message,
  emotion,
  position,
  onClose,
  autoClose = true,
  delay = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 500)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isVisible, autoClose, delay, onClose])

  const getCharacterEmoji = () => {
    const characters = {
      owl: '🦉',
      cat: '🐱',
      rabbit: '🐰',
      bear: '🐻',
      fox: '🦊'
    }
    return characters[type]
  }

  const getEmotionStyle = () => {
    const styles = {
      happy: { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] },
      excited: { scale: [1, 1.2, 1], y: [0, -10, 0] },
      thinking: { rotate: [0, 10, -10, 0] },
      sleepy: { scale: [1, 0.95, 1] },
      celebrating: { scale: [1, 1.3, 1], rotate: [0, 360] }
    }
    return styles[emotion]
  }

  const getEmotionDuration = () => {
    const durations = {
      happy: 2,
      excited: 1.5,
      thinking: 3,
      sleepy: 4,
      celebrating: 2
    }
    return durations[emotion]
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            ...getEmotionStyle()
          }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1
          }}
        >
          {/* Speech Bubble */}
          {message && (
            <motion.div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-2xl shadow-lg border-2 border-duolingo-green max-w-64 text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                {message}
                {/* Speech bubble tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-duolingo-green"></div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-7 border-r-7 border-t-7 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800" style={{ marginTop: '-1px' }}></div>
              </div>
            </motion.div>
          )}

          {/* Character */}
          <motion.div
            className="relative"
            animate={getEmotionStyle()}
            transition={{
              duration: getEmotionDuration(),
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <div className="text-6xl drop-shadow-lg">
              {getCharacterEmoji()}
            </div>
            
            {/* Sparkle effects for celebrating */}
            {emotion === 'celebrating' && (
              <>
                <motion.div
                  className="absolute -top-2 -right-2 text-yellow-400 text-xl"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ✨
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2 text-yellow-400 text-xl"
                  animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                >
                  ⭐
                </motion.div>
              </>
            )}

            {/* Zzz for sleepy */}
            {emotion === 'sleepy' && (
              <motion.div
                className="absolute -top-4 -right-4 text-blue-400 text-sm"
                animate={{ opacity: [0, 1, 0], y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Zzz
              </motion.div>
            )}

            {/* Close button */}
            {onClose && !autoClose && (
              <motion.button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors pointer-events-auto"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedCharacter
