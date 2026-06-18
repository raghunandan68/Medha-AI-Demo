import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(
    api_key=os.getenv("GOOGLE_API_KEY")
)

MODEL_NAME = "gemini-2.5-flash"

model = genai.GenerativeModel(
    MODEL_NAME
)


def generate_answer(question: str, context: str):

    prompt = f"""
You are StudyMate-RAG, an exam preparation assistant.

Your job is to answer ONLY from the retrieved study material.

STRICT RULES:

- Use ONLY the information present in CONTEXT.
- Never use your own knowledge.
- Never add extra facts.
- Never guess.
- Never make assumptions.
- If the answer is not clearly available in the context, return EXACTLY:

This question is outside the scope of your uploaded study material.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""

    response = model.generate_content(prompt)

    return response.text.strip()


def generate_content(prompt: str):
    """
    Generic Gemini content generation.
    Used for flashcards, quizzes, summaries, notes, etc.
    """

    response = model.generate_content(prompt)

    return response.text.strip()