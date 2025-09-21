"""
Plan Generator Service
Generates optimized daily schedules from parsed tasks
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta, time
import json

class PlanGenerator:
    """Generate time-blocked daily plans from parsed tasks"""
    
    # Default day configuration
    DEFAULT_DAY_CONFIG = {
        'start_time': '07:00',  # Default day start
        'end_time': '22:00',    # Default day end
        'lunch_time': '12:30',   # Preferred lunch time
        'break_interval': 90,    # Minutes between breaks
        'break_duration': 10,    # Duration of short breaks
    }
    
    # Energy levels throughout the day (0-10 scale)
    ENERGY_CURVE = {
        7: 6,   # Morning - moderate
        8: 7,   # Rising
        9: 9,   # Peak morning productivity
        10: 10, # Peak
        11: 9,  # Still high
        12: 7,  # Pre-lunch dip
        13: 5,  # Post-lunch low
        14: 6,  # Recovery
        15: 8,  # Second peak
        16: 8,  # Good productivity
        17: 7,  # Declining
        18: 6,  # Evening
        19: 5,  # Low
        20: 4,  # Winding down
        21: 3,  # Low energy
    }
    
    def generate_plan(self, parsed_intent: Dict[str, Any], config: Dict = None) -> Dict[str, Any]:
        """
        Generate a time-blocked daily plan from parsed tasks
        
        Args:
            parsed_intent: Parsed intent with tasks
            config: Optional day configuration overrides
            
        Returns:
            Generated plan with time blocks
        """
        # Check if this is a student context for enhanced planning
        context = parsed_intent.get('context', {})
        if context and context.get('type') == 'student':
            return self._generate_student_comprehensive_plan(parsed_intent, config)
        
        # Regular plan generation for non-student contexts
        return self._generate_regular_plan(parsed_intent, config)
    
    def _generate_regular_plan(self, parsed_intent: Dict[str, Any], config: Dict = None) -> Dict[str, Any]:
        """Generate regular time-blocked plan (original logic)"""
        # Merge config with defaults
        day_config = {**self.DEFAULT_DAY_CONFIG, **(config or {})}
        
        # Extract tasks and context
        tasks = parsed_intent.get('tasks', [])
        context = parsed_intent.get('context', {})
        
        # Check if tasks have specific times (from professional context)
        if context.get('type') == 'professional' and context.get('meal_times'):
            # Use time-specific scheduling for professional contexts
            return self._generate_time_specific_plan(tasks, context, day_config)
        
        # Sort tasks by priority for regular scheduling
        tasks = self._sort_tasks_by_priority(tasks)
        
        # Generate time blocks
        blocks = self._generate_time_blocks(tasks, day_config)
        
        # Add micro-breaks between long blocks
        blocks = self._add_micro_breaks(blocks, day_config)
        
        # Optimize block placement based on energy levels
        blocks = self._optimize_by_energy(blocks)
        
        # Calculate plan statistics
        stats = self._calculate_stats(blocks)
        
        return {
            'blocks': blocks,
            'stats': stats,
            'config': day_config,
            'generated_at': datetime.now().isoformat()
        }
    
    def _generate_time_specific_plan(self, tasks: List[Dict], context: Dict, day_config: Dict) -> Dict[str, Any]:
        """Generate plan with specific times from professional context"""
        blocks = []
        block_id = 1
        
        # Extract meal times and work times from context
        meal_times = context.get('meal_times', {})
        work_start = context.get('work_start', '9:00am')
        work_end = context.get('work_end', '5:00pm')
        
        # Convert times to 24-hour format for scheduling
        def convert_to_24h(time_str):
            time_str = time_str.lower().strip()
            if 'pm' in time_str:
                # Extract hour and minute
                time_part = time_str.replace('pm', '').replace('am', '').strip()
                if ':' in time_part:
                    hour, minute = time_part.split(':')
                    hour = int(hour)
                    minute = int(minute)
                else:
                    hour = int(time_part)
                    minute = 0
                
                if hour != 12:
                    hour += 12
                return f"{hour:02d}:{minute:02d}"
            elif 'am' in time_str:
                # Extract hour and minute
                time_part = time_str.replace('pm', '').replace('am', '').strip()
                if ':' in time_part:
                    hour, minute = time_part.split(':')
                    hour = int(hour)
                    minute = int(minute)
                else:
                    hour = int(time_part)
                    minute = 0
                
                if hour == 12:
                    hour = 0
                return f"{hour:02d}:{minute:02d}"
            else:
                # Already in 24-hour format or just hour
                return time_str
        
        # Schedule tasks based on their titles and context
        for task in tasks:
            title = task['title']
            duration = task['duration']
            task_type = task['type']
            
            # Determine start time based on task title and context
            if 'Morning Routine' in title:
                start_time = '07:00'
            elif 'Commute to Work' in title:
                start_time = '08:30'  # After morning routine
            elif 'Work (9:00am - 13:00)' in title or 'Work (9:00am - 5:00pm)' in title:
                start_time = convert_to_24h(work_start)
            elif 'Lunch Break' in title or 'lunch' in title.lower():
                start_time = convert_to_24h(meal_times.get('lunch', '13:00'))
            elif 'Work (13:00 - 5:00pm)' in title:
                # Start after lunch break (45 minutes)
                lunch_start = self._parse_time(convert_to_24h(meal_times.get('lunch', '13:00')))
                lunch_end = lunch_start + timedelta(minutes=45)
                start_time = lunch_end.strftime('%H:%M')
            elif 'Commute Home' in title:
                work_end_time = self._parse_time(convert_to_24h(work_end))
                start_time = work_end_time.strftime('%H:%M')
            elif 'Exercise' in title or 'Gym' in title:
                # Schedule after commute home
                work_end_time = self._parse_time(convert_to_24h(work_end))
                commute_duration = 30  # minutes
                exercise_start = work_end_time + timedelta(minutes=commute_duration)
                start_time = exercise_start.strftime('%H:%M')
            elif 'Dinner' in title:
                # Schedule after exercise (60 minutes)
                work_end_time = self._parse_time(convert_to_24h(work_end))
                exercise_start = work_end_time + timedelta(minutes=30 + 60)  # commute + exercise
                dinner_start = exercise_start + timedelta(minutes=60)  # exercise duration
                start_time = dinner_start.strftime('%H:%M')
            elif 'Personal Learning' in title or 'Learning' in title:
                # Schedule after dinner
                work_end_time = self._parse_time(convert_to_24h(work_end))
                learning_start = work_end_time + timedelta(minutes=30 + 60 + 45)  # commute + exercise + dinner
                start_time = learning_start.strftime('%H:%M')
            elif 'Evening Routine' in title:
                # Schedule at the end of the day
                work_end_time = self._parse_time(convert_to_24h(work_end))
                evening_start = work_end_time + timedelta(minutes=30 + 60 + 45 + 90)  # commute + exercise + dinner + learning
                start_time = evening_start.strftime('%H:%M')
            else:
                # Default: schedule sequentially
                if blocks:
                    last_block = blocks[-1]
                    last_end = self._parse_time(last_block['end_time'])
                    start_time = (last_end + timedelta(minutes=last_block['duration'])).strftime('%H:%M')
                else:
                    start_time = '07:00'
            
            # Create time block
            start_dt = self._parse_time(start_time)
            end_dt = start_dt + timedelta(minutes=duration)
            
            block = {
                'id': block_id,
                'title': title,
                'duration': duration,
                'start_time': start_time,
                'end_time': end_dt.strftime('%H:%M'),
                'type': task_type,
                'priority': task.get('priority', 'medium')
            }
            
            blocks.append(block)
            block_id += 1
        
        # Sort blocks by start time to ensure proper order
        blocks.sort(key=lambda x: x['start_time'])
        
        # Calculate plan statistics
        stats = self._calculate_stats(blocks)
        
        return {
            'blocks': blocks,
            'stats': stats,
            'config': day_config,
            'generated_at': datetime.now().isoformat()
        }
    
    def _generate_student_comprehensive_plan(self, parsed_intent: Dict[str, Any], config: Dict = None) -> Dict[str, Any]:
        """Generate a comprehensive student timetable similar to ChatGPT quality"""
        context = parsed_intent.get('context', {})
        grade_level = context.get('grade_level', 9)
        school_start = context.get('school_start', '8:00am')
        school_end = context.get('school_end', '3:30pm')
        
        # Create comprehensive daily schedule
        blocks = []
        block_id = 1
        
        # Morning Routine (Before School) - Starting early for discipline
        morning_blocks = [
            {'time': '6:00', 'duration': 30, 'title': 'Wake up & Freshen up', 'type': 'personal', 'description': 'Get out of bed, brush teeth, shower, get dressed'},
            {'time': '6:30', 'duration': 30, 'title': 'Morning Exercise', 'type': 'wellness', 'description': 'Light stretching, yoga, or quick workout'},
            {'time': '7:00', 'duration': 30, 'title': 'Breakfast', 'type': 'break', 'description': 'Nutritious breakfast with family'},
            {'time': '7:30', 'duration': 20, 'title': 'Quick Review & Preparation', 'type': 'learning', 'description': 'Review yesterday\'s lessons, pack school bag'},
        ]
        
        # School Block
        school_duration = self._calculate_time_difference(school_start, school_end)
        school_blocks = [
            {'time': '8:00', 'duration': school_duration, 'title': f'School ({school_start} - {school_end})', 'type': 'work', 'description': 'Includes travel + lunch break at school'}
        ]
        
        # After School Routine
        afternoon_blocks = [
            {'time': '17:00', 'duration': 30, 'title': 'Snack & Short Rest', 'type': 'break', 'description': 'Healthy snack and decompress from school'},
            {'time': '17:30', 'duration': 60, 'title': 'Homework Focus Session', 'type': 'work', 'description': 'Complete today\'s assignments and school work'},
            {'time': '18:30', 'duration': 45, 'title': 'Outdoor Play / Sports', 'type': 'wellness', 'description': 'Physical activity, sports, or outdoor games'},
            {'time': '19:15', 'duration': 60, 'title': 'Study Session', 'type': 'learning', 'description': 'Focus on Math, Science, or weak subjects'},
            {'time': '20:15', 'duration': 30, 'title': 'Dinner with Family', 'type': 'break', 'description': 'Family meal and conversation'},
            {'time': '20:45', 'duration': 45, 'title': 'Light Study', 'type': 'learning', 'description': 'Reading, revising, languages, or projects'},
            {'time': '21:30', 'duration': 20, 'title': 'Relaxation Time', 'type': 'personal', 'description': 'Journaling, drawing, music, or free reading'},
            {'time': '22:00', 'duration': 0, 'title': 'Sleep Time', 'type': 'personal', 'description': 'Essential 8+ hours of sleep for growth & focus'}
        ]
        
        # Combine all blocks
        all_schedule_blocks = morning_blocks + school_blocks + afternoon_blocks
        
        # Convert to our block format
        for schedule_block in all_schedule_blocks:
            start_time = schedule_block['time']
            end_time = self._add_minutes_to_time(start_time, schedule_block['duration'])
            
            blocks.append({
                'id': str(block_id),
                'title': schedule_block['title'],
                'startTime': start_time,
                'endTime': end_time,
                'duration': schedule_block['duration'],  # Keep as integer, not string
                'type': schedule_block['type'],
                'description': schedule_block.get('description', ''),
                'priority': 'high' if schedule_block['type'] in ['work', 'learning'] else 'medium'
            })
            block_id += 1
        
        # Create weekend recommendations
        weekend_blocks = self._generate_weekend_schedule(grade_level)
        
        # Enhanced statistics
        def safe_duration_extract(duration):
            """Safely extract minutes from duration (integer or string)"""
            if isinstance(duration, int):
                return duration
            if duration == 'Sleep' or not duration:
                return 0
            try:
                return int(str(duration).replace('m', ''))
            except:
                return 0
        
        study_minutes = sum(safe_duration_extract(b['duration']) for b in blocks if b['type'] in ['work', 'learning'])
        wellness_minutes = sum(safe_duration_extract(b['duration']) for b in blocks if b['type'] == 'wellness')
        
        stats = {
            'total_blocks': len(blocks),
            'study_hours': round(study_minutes / 60, 1),
            'wellness_hours': round(wellness_minutes / 60, 1),
            'sleep_hours': 8,
            'recommendations': [
                'Ensure at least 8 hours of sleep every day',
                'Keep 1.5-2 hours daily for studies after school',
                'Balance academics with play, hobbies, and family time',
                'Weekends should include both revision and relaxation'
            ],
            'grade_level': grade_level,
            'schedule_type': 'comprehensive_student'
        }
        
        return {
            'blocks': blocks,
            'weekend_schedule': weekend_blocks,
            'stats': stats,
            'generated_at': datetime.now().isoformat(),
            'plan_type': 'student_comprehensive'
        }
    
    def _generate_weekend_schedule(self, grade_level: int) -> List[Dict]:
        """Generate weekend routine recommendations"""
        return [
            {'time': '6:00-8:00', 'activity': 'Same as weekdays (exercise + breakfast + quick review)'},
            {'time': '10:00-12:00', 'activity': 'Weekly revision (subjects covered in school)'},
            {'time': '12:00-13:00', 'activity': 'Hobby time (coding, drawing, music, etc.)'},
            {'time': 'Afternoon', 'activity': 'Rest + outing/family time'},
            {'time': '17:00-18:30', 'activity': 'Practice problem-solving (Math/Science or upcoming tests)'},
            {'time': 'Evening', 'activity': 'Relax + prepare school bag & uniform for Monday'},
            {'time': '22:00', 'activity': 'Sleep by 10 PM'}
        ]
    
    def _calculate_time_difference(self, start_time: str, end_time: str) -> int:
        """Calculate duration in minutes between two times"""
        # Simple implementation for common formats
        if '8:00am' in start_time and '5:00pm' in end_time:
            return 540  # 9 hours
        elif '8:00am' in start_time and '3:30pm' in end_time:
            return 450  # 7.5 hours
        else:
            return 480  # Default 8 hours
    
    def _add_minutes_to_time(self, time_str: str, minutes: int) -> str:
        """Add minutes to a time string (HH:MM format)"""
        if minutes == 0:
            return time_str
        
        hour, minute = map(int, time_str.split(':'))
        total_minutes = hour * 60 + minute + minutes
        new_hour = (total_minutes // 60) % 24
        new_minute = total_minutes % 60
        return f"{new_hour:02d}:{new_minute:02d}"
    
    def _sort_tasks_by_priority(self, tasks: List[Dict]) -> List[Dict]:
        """Sort tasks by priority and type for optimal scheduling"""
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        type_order = {'wellness': 0, 'work': 1, 'break': 2, 'personal': 3}
        
        return sorted(tasks, key=lambda t: (
            priority_order.get(t.get('priority', 'medium'), 1),
            type_order.get(t.get('type', 'work'), 1)
        ))
    
    def _generate_time_blocks(self, tasks: List[Dict], config: Dict) -> List[Dict]:
        """Generate time blocks from tasks"""
        blocks = []
        current_time = self._parse_time(config['start_time'])
        end_time = self._parse_time(config['end_time'])
        lunch_time = self._parse_time(config['lunch_time'])
        
        block_id = 1
        lunch_scheduled = False
        
        for task in tasks:
            # Check if it's time for lunch
            if not lunch_scheduled and current_time >= lunch_time and task['type'] != 'break':
                # Insert lunch if not already in tasks
                if not any(t['type'] == 'break' and 'lunch' in t['title'].lower() for t in tasks):
                    lunch_block = self._create_block(
                        block_id,
                        '🍽️ Lunch Break',
                        45,
                        current_time,
                        'break'
                    )
                    blocks.append(lunch_block)
                    current_time = self._add_minutes(current_time, 45)
                    block_id += 1
                lunch_scheduled = True
            
            # Create block for current task
            duration = task['duration']
            
            # Split very long tasks into chunks with breaks
            if duration > 120 and task['type'] == 'work':
                # Split into 90-minute chunks
                remaining = duration
                chunk_num = 1
                while remaining > 0:
                    chunk_duration = min(90, remaining)
                    chunk_title = f"{task['title']} (Part {chunk_num})" if remaining != duration else task['title']
                    
                    block = self._create_block(
                        block_id,
                        chunk_title,
                        chunk_duration,
                        current_time,
                        task['type'],
                        task.get('priority', 'medium')
                    )
                    blocks.append(block)
                    current_time = self._add_minutes(current_time, chunk_duration)
                    block_id += 1
                    remaining -= chunk_duration
                    chunk_num += 1
                    
                    # Add break between chunks
                    if remaining > 0:
                        break_block = self._create_block(
                            block_id,
                            'Short Break',
                            10,
                            current_time,
                            'break'
                        )
                        blocks.append(break_block)
                        current_time = self._add_minutes(current_time, 10)
                        block_id += 1
            else:
                block = self._create_block(
                    block_id,
                    task['title'],
                    duration,
                    current_time,
                    task['type'],
                    task.get('priority', 'medium')
                )
                blocks.append(block)
                current_time = self._add_minutes(current_time, duration)
                block_id += 1
            
            # Stop if we've exceeded the day
            if current_time >= end_time:
                break
        
        return blocks
    
    def _create_block(self, block_id: int, title: str, duration: int, 
                     start_time: datetime, block_type: str, priority: str = 'medium') -> Dict:
        """Create a single time block"""
        end_time = self._add_minutes(start_time, duration)
        
        return {
            'id': str(block_id),
            'title': title,
            'duration': duration,
            'startTime': start_time.strftime('%H:%M'),
            'endTime': end_time.strftime('%H:%M'),
            'type': block_type,
            'priority': priority,
            'energy_level': self._get_energy_level(start_time.hour)
        }
    
    def _add_micro_breaks(self, blocks: List[Dict], config: Dict) -> List[Dict]:
        """Add micro-breaks between intense work blocks"""
        enhanced_blocks = []
        last_work_duration = 0
        
        for i, block in enumerate(blocks):
            enhanced_blocks.append(block)
            
            if block['type'] == 'work':
                last_work_duration += block['duration']
            else:
                last_work_duration = 0
            
            # Add hydration reminder after long work sessions
            if last_work_duration >= 120 and i < len(blocks) - 1:
                if blocks[i + 1]['type'] != 'break':
                    # Insert 5-minute hydration break
                    start_time = self._parse_time(block['endTime'])
                    hydration_block = self._create_block(
                        f"{block['id']}_h",
                        'Hydration & Stretch',
                        5,
                        start_time,
                        'wellness'
                    )
                    enhanced_blocks.append(hydration_block)
                    
                    # Adjust next block's start time
                    if i + 1 < len(blocks):
                        next_start = self._add_minutes(start_time, 5)
                        self._adjust_subsequent_blocks(blocks[i + 1:], next_start)
        
        return enhanced_blocks
    
    def _optimize_by_energy(self, blocks: List[Dict]) -> List[Dict]:
        """Optimize block placement based on energy levels"""
        # Group blocks by type
        high_energy_tasks = []
        low_energy_tasks = []
        breaks = []
        
        for block in blocks:
            if block['type'] == 'work' and block.get('priority') == 'high':
                high_energy_tasks.append(block)
            elif block['type'] == 'break':
                breaks.append(block)
            else:
                low_energy_tasks.append(block)
        
        # Reassemble optimized schedule
        optimized = []
        
        # Place high-priority work in high-energy periods (9-11 AM, 3-5 PM)
        # This is a simplified optimization - in production, use more sophisticated algorithms
        
        # For now, return blocks as-is but with energy annotations
        for block in blocks:
            hour = int(block['startTime'].split(':')[0])
            block['recommended_energy'] = self._get_energy_level(hour)
            block['is_optimal'] = self._is_optimal_time(block['type'], hour)
            optimized.append(block)
        
        return optimized
    
    def _is_optimal_time(self, task_type: str, hour: int) -> bool:
        """Check if the time is optimal for the task type"""
        energy = self._get_energy_level(hour)
        
        if task_type == 'work':
            return energy >= 8
        elif task_type == 'wellness':
            return hour in [7, 8, 17, 18]  # Morning or evening
        elif task_type == 'personal':
            return hour >= 19  # Evening
        elif task_type == 'break':
            return True  # Breaks are always good
        
        return True
    
    def _get_energy_level(self, hour: int) -> int:
        """Get energy level for a given hour"""
        return self.ENERGY_CURVE.get(hour, 5)
    
    def _parse_time(self, time_str: str) -> datetime:
        """Parse time string to datetime"""
        if isinstance(time_str, datetime):
            return time_str
        
        time_parts = time_str.split(':')
        hour = int(time_parts[0])
        minute = int(time_parts[1]) if len(time_parts) > 1 else 0
        
        return datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    def _add_minutes(self, dt: datetime, minutes: int) -> datetime:
        """Add minutes to datetime"""
        return dt + timedelta(minutes=minutes)
    
    def _adjust_subsequent_blocks(self, blocks: List[Dict], new_start: datetime):
        """Adjust start times of subsequent blocks"""
        current_time = new_start
        for block in blocks:
            block['startTime'] = current_time.strftime('%H:%M')
            end_time = self._add_minutes(current_time, block['duration'])
            block['endTime'] = end_time.strftime('%H:%M')
            current_time = end_time
    
    def _calculate_stats(self, blocks: List[Dict]) -> Dict[str, Any]:
        """Calculate statistics about the generated plan"""
        total_duration = sum(block['duration'] for block in blocks)
        work_duration = sum(block['duration'] for block in blocks if block['type'] == 'work')
        break_duration = sum(block['duration'] for block in blocks if block['type'] == 'break')
        wellness_duration = sum(block['duration'] for block in blocks if block['type'] == 'wellness')
        personal_duration = sum(block['duration'] for block in blocks if block['type'] == 'personal')
        
        return {
            'total_blocks': len(blocks),
            'total_duration_minutes': total_duration,
            'total_duration_hours': round(total_duration / 60, 1),
            'work_duration_minutes': work_duration,
            'work_percentage': round((work_duration / total_duration * 100) if total_duration > 0 else 0, 1),
            'break_duration_minutes': break_duration,
            'wellness_duration_minutes': wellness_duration,
            'personal_duration_minutes': personal_duration,
            'productivity_score': self._calculate_productivity_score(blocks),
            'balance_score': self._calculate_balance_score(blocks)
        }
    
    def _calculate_productivity_score(self, blocks: List[Dict]) -> int:
        """Calculate a productivity score (0-100)"""
        score = 0
        
        for block in blocks:
            if block['type'] == 'work':
                # Higher score for work in high-energy periods
                if block.get('is_optimal', False):
                    score += 10
                else:
                    score += 5
        
        # Cap at 100
        return min(score, 100)
    
    def _calculate_balance_score(self, blocks: List[Dict]) -> int:
        """Calculate work-life balance score (0-100)"""
        work_blocks = sum(1 for b in blocks if b['type'] == 'work')
        wellness_blocks = sum(1 for b in blocks if b['type'] in ['wellness', 'break'])
        personal_blocks = sum(1 for b in blocks if b['type'] == 'personal')
        
        total_blocks = len(blocks)
        if total_blocks == 0:
            return 0
        
        # Ideal ratio: 50% work, 30% breaks/wellness, 20% personal
        work_ratio = work_blocks / total_blocks
        wellness_ratio = wellness_blocks / total_blocks
        personal_ratio = personal_blocks / total_blocks
        
        # Calculate deviation from ideal
        work_score = max(0, 100 - abs(work_ratio - 0.5) * 200)
        wellness_score = max(0, 100 - abs(wellness_ratio - 0.3) * 200)
        personal_score = max(0, 100 - abs(personal_ratio - 0.2) * 200)
        
        # Weighted average
        return int((work_score * 0.4 + wellness_score * 0.4 + personal_score * 0.2))


# Example usage and testing
if __name__ == "__main__":
    generator = PlanGenerator()
    
    # Example parsed intent
    parsed_intent = {
        'tasks': [
            {'title': '💪 Workout', 'duration': 30, 'type': 'wellness', 'priority': 'high'},
            {'title': '💼 Deep Work Session', 'duration': 240, 'type': 'work', 'priority': 'high'},
            {'title': '🧘 Meditation', 'duration': 15, 'type': 'wellness', 'priority': 'medium'},
            {'title': '🌟 Personal Time', 'duration': 120, 'type': 'personal', 'priority': 'low'},
        ]
    }
    
    plan = generator.generate_plan(parsed_intent)
    print(json.dumps(plan, indent=2))
