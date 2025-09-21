import React from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakCounterProps {
  streak: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  streak,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const flameSize = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <motion.div
      className={`flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-3 py-2 rounded-full border border-red-200 dark:border-red-800 ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        <Flame 
          size={flameSize[size]} 
          className="text-red-500 drop-shadow-sm"
        />
      </motion.div>
      
      <motion.span
        className={`font-bold text-red-600 dark:text-red-400 ${sizeClasses[size]}`}
        key={streak}
        initial={{ scale: 1.2, color: '#ff4b4b' }}
        animate={{ scale: 1, color: '#dc2626' }}
        transition={{ duration: 0.3 }}
      >
        {streak}
      </motion.span>
      
      <span className={`text-red-500 dark:text-red-400 font-medium ${sizeClasses[size]}`}>
        day{streak !== 1 ? 's' : ''}
      </span>
    </motion.div>
  )
}

export default StreakCounter
