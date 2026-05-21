FLASHCARD_PROMPT = """Create {num_cards} flashcards in {language} from the following text. Return ONLY a JSON array. Each card must have "front" (question or term) and "back" (answer or definition).

Example format:
[{{"front": "", "back": ""}}]

Text: {text}

JSON response:"""

FLASHCARD_TOPIC_PROMPT = """Create {num_cards} flashcards in {language} on the topic "{topic}". Return ONLY a JSON array. Each card must have "front" (question or term) and "back" (answer or definition).

Example format:
[{{"front": "What is ...", "back": "It is ..."}}]

JSON response:"""
