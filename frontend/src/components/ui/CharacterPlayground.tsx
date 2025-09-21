import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface CharacterPlaygroundProps {
  className?: string
}

export const CharacterPlayground: React.FC<CharacterPlaygroundProps> = ({
  className = ''
}) => {
  const [userMood, setUserMood] = useState<string>('')
  const [userNeed, setUserNeed] = useState<string>('')
  const [showNeedSelection, setShowNeedSelection] = useState(false)

  const moods = [
    { emoji: '😊', mood: 'happy', name: 'Happy', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
    { emoji: '🤩', mood: 'excited', name: 'Excited', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
    { emoji: '🤔', mood: 'thinking', name: 'Thinking', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
    { emoji: '😴', mood: 'sleepy', name: 'Sleepy', color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300' },
    { emoji: '🎉', mood: 'celebrating', name: 'Celebrating', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' }
  ]

  const needs = [
    { emoji: '🎊', need: 'celebrate', name: 'Celebrate', color: 'bg-duolingo-green hover:bg-duolingo-darkGreen text-white' },
    { emoji: '💪', need: 'encourage', name: 'Encourage', color: 'bg-duolingo-blue hover:bg-blue-600 text-white' },
    { emoji: '🤔', need: 'thinking', name: 'Thinking', color: 'bg-duolingo-purple hover:bg-purple-600 text-white' },
    { emoji: '😴', need: 'rest', name: 'Rest', color: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    { emoji: '🎭', need: 'party', name: 'Party Time!', color: 'bg-duolingo-orange hover:bg-orange-600 text-white' }
  ]

  const characters = [
    { emoji: '🦉', character: 'owl', name: 'Wise Owl', color: 'bg-amber-100 hover:bg-amber-200 border-amber-300' },
    { emoji: '🐱', character: 'cat', name: 'Clever Cat', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
    { emoji: '🐰', character: 'rabbit', name: 'Happy Rabbit', color: 'bg-pink-100 hover:bg-pink-200 border-pink-300' },
    { emoji: '🐻', character: 'bear', name: 'Friendly Bear', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
    { emoji: '🦊', character: 'fox', name: 'Sly Fox', color: 'bg-red-100 hover:bg-red-200 border-red-300' }
  ]

  const handleMoodSelection = (mood: string) => {
    setUserMood(mood)
    setShowNeedSelection(true)
  }

  const handleNeedSelection = (need: string) => {
    setUserNeed(need)
    
    // Spawn a character based on mood and need combination
    let characterToSpawn = characters[Math.floor(Math.random() * characters.length)]
    let emotion: 'happy' | 'excited' | 'thinking' | 'sleepy' | 'celebrating' = 'happy'
    
    if ((window as any).characterManager) {
      const needAction = needs.find(n => n.need === need)
      if (needAction) {
        switch (needAction.need) {
          case 'celebrate':
            (window as any).characterManager.celebrateMilestone(`🎉 ${characterToSpawn.name} is here to celebrate with you!`)
            break
          case 'encourage':
            (window as any).characterManager.encourageProgress()
            break
          case 'thinking':
            (window as any).characterManager.showThinking()
            break
          case 'rest':
            // For rest, spawn a sleepy character (preferably fox for yawning)
            if (userMood === 'sleepy') {
              characterToSpawn = characters.find(c => c.character === 'fox') || characterToSpawn
              emotion = 'sleepy'
              (window as any).characterManager.spawnCharacter(characterToSpawn.character, emotion, '😴 Time to rest...')
            } else {
              // For other moods with rest, spawn a random character with sleepy emotion
              emotion = 'sleepy'
              (window as any).characterManager.spawnCharacter(characterToSpawn.character, emotion, '😴 Time to rest...')
            }
            break
          case 'party':
            // Spawn multiple characters for party time
            characters.forEach((char, index) => {
              setTimeout(() => {
                (window as any).characterManager.spawnCharacter(char.character, 'celebrating')
              }, index * 300)
            })
            break
        }
      }
    }
    
    // Reset the selections
    setTimeout(() => {
      setUserMood('')
      setUserNeed('')
      setShowNeedSelection(false)
    }, 2000)
  }

  const resetSelections = () => {
    setUserMood('')
    setUserNeed('')
    setShowNeedSelection(false)
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          🎭 Character Companion
        </h3>
        <p className="text-sm text-duolingo-grey mb-6 text-center">
          Let's find the perfect character for your mood today!
        </p>

        {/* Step 1: Mood Selection */}
        {!userMood && !showNeedSelection && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
              How are you feeling today? 🤔
            </h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {moods.map((mood) => (
                <motion.button
                  key={mood.mood}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${mood.color}`}
                  onClick={() => handleMoodSelection(mood.mood)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2 text-lg">{mood.emoji}</span>
                  {mood.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Need Selection */}
        {userMood && showNeedSelection && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center mb-4">
              <span className="text-lg mr-2">{moods.find(m => m.mood === userMood)?.emoji}</span>
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Great! What do you need right now?
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {needs.map((need) => (
                <motion.button
                  key={need.need}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${need.color}`}
                  onClick={() => handleNeedSelection(need.need)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-2 text-lg">{need.emoji}</span>
                  {need.name}
                </motion.button>
              ))}
            </div>
            <button
              onClick={resetSelections}
              className="mt-4 text-sm text-duolingo-grey hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to mood selection
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}

export default CharacterPlayground
