import api from "./api";

export type PartnerType = 'HIGH_SCHOOL' | 'UNIVERSITY' | 'COMPANY' | 'ORGANIZATION';
export type PartnerSchoolStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_RENEWAL' | 'EXPIRED';
export type MouStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING_RENEWAL' | 'TERMINATED';
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Mou {
  id: number;
  partnerSchoolId: number;
  mouTitle: string;
  signDate: string;
  startDate: string;
  endDate: string;
  status: MouStatus | string;
  discountType: DiscountType | string;
  discountValue: number;
  maxEligibleStudents?: number | null;
  mouDocumentUrl?: string | null;
  scope?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerSchool {
  id: number;
  name: string;
  type: PartnerType | string;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: PartnerSchoolStatus | string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  mous?: Mou[];
  students?: any[];
  _count?: {
    students: number;
    mous: number;
  };
}

export interface PartnerSchoolQueryParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PartnerSchoolStats {
  totalPartners: number;
  activeMousCount: number;
  expiringMousCount: number;
}

export interface PartnerSchoolListResponse {
  data: PartnerSchool[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: PartnerSchoolStats;
}

export interface CreatePartnerSchoolParams {
  name: string;
  type?: PartnerType | string;
  city?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: PartnerSchoolStatus | string;
  notes?: string;
  initialMou?: {
    mouTitle: string;
    signDate?: string;
    startDate: string;
    endDate: string;
    status?: MouStatus | string;
    discountType?: DiscountType | string;
    discountValue?: number;
    maxEligibleStudents?: number;
    mouDocumentUrl?: string;
    scope?: string;
    notes?: string;
  };
}

export interface UpdatePartnerSchoolParams {
  name?: string;
  type?: PartnerType | string;
  city?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: PartnerSchoolStatus | string;
  notes?: string;
}

export interface MouCreateParams {
  mouTitle: string;
  signDate?: string;
  startDate: string;
  endDate: string;
  status?: MouStatus | string;
  discountType?: DiscountType | string;
  discountValue?: number;
  maxEligibleStudents?: number;
  mouDocumentUrl?: string;
  scope?: string;
  notes?: string;
}

export const fetchPartnerSchools = async (
  params?: PartnerSchoolQueryParams
): Promise<PartnerSchoolListResponse> => {
  const response = await api.get("/partner-schools", { params });
  return response.data;
};

export const fetchPartnerSchoolById = async (id: number): Promise<PartnerSchool> => {
  const response = await api.get(`/partner-schools/${id}`);
  return response.data;
};

export const createPartnerSchool = async (
  data: CreatePartnerSchoolParams
): Promise<PartnerSchool> => {
  const response = await api.post("/partner-schools", data);
  return response.data;
};

export const updatePartnerSchool = async (
  id: number,
  data: UpdatePartnerSchoolParams
): Promise<PartnerSchool> => {
  const response = await api.put(`/partner-schools/${id}`, data);
  return response.data;
};

export const deletePartnerSchool = async (
  id: number
): Promise<{ message: string; id: number }> => {
  const response = await api.delete(`/partner-schools/${id}`);
  return response.data;
};

export const addMou = async (
  partnerSchoolId: number,
  data: MouCreateParams
): Promise<Mou> => {
  const response = await api.post(`/partner-schools/${partnerSchoolId}/mous`, data);
  return response.data;
};

export const updateMou = async (
  mouId: number,
  data: Partial<MouCreateParams>
): Promise<Mou> => {
  const response = await api.put(`/partner-schools/mous/${mouId}`, data);
  return response.data;
};

export const deleteMou = async (
  mouId: number
): Promise<{ message: string; id: number }> => {
  const response = await api.delete(`/partner-schools/mous/${mouId}`);
  return response.data;
};
