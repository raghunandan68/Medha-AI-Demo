import json

from services.llm import generate_content


def generate_flashcards(context: str):

    prompt = f"""
Generate EXACTLY 10 flashcards from the study material.

STRICT RULES:

1. Use ONLY the study material.
2. Generate EXACTLY 10 flashcards.
3. Do NOT use external knowledge.
4. Every flashcard must come from the study material.
5. Front should be a question.
6. Back should be the answer.
7. Return ONLY valid JSON.
8. Do NOT return markdown.

FORMAT:

[
    {{
        "front": "Question",
        "back": "Answer"
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
        flashcards = json.loads(response)

        if isinstance(flashcards, list):
            return flashcards

        return []

    except Exception as e:
        print("Flashcard JSON Parse Error:", e)
        return []