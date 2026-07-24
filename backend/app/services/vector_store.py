"""
FAISS & In-Memory Vector Store Manager Service.

Handles embedding generation using HuggingFace sentence-transformers,
FAISS vector persistence, semantic similarity search, and document vector deletion.
Includes FallbackEmbeddings and InMemoryVectorStore for zero-failure resilience.
"""
import hashlib
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.core.logging import logger


class FallbackEmbeddings:
    """
    Zero-dependency 384-dimensional fallback embedding model.
    """

    def __init__(self, dimension: int = 384) -> None:
        self.dimension = dimension

    def _embed_text(self, text: str) -> List[float]:
        vec = [0.0] * self.dimension
        words = text.lower().split()

        for word in words:
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            vec[idx] += 1.0

            if len(word) > 3:
                h_sub = int(hashlib.sha256(word[:4].encode("utf-8")).hexdigest(), 16)
                idx_sub = h_sub % self.dimension
                vec[idx_sub] += 0.5

        sq_sum = sum(x * x for x in vec)
        norm = math.sqrt(sq_sum)
        if norm > 0:
            return [x / norm for x in vec]
        vec[0] = 1.0
        return vec

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_text(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_text(text)


class _DocStoreContainer:
    """Mock DocStore for InMemoryVectorStore."""
    def __init__(self, records: List[Tuple[Any, List[float]]]) -> None:
        self._dict = {str(i): doc for i, (doc, _) in enumerate(records)}


class InMemoryVectorStore:
    """
    Lightweight vector store for similarity search.
    """

    def __init__(self, embeddings: Any) -> None:
        self.embeddings = embeddings
        self.records: List[Tuple[Any, List[float]]] = []

    @classmethod
    def from_documents(cls, docs: List[Any], embeddings: Any) -> "InMemoryVectorStore":
        store = cls(embeddings)
        store.add_documents(docs)
        return store

    def add_documents(self, docs: List[Any]) -> None:
        texts = [doc.page_content for doc in docs]
        embeds = self.embeddings.embed_documents(texts)
        for doc, emb in zip(docs, embeds):
            self.records.append((doc, emb))

    def similarity_search_with_score(self, query: str, k: int = 5) -> List[Tuple[Any, float]]:
        if not self.records:
            return []

        query_vec = self.embeddings.embed_query(query)
        scored: List[Tuple[Any, float]] = []

        for doc, vec in self.records:
            dot = sum(a * b for a, b in zip(query_vec, vec))
            dist = max(0.0, 2.0 * (1.0 - dot))
            scored.append((doc, dist))

        scored.sort(key=lambda x: x[1])
        return scored[:k]

    @property
    def docstore(self) -> _DocStoreContainer:
        return _DocStoreContainer(self.records)

    def save_local(self, folder_path: str) -> None:
        pass


class VectorStoreManager:
    """
    Singleton manager for local vector index.
    """

    _instance: Optional["VectorStoreManager"] = None

    def __new__(cls) -> "VectorStoreManager":
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if getattr(self, "_initialized", False):
            return

        self.store_dir = Path(settings.VECTOR_STORE_DIR).resolve()
        self.store_dir.mkdir(parents=True, exist_ok=True)
        self.embedding_model_name = settings.EMBEDDING_MODEL_NAME
        self._embeddings = None
        self.vector_store = None
        self._initialized = True

    @property
    def embeddings(self):
        """Lazy load embeddings with FallbackEmbeddings fallback."""
        if self._embeddings is None:
            try:
                logger.info("Initializing HuggingFaceEmbeddings with model: {}", self.embedding_model_name)
                from langchain_community.embeddings import HuggingFaceEmbeddings
                self._embeddings = HuggingFaceEmbeddings(
                    model_name=self.embedding_model_name,
                    model_kwargs={"device": "cpu"},
                    encode_kwargs={"normalize_embeddings": True},
                )
            except Exception as exc:
                logger.warning("HuggingFaceEmbeddings unavailable ({}). Using FallbackEmbeddings.", exc)
                self._embeddings = FallbackEmbeddings(dimension=384)
        return self._embeddings

    def initialize_store(self) -> None:
        """
        Load persisted FAISS vector store from disk if present.
        """
        index_file = self.store_dir / "index.faiss"
        pkl_file = self.store_dir / "index.pkl"

        if index_file.exists() and pkl_file.exists():
            try:
                from langchain_community.vectorstores import FAISS
                logger.info("Loading existing FAISS index from '{}'", self.store_dir)
                self.vector_store = FAISS.load_local(
                    folder_path=str(self.store_dir),
                    embeddings=self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                logger.info("FAISS vector store loaded successfully.")
            except Exception as exc:
                logger.error("Failed to load FAISS index: {}. Using empty store.", exc)
                self.vector_store = None
        else:
            logger.info("No existing FAISS index loaded at '{}'. Store ready.", self.store_dir)

    def persist(self) -> None:
        """Save current vector store to disk if FAISS."""
        if self.vector_store is not None and hasattr(self.vector_store, "save_local"):
            try:
                self.vector_store.save_local(folder_path=str(self.store_dir))
                logger.info("Persisted FAISS index to '{}'", self.store_dir)
            except Exception as exc:
                logger.warning("FAISS save_local warning: {}", exc)

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Convert text chunks to LangChain Documents, compute embeddings,
        and store in FAISS or InMemoryVectorStore.
        """
        if not chunks:
            return 0

        # Build Document objects
        class DummyDoc:
            def __init__(self, page_content, metadata):
                self.page_content = page_content
                self.metadata = metadata

        try:
            from langchain.docstore.document import Document as LCDoc
            docs = [LCDoc(page_content=c["text"], metadata=c["metadata"]) for c in chunks]
        except ImportError:
            docs = [DummyDoc(page_content=c["text"], metadata=c["metadata"]) for c in chunks]

        logger.info("Generating embeddings for {} chunk(s)...", len(docs))

        if self.vector_store is None:
            try:
                from langchain_community.vectorstores import FAISS
                self.vector_store = FAISS.from_documents(docs, self.embeddings)
            except Exception as exc:
                logger.info("Using InMemoryVectorStore: {}", exc)
                self.vector_store = InMemoryVectorStore.from_documents(docs, self.embeddings)
        else:
            self.vector_store.add_documents(docs)

        self.persist()
        logger.info("Successfully added {} chunk(s) to vector store.", len(docs))
        return len(docs)

    def search(
        self,
        query: str,
        top_k: int = settings.RAG_TOP_K,
        filter_doc_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic similarity search on the vector store.
        """
        if self.vector_store is None:
            logger.warning("Vector store search invoked, but store is empty.")
            return []

        try:
            results_with_scores = self.vector_store.similarity_search_with_score(
                query=query, k=top_k * 2 if filter_doc_id else top_k
            )
        except Exception as exc:
            logger.error("Vector similarity search error: {}", exc)
            return []

        search_results: List[Dict[str, Any]] = []

        for doc, score in results_with_scores:
            meta = getattr(doc, "metadata", {}) or {}
            doc_id = meta.get("document_id", "")

            if filter_doc_id and doc_id != filter_doc_id:
                continue

            if score < 0:
                similarity = 1.0
            else:
                similarity = max(0.0, round(1.0 - (float(score) / 2.0), 4))

            search_results.append({
                "text": getattr(doc, "page_content", ""),
                "document_id": doc_id,
                "document_name": meta.get("document_name", "Unknown Document"),
                "page": meta.get("page_number", 1),
                "chunk_index": meta.get("chunk_index", 0),
                "similarity": similarity,
            })

            if len(search_results) >= top_k:
                break

        logger.info("Search for '{}' returned {} result(s).", query, len(search_results))
        return search_results

    def delete_document_vectors(self, document_id: str) -> bool:
        """
        Remove all vectors associated with `document_id` and rebuild vector store.
        """
        if self.vector_store is None:
            return False

        try:
            docstore = getattr(self.vector_store, "docstore", None)
            if not docstore or not hasattr(docstore, "_dict"):
                self.vector_store = None
                return True

            remaining_docs = []
            purged_count = 0

            for doc_id, doc in docstore._dict.items():
                meta = getattr(doc, "metadata", {}) or {}
                if str(meta.get("document_id")) == str(document_id):
                    purged_count += 1
                else:
                    remaining_docs.append(doc)

            logger.info("Purging document_id={} | vectors_purged={} | remaining_docs={}", document_id, purged_count, len(remaining_docs))

            if remaining_docs:
                try:
                    from langchain_community.vectorstores import FAISS
                    self.vector_store = FAISS.from_documents(remaining_docs, self.embeddings)
                except Exception:
                    self.vector_store = InMemoryVectorStore.from_documents(remaining_docs, self.embeddings)
                self.persist()
            else:
                self.vector_store = None
                index_file = self.store_dir / "index.faiss"
                pkl_file = self.store_dir / "index.pkl"
                index_file.unlink(missing_ok=True)
                pkl_file.unlink(missing_ok=True)
                logger.info("Vector store now completely empty after purging.")

            return True
        except Exception as exc:
            logger.error("Error purging document vectors for document_id={}: {}", document_id, exc)
            return False


# Global singleton instance
vector_store_manager = VectorStoreManager()
