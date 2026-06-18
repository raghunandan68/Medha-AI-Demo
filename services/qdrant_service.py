from langchain_qdrant import QdrantVectorStore

from services.embeddings import get_embeddings

COLLECTION_NAME = "documents"

def store_documents(
    chunks,
    user_id,
    filename
):

    embeddings = get_embeddings()

    for chunk in chunks:
        chunk.metadata["user_id"] = user_id
        chunk.metadata["filename"] = filename

    QdrantVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        path="./qdrant_data",
        collection_name=COLLECTION_NAME
    )