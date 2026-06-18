from langchain_qdrant import QdrantVectorStore

from services.embeddings import get_embeddings

COLLECTION_NAME = "documents"


def get_retriever(k=3):

    embeddings = get_embeddings()

    vector_store = QdrantVectorStore.from_existing_collection(
        embedding=embeddings,
        path="./qdrant_data",
        collection_name=COLLECTION_NAME
    )

    return vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": k,
            "score_threshold": 0.6
        }
    )