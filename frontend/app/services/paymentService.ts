import api from "./api";

export interface Payment {
  id: number;
  reference: string;
  studentId: number;
  amount: number;
  method: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string | null;
  createdAt: string;
  student?: { id: number; studentCode: string; name: string; email: string | null };
}

export const getMyPayments = async (): Promise<{ data: Payment[]; paymentStatus: string }> => {
  const res = await api.get<{ data: Payment[]; paymentStatus: string }>("/payments/mine");
  return res.data;
};

export const checkout = async (payload: { amount: number; method: string; description?: string }): Promise<Payment> => {
  const res = await api.post<Payment>("/payments/checkout", payload);
  return res.data;
};

export const getPayments = async (): Promise<Payment[]> => {
  const res = await api.get<{ data: Payment[] }>("/payments");
  return res.data.data;
};
