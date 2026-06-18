from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth.dependencies import get_current_user
from services.retriever import get_retriever
from services.llm import generate_answer

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_question(
    data: QuestionRequest,
    current_user=Depends(get_current_user)
):

    print("User:", current_user.email)

    retriever = get_retriever()

    docs = retriever.invoke(data.question)

    if not docs:
        return {
            "answer": "No relevant study material found."
        }

    context = "\n\n".join(
        doc.page_content
        for doc in docs
    )

    answer = generate_answer(
        question=data.question,
        context=context
    )

    return {
        "question": data.question,
        "answer": answer,
        "sources": len(docs)
    }