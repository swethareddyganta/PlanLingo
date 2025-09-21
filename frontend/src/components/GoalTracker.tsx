import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Flame, Trophy, TrendingUp, Activity, Heart, BookOpen, Moon } from 'lucide-react'
import { cn } from '../lib/utils'
import { KPICard } from './ui/KPICard'
import { GoalCard } from './ui/GoalCard'
import { DonutChart } from './ui/DonutChart'

interface Goal {
  id: string
  title: string
  target: number
  unit: string
  current: number
  completed: boolean
  streak: number
}

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([])

  const [newGoal, setNewGoal] = useState({ title: '', target: '', unit: '' })
  const [showAddGoal, setShowAddGoal] = useState(false)

  const updateGoalProgress = (goalId: string, value: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            current: Math.max(0, Math.min(goal.target, value)),
            completed: value >= goal.target
          }
        : goal
    ))
  }

  const toggleGoalComplete = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            completed: !goal.completed,
            current: !goal.completed ? goal.target : 0
          }
        : goal
    ))
  }

  const addNewGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.unit) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        target: Number(newGoal.target),
        unit: newGoal.unit,
        current: 0,
        completed: false,
        streak: 0
      }
      setGoals([...goals, goal])
      setNewGoal({ title: '', target: '', unit: '' })
      setShowAddGoal(false)
    }
  }

  const removeGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId))
  }

  const completedGoals = goals.filter(g => g.completed).length
  const totalGoals = goals.length
  const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-8">
      {/* Daily Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Today's Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className={cn(
              "w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white",
              completionPercentage >= 80 ? 'bg-green-500' : 
              completionPercentage >= 60 ? 'bg-blue-500' : 
              completionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            )}>
              {completedGoals}/{totalGoals}
            </div>
            <p className="text-sm text-gray-600">Goals Completed</p>
            <p className="text-lg font-semibold">{completionPercentage}%</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500 mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white">
              🔥
            </div>
            <p className="text-sm text-gray-600">Average Streak</p>
            <p className="text-lg font-semibold">
              {goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.streak, 0) / goals.length) : 0} days
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500 mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white">
              ⭐
            </div>
            <p className="text-sm text-gray-600">Wellness Score</p>
            <p className="text-lg font-semibold">{completionPercentage}%</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500 mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white">
              📈
            </div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-lg font-semibold">0% avg</p>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">🎯 Daily Goals</h2>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Goal
          </button>
        </div>

        {/* Add New Goal Form */}
        {showAddGoal && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3">Add New Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Goal title (e.g., 💪 Exercise)"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Target"
                value={newGoal.target}
                onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Unit (minutes, hours, etc.)"
                value={newGoal.unit}
                onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={addNewGoal}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goals */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-2xl">
                🎯
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your daily goals to build better habits</p>
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => (
            <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleGoalComplete(goal.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      goal.completed 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "border-gray-300 hover:border-green-500"
                    )}
                  >
                    {goal.completed && "✓"}
                  </button>
                  <div>
                    <h3 className={cn("font-medium", goal.completed && "line-through text-gray-500")}>
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Target: {goal.target} {goal.unit} • Streak: {goal.streak} days
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeGoal(goal.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {goal.current} / {goal.target} {goal.unit}</span>
                  <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", getProgressColor(goal.current, goal.target))}
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateGoalProgress(goal.id, goal.current - 1)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => updateGoalProgress(goal.id, goal.current + 1)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateGoalProgress(goal.id, goal.target)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          )))
          }
        </div>
      </div>
    </div>
  )
}
