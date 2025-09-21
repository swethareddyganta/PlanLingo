import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  className?: string
  gradient?: boolean
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  gradient = false
}) => {
  const getTrendIcon = () => {
    if (!trend) return null
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />
      default:
        return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500'
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ 
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200",
        gradient 
          ? "bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20"
          : "bg-white dark:bg-gray-800",
        "border border-gray-100 dark:border-gray-700",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-100/20 to-purple-100/20 dark:from-blue-800/20 dark:to-purple-800/20 group-hover:scale-110 transition-transform duration-300" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          </div>
          
          {trend && (
            <div className={cn("flex items-center space-x-1 text-xs font-medium", getTrendColor())}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <motion.p 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.p>
          {trend?.label && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {trend.label}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
