import { groq } from '@ai-sdk/groq';

// Groq API configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Available Groq models
export const GROQ_MODELS = {
  'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant': 'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile': 'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768': 'mixtral-8x7b-32768',
} as const;

// Check if Groq is properly configured
export const isGroqConfigured = (): boolean => {
  return Boolean(GROQ_API_KEY);
};

// Create a Groq model instance
export const createGroqModel = (modelId: string) => {
  if (!isGroqConfigured()) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  
  return groq(modelId, {
    apiKey: GROQ_API_KEY,
  });
};

export default {
  GROQ_MODELS,
  isGroqConfigured,
  createGroqModel,
};
