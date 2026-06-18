from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.auth_routes import router as auth_router
from routes.upload import router as upload_router
from routes.chat import router as chat_router
from routes.flashcards import router as flashcards_router
from routes.quiz import router as quiz_router
from routes.evaluate_quiz import router as evaluate_quiz_router



app = FastAPI(
    title="Medha AI Backend"
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(flashcards_router)
app.include_router(quiz_router)
app.include_router(evaluate_quiz_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Medha AI Backend Running"
    }