import api from './api';

export type ApplicationStatus = 'REGISTRATION' | 'DOCUMENT_SUBMISSION' | 'DOCUMENT_REVIEW' | 'DOCUMENTS_APPROVED' | 'SCHOLARSHIP_APPLICATION' | 'APPLICATION_SUBMITTED' | 'SCHOOL_REVIEW' | 'SCHOOL_APPROVED' | 'PAYMENT' | 'ENROLLED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Application {
  id: number;
  applicationCode: string;
  applicantName: string;
  email: string;
  program: string;
  applicationDate: string;
  status: ApplicationStatus;
  studentId: number | null;
  partnerSchoolId: number | null;
  partnerSchool?: { id: number; name: string; city: string | null } | null;
  responsibleStaffId: string | null;
  responsibleStaff?: { id: string; name: string; email: string } | null;
  scholarshipRequested: boolean;
  scholarshipDetails: string | null;
  notes: string | null;
  approvalResult: string | null;
  createdAt: string;
  student?: { id: number; studentCode: string; name: string; email: string | null } | null;
}

export async function fetchApplications(params?: { search?: string; status?: string }) {
  const response = await api.get<{ data: Application[] }>('/applications', { params });
  return response.data;
}

export async function fetchApplicationById(id: number) {
  const response = await api.get<Application>(`/applications/${id}`);
  return response.data;
}

export async function createApplication(data: Partial<Pick<Application, 'studentId' | 'partnerSchoolId' | 'scholarshipRequested' | 'scholarshipDetails' | 'notes'>> & Pick<Application, 'applicantName' | 'email' | 'program'>) {
  const response = await api.post<Application>('/applications', data);
  return response.data;
}

export async function updateApplicationStatus(id: number, status: ApplicationStatus) {
  const response = await api.patch<Application>(`/applications/${id}/status`, { status });
  return response.data;
}
