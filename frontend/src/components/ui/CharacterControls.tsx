import React from 'react'
import { motion } from 'framer-motion'

interface CharacterControlsProps {
  className?: string
}

export const CharacterControls: React.FC<CharacterControlsProps> = ({
  className = ''
}) => {
  const spawnCharacter = (type: 'owl' | 'cat' | 'rabbit' | 'bear' | 'fox', emotion: 'happy' | 'excited' | 'thinking' | 'sleepy' | 'celebrating') => {
    if ((window as any).characterManager) {
      (window as any).characterManager.spawnCharacter(type, emotion)
    }
  }

  const characters = [
    { emoji: '🦉', type: 'owl', name: 'Wise Owl', color: 'bg-amber-100 hover:bg-amber-200 border-amber-300' },
    { emoji: '🐱', type: 'cat', name: 'Clever Cat', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
    { emoji: '🐰', type: 'rabbit', name: 'Happy Rabbit', color: 'bg-pink-100 hover:bg-pink-200 border-pink-300' },
    { emoji: '🐻', type: 'bear', name: 'Friendly Bear', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
    { emoji: '🦊', type: 'fox', name: 'Sly Fox', color: 'bg-red-100 hover:bg-red-200 border-red-300' }
  ]

  const emotions = [
    { emoji: '😊', emotion: 'happy', name: 'Happy', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
    { emoji: '🤩', emotion: 'excited', name: 'Excited', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
    { emoji: '🤔', emotion: 'thinking', name: 'Thinking', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
    { emoji: '😴', emotion: 'sleepy', name: 'Sleepy', color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300' },
    { emoji: '🎉', emotion: 'celebrating', name: 'Celebrating', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' }
  ]

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        🎭 Character Playground
      </h3>
      <p className="text-sm text-duolingo-grey mb-6 text-center">
        Click any combination to spawn animated characters!
      </p>

      {/* Characters */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Characters</h4>
        <div className="flex flex-wrap gap-2">
          {characters.map((char) => (
            <motion.button
              key={char.type}
              className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${char.color}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => spawnCharacter(char.type as any, 'happy')}
            >
              <span className="mr-2">{char.emoji}</span>
              {char.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Emotions */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Emotions</h4>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <motion.button
              key={emotion.emotion}
              className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${emotion.color}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => spawnCharacter('owl', emotion.emotion as any)}
            >
              <span className="mr-2">{emotion.emoji}</span>
              {emotion.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            className="bg-duolingo-green hover:bg-duolingo-darkGreen text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if ((window as any).characterManager) {
                (window as any).characterManager.celebrateMilestone('🎉 Milestone Achieved! 🎉')
              }
            }}
          >
            🎊 Celebrate
          </motion.button>
          <motion.button
            className="bg-duolingo-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if ((window as any).characterManager) {
                (window as any).characterManager.encourageProgress()
              }
            }}
          >
            💪 Encourage
          </motion.button>
          <motion.button
            className="bg-duolingo-purple hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if ((window as any).characterManager) {
                (window as any).characterManager.showThinking()
              }
            }}
          >
            🤔 Thinking
          </motion.button>
          <motion.button
            className="bg-duolingo-orange hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Spawn all characters celebrating
              const types = ['owl', 'cat', 'rabbit', 'bear', 'fox'] as const
              types.forEach((type, index) => {
                setTimeout(() => {
                  if ((window as any).characterManager) {
                    (window as any).characterManager.spawnCharacter(type, 'celebrating')
                  }
                }, index * 500)
              })
            }}
          >
            🎭 Party Time!
          </motion.button>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="mt-6 p-4 bg-duolingo-lightGrey dark:bg-gray-800 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Fun Facts</h4>
        <ul className="text-xs text-duolingo-grey space-y-1">
          <li>• Characters appear automatically based on your activity</li>
          <li>• Each character has unique personality and messages</li>
          <li>• Characters will celebrate your achievements!</li>
          <li>• Click anywhere to make them disappear</li>
        </ul>
      </div>
    </div>
  )
}

export default CharacterControls
