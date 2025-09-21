import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Coffee, 
  Clock, 
  Target,
  TrendingUp,
  Volume2,
  VolumeX,
  SkipForward
} from 'lucide-react'
import { cn } from '../lib/utils'
import { makeUserKey, readUserState, writeUserState, subscribeToUserState } from '../hooks/useUserScopedStorage'

interface PomodoroSession {
  id: string
  type: 'work' | 'shortBreak' | 'longBreak'
  duration: number
  completedAt: Date
}

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundEnabled: boolean
  soundType: string
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakInterval: 4,
  longBreakDuration: 15,
  soundEnabled: true,
  soundType: 'chime',
  autoStartBreaks: false,
  autoStartPomodoros: false
}

export const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS)
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work')
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(settings.longBreakInterval)
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editTimeValue, setEditTimeValue] = useState('')
  const [initialTimeForSession, setInitialTimeForSession] = useState(settings.workDuration * 60)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Use browser timer id (number) to avoid NodeJS.Timeout mismatch in the browser
  const intervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Load settings from localStorage on mount (user-scoped)
  useEffect(() => {
    const savedSettings = readUserState('pomodoro-settings', null as any)
    const savedSessions = readUserState('pomodoro-sessions', null as any)
    
    if (savedSettings) {
      const parsed = savedSettings
      setSettings(parsed)
      const workDuration = parsed.workDuration * 60
      setTimeLeft(workDuration)
      setInitialTimeForSession(workDuration)
    }
    
    if (savedSessions) {
      setCompletedSessions(savedSessions)
    }
    const unsubscribe = subscribeToUserState(({ key, value }) => {
      if (key === makeUserKey('pomodoro-settings')) {
        setSettings(value)
      }
      if (key === makeUserKey('pomodoro-sessions')) {
        setCompletedSessions(value)
      }
    })
    return unsubscribe
  }, [])

  // Save settings to localStorage (user-scoped)
  useEffect(() => {
    writeUserState('pomodoro-settings', settings)
  }, [settings])

  // Save sessions to localStorage (user-scoped)
  useEffect(() => {
    writeUserState('pomodoro-sessions', completedSessions)
  }, [completedSessions])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Start ticking
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => Math.max(prev - 1, 0))
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeLeft])

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Resume context if it's suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume()
        }
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
      }
    }
    return audioContextRef.current
  }

  const soundOptions = {
    chime: {
      name: 'Extended Chime',
      description: 'Long pleasant bell sequence (8 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create a series of chimes over 8 seconds
          const chimes = [
            { freq: 800, time: 0 },
            { freq: 600, time: 0.8 },
            { freq: 800, time: 1.6 },
            { freq: 1000, time: 2.4 },
            { freq: 800, time: 3.2 },
            { freq: 600, time: 4.0 },
            { freq: 800, time: 4.8 },
            { freq: 1000, time: 5.6 },
            { freq: 800, time: 6.4 },
            { freq: 600, time: 7.2 }
          ]
          
          chimes.forEach(({ freq, time }) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            const startTime = audioContext.currentTime + time
            oscillator.frequency.setValueAtTime(freq, startTime)
            
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.7)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + 0.7)
          })
        } catch (error) {
          console.warn('Failed to play extended chime:', error)
        }
      }
    },
    digital: {
      name: 'Digital Alarm',
      description: 'Persistent digital beeping (10 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create repeating digital beeps for 10 seconds
          for (let i = 0; i < 20; i++) {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            const startTime = audioContext.currentTime + (i * 0.5)
            oscillator.type = 'square'
            oscillator.frequency.setValueAtTime(880, startTime)
            
            gainNode.gain.setValueAtTime(0.4, startTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + 0.3)
          }
        } catch (error) {
          console.warn('Failed to play digital alarm:', error)
        }
      }
    },
    melody: {
      name: 'Victory Fanfare',
      description: 'Extended uplifting melody (12 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Extended melody sequence - like a victory fanfare
          const melody = [
            // First phrase
            { freq: 523, time: 0, duration: 0.4 },    // C5
            { freq: 659, time: 0.5, duration: 0.4 },  // E5
            { freq: 784, time: 1.0, duration: 0.4 },  // G5
            { freq: 1047, time: 1.5, duration: 0.8 }, // C6
            
            // Second phrase
            { freq: 784, time: 2.5, duration: 0.4 },  // G5
            { freq: 880, time: 3.0, duration: 0.4 },  // A5
            { freq: 988, time: 3.5, duration: 0.4 },  // B5
            { freq: 1047, time: 4.0, duration: 0.8 }, // C6
            
            // Third phrase - triumph
            { freq: 1047, time: 5.0, duration: 0.3 }, // C6
            { freq: 988, time: 5.4, duration: 0.3 },  // B5
            { freq: 1047, time: 5.8, duration: 0.3 }, // C6
            { freq: 1175, time: 6.2, duration: 0.6 }, // D6
            { freq: 1047, time: 6.9, duration: 1.0 }, // C6
            
            // Final flourish
            { freq: 523, time: 8.0, duration: 0.4 },  // C5
            { freq: 659, time: 8.5, duration: 0.4 },  // E5
            { freq: 784, time: 9.0, duration: 0.4 },  // G5
            { freq: 1047, time: 9.5, duration: 2.0 }  // C6 - long finish
          ]
          
          melody.forEach(({ freq, time, duration }) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            const startTime = audioContext.currentTime + time
            oscillator.frequency.setValueAtTime(freq, startTime)
            
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + duration)
          })
        } catch (error) {
          console.warn('Failed to play victory fanfare:', error)
        }
      }
    },
    birds: {
      name: 'Forest Morning',
      description: 'Extended nature soundscape (15 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create a longer nature soundscape with multiple bird types
          const duration = 15
          const birdCount = 25
          
          for (let i = 0; i < birdCount; i++) {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            const startTime = audioContext.currentTime + (Math.random() * duration * 0.8)
            const baseFreq = 800 + Math.random() * 1000
            const chirpDuration = 0.2 + Math.random() * 0.3
            
            // Different bird call patterns
            const pattern = Math.floor(Math.random() * 3)
            
            if (pattern === 0) {
              // Rising chirp
              oscillator.frequency.setValueAtTime(baseFreq, startTime)
              oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, startTime + chirpDuration)
            } else if (pattern === 1) {
              // Falling chirp
              oscillator.frequency.setValueAtTime(baseFreq * 1.5, startTime)
              oscillator.frequency.exponentialRampToValueAtTime(baseFreq, startTime + chirpDuration)
            } else {
              // Warbling chirp
              oscillator.frequency.setValueAtTime(baseFreq, startTime)
              oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, startTime + chirpDuration * 0.5)
              oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, startTime + chirpDuration)
            }
            
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + chirpDuration)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + chirpDuration)
          }
        } catch (error) {
          console.warn('Failed to play forest morning:', error)
        }
      }
    },
    bell: {
      name: 'Meditation Bells',
      description: 'Multiple deep resonant bells (20 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create a sequence of temple bells with harmonics
          const bellTimes = [0, 4, 8, 12, 16] // Bell strikes every 4 seconds
          const frequencies = [220, 165, 110] // Fundamental + harmonics
          
          bellTimes.forEach((time, index) => {
            frequencies.forEach((freq, freqIndex) => {
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              const startTime = audioContext.currentTime + time
              oscillator.frequency.setValueAtTime(freq, startTime)
              
              // Vary volume based on harmonic (fundamental loudest)
              const baseVolume = freqIndex === 0 ? 0.4 : 0.2 / (freqIndex + 1)
              
              gainNode.gain.setValueAtTime(0, startTime)
              gainNode.gain.linearRampToValueAtTime(baseVolume, startTime + 0.1)
              gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 3.5)
              
              oscillator.start(startTime)
              oscillator.stop(startTime + 3.5)
            })
          })
        } catch (error) {
          console.warn('Failed to play meditation bells:', error)
        }
      }
    },
    urgent: {
      name: 'Emergency Siren',
      description: 'Continuous urgent alarm (15 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create a continuous siren-like urgent alarm
          const duration = 15
          const beepCount = 30 // One beep every 0.5 seconds
          
          for (let i = 0; i < beepCount; i++) {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            const startTime = audioContext.currentTime + (i * 0.5)
            
            // Alternate between two frequencies for siren effect
            const freq = i % 2 === 0 ? 1000 : 800
            oscillator.frequency.setValueAtTime(freq, startTime)
            
            // Gradually increase urgency by making beeps longer
            const beepDuration = 0.3 + (i * 0.01)
            
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + beepDuration)
          }
        } catch (error) {
          console.warn('Failed to play emergency siren:', error)
        }
      }
    },
    notification: {
      name: 'Phone Ring',
      description: 'Classic phone ringing pattern (12 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create classic phone ring pattern - ring for 2 seconds, pause 1 second, repeat
          const ringPattern = [0, 3, 6, 9] // Start times for each ring cycle
          
          ringPattern.forEach(startTime => {
            // Each ring cycle has multiple rapid beeps
            for (let i = 0; i < 6; i++) {
              const oscillator1 = audioContext.createOscillator()
              const oscillator2 = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              
              oscillator1.connect(gainNode)
              oscillator2.connect(gainNode)
              gainNode.connect(audioContext.destination)
              
              const beepStart = audioContext.currentTime + startTime + (i * 0.3)
              
              // Dual-tone ring frequencies
              oscillator1.frequency.setValueAtTime(800, beepStart)
              oscillator2.frequency.setValueAtTime(1000, beepStart)
              
              gainNode.gain.setValueAtTime(0, beepStart)
              gainNode.gain.linearRampToValueAtTime(0.3, beepStart + 0.05)
              gainNode.gain.exponentialRampToValueAtTime(0.01, beepStart + 0.25)
              
              oscillator1.start(beepStart)
              oscillator1.stop(beepStart + 0.25)
              oscillator2.start(beepStart)
              oscillator2.stop(beepStart + 0.25)
            }
          })
        } catch (error) {
          console.warn('Failed to play phone ring:', error)
        }
      }
    },
    soft: {
      name: 'Gentle Waves',
      description: 'Calming ocean-like sounds (18 seconds)',
      play: () => {
        const audioContext = initAudioContext()
        if (!audioContext) return
        
        try {
          // Create a series of gentle wave-like sounds
          const duration = 18
          const waveCount = 12
          
          for (let i = 0; i < waveCount; i++) {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            const filterNode = audioContext.createBiquadFilter()
            
            oscillator.connect(filterNode)
            filterNode.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            const startTime = audioContext.currentTime + (i * 1.5)
            const waveDuration = 2.0 + Math.random() * 1.0
            
            // Create wave-like frequency modulation
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(200, startTime)
            oscillator.frequency.exponentialRampToValueAtTime(100, startTime + waveDuration * 0.3)
            oscillator.frequency.exponentialRampToValueAtTime(150, startTime + waveDuration * 0.7)
            oscillator.frequency.exponentialRampToValueAtTime(80, startTime + waveDuration)
            
            // Low-pass filter for oceanic sound
            filterNode.type = 'lowpass'
            filterNode.frequency.setValueAtTime(400, startTime)
            
            // Gentle volume envelope like waves
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + waveDuration * 0.3)
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + waveDuration * 0.7)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + waveDuration)
            
            oscillator.start(startTime)
            oscillator.stop(startTime + waveDuration)
          }
        } catch (error) {
          console.warn('Failed to play gentle waves:', error)
        }
      }
    }
  }

  const playNotificationSound = () => {
    if (settings.soundEnabled && soundOptions[settings.soundType as keyof typeof soundOptions]) {
      soundOptions[settings.soundType as keyof typeof soundOptions].play()
    }
  }

  const previewSound = (soundType: string) => {
    // Initialize audio context on first user interaction
    initAudioContext()
    
    if (soundOptions[soundType as keyof typeof soundOptions]) {
      soundOptions[soundType as keyof typeof soundOptions].play()
    }
  }

  const handleSessionComplete = () => {
    setIsRunning(false)
    playNotificationSound()
    
    // Add completed session to history
    const actualDuration = Math.round(initialTimeForSession / 60) // Convert to minutes
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      type: currentSession,
      duration: actualDuration,
      completedAt: new Date()
    }
    setCompletedSessions(prev => [...prev, newSession])
    
    // Celebrate session completion with character
    if ((window as any).characterManager) {
      const message = currentSession === 'work'
        ? '🎯 Great work! Time for a well-deserved break'
        : '☕ Break time over! Ready to focus?';
      (window as any).characterManager.celebrateMilestone(message);
    }

    // Determine next session
    if (currentSession === 'work') {
      setPomodorosUntilLongBreak(prev => prev - 1)
      if (pomodorosUntilLongBreak <= 1) {
        setCurrentSession('longBreak')
        const longBreakTime = settings.longBreakDuration * 60
        setTimeLeft(longBreakTime)
        setInitialTimeForSession(longBreakTime)
        setPomodorosUntilLongBreak(settings.longBreakInterval)
      } else {
        setCurrentSession('shortBreak')
        const shortBreakTime = settings.shortBreakDuration * 60
        setTimeLeft(shortBreakTime)
        setInitialTimeForSession(shortBreakTime)
      }
      
      if (settings.autoStartBreaks) {
        setIsRunning(true)
      }
    } else {
      setCurrentSession('work')
      const workTime = settings.workDuration * 60
      setTimeLeft(workTime)
      setInitialTimeForSession(workTime)
      
      if (settings.autoStartPomodoros) {
        setIsRunning(true)
      }
    }
  }

  const getCurrentSessionDuration = () => {
    switch (currentSession) {
      case 'work': return settings.workDuration
      case 'shortBreak': return settings.shortBreakDuration
      case 'longBreak': return settings.longBreakDuration
      default: return settings.workDuration
    }
  }

  const startTimer = () => {
    // Initialize audio context on first user interaction
    initAudioContext()
    
    // Set the initial time when starting if not already set
    if (!isRunning) {
      setInitialTimeForSession(timeLeft)
    }
    setIsRunning(true)
  }
  const pauseTimer = () => setIsRunning(false)
  
  const resetTimer = () => {
    setIsRunning(false)
    const defaultTime = getCurrentSessionDuration() * 60
    setTimeLeft(defaultTime)
    setInitialTimeForSession(defaultTime)
  }

  const skipSession = () => {
    setTimeLeft(0)
  }

  const switchSession = (type: 'work' | 'shortBreak' | 'longBreak') => {
    setCurrentSession(type)
    setIsRunning(false)
    const duration = type === 'work' ? settings.workDuration : 
                    type === 'shortBreak' ? settings.shortBreakDuration : 
                    settings.longBreakDuration
    const durationInSeconds = duration * 60
    setTimeLeft(durationInSeconds)
    setInitialTimeForSession(durationInSeconds)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeClick = () => {
    if (!isRunning) {
      setIsEditingTime(true)
      setEditTimeValue(formatTime(timeLeft))
    }
  }

  const handleTimeEdit = (value: string) => {
    // Allow only valid time format (MM:SS)
    const regex = /^(\d{0,2}):?(\d{0,2})$/
    if (regex.test(value) || value === '') {
      setEditTimeValue(value)
    }
  }

  const handleTimeSubmit = () => {
    const timePattern = /^(\d{1,2}):(\d{2})$/
    const match = editTimeValue.match(timePattern)
    
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      
      // Validate the time (max 99:59, seconds must be 0-59)
      if (minutes >= 0 && minutes <= 99 && seconds >= 0 && seconds <= 59) {
        const totalSeconds = minutes * 60 + seconds
        if (totalSeconds > 0) {
          setTimeLeft(totalSeconds)
          // Update initial time if timer hasn't started yet
          if (!isRunning) {
            setInitialTimeForSession(totalSeconds)
          }
        }
      }
    }
    
    setIsEditingTime(false)
    setEditTimeValue('')
  }

  const handleTimeCancel = () => {
    setIsEditingTime(false)
    setEditTimeValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTimeSubmit()
    } else if (e.key === 'Escape') {
      handleTimeCancel()
    }
  }

  const getProgress = () => {
    // Use the initial time set for this session
    const totalTime = initialTimeForSession || getCurrentSessionDuration() * 60
    const elapsed = totalTime - timeLeft
    return totalTime > 0 ? Math.min((elapsed / totalTime) * 100, 100) : 0
  }

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'from-red-500 to-pink-600'
      case 'shortBreak': return 'from-green-500 to-emerald-600'
      case 'longBreak': return 'from-blue-500 to-indigo-600'
      default: return 'from-red-500 to-pink-600'
    }
  }

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work': return <Target className="w-6 h-6" />
      case 'shortBreak': return <Coffee className="w-6 h-6" />
      case 'longBreak': return <Clock className="w-6 h-6" />
      default: return <Target className="w-6 h-6" />
    }
  }

  const todaysSessions = completedSessions.filter(session => {
    const today = new Date()
    const sessionDate = new Date(session.completedAt)
    return sessionDate.toDateString() === today.toDateString()
  })

  const todaysPomodoros = todaysSessions.filter(s => s.type === 'work').length
  const totalPomodoros = completedSessions.filter(s => s.type === 'work').length

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mt-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stay focused with the Pomodoro Technique
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <motion.div
            layout
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-800"
          >
            {/* Session Type Tabs */}
            <div className="flex space-x-2 mb-8 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
              {(['work', 'shortBreak', 'longBreak'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => switchSession(type)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                    currentSession === type
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {type === 'work' ? 'Work' : type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className="transition-all duration-1000 ease-in-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className={cn("stop-red-500", currentSession === 'work' && "stop-red-500", currentSession === 'shortBreak' && "stop-green-500", currentSession === 'longBreak' && "stop-blue-500")} />
                      <stop offset="100%" className={cn("stop-pink-600", currentSession === 'work' && "stop-pink-600", currentSession === 'shortBreak' && "stop-emerald-600", currentSession === 'longBreak' && "stop-indigo-600")} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br", getSessionColor())}>
                    <div className="text-white">
                      {getSessionIcon()}
                    </div>
                  </div>
                  {isEditingTime ? (
                    <div className="flex flex-col items-center">
                      <input
                        type="text"
                        value={editTimeValue}
                        onChange={(e) => handleTimeEdit(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleTimeSubmit}
                        placeholder="MM:SS"
                        className="text-4xl font-bold text-gray-900 dark:text-white font-mono bg-transparent text-center border-2 border-blue-500 rounded-lg px-2 py-1 w-32 focus:outline-none"
                        autoFocus
                        maxLength={5}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Press Enter to save, Esc to cancel
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "text-5xl font-bold text-gray-900 dark:text-white font-mono cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg px-2 py-1",
                        !isRunning && "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={handleTimeClick}
                      title={!isRunning ? "Click to edit time" : "Timer is running"}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 capitalize">
                    {currentSession === 'shortBreak' ? 'Short Break' : currentSession === 'longBreak' ? 'Long Break' : 'Work Session'}
                    {!isRunning && !isEditingTime && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Click time to edit
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={isRunning ? pauseTimer : startTimer}
                  className={cn(
                    "flex items-center space-x-2 px-8 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 active:scale-95",
                    isRunning 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-gradient-to-r text-white shadow-lg", getSessionColor()
                  )}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>
                
                <button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={skipSession}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <SkipForward className="w-5 h-5" />
                  <span>Skip</span>
                </button>
              </div>
            </div>

            {/* Next Session Info */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {pomodorosUntilLongBreak > 1 ? 
                  `${pomodorosUntilLongBreak - 1} work sessions until long break` :
                  'Next: Long break'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Today's Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pomodoros</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{todaysPomodoros}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Focus Time</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(todaysPomodoros * settings.workDuration / 60 * 10) / 10}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{todaysSessions.length}</span>
              </div>
            </div>
          </div>

          {/* All Time Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Time</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Pomodoros</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalPomodoros}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Focus Time</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(totalPomodoros * settings.workDuration / 60 * 10) / 10}h
                </span>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Settings</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <span className="text-gray-700 dark:text-gray-300">Sound</span>
                <div className="text-gray-600 dark:text-gray-400">
                  {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
              </button>
              
              {settings.soundEnabled && (
                <div className="pl-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Sound:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {soundOptions[settings.soundType as keyof typeof soundOptions]?.name || 'Gentle Chime'}
                    </span>
                    <button
                      onClick={() => previewSound(settings.soundType)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
                      title="Preview sound"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => previewSound(settings.soundType)}
                    className="w-full mt-2 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    Test Sound
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Settings</h3>
              
              <div className="space-y-6">
                {/* Duration Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Long Break Interval
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) || 4 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of work sessions before a long break
                  </p>
                </div>

                {/* Sound Settings */}
                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Sound notifications</span>
                  </label>

                  {settings.soundEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Alarm Sound
                      </label>
                      <div className="space-y-2">
                        {Object.entries(soundOptions).map(([key, sound]) => (
                          <div 
                            key={key}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer",
                              settings.soundType === key
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            )}
                            onClick={() => setSettings(prev => ({ ...prev, soundType: key }))}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="soundType"
                                  value={key}
                                  checked={settings.soundType === key}
                                  onChange={() => setSettings(prev => ({ ...prev, soundType: key }))}
                                  className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{sound.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{sound.description}</p>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                previewSound(key)
                              }}
                              className="ml-3 p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                              title="Preview sound"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto-start Settings */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-start breaks</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartPomodoros: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-start work sessions</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
