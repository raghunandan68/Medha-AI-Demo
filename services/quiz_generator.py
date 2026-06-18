import json

from services.llm import generate_content


def generate_quiz(context: str):

    prompt = f"""
Generate EXACTLY 10 multiple choice questions from the study material.

STRICT RULES:

1. Use ONLY the provided study material.
2. Generate EXACTLY 10 questions.
3. Each question must have EXACTLY 4 options.
4. Only one option must be correct.
5. Questions must come ONLY from the study material.
6. Correct answers must come ONLY from the study material.
7. Wrong options must also be derived from the study material.
8. Do NOT use external knowledge.
9. Do NOT invent concepts not present in the study material.
10. Return ONLY valid JSON.
11. Do NOT wrap the response inside ```json blocks.

FORMAT:

[
    {{
        "question": "...",
        "options": [
            "...",
            "...",
            "...",
            "..."
        ],
        "answer": "..."
    }}
]

STUDY MATERIAL:

{context}
"""

    response = generate_content(prompt)

    response = response.replace("```json", "")
    response = response.replace("```", "")
    response = response.strip()

    try:
        quiz = json.loads(response)

        if isinstance(quiz, list):
            return quiz

        return {
            "error": "Invalid quiz format returned by Gemini"
        }

    except Exception as e:

        print("Quiz JSON Parse Error:", e)

        return {
            "error": "Failed to parse quiz JSON",
            "raw_response": response
        }