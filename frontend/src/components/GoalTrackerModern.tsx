import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Flame, Trophy, TrendingUp, Activity, Heart, BookOpen, Moon, Droplets, Dumbbell } from 'lucide-react'
import { cn } from '../lib/utils'
import { KPICard } from './ui/KPICard'
import { GoalCard } from './ui/GoalCard'
import { DonutChart } from './ui/DonutChart'
import { useGoals } from '../hooks/useGoals'

interface Goal {
  id: string
  title: string
  iconType?: string
  target: number
  unit: string
  current: number
  completed: boolean
  streak: number
  days?: string[]
  startDate?: string
  endDate?: string
  timeSlot?: string
}

// Icon mapping function
const getIconComponent = (iconType?: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    target: <Target className="w-6 h-6" />,
    flame: <Flame className="w-6 h-6" />,
    trophy: <Trophy className="w-6 h-6" />,
    trending: <TrendingUp className="w-6 h-6" />,
    activity: <Activity className="w-6 h-6" />,
    heart: <Heart className="w-6 h-6" />,
    book: <BookOpen className="w-6 h-6" />,
    moon: <Moon className="w-6 h-6" />,
    droplets: <Droplets className="w-6 h-6" />,
    dumbbell: <Dumbbell className="w-6 h-6" />
  }
  return iconMap[iconType || 'target'] || <Target className="w-6 h-6" />
}

export const GoalTrackerModern: React.FC = () => {
  const { goals, setGoals, completedGoals, totalGoals, completionPercentage, averageStreak, wellnessScore } = useGoals()
  const [showAddGoal, setShowAddGoal] = useState(false)
  
  // Debug logging
  console.log('GoalTrackerModern rendered with goals:', goals)
  
  // Celebrate when goals panel loads
  useEffect(() => {
    if ((window as any).characterManager) {
      (window as any).characterManager.encourageProgress()
    }
  }, [])
  
  // Simple fallback if there are any issues
  if (!goals) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
            <Target className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Goals...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load your goals
          </p>
        </div>
      </div>
    )
  }
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    target: '', 
    unit: '',
    days: [] as string[],
    startDate: '',
    endDate: '',
    timeSlot: ''
  })


  // Donut chart data
  const chartData = [
    { label: 'Completed', value: completedGoals, color: '#10b981' },
    { label: 'In Progress', value: goals.filter(g => !g.completed && g.current > 0).length, color: '#3b82f6' },
    { label: 'Not Started', value: goals.filter(g => g.current === 0).length, color: '#ef4444' }
  ]

  const updateGoal = (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId)
    const wasCompleted = goal?.completed || false
    
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            current: Math.max(0, Math.min(goal.target, newValue)),
            completed: newValue >= goal.target
          }
        : goal
    ))
    
    // Celebrate goal completion
    if (goal && !wasCompleted && newValue >= goal.target && (window as any).characterManager) {
      (window as any).characterManager.celebrateMilestone(`Goal completed: ${goal.title}! Amazing work!`)
    }
  }

  const toggleGoalComplete = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            completed: !goal.completed,
            current: !goal.completed ? goal.target : Math.min(goal.current, goal.target - 1)
          }
        : goal
    ))
  }

  const removeGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId))
  }

  const addNewGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.unit) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        iconType: 'target',
        target: Number(newGoal.target),
        unit: newGoal.unit,
        current: 0,
        completed: false,
        streak: 0,
        days: newGoal.days.length > 0 ? newGoal.days : undefined,
        startDate: newGoal.startDate || undefined,
        endDate: newGoal.endDate || undefined,
        timeSlot: newGoal.timeSlot || undefined
      }
      setGoals([...goals, goal])
      setNewGoal({ 
        title: '', 
        target: '', 
        unit: '',
        days: [],
        startDate: '',
        endDate: '',
        timeSlot: ''
      })
      setShowAddGoal(false)
      
      // Celebrate new goal creation
      if ((window as any).characterManager) {
        (window as any).characterManager.celebrateMilestone('New goal created! You can do it!')
      }
    }
  }

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
        <Target className="w-10 h-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Ready to build some habits?
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Start by creating your first goal. Small daily actions lead to big results!
      </p>
      <motion.button
        onClick={() => setShowAddGoal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
      >
        Create Your First Goal
      </motion.button>
    </motion.div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Daily Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and build lasting habits
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowAddGoal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {completedGoals}/{totalGoals}
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {averageStreak}d
              </p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {completionPercentage}%
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wellness</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {wellnessScore}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Progress Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Today's Progress
            </h3>
            
            <div className="flex items-center justify-center mb-4">
              <DonutChart
                data={chartData}
                size={120}
                strokeWidth={12}
                centerContent={
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {completionPercentage}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Complete
                    </div>
                  </div>
                }
              />
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Goals ({goals.length})
              </h3>
              {goals.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {completedGoals} of {totalGoals} completed today
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {goals.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState />
                  </div>
                ) : (
                  goals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      id={goal.id}
                      icon={getIconComponent(goal.iconType)}
                      title={goal.title}
                      current={goal.current}
                      target={goal.target}
                      unit={goal.unit}
                      streak={goal.streak}
                      completed={goal.completed}
                      days={goal.days}
                      startDate={goal.startDate}
                      endDate={goal.endDate}
                      timeSlot={goal.timeSlot}
                      onUpdate={updateGoal}
                      onComplete={toggleGoalComplete}
                      onRemove={removeGoal}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddGoal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Create a New Goal
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set yourself up for success with a clear, achievable goal
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Goal Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What's your goal?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Exercise, Read books, Drink water, Meditate"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    autoFocus
                  />
                </div>
                
                {/* Target & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Amount
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., minutes, pages, glasses, times"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Days Selection - Simplified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Which days? (Leave empty for daily)
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index];
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const updatedDays = newGoal.days.includes(day)
                              ? newGoal.days.filter(d => d !== day)
                              : [...newGoal.days, day]
                            setNewGoal({...newGoal, days: updatedDays})
                          }}
                          className={cn(
                            "p-2 rounded-lg text-xs font-medium transition-colors",
                            newGoal.days.includes(day)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slot - Simplified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'morning', label: 'Morning' },
                      { value: 'afternoon', label: 'Afternoon' },
                      { value: 'evening', label: 'Evening' },
                      { value: 'anytime', label: 'Anytime' }
                    ].map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setNewGoal({...newGoal, timeSlot: slot.value})}
                        className={cn(
                          "p-3 rounded-lg text-xs font-medium transition-colors text-center",
                          newGoal.timeSlot === slot.value
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        <div>{slot.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewGoal}
                  disabled={!newGoal.title || !newGoal.target || !newGoal.unit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg disabled:shadow-none"
                >
                  Create Goal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
