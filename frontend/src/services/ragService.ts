import { apiClient } from './apiClient';

export interface SourceCitation {
  document: string;
  page: number;
  similarity: number;
}

export interface ChatResponsePayload {
  answer: string;
  sources: SourceCitation[];
  confidence: number;
}

export interface DocumentMetadata {
  page_count: number;
  title?: string;
  author?: string;
  subject?: string;
  creation_date?: string;
  producer?: string;
  file_size: number;
  file_size_mb: number;
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  page_count: number;
  status: string;
  upload_date: string;
  title?: string;
  author?: string;
}

export interface APIEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const sendChatQuery = async (
  question: string,
  topK: number = 5
): Promise<ChatResponsePayload> => {
  const response = (await apiClient.post('/chat', {
    question,
    top_k: topK,
  })) as unknown as APIEnvelope<ChatResponsePayload>;

  return response.data;
};

export const uploadPolicyDocument = async (file: File): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = (await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })) as unknown as APIEnvelope<{ document: DocumentItem }>;

  return response.data.document;
};

export const listPolicyDocuments = async (): Promise<DocumentItem[]> => {
  const response = (await apiClient.get('/documents/')) as unknown as APIEnvelope<DocumentItem[]>;
  return response.data || [];
};

export const deletePolicyDocument = async (documentId: string): Promise<void> => {
  await apiClient.delete(`/documents/${documentId}`);
};
