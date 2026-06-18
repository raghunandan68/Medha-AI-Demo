from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from auth.dependencies import get_current_user

router = APIRouter()


class QuizQuestion(BaseModel):
    question: str
    answer: str


class EvaluationRequest(BaseModel):
    quiz: List[QuizQuestion]
    user_answers: List[str]


@router.post("/evaluate-quiz")
async def evaluate_quiz(
    data: EvaluationRequest,
    current_user=Depends(get_current_user)
):

    score = 0
    results = []

    for q, user_answer in zip(
        data.quiz,
        data.user_answers
    ):

        is_correct = (
            user_answer.strip().lower()
            ==
            q.answer.strip().lower()
        )

        if is_correct:
            score += 1

        results.append(
            {
                "question": q.question,
                "your_answer": user_answer,
                "correct_answer": q.answer,
                "is_correct": is_correct
            }
        )

    percentage = (
        score / len(data.quiz)
    ) * 100 if data.quiz else 0

    return {
        "score": score,
        "total": len(data.quiz),
        "percentage": round(
            percentage,
            2
        ),
        "results": results
    }