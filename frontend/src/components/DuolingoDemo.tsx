import React, { useState } from 'react'
import { LessonPath } from './ui/LessonPath'
import { StreakCalendar } from './ui/StreakCalendar'
import { QuestionCard } from './ui/QuestionCard'
import { ProgressRing } from './ui/ProgressRing'
import { StreakCounter } from './ui/StreakCounter'
import { CharacterControls } from './ui/CharacterControls'

export const DuolingoDemo: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const lessons = [
    { id: '1', title: 'Basic Phrases', type: 'lesson', completed: true, locked: false, xp: 10 },
    { id: '2', title: 'Greetings', type: 'lesson', completed: true, locked: false, xp: 15 },
    { id: '3', title: 'Numbers', type: 'practice', completed: false, locked: false, xp: 20 },
    { id: '4', title: 'Colors', type: 'lesson', completed: false, locked: true },
    { id: '5', title: 'Animals', type: 'test', completed: false, locked: true },
  ]

  const weeklyProgress = [
    { day: 'Su', completed: false, date: '2024-01-21' },
    { day: 'Mo', completed: true, date: '2024-01-22' },
    { day: 'Tu', completed: true, date: '2024-01-23' },
    { day: 'We', completed: true, date: '2024-01-24' },
    { day: 'Th', completed: false, date: '2024-01-25' },
    { day: 'Fr', completed: false, date: '2024-01-26' },
    { day: 'Sa', completed: false, date: '2024-01-27' },
  ]

  const questionOptions = [
    { id: '1', text: 'the woman', image: '👩' },
    { id: '2', text: '1', image: '1️⃣' },
    { id: '3', text: 'the woman', image: '👩‍💼' },
    { id: '4', text: 'the man', image: '👨' },
  ]

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId)
    // Simulate feedback after selection
    setTimeout(() => {
      setFeedback(optionId === '1' ? 'correct' : 'incorrect')
    }, 500)
  }

  const handleContinue = () => {
    setSelectedOption('')
    setFeedback(null)
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Daily Flow - Duolingo Style
        </h1>
        <p className="text-duolingo-grey text-lg">
          Experience the familiar Duolingo interface with productivity features
        </p>
      </div>

      {/* Progress and Streak Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <ProgressRing progress={65} size={100} className="mx-auto mb-4">
              <span className="text-2xl font-bold text-duolingo-green">65%</span>
            </ProgressRing>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Daily Progress</h3>
            <p className="text-sm text-duolingo-grey">Keep going!</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <StreakCounter streak={7} size="lg" className="mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Current Streak</h3>
            <p className="text-sm text-duolingo-grey">You're on fire!</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-24 h-24 bg-duolingo-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">XP Earned</h3>
            <p className="text-2xl font-bold text-duolingo-green">1,250</p>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Path</h2>
        <LessonPath lessons={lessons} currentLesson="3" />
      </div>

      {/* Question Card Demo */}
      <div className="max-w-2xl mx-auto">
        <QuestionCard
          type="new_word"
          question="Select the correct image"
          audioText="La femme"
          options={questionOptions}
          selectedOption={selectedOption}
          onSelect={handleSelect}
          feedback={feedback}
          feedbackText={feedback === 'correct' ? 'Excellent!' : 'Try again!'}
          onContinue={feedback ? handleContinue : undefined}
        />
      </div>

      {/* Streak Calendar */}
      <div className="max-w-md mx-auto">
        <StreakCalendar
          currentStreak={7}
          weeklyProgress={weeklyProgress}
        />
      </div>

      {/* Character Controls */}
      <div className="max-w-2xl mx-auto">
        <CharacterControls />
      </div>
    </div>
  )
}

export default DuolingoDemo
