"""
Intent Parser Service
Parses natural language daily intents into structured tasks
"""

import re
from typing import List, Dict, Any
from datetime import datetime, timedelta
import json

class IntentParser:
    """Parse natural language intents into structured tasks"""
    
    # Common patterns for time detection
    TIME_PATTERNS = {
        'minutes': r'(\d+)\s*(?:minutes?|mins?|m\b)',
        'hours': r'(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)',
        'time_range': r'(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)',
        'specific_time': r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?',
        'meal_time': r'(lunch|breakfast|dinner)\s*(?:at|around|about)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?',
    }
    
    # Task type keywords
    TASK_KEYWORDS = {
        'work': ['work', 'meeting', 'code', 'develop', 'project', 'task', 'email', 'call', 'focus'],
        'wellness': ['workout', 'exercise', 'gym', 'run', 'yoga', 'meditate', 'meditation', 'walk', 'stretch'],
        'personal': ['me time', 'relax', 'hobby', 'read', 'personal', 'family', 'friends', 'social'],
        'break': ['break', 'lunch', 'breakfast', 'dinner', 'meal', 'snack', 'rest', 'pause'],
        'learning': ['learn', 'study', 'course', 'tutorial', 'practice', 'skill'],
    }
    
    def parse_intent(self, text: str) -> Dict[str, Any]:
        """
        Parse natural language intent into structured format
        
        Args:
            text: Natural language description of daily intent
            
        Returns:
            Parsed intent with tasks and metadata
        """
        text_lower = text.lower()
        tasks = []
        
        # Extract specific meal times first
        meal_times = self._extract_meal_times(text_lower)
        
        # Check if this is a student schedule request
        student_context = self._extract_student_context(text_lower)
        if student_context:
            # Generate appropriate tasks for a student
            tasks = self._generate_student_tasks(student_context)
        else:
            # Check if this is a professional/employee schedule request
            professional_context = self._extract_professional_context(text_lower)
            if professional_context:
                # Add default lunch time for professional contexts
                if not meal_times:
                    meal_times = {'lunch': '12:30pm'}
                # Generate appropriate tasks for a professional
                tasks = self._generate_professional_tasks(professional_context, meal_times)
            else:
                # Split text into potential task segments
                segments = self._split_into_segments(text_lower)
                for segment in segments:
                    task = self._extract_task_from_segment(segment)
                    if task:
                        tasks.append(task)
                # Add default tasks if certain activities aren't mentioned
                tasks = self._add_wellness_recommendations(tasks, text_lower)
        
        # Calculate total time and adjust if needed
        total_minutes = sum(task['duration'] for task in tasks)
        
        # Include meal times in context
        final_context = student_context if student_context else (professional_context if 'professional_context' in locals() else None)
        if final_context:
            # For professional contexts, preserve default lunch time if no specific meal times found
            if final_context.get('type') == 'professional' and (not meal_times or len(meal_times) == 0):
                final_context['meal_times'] = {'lunch': '12:30pm'}
            else:
                final_context['meal_times'] = meal_times
        
        return {
            'original_text': text,
            'tasks': tasks,
            'total_duration_minutes': total_minutes,
            'total_duration_hours': round(total_minutes / 60, 1),
            'includes_wellness': self._has_wellness_activities(tasks),
            'parsed_at': datetime.now().isoformat(),
            'context': final_context
        }
    
    def _split_into_segments(self, text: str) -> List[str]:
        """Split text into task segments based on common separators"""
        # Split by commas, 'and', periods, or 'then'
        separators = [',', ' and ', '.', ' then ', ';']
        segments = [text]
        
        for sep in separators:
            new_segments = []
            for segment in segments:
                new_segments.extend(segment.split(sep))
            segments = new_segments
        
        # Filter out empty segments
        return [s.strip() for s in segments if s.strip()]
    
    def _extract_task_from_segment(self, segment: str) -> Dict[str, Any]:
        """Extract task information from a text segment"""
        if not segment:
            return None
            
        # Extract duration
        duration = self._extract_duration(segment)
        if duration == 0:
            # If no duration specified, make intelligent guess based on task type
            duration = self._estimate_duration(segment)
        
        # Determine task type
        task_type = self._determine_task_type(segment)
        
        # Extract task title
        title = self._extract_title(segment, task_type)
        
        if not title:
            return None
            
        # Determine priority based on context
        priority = self._determine_priority(segment, task_type)
        
        return {
            'title': title,
            'duration': duration,  # in minutes
            'type': task_type,
            'priority': priority,
            'original_text': segment
        }
    
    def _extract_duration(self, text: str) -> int:
        """Extract duration from text in minutes"""
        total_minutes = 0
        
        # Check for hours
        hours_match = re.search(self.TIME_PATTERNS['hours'], text)
        if hours_match:
            hours = float(hours_match.group(1))
            total_minutes += int(hours * 60)
        
        # Check for minutes
        mins_match = re.search(self.TIME_PATTERNS['minutes'], text)
        if mins_match:
            total_minutes += int(mins_match.group(1))
        
        # Check for time ranges (e.g., "2 to 3 hours")
        range_match = re.search(self.TIME_PATTERNS['time_range'], text)
        if range_match:
            min_hours = float(range_match.group(1))
            max_hours = float(range_match.group(2))
            avg_hours = (min_hours + max_hours) / 2
            total_minutes = int(avg_hours * 60)
        
        return total_minutes
    
    def _estimate_duration(self, text: str) -> int:
        """Estimate duration based on task type when not specified"""
        estimations = {
            'workout': 45,
            'exercise': 45,
            'gym': 60,
            'meditation': 15,
            'meditate': 15,
            'lunch': 60,
            'breakfast': 30,
            'dinner': 60,
            'break': 15,
            'meeting': 60,
            'walk': 20,
            'yoga': 45,
            'read': 30,
            'email': 30,
        }
        
        for keyword, duration in estimations.items():
            if keyword in text:
                return duration
        
        # Default duration for unspecified tasks
        return 30
    
    def _determine_task_type(self, text: str) -> str:
        """Determine the type of task based on keywords"""
        for task_type, keywords in self.TASK_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text:
                    return task_type
        
        # Default to work if no specific type detected
        return 'work'
    
    def _extract_title(self, text: str, task_type: str) -> str:
        """Extract a meaningful title for the task"""
        # Remove duration patterns from text
        title = text
        for pattern in self.TIME_PATTERNS.values():
            title = re.sub(pattern, '', title)
        
        # Remove common filler words
        filler_words = ['want to', 'need to', 'have to', 'planning to', 'going to', 'will', 'for', 'around', 'about', 'some']
        for filler in filler_words:
            title = title.replace(filler, '')
        
        # Clean up and capitalize
        title = ' '.join(title.split())  # Remove extra spaces
        title = title.strip(' .,;')
        
        if not title:
            # Generate title based on task type
            default_titles = {
                'work': 'Work Session',
                'wellness': 'Wellness Activity',
                'personal': 'Personal Time',
                'break': 'Break',
                'learning': 'Learning Session'
            }
            title = default_titles.get(task_type, 'Task')
        
        return title.title()
    
    def _determine_priority(self, text: str, task_type: str) -> str:
        """Determine task priority based on context and type"""
        high_priority_keywords = ['important', 'must', 'critical', 'urgent', 'deadline', 'priority']
        low_priority_keywords = ['maybe', 'if possible', 'optional', 'try to', 'would like']
        
        for keyword in high_priority_keywords:
            if keyword in text:
                return 'high'
        
        for keyword in low_priority_keywords:
            if keyword in text:
                return 'low'
        
        # Default priorities by type
        if task_type == 'work':
            return 'high'
        elif task_type == 'wellness':
            return 'medium'
        elif task_type == 'break':
            return 'medium'
        
        return 'medium'
    
    def _add_wellness_recommendations(self, tasks: List[Dict], original_text: str) -> List[Dict]:
        """Add recommended wellness activities if missing"""
        has_breaks = any(task['type'] == 'break' for task in tasks)
        has_exercise = any(task['type'] == 'wellness' and 'workout' in task['title'].lower() for task in tasks)
        has_meditation = any('meditat' in task['title'].lower() for task in tasks)
        
        # Only add if user hasn't explicitly said "no breaks" or similar
        no_break_indicators = ['no break', 'without break', 'skip break']
        skip_wellness = any(indicator in original_text for indicator in no_break_indicators)
        
        if skip_wellness:
            return tasks
        
        recommendations = []
        
        # Add lunch break if not present and work > 4 hours
        work_duration = sum(t['duration'] for t in tasks if t['type'] == 'work')
        if not has_breaks and work_duration > 240:
            recommendations.append({
                'title': 'Lunch Break',
                'duration': 45,
                'type': 'break',
                'priority': 'medium',
                'original_text': '[auto-added]'
            })
        
        # Add short morning meditation if no meditation present
        if not has_meditation and len(tasks) > 2:
            recommendations.append({
                'title': 'Morning Meditation',
                'duration': 10,
                'type': 'wellness',
                'priority': 'low',
                'original_text': '[recommended]'
            })
        
        # Add stretch break if long work sessions
        if work_duration > 360:
            recommendations.append({
                'title': 'Stretch Break',
                'duration': 5,
                'type': 'wellness',
                'priority': 'low',
                'original_text': '[recommended]'
            })
        
        return tasks + recommendations
    
    def _has_wellness_activities(self, tasks: List[Dict]) -> bool:
        """Check if tasks include wellness activities"""
        wellness_types = ['wellness', 'break']
        return any(task['type'] in wellness_types for task in tasks)
    
    def _extract_student_context(self, text: str) -> Dict[str, Any]:
        """Extract student-related context from text"""
        import re
        
        # Check for student/school related keywords
        student_patterns = [
            r'(\d+)(?:st|nd|rd|th)\s+grad(?:e|er)',  # grade level
            r'school\s+from\s+(\d+[:\.\d]*\s*(?:am|pm)?)',  # school start time
            r'to\s+(\d+[:\.\d]*\s*(?:am|pm)?)',  # school end time
            r'timetable',
            r'schedule',
            r'student',
            r'homework',
            r'study',
            r'grade\s+(\d+)',  # grade level alternative
            r'(\d+)\s+grade'  # grade level alternative
        ]
        
        is_student = False
        grade_level = None
        school_start = None
        school_end = None
        specific_activities = []
        
        # Check for grade level
        grade_match = re.search(r'(\d+)(?:st|nd|rd|th)\s+grad(?:e|er)', text)
        if not grade_match:
            grade_match = re.search(r'grade\s+(\d+)', text)
        if not grade_match:
            grade_match = re.search(r'(\d+)\s+grade', text)
            
        if grade_match:
            is_student = True
            grade_level = int(grade_match.group(1))
        
        # Check for school times - handle both "8:30 to 3:30" and "8 to 5" formats
        school_time_match = re.search(r'school\s+(?:is\s+)?from\s+(\d+(?:[:\.]?\d+)?)\s*(?:am|pm)?\s+to\s+(\d+(?:[:\.]?\d+)?)\s*(?:am|pm)?', text)
        if school_time_match:
            is_student = True
            school_start = school_time_match.group(1)
            school_end = school_time_match.group(2)
            
            # Normalize times and handle single digits
            if '.' in school_start:
                school_start = school_start.replace('.', ':')
            if '.' in school_end:
                school_end = school_end.replace('.', ':')
            
            # Add default minutes if only hour is provided
            if ':' not in school_start:
                school_start = school_start + ':00'
            if ':' not in school_end:
                school_end = school_end + ':00'
            
            # Add AM/PM based on context - school typically starts AM and ends PM
            if 'am' not in school_start and 'pm' not in school_start:
                start_hour = int(school_start.split(':')[0])
                if start_hour >= 6 and start_hour <= 10:  # Typical school start times
                    school_start = school_start + 'am'
            
            if 'am' not in school_end and 'pm' not in school_end:
                end_hour = int(school_end.split(':')[0])
                if end_hour <= 8:  # Likely PM if hour is 8 or less
                    school_end = school_end + 'pm'
                elif end_hour >= 12:  # Already in 24-hour format, convert to PM
                    if end_hour > 12:
                        school_end = f"{end_hour - 12}:00pm"
                    else:
                        school_end = f"{end_hour}:00pm"
        
        # Check for specific student keywords (more precise)
        student_specific_keywords = [
            'student', 'homework', 'grader', 'grade', 'school', 'study time',
            'exam', 'test', 'assignment', 'class', 'teacher', 'education'
        ]
        
        # Exclude work-related contexts
        work_keywords = ['employee', 'work', 'job', 'office', 'company', 'professional', 'career']
        has_work_context = any(keyword in text for keyword in work_keywords)
        
        if not has_work_context and any(keyword in text for keyword in student_specific_keywords):
            is_student = True
        
        # Extract specific activities mentioned
        # Basketball
        basketball_match = re.search(r'basketball\s+for\s+(\d+)\s*(?:min|minutes?)', text)
        if basketball_match:
            specific_activities.append({
                'title': 'Basketball Practice',
                'duration': int(basketball_match.group(1)),
                'type': 'wellness',
                'priority': 'high'
            })
        
        # Math practice
        math_match = re.search(r'practice\s+math\s+for\s+(\d+)\s*(?:min|minutes?)', text)
        if math_match:
            specific_activities.append({
                'title': 'Math Practice',
                'duration': int(math_match.group(1)),
                'type': 'learning',
                'priority': 'high'
            })
        
        # Sleep duration
        sleep_match = re.search(r'sleep\s+(?:for\s+)?(\d+)\s*(?:hours?|hrs?)', text)
        if sleep_match:
            sleep_hours = int(sleep_match.group(1))
            specific_activities.append({
                'title': f'Sleep ({sleep_hours} hours)',
                'duration': sleep_hours * 60,
                'type': 'personal',
                'priority': 'high'
            })
        
        # Workout duration
        workout_match = re.search(r'workout\s+for\s+(\d+)\s*(?:min|minutes?)', text)
        if workout_match:
            specific_activities.append({
                'title': 'Workout Session',
                'duration': int(workout_match.group(1)),
                'type': 'wellness',
                'priority': 'high'
            })
        
        # Learning duration
        learn_match = re.search(r'learn\s+(\w+)\s+for\s+(\d+)\s*(?:hours?|hrs?)', text)
        if learn_match:
            subject = learn_match.group(1)
            hours = int(learn_match.group(2))
            specific_activities.append({
                'title': f'Learn {subject.title()}',
                'duration': hours * 60,
                'type': 'learning',
                'priority': 'high'
            })
        
        # Study duration
        study_match = re.search(r'study\s+for\s+(\d+)\s*(?:hours?|hrs?)', text)
        if study_match:
            hours = int(study_match.group(1))
            specific_activities.append({
                'title': 'Study Session',
                'duration': hours * 60,
                'type': 'learning',
                'priority': 'high'
            })
        
        # Job application duration
        apply_match = re.search(r'apply\s+jobs?\s+for\s+(\d+)\s*(?:hours?|hrs?)', text)
        if apply_match:
            hours = int(apply_match.group(1))
            specific_activities.append({
                'title': 'Job Applications',
                'duration': hours * 60,
                'type': 'work',
                'priority': 'high'
            })
        
        if is_student:
            return {
                'type': 'student',
                'grade_level': grade_level,
                'school_start': school_start or '8:30',
                'school_end': school_end or '3:30pm',
                'needs_homework_time': True,
                'needs_study_time': grade_level >= 7 if grade_level else True,
                'specific_activities': specific_activities
            }
        
        return None
    
    def _generate_student_tasks(self, context: Dict[str, Any]) -> List[Dict]:
        """Generate appropriate tasks for a student based on context"""
        tasks = []
        grade_level = context.get('grade_level', 9)
        specific_activities = context.get('specific_activities', [])
        
        # Morning routine
        tasks.append({
            'title': 'Morning Routine',
            'duration': 45,
            'type': 'personal',
            'priority': 'high',
            'original_text': '[morning routine]'
        })
        
        # School time block
        school_start = context.get('school_start', '8:30')
        school_end = context.get('school_end', '3:30pm')
        
        # Calculate school duration with improved time parsing
        def parse_time_to_hours(time_str):
            """Convert time string to hours (24-hour format)"""
            # Remove am/pm and clean up
            time_clean = time_str.lower().replace('am', '').replace('pm', '').strip()
            
            # Split hour and minute
            if ':' in time_clean:
                hour, minute = time_clean.split(':')
                hour = int(hour)
                minute = int(minute)
            else:
                hour = int(time_clean)
                minute = 0
            
            # Convert to 24-hour format
            if 'pm' in time_str.lower() and hour != 12:
                hour += 12
            elif 'am' in time_str.lower() and hour == 12:
                hour = 0
            
            return hour + (minute / 60)
        
        start_hour = parse_time_to_hours(school_start)
        end_hour = parse_time_to_hours(school_end)
        
        school_duration = int((end_hour - start_hour) * 60)
        
        tasks.append({
            'title': f'School ({school_start} - {school_end})',
            'duration': school_duration,
            'type': 'work',
            'priority': 'high',
            'original_text': '[school time]'
        })
        
        # After school snack break
        tasks.append({
            'title': 'After School Snack',
            'duration': 15,
            'type': 'break',
            'priority': 'medium',
            'original_text': '[snack break]'
        })
        
        # Homework time (varies by grade)
        if grade_level:
            if grade_level <= 5:
                homework_duration = 30
            elif grade_level <= 8:
                homework_duration = 60
            else:
                homework_duration = 90
        else:
            homework_duration = 60
        
        tasks.append({
            'title': 'Homework Time',
            'duration': homework_duration,
            'type': 'work',
            'priority': 'high',
            'original_text': '[homework]'
        })
        
        # Physical activity
        tasks.append({
            'title': 'Physical Activity/Sports',
            'duration': 45,
            'type': 'wellness',
            'priority': 'high',
            'original_text': '[exercise]'
        })
        
        # Dinner
        tasks.append({
            'title': 'Dinner with Family',
            'duration': 45,
            'type': 'break',
            'priority': 'high',
            'original_text': '[dinner]'
        })
        
        # Free time/hobbies
        tasks.append({
            'title': 'Free Time/Hobbies',
            'duration': 60,
            'type': 'personal',
            'priority': 'medium',
            'original_text': '[free time]'
        })
        
        # Study time for older students
        if context.get('needs_study_time'):
            tasks.append({
                'title': 'Study/Reading Time',
                'duration': 30,
                'type': 'learning',
                'priority': 'medium',
                'original_text': '[study time]'
            })
        
        # Evening routine
        tasks.append({
            'title': 'Evening Routine',
            'duration': 30,
            'type': 'personal',
            'priority': 'medium',
            'original_text': '[evening routine]'
        })
        
        # Add specific activities mentioned in the prompt
        for activity in specific_activities:
            tasks.append(activity)
        
        return tasks
    
    def _extract_professional_context(self, text: str) -> Dict[str, Any]:
        """Extract professional/employee-related context from text"""
        import re
        specific_activities = []
        
        # Check for professional keywords
        professional_patterns = [
            r'(?:software\s+)?employee',
            r'professional',
            r'worker',
            r'office\s+worker',
            r'remote\s+worker',
            r'developer',
            r'programmer',
            r'engineer'
        ]
        
        is_professional = False
        work_start = None
        work_end = None
        job_type = None
        
        # Check for professional role
        for pattern in professional_patterns:
            match = re.search(pattern, text)
            if match:
                is_professional = True
                job_type = match.group(0)
                break
        
        # Check for work hours - handle both "works from 9 to 5" and "working 9 to 5"
        work_time_match = re.search(r'work(?:s|ing)?\s+(?:from\s+)?(\d+(?:[:\.]?\d+)?)\s*(?:am|pm)?\s+to\s+(\d+(?:[:\.]?\d+)?)\s*(?:am|pm)?', text)
        if work_time_match:
            is_professional = True
            work_start = work_time_match.group(1)
            work_end = work_time_match.group(2)
            
            # Normalize and add AM/PM
            if ':' not in work_start:
                work_start = work_start + ':00'
            if ':' not in work_end:
                work_end = work_end + ':00'
            
            # Add AM/PM based on typical work hours
            if 'am' not in work_start and 'pm' not in work_start:
                start_hour = int(work_start.split(':')[0])
                if start_hour >= 6 and start_hour <= 11:
                    work_start = work_start + 'am'
                elif start_hour == 9:  # 9 is typically 9am for work
                    work_start = work_start + 'am'
            
            if 'am' not in work_end and 'pm' not in work_end:
                end_hour = int(work_end.split(':')[0])
                if end_hour <= 8 or end_hour == 5:  # 5 is typically 5pm for work
                    work_end = work_end + 'pm'
        
        # Extract specific activities mentioned
        # Workout duration
        workout_match = re.search(r'workout\s+for\s+(\d+)\s*(?:min|minutes?)', text)
        if workout_match:
            specific_activities.append({
                'title': 'Workout Session',
                'duration': int(workout_match.group(1)),
                'type': 'wellness',
                'priority': 'high'
            })
        
        # Learning duration
        learn_match = re.search(r'learn\s+(\w+)\s+for\s+(\d+)\s*(?:hours?|hrs?)', text)
        if learn_match:
            subject = learn_match.group(1)
            hours = int(learn_match.group(2))
            specific_activities.append({
                'title': f'Learn {subject.title()}',
                'duration': hours * 60,
                'type': 'learning',
                'priority': 'high'
            })
        
        # Sleep duration
        sleep_match = re.search(r'sleep\s+(?:for\s+)?(\d+)\s*(?:hours?|hrs?)', text)
        if sleep_match:
            sleep_hours = int(sleep_match.group(1))
            specific_activities.append({
                'title': f'Sleep ({sleep_hours} hours)',
                'duration': sleep_hours * 60,
                'type': 'personal',
                'priority': 'high'
            })
        
        if is_professional:
            return {
                'type': 'professional',
                'job_type': job_type or 'employee',
                'work_start': work_start or '9:00am',
                'work_end': work_end or '5:00pm',
                'remote_work': 'remote' in text,
                'has_commute': 'commute' in text or 'travel' in text,
                'specific_activities': specific_activities,
                'original_text': text
            }
        
        return None
    
    def _generate_professional_tasks(self, context: Dict[str, Any], meal_times: Dict[str, str] = None) -> List[Dict]:
        """Generate appropriate tasks for a professional based on context"""
        tasks = []
        job_type = context.get('job_type', 'employee')
        work_start = context.get('work_start', '9:00am')
        work_end = context.get('work_end', '5:00pm')
        remote_work = context.get('remote_work', False)
        specific_activities = context.get('specific_activities', [])
        
        # Extract specific requirements from the original text
        original_text = context.get('original_text', '')
        workout_duration = self._extract_workout_duration(original_text)
        sleep_duration = self._extract_sleep_duration(original_text)
        
        # Morning routine (professional)
        tasks.append({
            'title': 'Morning Routine',
            'duration': 60,
            'type': 'personal',
            'priority': 'high',
            'original_text': '[morning routine]'
        })
        
        # Commute or setup time
        if remote_work:
            tasks.append({
                'title': 'Setup Home Office',
                'duration': 15,
                'type': 'work',
                'priority': 'high',
                'original_text': '[setup time]'
            })
        else:
            tasks.append({
                'title': 'Commute to Work',
                'duration': 30,
                'type': 'personal',
                'priority': 'high',
                'original_text': '[commute]'
            })
        
        # Work block - split by lunch time if specified
        work_duration = self._calculate_time_difference(work_start, work_end)
        # Use meal_times from context if not provided as parameter
        meal_times = meal_times or context.get('meal_times', {})
        
        if 'lunch' in meal_times:
            # Split work day around lunch time
            lunch_time = meal_times['lunch']
            # Add morning work block
            morning_work_duration = self._calculate_morning_work_duration(work_start, lunch_time)
            if morning_work_duration > 0:
                tasks.append({
                    'title': f'Work ({work_start} - {lunch_time})',
                    'duration': morning_work_duration,
                    'type': 'work',
                    'priority': 'high',
                    'original_text': '[work time]'
                })
            
            # Add lunch break
            tasks.append({
                'title': 'Lunch Break',
                'duration': 45,
                'type': 'break',
                'priority': 'medium',
                'original_text': '[lunch]'
            })
            
            # Add afternoon work block
            afternoon_work_duration = self._calculate_afternoon_work_duration(lunch_time, work_end)
            if afternoon_work_duration > 0:
                tasks.append({
                    'title': f'Work ({lunch_time} - {work_end})',
                    'duration': afternoon_work_duration,
                    'type': 'work',
                    'priority': 'high',
                    'original_text': '[work time]'
                })
        else:
            # No specific lunch time - add full work block
            tasks.append({
                'title': f'Work ({work_start} - {work_end})',
                'duration': work_duration,
                'type': 'work',
                'priority': 'high',
                'original_text': '[work time]'
            })
        
        # Post-work routine
        if not remote_work:
            tasks.append({
                'title': 'Commute Home',
                'duration': 30,
                'type': 'personal',
                'priority': 'medium',
                'original_text': '[commute home]'
            })
        
        # Evening exercise/wellness
        tasks.append({
            'title': 'Exercise/Gym Session',
            'duration': workout_duration,
            'type': 'wellness',
            'priority': 'high',
            'original_text': '[exercise]'
        })
        
        # Dinner
        tasks.append({
            'title': 'Dinner',
            'duration': 45,
            'type': 'break',
            'priority': 'medium',
            'original_text': '[dinner]'
        })
        
        # Personal development (especially for tech roles)
        if 'software' in job_type or 'developer' in job_type or 'engineer' in job_type:
            tasks.append({
                'title': 'Personal Learning/Side Projects',
                'duration': 90,
                'type': 'learning',
                'priority': 'medium',
                'original_text': '[learning]'
            })
        else:
            tasks.append({
                'title': 'Personal Time/Hobbies',
                'duration': 90,
                'type': 'personal',
                'priority': 'medium',
                'original_text': '[personal time]'
            })
        
        # Evening routine
        tasks.append({
            'title': 'Evening Routine',
            'duration': 30,
            'type': 'personal',
            'priority': 'medium',
            'original_text': '[evening routine]'
        })
        
        # Sleep - add as a note for planning purposes
        if sleep_duration > 0:
            tasks.append({
                'title': f'Sleep ({sleep_duration} hours)',
                'duration': sleep_duration * 60,  # Convert hours to minutes
                'type': 'personal',
                'priority': 'high',
                'original_text': '[sleep]'
            })
        
        # Add specific activities mentioned in the prompt
        for activity in specific_activities:
            tasks.append(activity)
        
        return tasks
    
    def _extract_meal_times(self, text: str) -> Dict[str, str]:
        """Extract specific meal times from text"""
        meal_times = {}
        
        # Pattern for meal times like "lunch at 1pm", "lunch at 1:00pm", "dinner at 7pm"
        meal_pattern = r'(lunch|breakfast|dinner)\s*(?:at|around|about)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?'
        matches = re.finditer(meal_pattern, text, re.IGNORECASE)
        
        for match in matches:
            meal_type = match.group(1).lower()
            hour = int(match.group(2))
            minute = int(match.group(3)) if match.group(3) else 0
            period = match.group(4).lower() if match.group(4) else 'pm' if meal_type == 'lunch' else 'am'
            
            # Convert to 24-hour format
            if period == 'pm' and hour != 12:
                hour += 12
            elif period == 'am' and hour == 12:
                hour = 0
            
            # Format as time string
            time_str = f"{hour:02d}:{minute:02d}"
            meal_times[meal_type] = time_str
        
        return meal_times

    def _calculate_morning_work_duration(self, work_start: str, lunch_time: str) -> int:
        """Calculate work duration from start to lunch time"""
        # Convert times to minutes since midnight
        start_minutes = self._time_to_minutes(work_start)
        lunch_minutes = self._time_to_minutes(lunch_time)
        
        if start_minutes < lunch_minutes:
            return lunch_minutes - start_minutes
        return 0
    
    def _calculate_afternoon_work_duration(self, lunch_time: str, work_end: str) -> int:
        """Calculate work duration from lunch end to work end"""
        # Add 45 minutes for lunch duration
        lunch_end_minutes = self._time_to_minutes(lunch_time) + 45
        end_minutes = self._time_to_minutes(work_end)
        
        if lunch_end_minutes < end_minutes:
            return end_minutes - lunch_end_minutes
        return 0
    
    def _time_to_minutes(self, time_str: str) -> int:
        """Convert time string to minutes since midnight"""
        # Handle formats like "9:00am", "13:00", "1pm"
        original_time_str = time_str.lower().strip()
        time_str = original_time_str
        
        # Check for AM/PM first
        is_pm = 'pm' in time_str
        is_am = 'am' in time_str
        
        # Remove common suffixes
        time_str = time_str.replace('am', '').replace('pm', '').strip()
        
        if ':' in time_str:
            hour, minute = time_str.split(':')
            hour = int(hour)
            minute = int(minute)
        else:
            hour = int(time_str)
            minute = 0
        
        # Convert to 24-hour format
        if is_pm and hour != 12:
            hour += 12
        elif is_am and hour == 12:
            hour = 0
        elif not is_am and not is_pm:
            # If no AM/PM specified, assume it's already in 24-hour format if hour > 12
            # Otherwise, assume PM if it's a reasonable work time
            if hour < 12 and hour != 0:
                # For work times like "5" without AM/PM, assume PM
                if hour <= 5:  # 1pm to 5pm range
                    hour += 12
        
        return hour * 60 + minute

    def _extract_workout_duration(self, text: str) -> int:
        """Extract workout duration from text in minutes"""
        # Look for workout patterns with duration
        workout_patterns = [
            r'workout\s+(?:for\s+)?(\d+)\s*(?:min|minutes?|mins?)',
            r'exercise\s+(?:for\s+)?(\d+)\s*(?:min|minutes?|mins?)',
            r'gym\s+(?:for\s+)?(\d+)\s*(?:min|minutes?|mins?)',
            r'(\d+)\s*(?:min|minutes?|mins?)\s+workout',
            r'(\d+)\s*(?:min|minutes?|mins?)\s+exercise'
        ]
        
        for pattern in workout_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 30  # Default workout duration

    def _extract_sleep_duration(self, text: str) -> int:
        """Extract sleep duration from text in hours"""
        # Look for sleep patterns with duration
        sleep_patterns = [
            r'sleep\s+(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)',
            r'(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\s+sleep',
            r'sleep\s+(\d+)\s*(?:hrs?|hours?)',
            r'(\d+)\s*(?:hrs?|hours?)\s+sleep'
        ]
        
        for pattern in sleep_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(float(match.group(1)))
        
        return 8  # Default sleep duration

    def _calculate_time_difference(self, start_time: str, end_time: str) -> int:
        """Calculate duration in minutes between two times"""
        # Use the new time conversion method
        start_minutes = self._time_to_minutes(start_time)
        end_minutes = self._time_to_minutes(end_time)
        
        if start_minutes < end_minutes:
            return end_minutes - start_minutes
        else:
            # Handle overnight scenarios
            return (24 * 60) - start_minutes + end_minutes


# Example usage and testing
if __name__ == "__main__":
    parser = IntentParser()
    
    # Test examples
    test_intents = [
        "I want to workout for 30 minutes in the morning, work for 8 hours with breaks, meditate for 15 minutes, and have 2 hours of me time in the evening. Lunch around 1pm.",
        "Start with yoga, then 4 hours of deep work, lunch break, 3 more hours of work, and end with reading",
        "Morning gym session, meetings from 9 to 12, lunch, coding from 1 to 5pm, dinner with family",
    ]
    
    for intent in test_intents:
        print(f"\nOriginal: {intent}")
        parsed = parser.parse_intent(intent)
        print(f"Parsed: {json.dumps(parsed, indent=2)}")
