import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Target, Clock } from 'lucide-react';

interface PersonalizedDashboardProps {
  onNavigateToPlanner?: () => void;
  onNavigateToGoals?: () => void;
  onNavigateToPomodoro?: () => void;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ 
  onNavigateToPlanner, 
  onNavigateToGoals, 
  onNavigateToPomodoro 
}) => {
  const { user } = useAuth();

  // Get user's first name for greeting
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 bg-white px-4">
      {/* Duo Bird Video */}
      <div className="relative w-full max-w-4xl mx-auto flex justify-center items-center">
        <video
          className="w-72 h-72 object-contain"
          autoPlay
          loop
          muted
          playsInline
          style={{ 
            WebkitMaskImage: 'radial-gradient(circle at center, black 70%, transparent 100%)',
            maskImage: 'radial-gradient(circle at center, black 70%, transparent 100%)'
          }}
        >
          <source src="/Duo-bird.mp4" type="video/mp4" />
          <source src="/duo-bird.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Welcome Message */}
      <div className="text-center">
        <h1 className="text-4xl font-['Baloo 2'] font-bold mb-4" style={{ color: '#58CC02' }}>
          Welcome to PlanLingo!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 font-body">
          Choose what you'd like to work on today
        </p>
      </div>

      {/* Three Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Daily Planner Button */}
        <button
          onClick={onNavigateToPlanner}
          className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-feather font-bold text-gray-900 dark:text-white mb-2">
              Daily Planner
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-body">
              Create your perfect daily schedule with AI-powered planning
            </p>
          </div>
        </button>

        {/* Goals Button */}
        <button
          onClick={onNavigateToGoals}
          className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-feather font-bold text-gray-900 dark:text-white mb-2">
              Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-body">
              Set and track your personal and professional goals
            </p>
          </div>
        </button>

        {/* Pomodoro Timer Button */}
        <button
          onClick={onNavigateToPomodoro}
          className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-feather font-bold text-gray-900 dark:text-white mb-2">
              Pomodoro Timer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-body">
              Focus with the proven 25-minute work technique
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;