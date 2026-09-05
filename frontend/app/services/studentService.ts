import api from "./api";

export enum StudentStatus {
  ENROLLED = 'ENROLLED',
  PENDING = 'PENDING',
  GRADUATED = 'GRADUATED',
  SUSPENDED = 'SUSPENDED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
}

export interface StudentHistoryItem {
  id: number;
  studentId: number;
  action: string;
  description: string;
  performedBy?: string;
  createdAt: string;
}

export interface Student {
  id: number;
  studentCode: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  status: StudentStatus | string;
  paymentStatus: PaymentStatus | string;
  department?: string | null;
  photoUrl?: string | null;
  partnerSchoolId?: number | null;
  partnerSchool?: any;
  createdAt: string;
  updatedAt: string;
  applications?: any[];
  documents?: any[];
  histories?: StudentHistoryItem[];
  _count?: {
    documents?: number;
    applications?: number;
    histories?: number;
    payments?: number;
  };
}

export interface StudentQueryParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface StudentListResponse {
  data: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StudentCreateParams {
  name: string;
  studentCode?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  status?: string;
  paymentStatus?: string;
  department?: string;
  photoUrl?: string;
  partnerSchoolId?: number | null;
  scholarshipTrack?: "NONE" | "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER" | null;
  specialCode?: string | null;
  gradeLetter?: string | null;
  gradeDiscountValue?: number | null;
  gradeDiscountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
  scholarshipNotes?: string | null;
}

export interface StudentUpdateParams {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  status?: string;
  paymentStatus?: string;
  department?: string;
  photoUrl?: string;
  partnerSchoolId?: number | null;
  scholarshipTrack?: "NONE" | "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER" | null;
  specialCode?: string | null;
  gradeLetter?: string | null;
  gradeDiscountValue?: number | null;
  gradeDiscountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
  scholarshipNotes?: string | null;
}

export const fetchStudents = async (params?: StudentQueryParams): Promise<StudentListResponse> => {
  const response = await api.get("/students", { params });
  return response.data;
};

export const fetchStudentById = async (id: number): Promise<Student> => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

/** The logged-in STUDENT-role user's own profile, application, and enrollment status. */
export const fetchMyProfile = async (): Promise<Student> => {
  const response = await api.get("/students/me");
  return response.data;
};

export const createStudent = async (data: StudentCreateParams): Promise<Student> => {
  const response = await api.post("/students", data);
  return response.data;
};

export const updateStudent = async (id: number, data: StudentUpdateParams): Promise<Student> => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const updateStudentStatus = async (
  id: number,
  payload: { status?: string; paymentStatus?: string }
): Promise<Student> => {
  const response = await api.patch(`/students/${id}/status`, payload);
  return response.data;
};

export const deleteStudent = async (id: number): Promise<{ message: string; id: number }> => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const fetchStudentHistory = async (id: number): Promise<StudentHistoryItem[]> => {
  const response = await api.get(`/students/${id}/history`);
  return response.data;
};
