import api from "./api";

export interface ScholarshipOverview {
  activeSchemesCount: number;
  awardedStudentsCount: number;
  pendingApplicantsCount: number;
  activePartnersCount: number;
  totalQuota: number;
  quotaUtilizationRate: number;
}

export interface SpecialScholarshipCode {
  id: string;
  code: string;
  title: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  discountValue: number;
  description: string;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string;
}

export interface GradeScholarship {
  id: string;
  grade: string;
  title: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  discountValue: number;
  description: string;
  active: boolean;
}

export interface CreateGradeScholarshipPayload {
  grade: string;
  title: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  description?: string;
}

export interface ScholarshipScheme {
  id: string;
  track: "MOU_PARTNER";
  partnerSchoolId: number;
  schoolName: string;
  schoolCity?: string | null;
  schoolType: string;
  logoUrl?: string | null;
  mouTitle: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  discountValue: number;
  maxEligibleStudents?: number | null;
  enrolledCount: number;
  applicationsCount: number;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string | null;
}

export interface ScholarshipBeneficiary {
  id: string;
  rawId: number;
  kind: "STUDENT" | "APPLICANT";
  track: "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER";
  name: string;
  code: string;
  email?: string | null;
  phone?: string | null;
  program: string;
  partnerSchoolId?: number | null;
  partnerSchoolName: string;
  partnerSchoolCity?: string | null;
  discountLabel: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
  discountValue?: number | null;
  status: string;
  paymentStatus?: string | null;
  date: string;
}

export interface AwardScholarshipPayload {
  studentId: number;
  track: "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER";
  partnerSchoolId?: number;
  specialCode?: string;
  gradeLetter?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  notes?: string;
}

export interface CreateScholarshipCodePayload {
  code: string;
  title: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  description?: string;
  maxUses?: number;
  expiresAt?: string;
}

export async function getScholarshipOverview(): Promise<ScholarshipOverview> {
  const response = await api.get("/scholarships/overview");
  return response.data;
}

export async function getScholarshipSchemes(): Promise<{
  data: ScholarshipScheme[];
  specialCodes: SpecialScholarshipCode[];
  gradeScholarships?: GradeScholarship[];
}> {
  const response = await api.get("/scholarships/schemes");
  return response.data;
}

export async function getGradeScholarships(): Promise<{ data: GradeScholarship[] }> {
  const response = await api.get("/scholarships/grades");
  return response.data;
}

export async function createGradeScholarship(
  payload: CreateGradeScholarshipPayload
): Promise<{ message: string; data: GradeScholarship }> {
  const response = await api.post("/scholarships/grades", payload);
  return response.data;
}

export async function updateGradeScholarship(
  id: string,
  payload: Partial<CreateGradeScholarshipPayload> & { active?: boolean }
): Promise<{ message: string; data: GradeScholarship }> {
  const response = await api.put(`/scholarships/grades/${id}`, payload);
  return response.data;
}

export async function deleteGradeScholarship(
  id: string
): Promise<{ message: string; data: GradeScholarship }> {
  const response = await api.delete(`/scholarships/grades/${id}`);
  return response.data;
}

export async function getScholarshipCodes(): Promise<{ data: SpecialScholarshipCode[] }> {
  const response = await api.get("/scholarships/codes");
  return response.data;
}

export async function validateScholarshipCode(
  code: string
): Promise<{ valid: boolean; message: string; data?: SpecialScholarshipCode }> {
  const response = await api.post("/scholarships/validate-code", { code });
  return response.data;
}

export async function createScholarshipCode(
  payload: CreateScholarshipCodePayload
): Promise<{ message: string; data: SpecialScholarshipCode }> {
  const response = await api.post("/scholarships/codes", payload);
  return response.data;
}

export async function updateScholarshipCode(
  id: string,
  payload: Partial<CreateScholarshipCodePayload> & { active?: boolean }
): Promise<{ message: string; data: SpecialScholarshipCode }> {
  const response = await api.put(`/scholarships/codes/${id}`, payload);
  return response.data;
}

export async function deleteScholarshipCode(
  id: string
): Promise<{ message: string; data: SpecialScholarshipCode }> {
  const response = await api.delete(`/scholarships/codes/${id}`);
  return response.data;
}

export async function getScholarshipBeneficiaries(params?: {
  search?: string;
  type?: string;
}): Promise<{ data: ScholarshipBeneficiary[]; total: number }> {
  const response = await api.get("/scholarships/beneficiaries", { params });
  return response.data;
}

export async function awardScholarship(
  payload: AwardScholarshipPayload
): Promise<{ message: string; student: any; description: string }> {
  const response = await api.post("/scholarships/award", payload);
  return response.data;
}

export async function revokeScholarship(
  studentId: number
): Promise<{ message: string }> {
  const response = await api.delete(`/scholarships/beneficiaries/${studentId}`);
  return response.data;
}


