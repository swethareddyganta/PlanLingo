import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface DuolingoButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const DuolingoButton: React.FC<DuolingoButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const variantClasses = {
    primary: 'bg-duolingo-green hover:bg-green-600 text-white shadow-lg shadow-green-500/25',
    secondary: 'bg-duolingo-purple hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25',
    success: 'bg-duolingo-green hover:bg-green-600 text-white shadow-lg shadow-green-500/25',
    warning: 'bg-duolingo-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25',
    error: 'bg-duolingo-red hover:bg-red-600 text-white shadow-lg shadow-red-500/25',
    info: 'bg-duolingo-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm h-10',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14'
  }

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  const focusRingClasses = {
    primary: 'focus:ring-green-500',
    secondary: 'focus:ring-purple-500',
    success: 'focus:ring-green-500',
    warning: 'focus:ring-orange-500',
    error: 'focus:ring-red-500',
    info: 'focus:ring-blue-500',
  }

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${focusRingClasses[variant]}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { 
        scale: 1.05,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.div>
      )}
      
      <motion.span
        className={loading ? 'opacity-0' : 'opacity-100'}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}

export default DuolingoButton
