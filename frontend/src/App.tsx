import { useState } from 'react'
import { ModernPlannerInterface } from './components/ModernPlannerInterface'
import { GoalTrackerModern } from './components/GoalTrackerModern'
import { Dashboard } from './components/Dashboard'
import { PomodoroTimer } from './components/PomodoroTimer'
import { CharacterManager } from './components/ui/CharacterManager'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

type TabType = 'dashboard' | 'modern-planner' | 'goals' | 'pomodoro'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-['Inter'] antialiased">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 
                className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors" 
                onClick={() => window.location.href = '/'}
              >
                PlanLingo
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('modern-planner')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'modern-planner'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  AI Planner
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'goals'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Goals
                </button>
                <button
                  onClick={() => setActiveTab('pomodoro')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'pomodoro'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Pomodoro
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="min-h-screen">
        {activeTab === 'dashboard' && <Dashboard onNavigateToPlanner={() => setActiveTab('modern-planner')} onNavigateToGoals={() => setActiveTab('goals')} onNavigateToPomodoro={() => setActiveTab('pomodoro')} />}
        {activeTab === 'modern-planner' && <ModernPlannerInterface />}
        {activeTab === 'goals' && (
          <ErrorBoundary>
            <GoalTrackerModern />
          </ErrorBoundary>
        )}
        {activeTab === 'pomodoro' && <PomodoroTimer />}
      </main>
      
      {/* Character Manager - Always present */}
      <CharacterManager />
    </div>
  )
}

export default App
