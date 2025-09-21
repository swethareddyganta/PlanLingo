import React from 'react'
import { motion } from 'framer-motion'

interface DuolingoCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  color?: 'green' | 'purple' | 'orange' | 'blue' | 'yellow' | 'red'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export const DuolingoCard: React.FC<DuolingoCardProps> = ({
  children,
  className = '',
  hover = true,
  color = 'green',
  size = 'md',
  onClick
}) => {
  const colorClasses = {
    green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800',
    red: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
  }

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const baseClasses = `
    rounded-2xl border-2 shadow-lg transition-all duration-300 ease-out
    ${colorClasses[color]}
    ${sizeClasses[size]}
    ${hover ? 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

export default DuolingoCard
