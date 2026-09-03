import api, { API_BASE_URL } from "./api";

export type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type DocumentType = "DIPLOMA" | "ID" | "TRANSCRIPT" | "CERTIFICATE" | "OTHER";

export interface DocumentRecord {
  id: number;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  description?: string | null;
  studentId?: number | null;
  student?: { id: number; studentCode: string; name: string } | null;
  reviewedBy?: string | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  uploadedAt: string;
  updatedAt: string;
  reviews?: DocumentReview[];
}

export interface DocumentReview {
  id: number;
  documentId: number;
  reviewerId: string;
  status: DocumentStatus;
  comment?: string | null;
  uploadedAt: string;
}

interface DocumentListResponse { data: DocumentRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number } }

const unwrap = <T,>(data: T | { data: T }): T =>
  data && typeof data === "object" && "data" in data ? data.data : data;

export const fetchDocuments = async (params?: { search?: string; status?: DocumentStatus; type?: DocumentType; page?: number; limit?: number }) => {
  const response = await api.get<DocumentListResponse>("/documents", { params });
  return response.data;
};

export const fetchDocument = async (id: number) => unwrap((await api.get<DocumentRecord | { data: DocumentRecord }>(`/documents/${id}`)).data);

export const uploadDocument = async (formData: FormData) => unwrap((await api.post<DocumentRecord | { data: DocumentRecord }>("/documents", formData)).data);

export const updateDocument = async (id: number, data: { title?: string; description?: string; type?: DocumentType }) => unwrap((await api.put<DocumentRecord | { data: DocumentRecord }>(`/documents/${id}`, data)).data);

export const reviewDocument = async (id: number, status: Exclude<DocumentStatus, "PENDING">, comment: string) => unwrap((await api.post<DocumentRecord | { data: DocumentRecord }>(`/documents/${id}/review`, { status, comment })).data);

export const deleteDocument = async (id: number) => api.delete(`/documents/${id}`);

export const getDocumentUrl = (fileUrl: string) => fileUrl.startsWith("http") ? fileUrl : `${API_BASE_URL}${fileUrl}`;

export const formatFileSize = (size?: number | null) => {
  if (!size) return "-";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};
