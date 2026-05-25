SUMMARY_PROMPT = """You are a study assistant. Create a concise summary in {language} of the following text. Use a bulleted list of {max_points} points. **Use Markdown formatting** for better readability (bold, italic, code blocks if needed). Be brief, highlight only the most important information.

Text: {text}

Summary:"""

SUMMARY_TOPIC_PROMPT = """You are a study assistant. Create a concise educational summary in {language} on the topic "{topic}". Use a bulleted list of {max_points} points. The summary should be informative and well-structured.

Summary:"""
