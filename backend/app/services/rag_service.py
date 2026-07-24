"""
RAG Engine & LLM Integration Service.

Combines FAISS vector retrieval with Google Gemini 2.5 Flash LLM generation
to produce accurate, source-backed answers to loan policy queries.
"""
import time
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.logging import logger
from app.services.vector_store import vector_store_manager

# System prompt enforcing strict anti-hallucination and source citation rules
RAG_SYSTEM_PROMPT = """
You are an expert, precise, and professional AI Loan Advisory Agent.

Your primary objective is to assist users by answering questions about loan policies, eligibility, interest rates, documentation, and terms strictly based on the provided context passages from official loan documents.

CRITICAL RULES YOU MUST STRICTLY FOLLOW:
1. ANSWER ONLY USING THE PROVIDED CONTEXT PASSAGES BELOW.
2. DO NOT USE ANY EXTERNAL KNOWLEDGE OR MAKE ASSUMPTIONS.
3. NEVER HALLUCINATE OR SPECULATE.
4. IF THE PROVIDED CONTEXT DOES NOT CONTAIN ENOUGH INFORMATION TO ANSWER THE QUESTION, RESPOND EXACTLY WITH:
   "The uploaded loan documents do not contain enough information to answer this question."
5. ALWAYS CITE SOURCES USING THE DOCUMENT NAME AND PAGE NUMBER PROVIDED IN THE CONTEXT (e.g. "[Source: Home_Loan_Policy.pdf, Page 3]").
6. USE BULLET POINTS AND STRUCTURED FORMATTING WHERE APPROPRIATE.
7. KEEP ANSWERS CONCISE, DIRECT, AND PROFESSIONAL.

---
CONTEXT PASSAGES FROM UPLOADED LOAN POLICY DOCUMENTS:
{context}
---

USER QUESTION:
{question}

DETAILED, ACCURATE SOURCE-BACKED ANSWER:
"""

NOT_ENOUGH_INFO_MSG = "The uploaded loan documents do not contain enough information to answer this question."


class SourceCitation(BaseModel):
    """Source citation structure."""

    document: str = Field(..., description="Document filename.")
    page: int = Field(..., description="Page number where the chunk appears.")
    similarity: float = Field(..., description="Similarity confidence score (0.0 to 1.0).")


class ChatResponsePayload(BaseModel):
    """Payload returned by the Chat RAG endpoint."""

    answer: str = Field(..., description="Generated answer text.")
    sources: List[SourceCitation] = Field(default_factory=list, description="Source citations.")
    confidence: float = Field(..., description="Overall confidence score of the answer.")


async def generate_rag_response(question: str, top_k: int = settings.RAG_TOP_K) -> ChatResponsePayload:
    """
    Execute full RAG pipeline:
      1. Embed question and retrieve top matching chunks from FAISS.
      2. If no chunks found or low similarity, return "not enough info".
      3. Construct prompt with retrieved context.
      4. Call Google Gemini LLM to generate answer.
      5. Calculate confidence score and return response payload.
    """
    start_time = time.time()
    logger.info("Processing RAG query | question='{}'", question)

    # 1. Retrieve top chunks from FAISS
    results = vector_store_manager.search(query=question, top_k=top_k)

    if not results:
        logger.warning("No context chunks retrieved from FAISS for question='{}'", question)
        return ChatResponsePayload(
            answer=NOT_ENOUGH_INFO_MSG,
            sources=[],
            confidence=0.0,
        )

    similarities = [r["similarity"] for r in results]
    avg_similarity = sum(similarities) / len(similarities) if similarities else 0.0

    sources: List[SourceCitation] = []
    seen_sources = set()
    for r in results:
        key = (r["document_name"], r["page"])
        if key not in seen_sources:
            seen_sources.add(key)
            sources.append(
                SourceCitation(
                    document=r["document_name"],
                    page=r["page"],
                    similarity=r["similarity"],
                )
            )

    max_sim = max(similarities) if similarities else 0.0
    if max_sim < 0.25:
        logger.info("Top similarity ({}) below threshold (0.25). Returning fallback.", max_sim)
        return ChatResponsePayload(
            answer=NOT_ENOUGH_INFO_MSG,
            sources=sources,
            confidence=round(max_sim, 2),
        )

    # 2. Build Context String
    context_blocks = []
    for idx, r in enumerate(results, 1):
        block = f"Passage {idx} [Doc: {r['document_name']}, Page {r['page']}]:\n{r['text']}"
        context_blocks.append(block)

    formatted_context = "\n\n".join(context_blocks)
    prompt = RAG_SYSTEM_PROMPT.format(context=formatted_context, question=question)

    # 3. Call Gemini LLM
    api_key = settings.EFFECTIVE_GEMINI_KEY

    if not api_key:
        logger.warning("No GEMINI_API_KEY found in settings. Returning extracted context synthesis fallback.")
        synthesis_lines = [f"Based on official loan policy **{results[0]['document_name']}** (Page {results[0]['page']}):\n"]
        for r in results[:3]:
            synthesis_lines.append(f"• {r['text']}")
        synthesis_text = "\n\n".join(synthesis_lines)
        return ChatResponsePayload(
            answer=synthesis_text,
            sources=sources,
            confidence=round(avg_similarity, 2),
        )

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(settings.GEMINI_MODEL_NAME)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=settings.LLM_TEMPERATURE,
                max_output_tokens=settings.LLM_MAX_TOKENS,
            ),
        )
        answer_text = response.text.strip() if response.text else NOT_ENOUGH_INFO_MSG
        latency_ms = round((time.time() - start_time) * 1000, 2)
        logger.info("Gemini LLM response generated | latency={}ms | length={}", latency_ms, len(answer_text))

        return ChatResponsePayload(
            answer=answer_text,
            sources=sources,
            confidence=round(avg_similarity, 2),
        )

    except Exception as exc:
        logger.error("Gemini API call failed: {}", exc)
        fallback_answer = (
            f"According to loan policy document **{results[0]['document_name']}** (Page {results[0]['page']}):\n\n"
            f"{results[0]['text'][:400]}"
        )
        return ChatResponsePayload(
            answer=fallback_answer,
            sources=sources,
            confidence=round(avg_similarity, 2),
        )
