"""
AI Service using Groq for enhanced natural language processing
"""
import os
from typing import Dict, Any, List
import httpx
from fastapi import HTTPException

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/v1/completions"

class AIService:
    def __init__(self):
        self.enabled = bool(GROQ_API_KEY)
        
        if self.enabled:
            self.headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            self.model = "llama-3.3-70b-versatile"
        else:
            print("Warning: GROQ_API_KEY not set. AI features will be disabled.")

    async def generate_response(self, prompt: str) -> str:
        """
        Generate a response using Groq's LLM
        """
        if not self.enabled:
            return "AI service is currently unavailable. Please set GROQ_API_KEY environment variable."
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    GROQ_API_URL,
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "max_tokens": 1000,
                        "temperature": 0.7,
                        "top_p": 1.0,
                        "stream": False
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Groq API error: {response.text}"
                    )
                
                result = response.json()
                return result['choices'][0]['text'].strip()

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating AI response: {str(e)}"
            )

    async def enhance_schedule_generation(self, user_input: str) -> Dict[str, Any]:
        """
        Use Groq to enhance schedule generation with more natural language understanding
        """
        if not self.enabled:
            # Return a basic fallback schedule
            return {
                "schedule": [
                    {"time": "09:00", "activity": "Work session", "duration": 120, "type": "work"},
                    {"time": "11:00", "activity": "Break", "duration": 15, "type": "break"},
                    {"time": "12:00", "activity": "Lunch", "duration": 60, "type": "break"},
                    {"time": "14:00", "activity": "Work session", "duration": 120, "type": "work"},
                    {"time": "16:00", "activity": "Exercise", "duration": 45, "type": "wellness"},
                    {"time": "17:00", "activity": "Personal time", "duration": 120, "type": "personal"}
                ],
                "suggestions": [
                    "Consider taking regular breaks every 2 hours",
                    "AI features are disabled - set GROQ_API_KEY for personalized suggestions"
                ],
                "wellness_tips": [
                    "Stay hydrated throughout the day",
                    "Take short walks between work sessions"
                ]
            }
        
        prompt = f"""
        As an AI schedule planner, analyze this request and create a detailed daily schedule:
        
        User Request: {user_input}
        
        Generate a structured response in the following JSON format:
        {{
            "schedule": [
                {{
                    "time": "HH:MM",
                    "activity": "description",
                    "duration": minutes,
                    "type": "work/break/personal/wellness"
                }}
            ],
            "suggestions": [
                "improvement suggestion 1",
                "improvement suggestion 2"
            ],
            "wellness_tips": [
                "wellness tip 1",
                "wellness tip 2"
            ]
        }}
        
        Ensure the schedule is realistic, balanced, and includes appropriate breaks.
        """
        
        try:
            response = await self.generate_response(prompt)
            # The response should be valid JSON
            import json
            enhanced_schedule = json.loads(response)
            return enhanced_schedule
            
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse AI response into valid schedule format"
            )

    async def generate_goal_recommendations(self, current_goals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate personalized goal recommendations based on current goals
        """
        if not self.enabled:
            # Return basic goal recommendations
            return [
                {
                    "title": "Daily Exercise",
                    "description": "Regular physical activity improves overall health and productivity",
                    "suggested_target": "30",
                    "unit": "minutes",
                    "timeframe": "daily"
                },
                {
                    "title": "Reading",
                    "description": "Reading helps expand knowledge and improves cognitive function",
                    "suggested_target": "20",
                    "unit": "pages",
                    "timeframe": "daily"
                },
                {
                    "title": "Water Intake",
                    "description": "Staying hydrated is essential for optimal body function",
                    "suggested_target": "8",
                    "unit": "glasses",
                    "timeframe": "daily"
                }
            ]
        
        goals_description = "\n".join([
            f"- {goal['title']}: Progress {goal['currentProgress']}/{goal['targetProgress']} {goal['unit']}"
            for goal in current_goals
        ])
        
        prompt = f"""
        Based on these current goals:
        {goals_description}
        
        Suggest 3 additional goals that would complement the existing ones. Format as JSON:
        {{
            "recommendations": [
                {{
                    "title": "goal title",
                    "description": "why this goal would be beneficial",
                    "suggested_target": "numeric target",
                    "unit": "measurement unit",
                    "timeframe": "suggested timeframe"
                }}
            ]
        }}
        """
        
        try:
            response = await self.generate_response(prompt)
            import json
            recommendations = json.loads(response)
            return recommendations['recommendations']
            
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse AI response into valid recommendations format"
            )

# Initialize the AI service
ai_service = AIService()
