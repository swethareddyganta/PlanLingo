import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo login function - bypasses authentication
  const handleDemoLogin = () => {
    setIsLoading(true)
    
    // Simulate brief loading for better UX
    setTimeout(() => {
      setIsLoading(false)
      // Navigate directly to demo route which bypasses authentication
      navigate('/demo')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-12">
      {/* Single Duolingo style top bar */}
      <div className="w-full h-14 mb-10" style={{ backgroundColor: '#58CC02' }}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white">
          <Link to="/" className="font-extrabold tracking-tight">planlingo</Link>
          <Link to="/signup" className="hidden sm:inline-flex items-center px-5 py-2 bg-white text-gray-900 rounded-full font-semibold">SIGN UP</Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left: fun video */}
        <div className="hidden md:flex items-center justify-center">
          <video
            className="w-[260px] h-[260px] lg:w-[360px] lg:h-[360px] object-contain"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/Duo-bird.mp4" type="video/mp4" />
            <source src="/duo-bird.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="max-w-md w-full mx-auto md:mx-0">
          {/* Logo small (optional) */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#58CC02' }}>
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900 dark:text-white">PlanLingo</span>
            </Link>
          </div>

        {/* Login Card - Duolingo themed */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-[#E3FFD1]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-feather text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300 font-body">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-interface text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-body"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-interface text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-body"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-body text-gray-600 dark:text-gray-300">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm font-body text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-full font-feather text-white hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ backgroundColor: '#58CC02' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-body">
                Or continue with
              </span>
            </div>
          </div>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-feather hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center"
          >
            <span className="mr-2">🎭</span>
            Try Demo Account
          </button>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm font-body text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-feather text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign up for free
            </Link>
          </p>

          {/* Creative Attribution */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
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
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
