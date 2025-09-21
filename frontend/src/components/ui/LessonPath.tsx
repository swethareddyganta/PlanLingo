import React from 'react'
import { motion } from 'framer-motion'
import { Star, Headphones, Mic, CheckCircle, Lock } from 'lucide-react'

interface LessonPathProps {
  lessons: Array<{
    id: string
    title: string
    type: 'lesson' | 'practice' | 'test'
    completed: boolean
    locked: boolean
    xp?: number
  }>
  currentLesson?: string
  className?: string
}

export const LessonPath: React.FC<LessonPathProps> = ({
  lessons,
  currentLesson,
  className = ''
}) => {
  const getLessonIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-white" />
    }
    
    switch (type) {
      case 'lesson':
        return <Star className="w-6 h-6 text-white" />
      case 'practice':
        return <Headphones className="w-6 h-6 text-white" />
      case 'test':
        return <Mic className="w-6 h-6 text-white" />
      default:
        return <Star className="w-6 h-6 text-white" />
    }
  }

  const getLessonColor = (lesson: any) => {
    if (lesson.locked) {
      return 'bg-gray-300 dark:bg-gray-600'
    }
    if (lesson.completed) {
      return 'bg-duolingo-green'
    }
    if (lesson.id === currentLesson) {
      return 'bg-duolingo-blue'
    }
    return 'bg-duolingo-green'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {lessons.map((lesson, index) => (
        <div key={lesson.id} className="flex items-center space-x-4">
          {/* Lesson Circle */}
          <div className="relative">
            <motion.div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                shadow-lg border-2 border-white
                ${getLessonColor(lesson)}
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {lesson.locked ? (
                <Lock className="w-6 h-6 text-gray-500" />
              ) : (
                getLessonIcon(lesson.type, lesson.completed)
              )}
            </motion.div>
            
            {/* XP Badge */}
            {lesson.xp && !lesson.locked && (
              <div className="absolute -top-2 -right-2 bg-duolingo-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                +{lesson.xp}
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="flex-1">
            <h3 className={`font-semibold ${
              lesson.locked ? 'text-gray-400' : 'text-gray-900 dark:text-white'
            }`}>
              {lesson.title}
            </h3>
            <p className="text-sm text-duolingo-grey">
              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
            </p>
          </div>

          {/* Progress Line */}
          {index < lessons.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200 dark:bg-gray-700" />
          )}
        </div>
      ))}
    </div>
  )
}

export default LessonPath
