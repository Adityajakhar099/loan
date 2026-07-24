"""
Chat API Router for RAG Policy Queries.

POST /api/v1/chat — Accepts user questions, retrieves policy chunks from FAISS,
and generates source-backed answers using Google Gemini LLM.
"""
from typing import Optional

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.logging import logger
from app.schemas.response import APIResponse, success_response
from app.services.rag_service import ChatResponsePayload, generate_rag_response

router = APIRouter(prefix="/chat", tags=["Chat & RAG Advisory"])


class ChatQueryRequest(BaseModel):
    """Input payload for the Chat API endpoint."""

    question: str = Field(
        ...,
        min_length=3,
        max_length=1000,
        description="Loan policy question in natural language.",
        examples=["What is the maximum loan-to-value (LTV) ratio for home loans?"],
    )
    top_k: Optional[int] = Field(
        default=settings.RAG_TOP_K,
        ge=1,
        le=20,
        description="Number of top document passages to retrieve.",
    )


@router.post(
    "",
    response_model=APIResponse[ChatResponsePayload],
    status_code=status.HTTP_200_OK,
    summary="Ask a loan policy question (RAG Chat)",
    description=(
        "Performs semantic similarity search against uploaded loan policies in FAISS, "
        "constructs context-backed prompts, and generates source-cited answers via Gemini LLM."
    ),
)
@router.post(
    "/",
    response_model=APIResponse[ChatResponsePayload],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
async def chat_query(body: ChatQueryRequest) -> APIResponse[ChatResponsePayload]:
    """
    Process a loan advisory question and return a source-backed answer.
    """
    logger.info("Received chat query: '{}'", body.question)

    top_k = body.top_k or settings.RAG_TOP_K
    response_payload = await generate_rag_response(question=body.question, top_k=top_k)

    return success_response(
        data=response_payload,
        message="Response generated successfully.",
        status_code=status.HTTP_200_OK,
    )
