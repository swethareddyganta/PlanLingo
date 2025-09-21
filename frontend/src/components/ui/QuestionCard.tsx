import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, CheckCircle, X } from 'lucide-react'

interface QuestionCardProps {
  type: 'new_word' | 'translation' | 'selection'
  question: string
  audioText?: string
  options?: Array<{
    id: string
    text: string
    image?: string
    correct?: boolean
  }>
  selectedOption?: string
  onSelect?: (optionId: string) => void
  feedback?: 'correct' | 'incorrect' | null
  feedbackText?: string
  onContinue?: () => void
  className?: string
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  type,
  question,
  audioText,
  options = [],
  selectedOption,
  onSelect,
  feedback,
  feedbackText,
  onContinue,
  className = ''
}) => {
  const getOptionStyle = (option: any) => {
    if (feedback === 'correct' && option.correct) {
      return 'bg-duolingo-green border-duolingo-green text-white'
    }
    if (feedback === 'incorrect' && selectedOption === option.id) {
      return 'bg-red-500 border-red-500 text-white'
    }
    if (selectedOption === option.id) {
      return 'bg-duolingo-blue border-duolingo-blue text-white'
    }
    return 'bg-white border-gray-300 hover:border-duolingo-green hover:bg-green-50'
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-duolingo-green rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">DF</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Daily Flow</span>
        </div>
        <button className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-duolingo-green h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="space-y-6">
        {/* Question Type */}
        <div className="text-center">
          <span className="inline-block bg-duolingo-purple text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {type === 'new_word' ? 'NEW WORD' : type === 'translation' ? 'TRANSLATE' : 'SELECT'}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {question}
          </h2>
          
          {/* Audio */}
          {audioText && (
            <div className="flex items-center justify-center space-x-3">
              <button className="w-12 h-12 bg-duolingo-blue rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all">
                <Volume2 className="w-6 h-6 text-white" />
              </button>
              <span className="text-duolingo-blue text-lg font-semibold">
                {audioText}
              </span>
            </div>
          )}
        </div>

        {/* Options */}
        {options.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => (
              <motion.button
                key={option.id}
                className={`
                  p-4 rounded-2xl border-2 transition-all duration-200 font-medium
                  ${getOptionStyle(option)}
                `}
                onClick={() => onSelect?.(option.id)}
                disabled={!!feedback}
                whileHover={!feedback ? { scale: 1.02 } : {}}
                whileTap={!feedback ? { scale: 0.98 } : {}}
              >
                {option.image ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">{option.image}</span>
                    </div>
                    <p className="text-sm">{option.text}</p>
                  </div>
                ) : (
                  <p>{option.text}</p>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div
            className={`
              p-4 rounded-2xl flex items-center justify-center space-x-3
              ${feedback === 'correct' 
                ? 'bg-duolingo-green text-white' 
                : 'bg-red-500 text-white'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {feedback === 'correct' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <X className="w-6 h-6" />
            )}
            <span className="font-semibold">{feedbackText}</span>
          </motion.div>
        )}

        {/* Continue Button */}
        {feedback && onContinue && (
          <motion.button
            className="w-full bg-duolingo-green hover:bg-duolingo-darkGreen text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={onContinue}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            CONTINUE
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
