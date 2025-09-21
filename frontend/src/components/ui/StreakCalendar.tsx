import React from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface StreakCalendarProps {
  currentStreak: number
  weeklyProgress: Array<{
    day: string
    completed: boolean
    date: string
  }>
  className?: string
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentStreak,
  weeklyProgress,
  className = ''
}) => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Streak Header */}
      <div className="text-center mb-6">
        <motion.div
          className="inline-block mb-4"
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
          <Flame className="w-16 h-16 text-duolingo-orange mx-auto drop-shadow-lg" />
        </motion.div>
        
        <motion.h2
          className="text-4xl font-bold text-duolingo-orange mb-2"
          key={currentStreak}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentStreak}
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          day streak
        </p>
      </div>

      {/* Weekly Calendar */}
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div key={day} className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {day}
              </p>
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mx-auto
                  ${weeklyProgress[index]?.completed 
                    ? 'bg-duolingo-orange text-white shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {weeklyProgress[index]?.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    ✓
                  </motion.div>
                ) : (
                  <span className="text-xs font-medium">
                    {weeklyProgress[index]?.date?.split('-').pop() || ''}
                  </span>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Motivational Text */}
        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Practicing daily grows your streak, but skipping a day resets it!
          </p>
        </div>

        {/* Commitment Button */}
        <motion.button
          className="w-full bg-duolingo-lightBlue hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          I'M COMMITTED
        </motion.button>
      </div>
    </div>
  )
}

export default StreakCalendar
