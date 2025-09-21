#!/usr/bin/env python3
"""
Test student schedule parsing
"""

from services.intent_parser import IntentParser
from services.plan_generator import PlanGenerator
import json

def test_student_schedules():
    parser = IntentParser()
    generator = PlanGenerator()
    
    test_cases = [
        "timetable for a 9th grader who goes to school from 8.30 to 5.30pm",
        "schedule for a 5th grade student, school hours 8am to 2:30pm",
        "I'm a high school student (11th grade) with classes from 7:45 to 3:15",
        "Create a daily routine for my 7th grader who has school 8:00-3:00"
    ]
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"Test Case {i}: {test_text}")
        print("="*60)
        
        # Parse intent
        parsed = parser.parse_intent(test_text)
        
        # Show context
        if parsed.get('context'):
            context = parsed['context']
            print(f"\n✅ Recognized as STUDENT schedule:")
            print(f"   Grade Level: {context.get('grade_level', 'Not specified')}")
            print(f"   School Hours: {context.get('school_start')} - {context.get('school_end')}")
            print(f"   Needs Homework: {context.get('needs_homework_time')}")
            print(f"   Needs Study Time: {context.get('needs_study_time')}")
        
        # Show generated tasks
        print(f"\n📚 Generated Daily Tasks:")
        for task in parsed['tasks']:
            emoji_type = {
                'wellness': '💚',
                'work': '📘',
                'break': '🍽️',
                'personal': '🌟',
                'learning': '📖'
            }.get(task['type'], '⚫')
            
            print(f"   {emoji_type} {task['title']:<35} ({task['duration']:>3} min)")
        
        # Generate and show plan summary
        plan = generator.generate_plan(parsed, {"start_time": "06:30", "end_time": "21:30"})
        stats = plan['stats']
        
        print(f"\n📊 Day Statistics:")
        print(f"   Total Duration: {stats['total_duration_hours']} hours")
        print(f"   School/Work Time: {stats['work_duration_minutes']} minutes")
        print(f"   Wellness Time: {stats['wellness_duration_minutes']} minutes")  
        print(f"   Personal Time: {stats['personal_duration_minutes']} minutes")
        print(f"   Balance Score: {stats['balance_score']}/100")

def compare_parsing():
    """Compare adult vs student parsing"""
    parser = IntentParser()
    
    print("\n" + "="*60)
    print("COMPARISON: Adult Professional vs Student Schedule")
    print("="*60)
    
    # Adult professional
    adult_text = "I want to workout for 30 minutes, work 8 hours with breaks, meditate 15 minutes, 2 hours personal time"
    adult_parsed = parser.parse_intent(adult_text)
    
    print("\n👔 Adult Professional:")
    print(f"Input: {adult_text[:50]}...")
    print(f"Tasks: {len(adult_parsed['tasks'])} items")
    print(f"Context: {adult_parsed.get('context', 'None - Standard adult schedule')}")
    
    # Student
    student_text = "timetable for a 9th grader who goes to school from 8.30 to 5.30pm"
    student_parsed = parser.parse_intent(student_text)
    
    print("\n🎒 Student:")
    print(f"Input: {student_text}")
    print(f"Tasks: {len(student_parsed['tasks'])} items")
    print(f"Context: Grade {student_parsed['context']['grade_level']} student")
    print(f"Special considerations: Homework time, study time, physical activity")

if __name__ == "__main__":
    print("🎓 STUDENT SCHEDULE PARSER TEST")
    print("Testing improved parsing for student timetables\n")
    
    test_student_schedules()
    compare_parsing()
    
    print("\n✅ Test complete!")
