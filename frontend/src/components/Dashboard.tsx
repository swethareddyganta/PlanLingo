import React, { useState } from 'react'
import { cn } from '../lib/utils'
import PersonalizedDashboard from './PersonalizedDashboard'

// Export PersonalizedDashboard as the main Dashboard
export const Dashboard = PersonalizedDashboard

// Keep the old dashboard as DashboardOld for reference
export const DashboardOld: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('current')

  // Mock data for visualizations
  const weeklyData = [
    { day: 'Mon', completed: 4, total: 5, score: 80 },
    { day: 'Tue', completed: 5, total: 5, score: 100 },
    { day: 'Wed', completed: 3, total: 5, score: 60 },
    { day: 'Thu', completed: 4, total: 5, score: 80 },
    { day: 'Fri', completed: 5, total: 5, score: 100 },
    { day: 'Sat', completed: 2, total: 4, score: 50 },
    { day: 'Sun', completed: 3, total: 4, score: 75 }
  ]

  const monthlyStats = {
    totalGoals: 140,
    completedGoals: 112,
    averageScore: 82,
    bestStreak: 12,
    currentStreak: 5
  }

  const categoryData = [
    { name: 'Work', time: 320, color: 'bg-blue-500' },
    { name: 'Wellness', time: 90, color: 'bg-green-500' },
    { name: 'Personal', time: 180, color: 'bg-purple-500' },
    { name: 'Breaks', time: 60, color: 'bg-orange-500' }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 75) return 'bg-blue-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const totalTime = categoryData.reduce((sum, cat) => sum + cat.time, 0)

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(weeklyData.reduce((sum, d) => sum + d.score, 0) / weeklyData.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Average completion</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.currentStreak}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">days in a row</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Goals This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {monthlyStats.completedGoals}/{monthlyStats.totalGoals}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round((monthlyStats.completedGoals / monthlyStats.totalGoals) * 100)}% completed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.bestStreak}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">personal record</p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">📈 Weekly Progress</h3>
        <div className="space-y-4">
          {weeklyData.map((day) => (
            <div key={day.day} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={cn("h-6 rounded-full transition-all", getScoreColor(day.score))}
                  style={{ width: `${day.score}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {day.completed}/{day.total}
                </div>
              </div>
              <div className="w-16 text-sm text-right font-medium text-gray-900">
                {day.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">⏰ Time Distribution (Today)</h3>
        <div className="space-y-4">
          {categoryData.map((category) => (
            <div key={category.name} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-600">{category.name}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div
                  className={cn("h-4 rounded-full", category.color)}
                  style={{ width: `${(category.time / totalTime) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm text-right font-medium text-gray-900">
                {Math.round(category.time / 60 * 10) / 10}h
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Total Planned Time:</span>
            <span className="font-bold">{Math.round(totalTime / 60 * 10) / 10} hours</span>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">📅 Monthly Heatmap</h3>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(30)].map((_, index) => {
            const score = Math.floor(Math.random() * 100)
            return (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-xs font-medium",
                  score >= 90 ? 'bg-green-500 text-white' :
                  score >= 75 ? 'bg-blue-500 text-white' :
                  score >= 60 ? 'bg-yellow-500 text-white' :
                  score >= 30 ? 'bg-orange-500 text-white' :
                  'bg-gray-200 text-gray-600'
                )}
                title={`Day ${index + 1}: ${score}%`}
              >
                {index + 1}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Weekly Report Preview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">📄 Weekly Report</h3>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">🎉 Great week! You're on track!</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• You completed <strong>82%</strong> of your goals this week</p>
            <p>• Your wellness activities increased by <strong>15%</strong></p>
            <p>• You maintained focus for <strong>6.2 hours</strong> average per day</p>
            <p>• <strong>Suggestion:</strong> Try adding a 5-minute morning stretch to boost your energy</p>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            View Full Report
          </button>
        </div>
      </div>
    </div>
  )
}
