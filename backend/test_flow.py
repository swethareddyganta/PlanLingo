#!/usr/bin/env python3
"""
Test the complete Daily Flow intent parsing and plan generation
"""

import requests
import json
from datetime import datetime

API_BASE = "http://localhost:8000"

def test_intent_parsing():
    """Test the intent parsing endpoint"""
    print("=" * 60)
    print("TESTING INTENT PARSING")
    print("=" * 60)
    
    test_cases = [
        "I want to workout for 30 minutes in the morning, work for 8 hours with breaks, meditate for 15 minutes, and have 2 hours of me time in the evening.",
        "Start with yoga for 45 minutes, then 4 hours of deep work, lunch break, 3 more hours of work, and end with reading for an hour",
        "Morning gym session 1 hour, meetings from 9 to 12, lunch, coding from 1 to 5pm, dinner with family at 7pm",
    ]
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Input: {test_text[:80]}...")
        
        response = requests.post(
            f"{API_BASE}/api/v1/intents",
            json={"text": test_text}
        )
        
        if response.status_code == 200:
            data = response.json()
            parsed = data['parsed']
            print(f"✅ Successfully parsed!")
            print(f"   - Tasks identified: {len(parsed['tasks'])}")
            print(f"   - Total duration: {parsed['total_duration_hours']} hours")
            print(f"   - Includes wellness: {parsed['includes_wellness']}")
            
            print("   - Task breakdown:")
            for task in parsed['tasks']:
                print(f"     • {task['title']} ({task['duration']}min, {task['priority']} priority)")
            
            return parsed  # Return for plan generation
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Error: {response.text}")
    
    return None

def test_plan_generation(parsed_intent):
    """Test the plan generation endpoint"""
    print("\n" + "=" * 60)
    print("TESTING PLAN GENERATION")
    print("=" * 60)
    
    if not parsed_intent:
        print("❌ No parsed intent available")
        return
    
    # Test with different configurations
    configs = [
        {"start_time": "07:00", "end_time": "22:00"},  # Normal day
        {"start_time": "06:00", "end_time": "23:00"},  # Early bird
        {"start_time": "09:00", "end_time": "21:00"},  # Late starter
    ]
    
    for i, config in enumerate(configs, 1):
        print(f"\nConfiguration {i}: Day from {config['start_time']} to {config['end_time']}")
        
        response = requests.post(
            f"{API_BASE}/api/v1/plans",
            json={
                "intent": parsed_intent,
                "config": config
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            blocks = data['blocks']
            stats = data['stats']
            
            print(f"✅ Successfully generated plan!")
            print(f"   - Total blocks: {stats['total_blocks']}")
            print(f"   - Work time: {stats['work_duration_minutes']}min ({stats['work_percentage']}%)")
            print(f"   - Wellness time: {stats['wellness_duration_minutes']}min")
            print(f"   - Balance score: {stats['balance_score']}/100")
            print(f"   - Productivity score: {stats['productivity_score']}/100")
            
            print("\n   📅 Daily Schedule:")
            for block in blocks[:8]:  # Show first 8 blocks
                energy_indicator = "⚡" * (block.get('energy_level', 5) // 2)
                optimal = "✨" if block.get('is_optimal', False) else ""
                print(f"     {block['startTime']}-{block['endTime']} | {block['title']:<30} | {block['type']:<10} {energy_indicator} {optimal}")
            
            if len(blocks) > 8:
                print(f"     ... and {len(blocks) - 8} more blocks")
            
            break  # Just test first config for brevity
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Error: {response.text}")

def test_demo_endpoints():
    """Test the demo endpoints"""
    print("\n" + "=" * 60)
    print("TESTING DEMO ENDPOINTS")
    print("=" * 60)
    
    # Test demo intent
    print("\nDemo Intent Endpoint:")
    response = requests.get(f"{API_BASE}/api/v1/demo/intent")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Demo intent available with {len(data['parsed']['tasks'])} tasks")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test demo plan
    print("\nDemo Plan Endpoint:")
    response = requests.get(f"{API_BASE}/api/v1/demo/plan")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Demo plan available with {len(data['blocks'])} time blocks")
        print(f"   Balance score: {data['stats']['balance_score']}/100")
    else:
        print(f"❌ Failed: {response.status_code}")

def main():
    """Run all tests"""
    print("\n🚀 DAILY FLOW API TEST SUITE")
    print(f"   Testing API at: {API_BASE}")
    print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Check if API is running
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ API is healthy and running")
        else:
            print("❌ API health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the backend is running.")
        return
    
    # Run tests
    parsed_intent = test_intent_parsing()
    test_plan_generation(parsed_intent)
    test_demo_endpoints()
    
    print("\n" + "=" * 60)
    print("✨ TEST SUITE COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
