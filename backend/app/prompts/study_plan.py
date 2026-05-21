STUDY_PLAN_PROMPT = """Create a structured study plan in {language} for the following topics. The student has {available_hours} hours available. Difficulty level: {difficulty}.

Return ONLY a JSON object with:
- "total_hours": total hours in plan
- "sessions": array of objects with "day" (number), "topic" (string), "hours" (number), "tasks" (array of strings)

Topics: {topics}

JSON response:"""
