QUIZ_PROMPT = """Create {num_questions} multiple-choice quiz questions at {difficulty} difficulty level in {language} from the following text. Each question must have 4 options and include an "explanation" field explaining why the correct answer is right.

Return ONLY a JSON array. Each item: {{"question": "", "options": ["A","B","C","D"], "correct": 0, "explanation": ""}}

Text: {text}

JSON response:"""

QUIZ_TOPIC_PROMPT = """Create {num_questions} multiple-choice quiz questions at {difficulty} difficulty level in {language} on the topic "{topic}". Each question must have 4 options and include an "explanation" field explaining why the correct answer is right.

Return ONLY a JSON array. Each item: {{"question": "", "options": ["A","B","C","D"], "correct": 0, "explanation": ""}}

JSON response:"""
