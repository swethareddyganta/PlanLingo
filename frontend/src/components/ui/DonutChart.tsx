import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface DonutChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  size?: number
  strokeWidth?: number
  showLabels?: boolean
  centerContent?: React.ReactNode
  className?: string
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  strokeWidth = 20,
  showLabels = true,
  centerContent,
  className
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  let cumulativeValue = 0
  
  const segments = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0
    const strokeDasharray = total > 0 ? `${(item.value / total) * circumference} ${circumference}` : `0 ${circumference}`
    const rotation = total > 0 ? (cumulativeValue / total) * 360 : 0
    cumulativeValue += item.value
    
    return {
      ...item,
      percentage,
      strokeDasharray,
      rotation
    }
  })

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Data segments */}
          {segments.map((segment, index) => (
            <motion.circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: segment.strokeDasharray }}
              transition={{
                duration: 1.5,
                delay: index * 0.2,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              style={{
                transformOrigin: `${size / 2}px ${size / 2}px`,
                transform: `rotate(${segment.rotation}deg)`
              }}
              className="drop-shadow-sm"
            />
          ))}
        </svg>
        
        {/* Center content */}
        {centerContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              {centerContent}
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLabels && (
        <div className="mt-6 flex flex-wrap justify-center gap-4 w-full max-w-md">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center space-x-2 min-w-0"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {segment.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(segment.percentage)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
