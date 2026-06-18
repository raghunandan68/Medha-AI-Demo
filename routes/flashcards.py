from fastapi import APIRouter, Depends

from auth.dependencies import get_current_user
from services.retriever import get_retriever
from services.flashcard_generator import generate_flashcards

router = APIRouter()


@router.get("/flashcards")
async def get_flashcards(
    current_user=Depends(get_current_user)
):

    print("User:", current_user.email)

    retriever = get_retriever(k=15)

    docs = retriever.invoke(
        "Generate flashcards from uploaded study material"
    )

    if not docs:
        return {
            "error": "No study material found"
        }

    context = "\n\n".join(
        doc.page_content
        for doc in docs
    )

    flashcards = generate_flashcards(
        context
    )

    return {
        "total_flashcards": len(flashcards),
        "flashcards": flashcards
    }