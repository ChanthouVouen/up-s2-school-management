import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';
import Badge from '../../../components/ui/Badge';
import type { ApplicationStatus } from '../../../services/applicationService';

// Small pieces shared by the applications list page and the application detail page,
// so both files can stay focused on their own screen instead of repeating this.

// Once an application reaches one of these, the decision is final (mirrors backend TERMINAL_APPLICATION_STATUSES).
export const TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = ['SCHOOL_APPROVED', 'APPROVED', 'REJECTED', 'ENROLLED'];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef3c7', color: '#a16207' },
  APPROVED: { bg: '#dcfce7', color: '#15803d' },
  SCHOOL_APPROVED: { bg: '#dcfce7', color: '#15803d' },
  ENROLLED: { bg: '#dcfce7', color: '#15803d' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
};

export function label(status: ApplicationStatus) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const isApproved = status === 'APPROVED' || status === 'SCHOOL_APPROVED' || status === 'ENROLLED';
  const icon = isApproved ? <CheckCircle2 size={12} /> : status === 'REJECTED' ? <XCircle size={12} /> : <Clock3 size={12} />;
  const colors = STATUS_COLORS[status] || { bg: '#e0e7ff', color: '#4338ca' };
  return (
    <Badge bg={colors.bg} color={colors.color} icon={icon}>
      {label(status)}
    </Badge>
  );
}

/** Shared page wrapper (sidebar + header) used by both the list and detail pages. */
export function Shell({ children, headerAction, hidePageHeader = false }: { children: ReactNode; headerAction?: ReactNode; hidePageHeader?: boolean }) {
  return (
    <AdminLayout headerAction={headerAction} hidePageHeader={hidePageHeader}>
      {children}
    </AdminLayout>
  );
}

export const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 } as const;
export const heading = { margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontSize: 16 } as const;

/** A simple "label above value" row, used throughout the detail page's info cards. */
export function Info({ label: infoLabel, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px dotted #cbd5e1' }}>
      <div style={{ color: '#64748b', fontSize: 11 }}>{infoLabel}</div>
      <div style={{ color: '#0f172a', fontSize: 13, marginTop: 4 }}>{value}</div>
    </div>
  );
}
