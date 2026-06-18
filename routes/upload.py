from fastapi import APIRouter, UploadFile, Depends
import tempfile
import os
import uuid

from auth.dependencies import get_current_user
from auth.supabase_client import supabase

from services.pdf_loader import load_pdf
from services.chunking import split_documents
from services.qdrant_service import store_documents

router = APIRouter()


@router.post("/upload")
async def upload_pdf(
    file: UploadFile,
    current_user=Depends(get_current_user)
):

    print("User ID:", current_user.id)
    print("Email:", current_user.email)

    # Read uploaded file
    file_content = await file.read()

    # Create unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Storage path
    storage_path = f"{current_user.id}/{unique_filename}"

    print("Storage Path:", storage_path)

    try:
        # Upload PDF to Supabase Storage
        supabase.storage.from_("Documents").upload(
            storage_path,
            file_content,
            {"content-type": "application/pdf"}
        )

    except Exception as e:
        return {
            "error": f"Storage upload failed: {str(e)}"
        }

    # Create document record
    document = supabase.table("documents").insert(
        {
            "user_id": current_user.id,
            "chat_id": 2,
            "file_name": file.filename,
            "file_url": storage_path,
            "status": "processing"
        }
    ).execute()

    document_id = document.data[0]["id"]

    # Create temporary file for PDF processing
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(file_content)
        temp_path = temp_file.name

    try:

        # Load PDF
        docs = load_pdf(temp_path)

        print(f"Pages Loaded: {len(docs)}")

        # Chunk PDF
        chunks = split_documents(docs)

        print(f"Chunks Created: {len(chunks)}")

        # Store embeddings in Qdrant
        store_documents(
            chunks,
            current_user.id,
            file.filename
        )

        # Mark document as ready
        supabase.table("documents").update(
            {
                "status": "ready"
            }
        ).eq(
            "id",
            document_id
        ).execute()

        return {
            "message": "PDF processed successfully",
            "document_id": document_id,
            "filename": file.filename,
            "pages": len(docs),
            "chunks": len(chunks)
        }

    except Exception as e:

        print("Processing Error:", str(e))

        # Mark document as failed
        supabase.table("documents").update(
            {
                "status": "error"
            }
        ).eq(
            "id",
            document_id
        ).execute()

        return {
            "error": str(e)
        }

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)