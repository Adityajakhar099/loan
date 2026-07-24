import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import {
  DocumentItem,
  listPolicyDocuments,
  uploadPolicyDocument,
  deletePolicyDocument,
} from '../../services/ragService';
import { useToast } from '../../hooks/useToast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded?: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentUploaded,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await listPolicyDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Only PDF files are supported for policy ingestion.', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds the 20MB limit.', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadedDoc = await uploadPolicyDocument(file);
      showToast(`Policy '${uploadedDoc.original_filename}' ingested successfully!`, 'success');
      await fetchDocuments();
      if (onDocumentUploaded) onDocumentUploaded();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to upload and index document.';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    try {
      await deletePolicyDocument(docId);
      showToast(`Removed policy '${filename}' and purged vector store embeddings.`, 'info');
      await fetchDocuments();
    } catch (err) {
      showToast('Failed to delete document.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Policy Document Ingestion Center
            </h3>
            <p className="text-xs text-slate-400">
              Upload institutional guidelines to index into the FAISS vector database.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 p-6 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
            dragActive
              ? 'border-sky-400 bg-sky-500/10 scale-[0.99]'
              : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="text-xs font-semibold text-sky-300">
                Extracting text & generating 384-dim vector embeddings...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Click or drag & drop PDF loan guidelines here
              </span>
              <span className="text-xs text-slate-400">
                Supports PyMuPDF extraction up to 20MB per document
              </span>
            </div>
          )}
        </div>

        {/* Ingested Documents List */}
        <div className="mt-6 flex-1 overflow-y-auto pr-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ingested Guideline Manuals ({documents.length})
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              Loading vector registry...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
              <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No policy documents ingested yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Upload a loan policy PDF to enable custom RAG retrieval.
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h5 className="font-semibold text-slate-200 truncate">{doc.original_filename}</h5>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{doc.page_count} Pages</span>
                      <span>•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> FAISS Vector Index
                      </span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.original_filename)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-3 shrink-0"
                  title="Remove document & purge vector store"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Center
          </Button>
        </div>
      </div>
    </div>
  );
};
