import { apiClient } from './apiClient';

export interface SummaryMetrics {
  total_uploaded_documents: number;
  total_pages_indexed: number;
  total_chunks: number;
  total_embeddings: number;
  total_questions_asked: number;
  avg_response_time_ms: number;
  avg_confidence_score: number;
  system_uptime_seconds: number;
}

export interface MLMetrics {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  cross_val_auc: number;
  approval_rate_pct: number;
  risk_distribution: Record<string, number>;
}

export interface RAGMetrics {
  total_docs: number;
  chunks_created: number;
  embedding_count: number;
  vector_db_size_mb: number;
  avg_retrieval_time_ms: number;
  avg_similarity_score: number;
}

export interface SHAPFeatureImpact {
  feature: string;
  importance_score: number;
  shap_impact: number;
  explanation: string;
}

export interface AnalyticsOverview {
  time_range: string;
  summary: SummaryMetrics;
  ml_analytics: MLMetrics;
  rag_analytics: RAGMetrics;
  shap_explainability: SHAPFeatureImpact[];
  timestamp: string;
}

export interface APIEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchAnalyticsOverview = async (range: string = 'month'): Promise<AnalyticsOverview> => {
  const response = (await apiClient.get(`/analytics/overview?range=${range}`)) as unknown as APIEnvelope<AnalyticsOverview>;
  return response.data;
};
