import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Calendar, Target, Brain, Clock, Users, Activity, BarChart3, CheckCircle2, AlertCircle, ChevronRight, Plus } from 'lucide-react';

export const ModernDashboard: React.FC = () => {
  // Sample data
  const metrics = [
    {
      title: 'Tasks Completed',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'blue',
      subtitle: 'This week'
    },
    {
      title: 'Focus Time',
      value: '6.5h',
      change: '+8%',
      trend: 'up',
      icon: Clock,
      color: 'purple',
      subtitle: 'Daily average'
    },
    {
      title: 'Goals Progress',
      value: '78%',
      change: '+15%',
      trend: 'up',
      icon: Target,
      color: 'green',
      subtitle: 'Monthly target'
    },
    {
      title: 'AI Suggestions',
      value: '12',
      change: 'New',
      trend: 'neutral',
      icon: Brain,
      color: 'orange',
      subtitle: 'Pending review'
    }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Morning Workout', time: '07:00 AM', duration: '45 min', priority: 'high', completed: false },
    { id: 2, title: 'Team Standup', time: '09:00 AM', duration: '15 min', priority: 'medium', completed: false },
    { id: 3, title: 'Deep Work Session', time: '10:00 AM', duration: '2 hours', priority: 'high', completed: false },
    { id: 4, title: 'Lunch Break', time: '12:30 PM', duration: '1 hour', priority: 'low', completed: false },
  ];

  const weeklyProgress = [
    { day: 'Mon', completed: 8, planned: 10 },
    { day: 'Tue', completed: 9, planned: 9 },
    { day: 'Wed', completed: 7, planned: 8 },
    { day: 'Thu', completed: 10, planned: 10 },
    { day: 'Fri', completed: 6, planned: 9 },
    { day: 'Sat', completed: 4, planned: 5 },
    { day: 'Sun', completed: 3, planned: 4 },
  ];

  const goals = [
    { id: 1, title: 'Complete Project Alpha', progress: 85, dueDate: '2024-02-15', category: 'Work' },
    { id: 2, title: 'Read 12 Books', progress: 67, dueDate: '2024-12-31', category: 'Personal' },
    { id: 3, title: 'Learn Spanish', progress: 45, dueDate: '2024-06-30', category: 'Learning' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50 dark:bg-blue-900/20' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20' },
      green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50 dark:bg-green-900/20' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50 dark:bg-orange-900/20' },
    };
    return colors[color] || colors.blue;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah!</h1>
            <p className="text-blue-100">You have 12 tasks scheduled for today. Let's make it a productive day!</p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Current Streak</p>
              <p className="text-2xl font-bold">7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const colors = getColorClasses(metric.color);
          
          return (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${colors.light} rounded-xl`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                {metric.trend !== 'neutral' && (
                  <span className={`flex items-center text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                    {metric.change}
                  </span>
                )}
                {metric.trend === 'neutral' && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded-full">
                    {metric.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{metric.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{metric.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Schedule</h2>
              </div>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                <div className="flex items-center space-x-4">
                  <button className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{task.time}</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{task.duration}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            
            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Task</span>
            </button>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Goals</h2>
              </div>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Manage
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{goal.category}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Due {goal.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Progress</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Planned</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-48 space-x-2">
          {weeklyProgress.map((day, index) => {
            const maxHeight = 10;
            const completedHeight = (day.completed / maxHeight) * 100;
            const plannedHeight = (day.planned / maxHeight) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex justify-center space-x-1 mb-2">
                  <div className="w-1/3 bg-gray-200 dark:bg-gray-800 rounded-t" style={{ height: `${plannedHeight}px` }}>
                    <div 
                      className="w-full bg-gray-300 dark:bg-gray-700 rounded-t absolute bottom-0"
                      style={{ height: `${plannedHeight}px` }}
                    />
                  </div>
                  <div 
                    className="w-1/3 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t"
                    style={{ height: `${completedHeight}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left">
          <Brain className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">AI Planning Assistant</h3>
          <p className="text-sm text-blue-100">Get personalized suggestions</p>
        </button>
        
        <button className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left">
          <Activity className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">Wellness Check</h3>
          <p className="text-sm text-purple-100">Track your well-being</p>
        </button>
        
        <button className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-left">
          <TrendingUp className="w-8 h-8 mb-3" />
          <h3 className="font-semibold mb-1">View Insights</h3>
          <p className="text-sm text-green-100">Analyze your productivity</p>
        </button>
      </div>
    </div>
  );
};

export default ModernDashboard;
