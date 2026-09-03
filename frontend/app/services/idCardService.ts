import api from "./api";

export interface IdCardData {
  id: number;
  cardNumber: string;
  studentId: number;
  issueDate: string;
  expiryDate: string;
  verificationToken: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED" | string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithIdCard {
  id: number;
  studentCode: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  status: string;
  paymentStatus: string;
  department?: string | null;
  photoUrl?: string | null;
  isEligible: boolean;
  eligibilityReasons: string[];
  idCard?: IdCardData | null;
  applications?: any[];
  partnerSchool?: any;
}

export interface IdCardsQueryParams {
  search?: string;
  statusFilter?: "ALL" | "GENERATED" | "ELIGIBLE" | "INELIGIBLE" | "REVOKED" | string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface IdCardsResponse {
  data: StudentWithIdCard[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalStudents: number;
    totalCardsGenerated: number;
    totalEligible: number;
    totalPendingGeneration: number;
    totalRevoked: number;
  };
}

export interface OrganizationInfo {
  orgName: string;
  slogan?: string | null;
  logoUrl?: string | null;
  primaryEmail?: string | null;
  supportPhone?: string | null;
  websiteUrl?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface IdCardDetailResponse {
  student: StudentWithIdCard;
  organization: OrganizationInfo;
}

export interface VerificationResponse {
  valid: boolean;
  status: "ACTIVE" | "REVOKED" | "EXPIRED" | "NOT_FOUND";
  message: string;
  idCard?: IdCardData;
  student?: any;
  organization?: OrganizationInfo;
  verifiedAt?: string;
}

export const fetchIdCards = async (params?: IdCardsQueryParams): Promise<IdCardsResponse> => {
  const response = await api.get("/id-cards", { params });
  return response.data;
};

export const fetchIdCardByStudentId = async (studentId: number): Promise<IdCardDetailResponse> => {
  const response = await api.get(`/id-cards/${studentId}`);
  return response.data;
};

export const generateIdCard = async (studentId: number, validYears: number = 4): Promise<{ message: string; idCard: IdCardData }> => {
  const response = await api.post("/id-cards/generate", { studentId, validYears });
  return response.data;
};

export const revokeIdCard = async (studentId: number): Promise<{ message: string; idCard: IdCardData }> => {
  const response = await api.post(`/id-cards/${studentId}/revoke`);
  return response.data;
};

export const verifyIdCardToken = async (token: string): Promise<VerificationResponse> => {
  // Use public endpoint without throwing unhandled auth errors
  const response = await api.get(`/id-cards/verify/${token}`);
  return response.data;
};
