import React, { useState } from 'react'
import { cn } from '../lib/utils'
import { API_ENDPOINTS } from '../config/api'

interface Task {
  id: string
  title: string
  duration: number
  startTime: string
  endTime: string
  type: 'work' | 'break' | 'personal' | 'wellness' | 'learning'
}

export const PlannerInterface: React.FC = () => {
  const [intentInput, setIntentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<Task[]>([])
  const [parsedIntent, setParsedIntent] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{ title: string; startTime: string; endTime: string; duration?: number; type?: Task['type'] } | null>(null)

  const handleParseIntent = async () => {
    if (!intentInput.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.INTENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: intentInput })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.parsed) {
        setParsedIntent(result.parsed)
        // Auto-generate plan after parsing with the actual parsed data
        setTimeout(() => handleGeneratePlanWithIntent(result.parsed), 1000)
      } else {
        throw new Error('No parsed data received from API')
      }
    } catch (error) {
      console.error('Failed to parse intent:', error)
      // Show error to user instead of fallback
      alert(`Failed to parse your intent: ${error.message}. Please check if the backend is running.`)
    }
    setIsLoading(false)
  }

  const handleGeneratePlanWithIntent = async (intentData: any) => {
    if (!intentData) return
    
    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.PLANS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentData })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Plan Generation Response:', result)
      
      if (result.blocks && Array.isArray(result.blocks)) {
        // Normalize backend keys (snake_case) to frontend expectations (camelCase)
        const normalized = result.blocks.map((b: any) => ({
          ...b,
          startTime: b.startTime ?? b.start_time ?? '',
          endTime: b.endTime ?? b.end_time ?? '',
          duration: typeof b.duration === 'string' ? parseInt(b.duration, 10) : b.duration,
        }))
        setPlan(normalized)
      } else {
        throw new Error('No plan blocks received from API')
      }
    } catch (error) {
      console.error('Failed to generate plan:', error)
      // Show error to user instead of fallback
      alert(`Failed to generate plan: ${error.message}. Please check if the backend is running.`)
    }
    setIsLoading(false)
  }

  const handleGeneratePlan = async () => {
    handleGeneratePlanWithIntent(parsedIntent)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const parseTimeToMinutes = (t: string) => {
    // expects HH:MM (24h). Fallback: empty -> 0
    if (!t || typeof t !== 'string') return 0
    const [h, m] = t.split(':').map((n) => parseInt(n, 10))
    if (Number.isNaN(h) || Number.isNaN(m)) return 0
    return h * 60 + m
  }

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const recalcDuration = (startTime: string, endTime: string) => {
    const start = parseTimeToMinutes(startTime)
    const end = parseTimeToMinutes(endTime)
    return Math.max(0, end - start)
  }

  const downloadIcs = () => {
    if (plan.length === 0) return
    const today = new Date()
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    const toUtc = (time: string) => {
      const [h, m] = time.split(':').map((n) => parseInt(n, 10))
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0)
      // format as YYYYMMDDTHHMMSSZ
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
    }
    const lines: string[] = []
    lines.push('BEGIN:VCALENDAR')
    lines.push('VERSION:2.0')
    lines.push('PRODID:-//Daily Flow//Planner//EN')
    plan.forEach((t, i) => {
      const uid = `${dateStr}-${i}@dailyflow`
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${uid}`)
      lines.push(`DTSTAMP:${toUtc(t.startTime)}`)
      lines.push(`DTSTART:${toUtc(t.startTime)}`)
      lines.push(`DTEND:${toUtc(t.endTime)}`)
      lines.push(`SUMMARY:${t.title.replace(/\n/g, ' ')}`)
      lines.push(`DESCRIPTION:${(t.type || 'Task')}`)
      lines.push('END:VEVENT')
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'daily-flow.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const startEditing = (task: Task) => {
    setEditingId(task.id)
    setEditDraft({ title: task.title, startTime: task.startTime, endTime: task.endTime, duration: task.duration, type: task.type })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditDraft(null)
  }

  const saveEditing = (taskId: string) => {
    if (!editDraft) return
    // If duration field was directly edited, prefer it and recompute endTime; otherwise derive from times
    let newDuration = editDraft.duration ?? recalcDuration(editDraft.startTime, editDraft.endTime)
    let startTime = editDraft.startTime
    let endTime = editDraft.endTime
    if (editDraft.duration && parseTimeToMinutes(startTime) >= 0) {
      endTime = minutesToTime(parseTimeToMinutes(startTime) + editDraft.duration)
    } else {
      newDuration = recalcDuration(startTime, endTime)
    }
    if (newDuration <= 0) {
      alert('End time must be after start time (format HH:MM).')
      return
    }
    setPlan((prev) => prev.map((t) => (t.id === taskId ? { ...t, title: editDraft.title, startTime, endTime, duration: newDuration, type: (editDraft.type as Task['type']) || t.type } : t)))
    cancelEditing()
  }

  // Drag & drop reordering (HTML5 API)
  const [dragId, setDragId] = useState<string | null>(null)

  const onDragStart = (id: string) => setDragId(id)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const recomputeSequentialTimes = (arr: Task[]) => {
    if (arr.length === 0) return arr
    const next = [...arr]
    // Keep the first block's startTime; compute its end by duration
    let prevEnd = minutesToTime(parseTimeToMinutes(next[0].startTime) + next[0].duration)
    next[0] = { ...next[0], endTime: prevEnd }
    for (let i = 1; i < next.length; i += 1) {
      const start = prevEnd
      const end = minutesToTime(parseTimeToMinutes(start) + next[i].duration)
      next[i] = { ...next[i], startTime: start, endTime: end }
      prevEnd = end
    }
    return next
  }

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const current = [...plan]
    const fromIndex = current.findIndex((t) => t.id === dragId)
    const toIndex = current.findIndex((t) => t.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)
    const updated = recomputeSequentialTimes(current)
    setPlan(updated)
    setDragId(null)
  }

  const deleteTask = (taskId: string) => {
    setPlan((prev) => prev.filter((t) => t.id !== taskId))
  }

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'wellness': return 'bg-green-100 text-green-800 border-green-200'
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'break': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Intent Input</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your ideal day in natural language:
            </label>
            <textarea
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="e.g., 'I want to workout for 30 minutes in the morning, work for 8 hours with breaks, meditate for 15 minutes, and have 2 hours of me time in the evening. Lunch around 1pm.'"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleParseIntent}
              disabled={isLoading || !intentInput.trim()}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                isLoading || !intentInput.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isLoading ? "Processing..." : "Parse & Generate Plan"}
            </button>
            {plan.length > 0 && (
              <button
                onClick={() => {
                  setPlan([])
                  setParsedIntent(null)
                  setIntentInput('')
                }}
                className="px-4 py-2 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
            {plan.length > 0 && (
              <button
                onClick={downloadIcs}
                className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Export to Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parsed Intent panel removed per request */}

      {plan.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Daily Plan</h3>
          <div className="space-y-3">
            {plan.map((task) => (
              <div
                key={task.id}
                className={cn("p-4 rounded-lg border", getTaskColor(task.type))}
                draggable
                onDragStart={() => onDragStart(task.id)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(task.id)}
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1">
                    {editingId === task.id ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          value={editDraft?.title || ''}
                          onChange={(e) => setEditDraft((d) => ({ ...(d as any), title: e.target.value }))}
                          className="w-full sm:w-1/2 px-3 py-2 border rounded-md"
                          placeholder="Task title"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            value={editDraft?.startTime || ''}
                            onChange={(e) => setEditDraft((d) => ({ ...(d as any), startTime: e.target.value }))}
                            className="w-28 px-3 py-2 border rounded-md"
                            placeholder="HH:MM"
                          />
                          <span className="opacity-70">-</span>
                          <input
                            value={editDraft?.endTime || ''}
                            onChange={(e) => setEditDraft((d) => ({ ...(d as any), endTime: e.target.value }))}
                            className="w-28 px-3 py-2 border rounded-md"
                            placeholder="HH:MM"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={editDraft?.duration ?? task.duration}
                            onChange={(e) => setEditDraft((d) => ({ ...(d as any), duration: parseInt(e.target.value || '0', 10) }))}
                            className="w-24 px-3 py-2 border rounded-md"
                            placeholder="mins"
                          />
                          <select
                            value={editDraft?.type || task.type}
                            onChange={(e) => setEditDraft((d) => ({ ...(d as any), type: e.target.value as Task['type'] }))}
                            className="px-3 py-2 border rounded-md"
                          >
                            <option value="work">Work</option>
                            <option value="break">Break</option>
                            <option value="personal">Personal</option>
                            <option value="wellness">Wellness</option>
                            <option value="learning">Learning</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium cursor-text" onDoubleClick={() => startEditing(task)}>{task.title}</h4>
                        <p className="text-sm opacity-75">Duration: {formatDuration(task.duration)}</p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    {editingId === task.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => saveEditing(task.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md">Save</button>
                        <button onClick={cancelEditing} className="px-3 py-1 border rounded-md">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium cursor-text" onDoubleClick={() => startEditing(task)}>{task.startTime} - {task.endTime}</p>
                        <p className="text-sm opacity-75 capitalize">{task.type}</p>
                        <button onClick={() => deleteTask(task.id)} className="mt-1 text-xs text-red-600 hover:underline">Remove</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs opacity-60">Drag to reorder</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Plan Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Tasks: </span>
                <span>{plan.length}</span>
              </div>
              <div>
                <span className="font-medium">Work Time: </span>
                <span>{formatDuration(plan.filter(t => t.type === 'work').reduce((sum, t) => sum + t.duration, 0))}</span>
              </div>
              <div>
                <span className="font-medium">Wellness Time: </span>
                <span>{formatDuration(plan.filter(t => t.type === 'wellness').reduce((sum, t) => sum + t.duration, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
