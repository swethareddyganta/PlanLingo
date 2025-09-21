import { generateText } from 'ai';
import { createGroqModel, isGroqConfigured, GROQ_MODELS } from '../lib/groq-config';
import { API_ENDPOINTS } from '../config/api';

interface EnhancedSchedule {
  schedule: Array<{
    time: string;
    activity: string;
    duration: number;
    type: 'work' | 'break' | 'personal' | 'wellness';
  }>;
  suggestions: string[];
  wellness_tips: string[];
}

interface GoalRecommendation {
  title: string;
  description: string;
  suggested_target: number;
  unit: string;
  timeframe: string;
}

export const aiService = {
  // Direct Groq integration for real-time text generation
  generateText: async (prompt: string) => {
    if (!isGroqConfigured()) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    
    const completion = await generateText({
      model: createGroqModel(GROQ_MODELS['llama-3.3-70b-versatile']),
      prompt: prompt,
    });
    return completion;
  },

  // Enhanced schedule generation using our backend AI service
  enhanceSchedule: async (text: string): Promise<EnhancedSchedule> => {
    try {
      const response = await fetch(API_ENDPOINTS.AI.ENHANCE_SCHEDULE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance schedule');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error enhancing schedule:', error);
      throw error;
    }
  },

  // Get AI-powered goal recommendations
  getGoalRecommendations: async (currentGoals: any[]): Promise<GoalRecommendation[]> => {
    try {
      const response = await fetch(API_ENDPOINTS.AI.GOAL_RECOMMENDATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_goals: currentGoals }),
      });

      if (!response.ok) {
        throw new Error('Failed to get goal recommendations');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting goal recommendations:', error);
      throw error;
    }
  },
};
