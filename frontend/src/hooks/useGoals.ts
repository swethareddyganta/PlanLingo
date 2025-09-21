import { useState, useEffect, useMemo } from 'react'

interface Goal {
  id: string
  title: string
  iconType?: string  // Store icon type instead of React component
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

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([])

  // Load goals from localStorage on hook initialization
  useEffect(() => {
    try {
      // Get user ID from auth context
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user?.id || 'demo'
      const storageKey = `daily-flow-goals-${userId}`
      
      const savedGoals = localStorage.getItem(storageKey)
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals)
        setGoals(parsedGoals)
        console.log('Goals loaded from localStorage:', parsedGoals)
      } else {
        console.log('No goals found in localStorage, starting with empty array')
      }
    } catch (error) {
      console.error('Error loading goals from localStorage:', error)
      setGoals([])
    }
  }, [])

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    try {
      // Get user ID from auth context
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user?.id || 'demo'
      const storageKey = `daily-flow-goals-${userId}`
      
      // Save goals with user-specific key
      localStorage.setItem(storageKey, JSON.stringify(goals))
      console.log('Goals saved to localStorage:', goals)
      
      // Broadcast goal update event for other components
      const event = new CustomEvent('goals-updated', { detail: { goals, userId } })
      window.dispatchEvent(event)
      
      // Celebrate when goals are updated (but not on initial load)
      if (goals.length > 0 && (window as any).characterManager) {
        const completed = goals.filter(g => g.completed).length
        const total = goals.length
        const percentage = Math.round((completed / total) * 100)
        
        if (percentage > 0) {
          (window as any).characterManager.celebrateMilestone(`🎯 Progress update: ${percentage}% goals completed!`)
        }
      }
    } catch (error) {
      console.error('Error saving goals to localStorage:', error)
    }
  }, [goals])

  // Calculate goal statistics with useMemo for proper reactivity
  const completedGoals = useMemo(() => {
    const completed = goals.filter(g => g.completed).length
    console.log('useGoals - completedGoals calculated:', completed, 'from goals:', goals)
    return completed
  }, [goals])
  
  const totalGoals = useMemo(() => {
    const total = goals.length
    console.log('useGoals - totalGoals calculated:', total)
    return total
  }, [goals])
  
  const completionPercentage = useMemo(() => {
    const percentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
    console.log('useGoals - completionPercentage calculated:', percentage, 'from', completedGoals, '/', totalGoals)
    return percentage
  }, [completedGoals, totalGoals])
  
  const averageStreak = useMemo(() => 
    Math.round(goals.reduce((sum, g) => sum + g.streak, 0) / goals.length || 0), 
    [goals]
  )
  const wellnessScore = useMemo(() => 
    Math.round(goals.reduce((sum, g) => sum + (g.current / g.target * 100), 0) / goals.length || 0), 
    [goals]
  )

  return {
    goals,
    setGoals,
    completedGoals,
    totalGoals,
    completionPercentage,
    averageStreak,
    wellnessScore
  }
}
