import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const ShockedDuo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Shocked Duo Image */}
        <div className="mb-8">
          <img 
            src="/shocked_duo.webp" 
            alt="Shocked Duolingo Bird" 
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain mx-auto rounded-3xl shadow-2xl"
          />
        </div>
        
        {/* Message */}
        <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
          <h1 className="text-3xl md:text-4xl font-['Baloo 2'] font-bold text-gray-900 dark:text-white mb-6">
            Why did you click that?
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 font-body">
            Go back to the app right now!
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-feather text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#58CC02' }}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to PlanLingo App
            </Link>
            
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-700 border-2 border-green-600 text-green-600 dark:text-green-400 font-feather text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go to Landing Page
            </Link>
          </div>
        </div>
        
        {/* Fun Footer Message */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Seriously though, there's nothing here but this shocked bird. 🦉
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShockedDuo;