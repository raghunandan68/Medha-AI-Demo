from fastapi import APIRouter, Depends

from auth.dependencies import get_current_user
from services.retriever import get_retriever
from services.quiz_generator import generate_quiz

router = APIRouter()


@router.get("/quiz")
async def generate_quiz_route(
    current_user=Depends(get_current_user)
):

    print("User:", current_user.email)

    retriever = get_retriever(k=15)

    docs = retriever.invoke(
        "Generate a quiz from the uploaded study material"
    )

    if not docs:
        return {
            "error": "No study material found."
        }

    context = "\n\n".join(
        doc.page_content
        for doc in docs
    )

    quiz = generate_quiz(context)

    return {
        "total_questions": len(quiz) if isinstance(quiz, list) else 0,
        "quiz": quiz
    }