import api from "./api";

export type InquiryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Inquiry {
  id: number;
  studentId: number | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  response: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: number; studentCode: string; name: string };
}

export const submitPublicInquiry = async (payload: { name: string; email: string; subject: string; message: string }) => {
  const res = await api.post<{ message: string; id: number }>("/inquiries/public", payload);
  return res.data;
};

export const submitInquiry = async (payload: { subject: string; message: string }): Promise<Inquiry> => {
  const res = await api.post<Inquiry>("/inquiries", payload);
  return res.data;
};

export const getMyInquiries = async (): Promise<Inquiry[]> => {
  const res = await api.get<{ data: Inquiry[] }>("/inquiries/mine");
  return res.data.data;
};

export const getInquiries = async (): Promise<Inquiry[]> => {
  const res = await api.get<{ data: Inquiry[] }>("/inquiries");
  return res.data.data;
};

export const respondToInquiry = async (id: number, payload: { status?: InquiryStatus; response?: string }): Promise<Inquiry> => {
  const res = await api.patch<Inquiry>(`/inquiries/${id}`, payload);
  return res.data;
};
