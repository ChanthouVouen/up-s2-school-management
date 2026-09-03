import api from "./api";

export type DocumentType = "DIPLOMA" | "ID" | "TRANSCRIPT" | "CERTIFICATE" | "OTHER";
export type DocumentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface StudentDocument {
  id: number;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl: string | null;
  studentId: number | null;
  createdAt: string;
  student?: { id: number; studentCode: string; name: string; email: string | null };
}

export const getMyDocuments = async (): Promise<StudentDocument[]> => {
  const res = await api.get<{ data: StudentDocument[] }>("/documents/mine");
  return res.data.data;
};

export const submitDocument = async (payload: { title: string; type: DocumentType; file: string }): Promise<StudentDocument> => {
  const res = await api.post<StudentDocument>("/documents", payload);
  return res.data;
};

export const getDocuments = async (params?: { status?: DocumentStatus; studentId?: number }): Promise<StudentDocument[]> => {
  const res = await api.get<{ data: StudentDocument[] }>("/documents", { params });
  return res.data.data;
};

export const updateDocumentStatus = async (id: number, status: DocumentStatus): Promise<StudentDocument> => {
  const res = await api.patch<StudentDocument>(`/documents/${id}/status`, { status });
  return res.data;
};
