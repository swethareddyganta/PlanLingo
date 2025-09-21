import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Check, Flame, X, Edit3 } from 'lucide-react'
import { cn } from '../../lib/utils'
import confetti from 'canvas-confetti'

interface GoalCardProps {
  id: string
  icon: React.ReactNode
  title: string
  current: number
  target: number
  unit: string
  streak: number
  completed: boolean
  days?: string[]
  startDate?: string
  endDate?: string
  timeSlot?: string
  onUpdate: (id: string, value: number) => void
  onComplete: (id: string) => void
  onRemove: (id: string) => void
  className?: string
}

export const GoalCard: React.FC<GoalCardProps> = ({
  id,
  icon,
  title,
  current,
  target,
  unit,
  streak,
  completed,
  days,
  startDate,
  endDate,
  timeSlot,
  onUpdate,
  onComplete,
  onRemove,
  className
}) => {
  const [showInput, setShowInput] = useState(false)
  const [inputValue, setInputValue] = useState(current.toString())
  
  const percentage = Math.min((current / target) * 100, 100)
  
  const handleInputSubmit = () => {
    const value = parseInt(inputValue)
    if (!isNaN(value) && value >= 0 && value <= target) {
      onUpdate(id, value)
    }
    setShowInput(false)
    setInputValue(current.toString())
  }
  
  const handleInputCancel = () => {
    setShowInput(false)
    setInputValue(current.toString())
  }
  
  const quickIncrements = target > 20 ? [5, 10, target > 50 ? 25 : Math.floor(target/4)] : [1, Math.floor(target/4), Math.floor(target/2)]
  
  const handleComplete = () => {
    onComplete(id)
    
    // Celebration confetti with reduced motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })
    }
  }

  const getProgressColor = () => {
    if (completed) return 'text-green-500'
    if (percentage >= 75) return 'text-blue-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressBg = () => {
    if (completed) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Circular progress calculation
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ 
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn(
        "relative group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200",
        "border border-gray-100 dark:border-gray-700",
        completed && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/10",
        className
      )}
    >
      {/* Remove button */}
      <button
        onClick={() => onRemove(id)}
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={`Remove ${title} goal`}
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-gray-900 dark:text-gray-100 text-sm truncate",
              completed && "line-through text-gray-500"
            )}>
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {current} / {target} {unit}
            </p>
          </div>
        </div>

        {/* Compact Progress */}
        <div className="relative flex-shrink-0">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="30"
              cy="30"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 - (percentage / 100) * 2 * Math.PI * 24}
              className={getProgressColor()}
              initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 24 - (percentage / 100) * 2 * Math.PI * 24 }}
              transition={{ 
                duration: 1,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Additional Info Row */}
      <div className="space-y-1 mb-3">
        {(days && days.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {days.slice(0, 4).map((day) => (
              <span 
                key={day} 
                className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
              >
                {day}
              </span>
            ))}
            {days.length > 4 && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                +{days.length - 4}
              </span>
            )}
          </div>
        )}
        {timeSlot && (
          <p className="text-xs text-purple-600 dark:text-purple-400">
            {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
          </p>
        )}
      </div>

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              {streak} day{streak !== 1 ? 's' : ''} streak
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Action Controls */}
      <AnimatePresence mode="wait">
        {showInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInputSubmit()
                  if (e.key === 'Escape') handleInputCancel()
                }}
                min="0"
                max={target}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`0-${target}`}
                autoFocus
              />
              <button
                onClick={handleInputSubmit}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-xs"
              >
                Set
              </button>
              <button
                onClick={handleInputCancel}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Compact Control Row */}
            <div className="flex items-center justify-between">
              {/* Value Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onUpdate(id, current - 1)}
                  disabled={current <= 0}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Decrease ${title}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                
                <button
                  onClick={() => setShowInput(true)}
                  className="px-2 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-xs font-medium"
                  title="Edit value"
                >
                  {current}
                </button>
                
                <button
                  onClick={() => onUpdate(id, current + 1)}
                  disabled={current >= target}
                  className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Increase ${title}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              {/* Complete Button */}
              <motion.button
                onClick={handleComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  completed
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-green-500 text-white hover:bg-green-600"
                )}
                aria-label={completed ? "Goal completed" : `Complete ${title} goal`}
              >
                <Check className="w-3 h-3" />
                <span>{completed ? 'Done' : 'Complete'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
