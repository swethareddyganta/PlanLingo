/**
 * Example React Component using Groq API with AI SDK
 * 
 * This demonstrates how to integrate Groq API calls into React components
 * for the Daily Flow application.
 */

import React, { useState } from 'react';
import { aiService } from '../services/ai';
import { isGroqConfigured, GROQ_MODELS } from '../lib/groq-config';
import { generateText } from 'ai';
import { createGroqModel } from '../lib/groq-config';

export const GroqExampleComponent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Groq is properly configured
  const groqConfigured = isGroqConfigured();

  const handleBasicGeneration = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Using the existing aiService
      const result = await aiService.generateText(prompt);
      setResponse(result.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleGeneration = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { text } = await generateText({
        model: createGroqModel(GROQ_MODELS['llama-3.3-70b-versatile']),
        prompt: `Create a structured daily schedule based on this input: "${prompt}". Include specific times, activities, and brief descriptions.`,
      });
      setResponse(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { text } = await generateText({
        model: createGroqModel(GROQ_MODELS['llama-3.3-70b-versatile']),
        prompt: `Suggest 3-5 achievable goals based on these preferences: productivity, health, learning. Provide actionable steps for each.`,
      });
      setResponse(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!groqConfigured) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          Groq Not Configured
        </h2>
        <p className="text-red-600">
          Please set the VITE_GROQ_API_KEY environment variable to use Groq features.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Groq API Examples</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="e.g., I want to learn Spanish, exercise more, and improve my productivity..."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBasicGeneration}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Basic Generation'}
          </button>

          <button
            onClick={handleScheduleGeneration}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Schedule'}
          </button>

          <button
            onClick={handleGoalRecommendations}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Goal Recommendations'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Response:</h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{response}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">
          Available Groq Models:
        </h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li><code>llama-3.3-70b-versatile</code> - Most capable model</li>
          <li><code>llama-3.1-70b-versatile</code> - Previous generation</li>
          <li><code>llama-3.1-8b-instant</code> - Fast responses</li>
          <li><code>mixtral-8x7b-32768</code> - Large context window</li>
          <li><code>gemma2-9b-it</code> - Instruction tuned</li>
        </ul>
      </div>
    </div>
  );
};

export default GroqExampleComponent;