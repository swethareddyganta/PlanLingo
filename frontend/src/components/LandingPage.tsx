import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Brain, Target, TrendingUp, Clock, Sparkles, ArrowRight, Check, Star } from 'lucide-react'

const DuoBird: React.FC<{ size?: number; className?: string }> = ({ size = 48, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={className}
    aria-hidden
  >
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#58CC02" />
        <stop offset="100%" stopColor="#89E219" />
      </linearGradient>
    </defs>
    {/* Removed background circle per request */}
    <ellipse cx="24" cy="28" rx="6" ry="7" fill="#fff" />
    <ellipse cx="40" cy="28" rx="6" ry="7" fill="#fff" />
    <circle cx="24" cy="28" r="3" fill="#0c0c0c" />
    <circle cx="40" cy="28" r="3" fill="#0c0c0c" />
    <path d="M26 40 L32 44 L38 40" fill="#FFAA00" />
    <path d="M18 36 Q32 52 46 36" fill="#58CC02" />
  </svg>
)

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'Effective',
      description: 'Built for proficiency. Clear, optimized schedules to advance your day.'
    },
    {
      icon: Clock,
      title: 'Energizing',
      description: 'Bite‑sized time blocks make it fun to take a learning break.'
    },
    {
      icon: Target,
      title: 'Social',
      description: 'Share plans and celebrate progress with teammates, classmates, or friends.'
    },
    {
      icon: TrendingUp,
      title: 'Measurable',
      description: 'See improvements over time with friendly progress metrics.'
    }
  ]

  const benefits = [
    'Wellness-focused scheduling with automatic break insertion',
    'Energy-based optimization for peak productivity',
    'Student-friendly with grade-appropriate schedules',
    'Work-life balance scoring and recommendations',
    'Customizable day start and end times',
    'Smart defaults and recommendations'
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      content: 'PlanLingo transformed how I plan my day. The AI understands exactly what I need and creates perfect schedules.',
      rating: 5
    },
    {
      name: 'Mike Johnson',
      role: 'High School Student',
      content: 'As a 10th grader, this app perfectly balances my school, homework, and personal time. It\'s been a game-changer!',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Freelance Designer',
      content: 'The wellness breaks and energy optimization features help me maintain peak creativity throughout the day.',
      rating: 5
    }
  ]

  // Disable floating birds per request to remove left green circle
  const birds = useMemo(() => Array.from({ length: 0 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 90 + 5}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${12 + Math.random() * 8}s`,
    size: 36 + Math.floor(Math.random() * 18)
  })), [])

  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(20px) translateX(0); opacity: .0; }
          10% { opacity: .85; }
          50% { transform: translateY(-30vh) translateX(10px); }
          100% { transform: translateY(-60vh) translateX(-10px); opacity: 0; }
        }
        .duo-float { position: absolute; top: 70vh; pointer-events: none; animation-name: floatUp; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @keyframes runRight { 0% { transform: translateX(0); } 50% { transform: translateX(8px); } 100% { transform: translateX(0); } }
        .duo-run { animation: runRight 1s ease-in-out infinite; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      {/* Floating Duolingo birds */}
      {birds.map(b => (
        <DuoBird
          key={b.id}
          size={b.size}
          className="duo-float"
          style={{ left: b.left as any, animationDelay: b.delay as any, animationDuration: b.duration as any }}
        />
      ))}

      {/* Top green bar */}
      <div className="w-full h-14" style={{ backgroundColor: '#58CC02' }}>
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white">
            <div className="font-extrabold tracking-tight">planlingo for business</div>
          <Link to="/signup" className="hidden sm:inline-flex items-center px-5 py-2 bg-white text-gray-900 rounded-full font-semibold">
            GET STARTED
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-6" style={{ background: '#CFF56B' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#58CC02' }} />
              <span className="text-sm font-medium" style={{ color: '#58CC02' }}>
                Learn fast. Plan smarter.
              </span>
            </div>
            
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-feather text-green-600 dark:text-green-400 mb-6 font-bold leading-tight">
                "Duolingo taught you to speak languages. PlanLingo teaches you to speak productivity"
              </h1>
              <p className="text-xl font-body text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                A playful, bright planning experience inspired by Duolingo. Plan your day with ease and keep momentum with delightful visuals - created with love and care.
              </p>
            </div>
            <div className="mt-2 mb-4 flex justify-center">
              <div className="relative">
                <a 
                  href="https://linkedin.com/in/swetha-reddy-ganta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img 
                    src="/duo-bird-hug.png" 
                    alt="Swetha with Duolingo mascot - Click to visit LinkedIn profile"
                    className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] object-cover rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-105 cursor-pointer"
                  />
                </a>
              </div>
            </div>
            
            {/* Duolingo-style text */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-6 py-3 rounded-full" style={{ backgroundColor: '#CFF56B' }}>
                <span className="text-lg font-feather font-bold" style={{ color: '#58CC02' }}>
                  Yep! That's me with the Duo Buddy!!
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 rounded-full font-feather text-lg text-white shadow-sm transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: '#58CC02' }}
              >
                LET'S GOOOO
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center px-8 py-4 rounded-full font-feather text-lg bg-white border-2 shadow-sm transition-all duration-200 hover:shadow-lg"
                style={{ borderColor: '#58CC02', color: '#58CC02' }}
              >
                🎭 Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-feather text-gray-900 dark:text-white mb-6 leading-tight">
              Transform Ideas Into
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Perfect Schedules
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-body">
              Simply describe your day in natural language, and watch AI create a personalized, balanced schedule in seconds.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Input Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">✨</span>
                  </div>
                  <div>
                    <h3 className="font-feather font-bold text-gray-900 dark:text-white">Natural Language Input</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Just describe your ideal day</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 relative">
                  <div className="absolute -top-2 left-4 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300">
                    You type this...
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 italic leading-relaxed mt-2">
                    "I want to workout for 30 minutes in the morning, work for 8 hours with breaks, 
                    meditate for 15 minutes, and have 2 hours of me time in the evening. Lunch around 1pm."
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm dark:bg-gray-800/60 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm dark:bg-gray-800/60 rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</div>
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="lg:col-span-1 flex justify-center items-center">
              <div className="hidden lg:block">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Magic</span>
                </div>
              </div>
              <div className="lg:hidden w-full flex justify-center py-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg rotate-90">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {/* Output Side */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📅</span>
                  </div>
                  <div>
                    <h3 className="font-feather font-bold text-gray-900 dark:text-white">Perfect Schedule</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Optimized & balanced automatically</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { time: '07:00-07:30', task: 'Morning Workout', type: 'wellness', progress: 100 },
                    { time: '07:45-08:00', task: 'Meditation', type: 'wellness', progress: 100 },
                    { time: '09:00-12:00', task: 'Deep Work Block', type: 'work', progress: 75 },
                    { time: '12:00-13:00', task: 'Lunch Break', type: 'break', progress: 0 },
                    { time: '13:00-17:00', task: 'Afternoon Work', type: 'work', progress: 0 },
                    { time: '19:00-21:00', task: 'Personal Time', type: 'personal', progress: 0 }
                  ].map((item, i) => {
                    const delay = i * 200;
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay / 1000, duration: 0.4 }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                          item.type === 'wellness' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-300' :
                          item.type === 'work' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300' :
                          item.type === 'break' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300' :
                          'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300'
                        }`}
                      >
                        {/* Progress Bar */}
                        {item.progress > 0 && (
                          <div className="absolute top-0 left-0 h-1 bg-green-500 rounded-t-xl transition-all duration-1000" 
                               style={{ width: `${item.progress}%` }} />
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 dark:text-white">{item.task}</span>
                            {item.progress > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Done</span>
                            )}
                          </div>
                          <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                            {item.time}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium">AI optimized for productivity & well-being</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Added: 5min breaks every hour, 10min walk after lunch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-feather text-gray-900 dark:text-white mb-4">
              Powerful Features for Better Days
            </h2>
            <p className="text-xl font-body text-gray-600 dark:text-gray-300">
              Everything you need to optimize your daily routine
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#58CC02' }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-feather text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-body">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-feather text-gray-900 dark:text-white mb-6">
                Why PlanLingo?
              </h2>
              <p className="text-xl font-body text-gray-600 dark:text-gray-300 mb-8">
                We believe in creating schedules that not only boost productivity but also prioritize your well-being.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: '#58CC02' }} />
                    <span className="text-gray-700 dark:text-gray-200 font-body">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#58CC02' }}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">PlanLingo</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</Link>
              <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</Link>
              <Link to="/support" className="hover:text-gray-900 dark:hover:text-white">Support</Link>
              <Link to="/contact" className="hover:text-gray-900 dark:hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 PlanLingo. All rights reserved.
            <br />
            <span className="mt-2 block">
              A product from{' '}
              <a 
                href="https://linkedin.com/in/swetha-reddy-ganta" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold hover:underline transition-colors"
                style={{ color: '#58CC02' }}
              >
                Swetha's
              </a>{' '}
              creative mind
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
