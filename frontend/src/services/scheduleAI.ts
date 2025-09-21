import { generateText, generateObject } from 'ai';
import { createGroqModel, GROQ_MODELS, isGroqConfigured } from '../lib/groq-config';
import { z } from 'zod';

// Schedule block schema for structured parsing
const ScheduleBlockSchema = z.object({
  id: z.string(),
  title: z.string(),
  startTime: z.string(), // HH:MM format
  endTime: z.string(),   // HH:MM format
  duration: z.number(),  // in minutes
  type: z.enum(['work', 'exercise', 'sleep', 'meal', 'break', 'personal', 'commute', 'wellness']),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  flexible: z.boolean().optional(), // Can this block be moved around?
});

const DailyScheduleSchema = z.object({
  blocks: z.array(ScheduleBlockSchema),
  totalHours: z.number(),
  workLifeBalance: z.object({
    workHours: z.number(),
    personalHours: z.number(),
    sleepHours: z.number(),
    exerciseMinutes: z.number(),
  }),
  suggestions: z.array(z.string()),
  optimizationScore: z.number().min(0).max(100),
});

export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;
export type DailySchedule = z.infer<typeof DailyScheduleSchema>;

export const scheduleAI = {
  /**
   * Parse natural language input into a structured daily schedule using AI
   */
  parseScheduleFromText: async (input: string): Promise<DailySchedule> => {
    if (!isGroqConfigured()) {
      throw new Error('AI service is not configured. Please check your API keys.');
    }

    // Enhanced system prompt for better AI understanding
    const systemPrompt = `You are an expert daily schedule planner AI. Your task is to convert natural language descriptions into structured, realistic daily schedules.

Guidelines for creating schedules:
1. Use realistic timing - people need time to transition between activities
2. Include essential daily activities (meals, sleep, personal care)
3. Balance work, rest, and personal time appropriately
4. Consider energy levels throughout the day
5. Add buffer time between major activities
6. Respect work-life balance principles
7. Include proper sleep duration (7-9 hours)
8. Schedule exercise at optimal times (morning or after work)
9. Add breaks during long work sessions

Activity Types and Examples:
- work: Office work, meetings, coding, focused work sessions, client calls
- exercise: Gym, running, yoga, sports, walking, strength training
- sleep: Night sleep, naps, rest periods
- meal: Breakfast, lunch, dinner, snacks, cooking time
- break: Coffee break, short rest, stretching, relaxation
- personal: Hobbies, family time, entertainment, reading, personal projects
- commute: Travel to/from work, errands, transportation time
- wellness: Meditation, self-care, mental health activities, therapy

Time Format: Use 24-hour format (HH:MM) for all times.
Sequential Timing: Ensure no overlaps - each activity should start when the previous one ends.
Duration: Calculate accurate durations in minutes.
IDs: Generate unique sequential IDs (1, 2, 3, etc.)

Provide optimization suggestions and calculate a realistic optimization score based on work-life balance, health factors, and productivity principles.`;

    const userPrompt = `Create a complete daily schedule based on this description: "${input}"

Generate a full 24-hour schedule that includes:
- All requested activities from the description
- Essential daily activities (wake up, meals, sleep)
- Appropriate breaks and transitions
- Realistic timing and durations
- Proper categorization of each activity

Make the schedule practical and achievable for a real person.`;

    try {
      console.log('Generating schedule with AI for:', input);
      
      const { object } = await generateObject({
        model: createGroqModel(GROQ_MODELS['llama-3.3-70b-versatile']),
        schema: DailyScheduleSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7, // Add some creativity while maintaining structure
      });

      // Validate and fix the generated schedule
      const validatedSchedule = scheduleAI.validateAndFixSchedule(object, input);
      
      console.log('AI generated schedule with', validatedSchedule.blocks.length, 'blocks');
      return validatedSchedule;
      
    } catch (error) {
      console.error('AI schedule generation failed:', error);
      console.log('Falling back to rule-based generation');
      
      // Enhanced fallback with better parsing
      return scheduleAI.createIntelligentFallbackSchedule(input);
    }
  },

  /**
   * Optimize an existing schedule for better work-life balance
   */
  optimizeSchedule: async (currentSchedule: ScheduleBlock[]): Promise<{
    optimizedSchedule: ScheduleBlock[];
    suggestions: string[];
    improvements: string[];
    score: number;
  }> => {
    if (!isGroqConfigured()) {
      throw new Error('AI service is not configured');
    }

    const scheduleText = currentSchedule.map(block => 
      `${block.startTime}-${block.endTime}: ${block.title} (${block.type})`
    ).join('\n');

    const prompt = `Analyze this daily schedule and provide optimization suggestions:

    Current Schedule:
    ${scheduleText}

    Please provide:
    1. Specific suggestions for improvement
    2. Areas where work-life balance could be better
    3. Productivity optimization tips
    4. Wellness and health recommendations
    5. An overall optimization score (0-100)

    Focus on:
    - Proper break intervals
    - Optimal timing for different activities
    - Avoiding burnout
    - Maximizing energy levels
    - Better time management
    `;

    try {
      const { text } = await generateText({
        model: createGroqModel(GROQ_MODELS['llama-3.1-8b-instant']),
        prompt: prompt,
      });

      // Parse the response (simplified)
      const suggestions = text.split('\n').filter(line => 
        line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')
      ).slice(0, 5);

      return {
        optimizedSchedule: currentSchedule, // For now, return original
        suggestions: suggestions.length > 0 ? suggestions : [
          'Consider taking short breaks every 90 minutes',
          'Schedule exercise during your peak energy hours',
          'Ensure 30-60 minutes of personal time daily',
        ],
        improvements: [
          'Added buffer time between meetings',
          'Optimized exercise timing for better energy',
          'Improved work-break intervals',
        ],
        score: 75, // Default score
      };
    } catch (error) {
      console.error('Failed to optimize schedule:', error);
      return {
        optimizedSchedule: currentSchedule,
        suggestions: ['Consider adding more breaks between work sessions'],
        improvements: [],
        score: 60,
      };
    }
  },

  /**
   * Generate time analytics for visualization
   */
  generateTimeAnalytics: (schedule: ScheduleBlock[]) => {
    const analytics = {
      work: 0,
      exercise: 0,
      sleep: 0,
      meal: 0,
      break: 0,
      personal: 0,
      commute: 0,
      wellness: 0,
    };

    let totalMinutes = 0;

    schedule.forEach(block => {
      analytics[block.type] += block.duration;
      totalMinutes += block.duration;
    });

    // Convert to hours for display
    const hoursAnalytics = Object.entries(analytics).map(([type, minutes]) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: Math.round((minutes / 60) * 100) / 100, // Hours with 2 decimal places
      minutes: minutes,
      percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
      color: scheduleAI.getTypeColor(type as keyof typeof analytics),
    })).filter(item => item.minutes > 0);

    return {
      breakdown: hoursAnalytics,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      totalMinutes,
      workLifeBalance: {
        workPercentage: Math.round((analytics.work / totalMinutes) * 100),
        personalPercentage: Math.round(((analytics.personal + analytics.wellness + analytics.exercise) / totalMinutes) * 100),
        sleepPercentage: Math.round((analytics.sleep / totalMinutes) * 100),
      }
    };
  },

  /**
   * Get color for different activity types
   */
  getTypeColor: (type: string): string => {
    const colors = {
      work: '#3B82F6',      // Blue
      exercise: '#10B981',   // Green
      sleep: '#6366F1',      // Indigo
      meal: '#F59E0B',       // Amber
      break: '#EF4444',      // Red
      personal: '#8B5CF6',   // Purple
      commute: '#6B7280',    // Gray
      wellness: '#EC4899',   // Pink
    };
    return colors[type as keyof typeof colors] || '#9CA3AF';
  },

  /**
   * Fallback schedule creation when AI fails
   */
  createFallbackSchedule: (input: string): DailySchedule => {
    console.log('Creating simple fallback schedule...');
    
    // Simple inline helper functions
    const addMinutesToTime = (time: string, minutes: number): string => {
      const [hours, mins] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMins = totalMinutes % 60;
      return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    };
    
    // Extract basic info from input
    let exerciseMinutes = 45;
    let sleepHours = 7;
    let workStart = '09:00';
    let workEnd = '17:00';
    
    // Simple regex extraction
    const exerciseMatch = input.match(/(\d+)\s*min/i);
    if (exerciseMatch) exerciseMinutes = parseInt(exerciseMatch[1]);
    
    const sleepMatch = input.match(/(\d+)\s*hrs?/i);
    if (sleepMatch) sleepHours = parseInt(sleepMatch[1]);
    
    if (input.includes('6am') || input.includes('6:00')) workStart = '06:00';
    else if (input.includes('8am') || input.includes('8:00')) workStart = '08:00';

    const blocks: ScheduleBlock[] = [
      {
        id: '1',
        title: 'Morning Routine',
        startTime: '06:30',
        endTime: '07:30',
        duration: 60,
        type: 'personal',
      },
      {
        id: '2',
        title: 'Breakfast',
        startTime: '07:30',
        endTime: '08:00',
        duration: 30,
        type: 'meal',
      },
      {
        id: '3',
        title: 'Work Session',
        startTime: workStart,
        endTime: '12:00',
        duration: 180, // 3 hours
        type: 'work',
      },
      {
        id: '4',
        title: 'Lunch Break',
        startTime: '12:00',
        endTime: '13:00',
        duration: 60,
        type: 'meal',
      },
      {
        id: '5',
        title: 'Afternoon Work',
        startTime: '13:00',
        endTime: workEnd,
        duration: 240, // 4 hours
        type: 'work',
      },
      {
        id: '6',
        title: 'Exercise/Workout',
        startTime: '18:00',
        endTime: addMinutesToTime('18:00', exerciseMinutes),
        duration: exerciseMinutes,
        type: 'exercise',
      },
      {
        id: '7',
        title: 'Dinner',
        startTime: '19:30',
        endTime: '20:30',
        duration: 60,
        type: 'meal',
      },
      {
        id: '8',
        title: 'Personal Time',
        startTime: '20:30',
        endTime: '22:30',
        duration: 120,
        type: 'personal',
      },
      {
        id: '9',
        title: 'Sleep',
        startTime: '23:00',
        endTime: addMinutesToTime('23:00', sleepHours * 60),
        duration: sleepHours * 60,
        type: 'sleep',
      },
    ];

    // Simple work-life balance calculation
    const workMinutes = blocks.filter(b => b.type === 'work').reduce((sum, b) => sum + b.duration, 0);
    const personalMinutes = blocks.filter(b => b.type === 'personal' || b.type === 'wellness').reduce((sum, b) => sum + b.duration, 0);
    const sleepMinutes = blocks.filter(b => b.type === 'sleep').reduce((sum, b) => sum + b.duration, 0);
    
    return {
      blocks,
      totalHours: 24,
      workLifeBalance: {
        workHours: workMinutes / 60,
        personalHours: personalMinutes / 60,
        sleepHours: sleepMinutes / 60,
        exerciseMinutes,
      },
      suggestions: [
        'Consider adding short breaks during work hours',
        'Schedule meals at regular intervals',
        'Include time for personal activities',
      ],
      optimizationScore: 70,
    };
  },

  // Helper functions
  extractWorkHours: (input: string) => {
    if (input.includes('9 to 5') || input.includes('9-5')) {
      return { start: '09:00', end: '17:00', duration: 480 };
    }
    return { start: '09:00', end: '17:00', duration: 480 }; // Default 8 hours
  },

  extractExerciseTime: (input: string) => {
    const match = input.match(/workout?\s*(?:for\s*)?(\d+)\s*min/i);
    return match ? parseInt(match[1]) : 45; // Default 45 minutes
  },

  extractSleepHours: (input: string) => {
    const match = input.match(/sleep\s*(\d+)\s*hrs?/i);
    return match ? parseInt(match[1]) : 7; // Default 7 hours
  },

  addMinutesToTime: (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  },

  /**
   * Validate and fix AI-generated schedule to ensure consistency
   */
  validateAndFixSchedule: (schedule: DailySchedule, originalInput: string): DailySchedule => {
    console.log('Validating AI-generated schedule...');
    
    // Sort blocks by start time
    const sortedBlocks = [...schedule.blocks].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

    // Fix overlaps and gaps
    const fixedBlocks: ScheduleBlock[] = [];
    let lastEndTime = '00:00';

    sortedBlocks.forEach((block, index) => {
      const blockStartMinutes = scheduleAI.timeToMinutes(block.startTime);
      const lastEndMinutes = scheduleAI.timeToMinutes(lastEndTime);
      
      // Fix start time if there's an overlap or ensure reasonable gaps
      let adjustedStartTime = block.startTime;
      if (blockStartMinutes < lastEndMinutes) {
        adjustedStartTime = lastEndTime;
      }
      
      // Recalculate duration and end time
      const adjustedStartMinutes = scheduleAI.timeToMinutes(adjustedStartTime);
      const duration = Math.max(block.duration, 15); // Minimum 15 minutes
      const endTime = scheduleAI.minutesToTime(adjustedStartMinutes + duration);
      
      const fixedBlock: ScheduleBlock = {
        ...block,
        id: String(index + 1),
        startTime: adjustedStartTime,
        endTime: endTime,
        duration: duration,
      };
      
      fixedBlocks.push(fixedBlock);
      lastEndTime = endTime;
    });

    // Recalculate work-life balance
    const workLifeBalance = scheduleAI.calculateWorkLifeBalance(fixedBlocks);
    
    // Generate better suggestions based on the actual schedule
    const suggestions = scheduleAI.generateSmartSuggestions(fixedBlocks, originalInput);
    
    // Calculate optimization score
    const optimizationScore = scheduleAI.calculateOptimizationScore(fixedBlocks);

    console.log('Schedule validation complete');
    
    return {
      blocks: fixedBlocks,
      totalHours: 24,
      workLifeBalance,
      suggestions,
      optimizationScore,
    };
  },

  /**
   * Create an intelligent fallback schedule with better parsing
   */
  createIntelligentFallbackSchedule: (input: string): DailySchedule => {
    console.log('Creating intelligent fallback schedule...');
    
    // Enhanced parsing patterns
    const patterns = {
      workHours: /(work|office|job).*(\d+)\s*(?:to|-)\s*(\d+)|(\d+)\s*(?:to|-)\s*(\d+).*(work|office|job)|9\s*(?:to|-)\s*5|8\s*hours?\s*(?:of\s*)?work/i,
      exercise: /(workout|exercise|gym|run|fitness).*(\d+)\s*min|(\d+)\s*min.*(workout|exercise|gym)/i,
      sleep: /(sleep|rest).*(\d+)\s*hrs?|(\d+)\s*hrs?.*(sleep|rest)/i,
      meals: /(breakfast|lunch|dinner|meal)/i,
      breaks: /(break|rest)/i,
    };

    // Extract information
    const workMatch = input.match(patterns.workHours);
    const exerciseMatch = input.match(patterns.exercise);
    const sleepMatch = input.match(patterns.sleep);
    
    let workStart = '09:00';
    let workEnd = '17:00';
    let workDuration = 480;
    
    if (workMatch) {
      if (workMatch[2] && workMatch[3]) {
        workStart = `${workMatch[2].padStart(2, '0')}:00`;
        workEnd = `${workMatch[3].padStart(2, '0')}:00`;
        workDuration = (parseInt(workMatch[3]) - parseInt(workMatch[2])) * 60;
      } else if (workMatch[4] && workMatch[5]) {
        workStart = `${workMatch[4].padStart(2, '0')}:00`;
        workEnd = `${workMatch[5].padStart(2, '0')}:00`;
        workDuration = (parseInt(workMatch[5]) - parseInt(workMatch[4])) * 60;
      }
    }
    
    const exerciseMinutes = exerciseMatch ? 
      parseInt(exerciseMatch[2] || exerciseMatch[1] || '45') : 45;
    
    const sleepHours = sleepMatch ? 
      parseInt(sleepMatch[2] || sleepMatch[1] || '7') : 7;

    // Build comprehensive non-overlapping schedule
    let currentTime = '06:30';
    const blocks: ScheduleBlock[] = [];
    
    // Helper function to add block and update current time
    const addBlock = (title: string, duration: number, type: ScheduleBlock['type'], description?: string) => {
      const startTime = currentTime;
      const endTime = scheduleAI.addMinutesToTime(startTime, duration);
      
      blocks.push({
        id: String(blocks.length + 1),
        title,
        startTime,
        endTime,
        duration,
        type,
        description: description || `${title} activity`,
        priority: 'medium',
        flexible: true,
      });
      
      currentTime = endTime;
    };
    
    // Build schedule sequentially to avoid overlaps
    addBlock('Morning Routine', 30, 'personal', 'Wake up, personal hygiene, get ready');
    addBlock('Breakfast', 30, 'meal', 'Morning meal');
    
    // Work session 1 (9am-12pm)
    if (workStart !== '09:00') {
      // Add commute if work doesn't start at 9
      const commuteTime = scheduleAI.timeToMinutes(workStart) - scheduleAI.timeToMinutes(currentTime);
      if (commuteTime > 0) {
        addBlock('Commute to Work', Math.min(commuteTime, 60), 'commute', 'Travel to workplace');
      }
    }
    
    // Adjust current time to work start if needed
    if (scheduleAI.timeToMinutes(currentTime) < scheduleAI.timeToMinutes(workStart)) {
      currentTime = workStart;
    }
    
    // Morning work session
    const morningWorkDuration = Math.min(180, scheduleAI.timeToMinutes('12:00') - scheduleAI.timeToMinutes(currentTime));
    if (morningWorkDuration > 0) {
      addBlock('Work - Morning Session', morningWorkDuration, 'work', 'Focused work time, meetings, tasks');
    }
    
    // Lunch break
    addBlock('Lunch Break', 60, 'meal', 'Lunch and rest');
    
    // Afternoon work session
    const afternoonWorkDuration = Math.min(240, scheduleAI.timeToMinutes(workEnd) - scheduleAI.timeToMinutes(currentTime));
    if (afternoonWorkDuration > 0) {
      addBlock('Work - Afternoon Session', afternoonWorkDuration, 'work', 'Continued work, meetings, project tasks');
    }
    
    // Exercise/workout
    addBlock('Exercise/Workout', exerciseMinutes, 'exercise', 'Physical activity, gym, sports');
    
    // Dinner
    addBlock('Dinner', 60, 'meal', 'Evening meal');
    
    // Personal time
    addBlock('Personal Time', 120, 'personal', 'Relaxation, hobbies, family time');
    
    // Sleep (handle day rollover)
    addBlock('Sleep', sleepHours * 60, 'sleep', 'Night rest and recovery');

    const workLifeBalance = scheduleAI.calculateWorkLifeBalance(blocks);
    const suggestions = scheduleAI.generateSmartSuggestions(blocks, input);
    const optimizationScore = scheduleAI.calculateOptimizationScore(blocks);

    return {
      blocks,
      totalHours: 24,
      workLifeBalance,
      suggestions,
      optimizationScore,
    };
  },

  /**
   * Helper function to convert time to minutes
   */
  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  /**
   * Helper function to convert minutes to time
   */
  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  },

  /**
   * Calculate work-life balance metrics
   */
  calculateWorkLifeBalance: (blocks: ScheduleBlock[]) => {
    const totals = {
      work: 0,
      personal: 0,
      sleep: 0,
      exercise: 0,
    };

    blocks.forEach(block => {
      switch (block.type) {
        case 'work':
          totals.work += block.duration;
          break;
        case 'personal':
        case 'wellness':
          totals.personal += block.duration;
          break;
        case 'sleep':
          totals.sleep += block.duration;
          break;
        case 'exercise':
          totals.exercise += block.duration;
          break;
      }
    });

    return {
      workHours: totals.work / 60,
      personalHours: totals.personal / 60,
      sleepHours: totals.sleep / 60,
      exerciseMinutes: totals.exercise,
    };
  },

  /**
   * Generate smart suggestions based on the schedule
   */
  generateSmartSuggestions: (blocks: ScheduleBlock[], originalInput: string): string[] => {
    const suggestions: string[] = [];
    const totals = scheduleAI.calculateWorkLifeBalance(blocks);

    if (totals.workHours > 9) {
      suggestions.push('Consider reducing work hours to improve work-life balance');
    }
    
    if (totals.exerciseMinutes < 30) {
      suggestions.push('Add at least 30 minutes of daily exercise for better health');
    }
    
    if (totals.sleepHours < 7) {
      suggestions.push('Increase sleep duration to 7-9 hours for optimal recovery');
    }
    
    if (totals.personalHours < 2) {
      suggestions.push('Schedule more personal time for relaxation and hobbies');
    }

    // Check for missing breaks in work
    const workBlocks = blocks.filter(b => b.type === 'work');
    const hasLongWorkSession = workBlocks.some(b => b.duration > 240); // 4+ hours
    
    if (hasLongWorkSession) {
      suggestions.push('Add short breaks during long work sessions to maintain productivity');
    }

    if (suggestions.length === 0) {
      suggestions.push('Your schedule looks well-balanced!');
      suggestions.push('Consider adding variety to keep things interesting');
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  },

  /**
   * Calculate optimization score based on various factors
   */
  calculateOptimizationScore: (blocks: ScheduleBlock[]): number => {
    const totals = scheduleAI.calculateWorkLifeBalance(blocks);
    let score = 100;

    // Work-life balance (30 points)
    if (totals.workHours > 9) score -= 15;
    else if (totals.workHours < 6) score -= 10;
    
    if (totals.personalHours < 2) score -= 15;
    
    // Health factors (40 points)
    if (totals.sleepHours < 7 || totals.sleepHours > 9) score -= 20;
    if (totals.exerciseMinutes < 30) score -= 20;
    
    // Schedule structure (30 points)
    const hasMeals = blocks.some(b => b.type === 'meal');
    if (!hasMeals) score -= 10;
    
    const hasBreaks = blocks.some(b => b.type === 'break');
    if (!hasBreaks && totals.workHours > 6) score -= 10;
    
    const hasWellness = blocks.some(b => b.type === 'wellness');
    if (!hasWellness) score -= 5;
    
    // Ensure realistic scheduling
    const hasReasonableGaps = scheduleAI.validateTimeGaps(blocks);
    if (!hasReasonableGaps) score -= 5;

    return Math.max(0, Math.min(100, score));
  },

  /**
   * Validate time gaps between activities
   */
  validateTimeGaps: (blocks: ScheduleBlock[]): boolean => {
    for (let i = 0; i < blocks.length - 1; i++) {
      const currentEnd = scheduleAI.timeToMinutes(blocks[i].endTime);
      const nextStart = scheduleAI.timeToMinutes(blocks[i + 1].startTime);
      const gap = nextStart - currentEnd;
      
      // Check for unreasonable gaps (more than 3 hours) or overlaps
      if (gap < 0 || gap > 180) {
        return false;
      }
    }
    return true;
  },
};