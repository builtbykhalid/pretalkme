import os
from qdrant_client import QdrantClient
from qdrant_client.http import models

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = "pretalk_kb"

client = QdrantClient(url=QDRANT_URL)

async def search_kb(tenant_id: str, query_vector: list, limit: int = 3):
    """Search the tenant's knowledge base for relevant context."""
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="tenant_id",
                    match=models.MatchValue(value=tenant_id),
                )
            ]
        ),
        limit=limit,
    )
    return [res.payload for res in results]

async def upsert_kb(tenant_id: str, text: str, vector: list, metadata: dict = None):
    """Index new information into the knowledge base."""
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=os.urandom(16).hex(),
                vector=vector,
                payload={
                    "tenant_id": tenant_id,
                    "text": text,
                    **(metadata or {})
                }
            )
        ]
    )
