import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Award, CheckCircle2, Clock3, Eye, FileText, Plus, Search, XCircle } from 'lucide-react';
import AdminLayout from '../../../layouts/AdminLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { useAuth } from '../../../auth/AuthContext';
import { PERMISSIONS } from '../../../types/permissions';
import {
  Application,
  ApplicationStatus,
  createApplication,
  fetchApplicationById,
  fetchApplications,
  updateApplicationStatus,
} from '../../../services/applicationService';
import { fetchPartnerSchools, PartnerSchool } from '../../../services/partnerSchoolService';
import { getPayments, type Payment } from '../../../services/paymentService';
import { awardScholarship, type AwardScholarshipPayload } from '../../../services/scholarshipService';
import { PROGRAMS as PROGRAMMES } from '../../../constants/programs';

// Once an application reaches one of these, the decision is final (mirrors backend TERMINAL_APPLICATION_STATUSES).
const TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = ['SCHOOL_APPROVED', 'APPROVED', 'REJECTED', 'ENROLLED'];

const colors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef3c7', color: '#a16207' },
  APPROVED: { bg: '#dcfce7', color: '#15803d' },
  SCHOOL_APPROVED: { bg: '#dcfce7', color: '#15803d' },
  ENROLLED: { bg: '#dcfce7', color: '#15803d' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
};
const label = (status: ApplicationStatus) => status.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const icon = status === 'APPROVED' || status === 'SCHOOL_APPROVED' || status === 'ENROLLED' ? <CheckCircle2 size={12} /> : status === 'REJECTED' ? <XCircle size={12} /> : <Clock3 size={12} />;
  return <Badge {...(colors[status] || { bg: '#e0e7ff', color: '#4338ca' })} icon={icon}>{label(status)}</Badge>;
}

function Shell({ children, headerAction, hidePageHeader = false }: { children: ReactNode; headerAction?: ReactNode; hidePageHeader?: boolean }) {
  return <AdminLayout headerAction={headerAction} hidePageHeader={hidePageHeader}>{children}</AdminLayout>;
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchool[]>([]);
  const [form, setForm] = useState({ applicantName: '', email: '', program: '', partnerSchoolId: '', scholarshipRequested: false, scholarshipDetails: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try { setApplications((await fetchApplications({ search, status })).data); setError(''); }
    catch { setError('Applications could not be loaded. Check that the API is running.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); fetchPartnerSchools({ limit: 100 }).then(response => setPartnerSchools(response.data)).catch(() => setPartnerSchools([])); }, [search, status]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createApplication({
      applicantName: form.applicantName,
      email: form.email,
      program: form.program,
      partnerSchoolId: form.partnerSchoolId ? Number(form.partnerSchoolId) : null,
      scholarshipRequested: form.scholarshipRequested,
      scholarshipDetails: form.scholarshipDetails || null,
      notes: form.notes || null,
    });
    setCreateOpen(false);
    setForm({ applicantName: '', email: '', program: '', partnerSchoolId: '', scholarshipRequested: false, scholarshipDetails: '', notes: '' });
    load();
  };

  return <Shell headerAction={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>New application</Button>}>
    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
      <div style={{ position: 'relative', flex: 1 }}><Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant, email, or program" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', border: '1px solid #cbd5e1', borderRadius: 8 }} /></div>
      <select value={status} onChange={e => setStatus(e.target.value)} style={{ minWidth: 180, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px' }}><option value="">All statuses</option>{['REGISTRATION', 'DOCUMENT_SUBMISSION', 'DOCUMENT_REVIEW', 'DOCUMENTS_APPROVED', 'SCHOLARSHIP_APPLICATION', 'APPLICATION_SUBMITTED', 'SCHOOL_REVIEW', 'SCHOOL_APPROVED', 'PAYMENT', 'ENROLLED', 'PENDING', 'APPROVED', 'REJECTED'].map(value => <option key={value} value={value}>{label(value as ApplicationStatus)}</option>)}</select>
    </div>
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
      {loading ? <p style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading applications...</p> : error ? <p style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</p> : applications.length === 0 ? <p style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No applications match these filters.</p> : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}>{['Application', 'Applicant', 'Programme', 'Submitted', 'Status', ''].map(h => <th key={h} style={{ padding: '13px 16px', color: '#64748b', fontSize: 11 }}>{h}</th>)}</tr></thead><tbody>{applications.map(item => <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}><td style={{ padding: 16, fontWeight: 700, color: '#1d4ed8' }}>{item.applicationCode}</td><td style={{ padding: 16 }}><strong>{item.applicantName}</strong><div style={{ color: '#64748b', fontSize: 12 }}>{item.email}</div></td><td style={{ padding: 16 }}>{item.program}</td><td style={{ padding: 16, color: '#64748b' }}>{formatDate(item.createdAt)}</td><td style={{ padding: 16 }}><StatusBadge status={item.status} /></td><td style={{ padding: 16, textAlign: 'right' }}><Button variant="icon" icon={<Eye size={16} />} aria-label="View application" title="View application" onClick={() => navigate(`/applications/${item.id}`)} /></td></tr>)}</tbody></table>}
    </div>
    <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create admission application">
      <form onSubmit={submit}><Field label="Applicant name" value={form.applicantName} onChange={v => setForm({ ...form, applicantName: v })} required /><Field label="Email address" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} required /><label style={{ display: 'block', marginBottom: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>Programme / major<select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} required style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7, fontWeight: 400 }}><option value="" disabled>Select a programme</option>{PROGRAMMES.map(programme => <option key={programme} value={programme}>{programme}</option>)}</select></label><label style={{ display: 'block', marginBottom: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>Partner school<select value={form.partnerSchoolId} onChange={e => setForm({ ...form, partnerSchoolId: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7 }}><option value="">No partner school</option>{partnerSchools.map(school => <option key={school.id} value={school.id}>{school.name}{school.city ? `, ${school.city}` : ''}</option>)}</select></label><label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 14px', color: '#334155', fontSize: 13 }}><input type="checkbox" checked={form.scholarshipRequested} onChange={e => setForm({ ...form, scholarshipRequested: e.target.checked })} /> Scholarship requested</label>{form.scholarshipRequested && <Field label="Scholarship details" value={form.scholarshipDetails} onChange={v => setForm({ ...form, scholarshipDetails: v })} placeholder="e.g. 50% tuition waiver" />}<Field label="Initial staff notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder="Optional admissions note" /><Button variant="primary" type="submit" style={{ width: '100%', marginTop: 10 }}>Create application</Button></form>
    </Modal>
  </Shell>;
}

function Field({ label: fieldLabel, value, onChange, type = 'text', placeholder, required }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <label style={{ display: 'block', marginBottom: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>{fieldLabel}<input type={type} value={value} placeholder={placeholder} required={required} onChange={e => onChange(e.target.value)} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7, fontWeight: 400 }} /></label>;
}

type TimelineState = 'complete' | 'active' | 'pending' | 'rejected';
interface TimelineStep { title: string; description: string; state: TimelineState; }

/**
 * A scholarship "succeeds" only once it has been awarded through Scholarships > Award (which stamps a
 * structured discountType/discountValue on the application) — not merely because it was requested.
 * scholarshipDetails alone can't be trusted as proof of success: staff can type free-text notes about a
 * requested scholarship (e.g. "expects 50% waiver") before any decision is made.
 */
function describeScholarship(application: Application): { label: string; detail: string; awarded: boolean } {
  if (!application.scholarshipRequested) return { label: 'Not requested', detail: '', awarded: false };
  if (application.discountValue != null) {
    const amount = application.discountType === 'FIXED_AMOUNT' ? `$${application.discountValue}` : `${application.discountValue}%`;
    return { label: `Awarded — ${amount} discount`, detail: application.scholarshipDetails || '', awarded: true };
  }
  return { label: 'Requested — awaiting decision', detail: application.scholarshipDetails || '', awarded: false };
}

/** Every step here is derived from real application/payment/student data — no placeholder checkpoints. */
function buildTimeline(application: Application, payments: Payment[]): TimelineStep[] {
  const isRejected = application.status === 'REJECTED';
  const isApproved = application.status === 'SCHOOL_APPROVED' || application.status === 'APPROVED';
  const isEnrolled = application.student?.status === 'ENROLLED';
  const completedPayment = payments.find(p => p.status === 'COMPLETED');
  const pendingPayment = payments.find(p => p.status === 'PENDING');

  const steps: TimelineStep[] = [
    {
      title: 'Application Submitted',
      description: `Submitted ${formatDate(application.applicationDate)} for ${application.program}.`,
      state: 'complete',
    },
  ];

  if (application.scholarshipRequested) {
    const scholarship = describeScholarship(application);
    steps.push({
      title: 'Scholarship Request',
      description: scholarship.awarded
        ? `${scholarship.label}${scholarship.detail ? ` — ${scholarship.detail}` : ''}`
        : scholarship.detail || 'Scholarship requested — awaiting admissions decision.',
      state: scholarship.awarded ? 'complete' : 'active',
    });
  }

  steps.push({
    title: 'School Decision',
    description: isRejected
      ? (application.approvalResult || 'Application was rejected.')
      : isApproved
      ? (application.approvalResult || 'Application was approved.')
      : 'Awaiting an admissions decision.',
    state: isRejected ? 'rejected' : isApproved ? 'complete' : 'active',
  });

  if (!isRejected) {
    steps.push({
      title: 'Tuition Payment',
      description: completedPayment
        ? `Paid in full (${completedPayment.reference}).`
        : pendingPayment
        ? `Balance of $${pendingPayment.amount.toFixed(2)} due (${pendingPayment.reference}).`
        : 'Invoice is generated automatically once the application is approved.',
      state: completedPayment ? 'complete' : pendingPayment ? 'active' : 'pending',
    });

    steps.push({
      title: 'Enrollment',
      description: isEnrolled ? 'Student is enrolled.' : 'Finalized once the application is approved.',
      state: isEnrolled ? 'complete' : 'pending',
    });
  }

  return steps;
}

const timelineIcon = (state: TimelineState) => state === 'rejected' ? <XCircle size={17} /> : state === 'complete' ? <CheckCircle2 size={17} /> : <Clock3 size={17} />;
const timelineColor = (state: TimelineState) => state === 'rejected' ? '#dc2626' : state === 'complete' ? '#2563eb' : state === 'active' ? '#d97706' : '#94a3b8';

/** Pulls a "NN%" out of free-text scholarship details (e.g. "100% Tuition Waiver") to pre-fill the award form. */
function guessDiscountValue(details: string | null): number {
  const match = details?.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 100;
}

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [awardOpen, setAwardOpen] = useState(false);
  const [awardForm, setAwardForm] = useState<{ track: AwardScholarshipPayload['track']; gradeLetter: string; specialCode: string; discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'; discountValue: number; notes: string }>({ track: 'GRADE_A', gradeLetter: 'A', specialCode: '', discountType: 'PERCENTAGE', discountValue: 100, notes: '' });
  const [awardError, setAwardError] = useState('');
  const [awarding, setAwarding] = useState(false);
  const canApprove = hasPermission(PERMISSIONS.APPLICATION_APPROVE) || hasPermission(PERMISSIONS.APPLICATION_REJECT);
  const load = async () => { try { setApplication(await fetchApplicationById(Number(id))); } catch { setError('Application not found.'); } };
  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    const studentId = application?.student?.id;
    if (!studentId) { setPayments([]); return; }
    getPayments({ studentId }).then(setPayments).catch(() => setPayments([]));
  }, [application?.student?.id, application?.status]);
  const changeStatus = async (next: ApplicationStatus) => { if (!application) return; await updateApplicationStatus(application.id, next); load(); };
  const openAward = () => {
    if (!application) return;
    setAwardError('');
    setAwardForm({ track: 'GRADE_A', gradeLetter: 'A', specialCode: '', discountType: 'PERCENTAGE', discountValue: guessDiscountValue(application.scholarshipDetails), notes: '' });
    setAwardOpen(true);
  };
  const submitAward = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!application?.student) return;
    setAwarding(true);
    setAwardError('');
    try {
      await awardScholarship({
        studentId: application.student.id,
        track: awardForm.track,
        gradeLetter: awardForm.track === 'GRADE_A' ? awardForm.gradeLetter : undefined,
        specialCode: awardForm.track === 'SPECIAL_CODE' ? awardForm.specialCode : undefined,
        partnerSchoolId: awardForm.track === 'MOU_PARTNER' ? application.partnerSchoolId ?? undefined : undefined,
        discountType: awardForm.discountType,
        discountValue: awardForm.discountValue,
        notes: awardForm.notes || undefined,
      });
      setAwardOpen(false);
      load();
    } catch (err: any) {
      setAwardError(err?.response?.data?.message || 'Failed to award scholarship.');
    } finally {
      setAwarding(false);
    }
  };

  if (error) return <Shell hidePageHeader><Button icon={<ArrowLeft size={15} />} onClick={() => navigate('/applications')}>Back to applications</Button><p style={{ color: '#dc2626' }}>{error}</p></Shell>;
  if (!application) return <Shell hidePageHeader><p style={{ color: '#64748b' }}>Loading application...</p></Shell>;
  const timeline = buildTimeline(application, payments);
  const scholarship = describeScholarship(application);
  return <><Shell hidePageHeader><Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate('/applications')}>Back to applications</Button><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, margin: '14px 0 20px' }}><div><div style={{ color: '#64748b', fontSize: 12 }}>{application.applicationCode}</div><h2 style={{ margin: '4px 0', color: '#0f172a', fontSize: 25 }}>{application.applicantName}</h2><div style={{ color: '#64748b', fontSize: 13 }}>Admission application for {application.program}</div></div><div style={{ display: 'flex', gap: 8 }}>{canApprove && !TERMINAL_APPLICATION_STATUSES.includes(application.status) && <><Button variant="danger" icon={<XCircle size={15} />} onClick={() => changeStatus('REJECTED')}>Reject</Button><Button variant="primary" icon={<CheckCircle2 size={15} />} onClick={() => changeStatus('SCHOOL_APPROVED')}>Approve</Button></>}<StatusBadge status={application.status} /></div></div><div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, .8fr) minmax(320px, 1.5fr)', gap: 16 }}><section style={card}><h3 style={heading}>Applicant profile</h3><Info label="Full name" value={application.applicantName} /><Info label="Email" value={application.email} /><Info label="Application date" value={formatDate(application.applicationDate)} /><Info label="Partner school" value={application.partnerSchool?.name || 'Not linked'} /><Info label="Responsible staff" value={application.responsibleStaff?.name || 'Assigned admissions staff'} /><Info label="Student record" value={application.student ? `${application.student.name} (${application.student.studentCode})` : 'Not linked yet'} /></section><div style={{ display: 'grid', gap: 16 }}><section style={card}><h3 style={heading}>Application details</h3><div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: 16, borderRadius: 8 }}><div style={{ color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>PROGRAMME / MAJOR</div><strong style={{ display: 'block', marginTop: 8, color: '#0f172a' }}>{application.program}</strong><span style={{ color: '#64748b', fontSize: 12 }}>Cambodian university admissions intake</span></div><div style={{ padding: '12px 0', borderBottom: '1px dotted #cbd5e1' }}><div style={{ color: '#64748b', fontSize: 11 }}>Scholarship</div><div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}><Badge bg={scholarship.awarded ? '#dcfce7' : application.scholarshipRequested ? '#fef3c7' : '#f1f5f9'} color={scholarship.awarded ? '#16a34a' : application.scholarshipRequested ? '#a16207' : '#64748b'}>{scholarship.label}</Badge>{canApprove && application.scholarshipRequested && !scholarship.awarded && application.student && <Button variant="secondary" icon={<Award size={13} />} style={{ padding: '4px 10px', fontSize: 12 }} onClick={openAward}>Award scholarship</Button>}</div>{scholarship.detail && <div style={{ color: '#0f172a', fontSize: 13, marginTop: 8 }}>{scholarship.detail}</div>}</div><Info label="Approval result" value={application.approvalResult || 'Pending school decision'} /></section><section style={card}><h3 style={heading}>Fee &amp; payment <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>generated automatically on approval</span></h3>{!application.student ? <p style={{ color: '#64748b', fontSize: 12 }}>No student record linked yet — a tuition invoice can only be generated once this application has a linked student.</p> : payments.length === 0 ? <p style={{ color: '#64748b', fontSize: 12 }}>No tuition invoice yet. Approving this application will generate one automatically (base fee minus any scholarship discount).</p> : <div style={{ display: 'grid', gap: 10 }}>{payments.map(payment => <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}><div><div style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{payment.reference}</div><div style={{ color: '#334155', fontSize: 12, marginTop: 2 }}>{payment.description || payment.method}</div></div><div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontWeight: 700, color: '#0f172a' }}>${payment.amount.toFixed(2)}</div><Badge bg={payment.status === 'COMPLETED' ? '#dcfce7' : payment.status === 'PENDING' ? '#fef3c7' : '#fee2e2'} color={payment.status === 'COMPLETED' ? '#16a34a' : payment.status === 'PENDING' ? '#a16207' : '#dc2626'}>{payment.status}</Badge></div></div>)}</div>}</section><section style={card}><h3 style={heading}>Application timeline</h3>{timeline.map((step, index) => <div key={step.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: index ? '1px solid #f1f5f9' : 'none' }}><div style={{ color: timelineColor(step.state) }}>{timelineIcon(step.state)}</div><div><strong style={{ color: '#334155', fontSize: 13 }}>{step.title}</strong><div style={{ color: '#64748b', fontSize: 12 }}>{step.description}</div></div></div>)}</section><section style={card}><h3 style={heading}>Staff notes <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>stored with application</span></h3><div style={{ padding: 12, background: '#fffbeb', borderLeft: '3px solid #f59e0b', color: '#475569', fontSize: 12 }}>{application.notes || 'No staff notes recorded.'}</div></section></div></div></Shell>
    <Modal isOpen={awardOpen} onClose={() => setAwardOpen(false)} title="Award scholarship">
      <form onSubmit={submitAward}>
        <label style={{ display: 'block', marginBottom: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>Track
          <select value={awardForm.track} onChange={e => setAwardForm({ ...awardForm, track: e.target.value as AwardScholarshipPayload['track'] })} style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7 }}>
            <option value="GRADE_A">National Exam Grade Merit</option>
            <option value="SPECIAL_CODE">Special Scholarship Code</option>
            <option value="MOU_PARTNER">Partner School (MOU)</option>
          </select>
        </label>
        {awardForm.track === 'GRADE_A' && <Field label="Grade letter" value={awardForm.gradeLetter} onChange={v => setAwardForm({ ...awardForm, gradeLetter: v.toUpperCase() })} placeholder="A" />}
        {awardForm.track === 'SPECIAL_CODE' && <Field label="Scholarship code" value={awardForm.specialCode} onChange={v => setAwardForm({ ...awardForm, specialCode: v.toUpperCase() })} placeholder="e.g. UP-SCHOLARSHIP" required />}
        {awardForm.track === 'MOU_PARTNER' && (
          application.partnerSchool
            ? <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>Discount will be applied against <strong>{application.partnerSchool.name}</strong>'s active MOU.</p>
            : <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 14px' }}>This application isn't linked to a partner school yet — link one before awarding an MOU discount.</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'block', marginBottom: 14, color: '#334155', fontSize: 13, fontWeight: 600 }}>Discount type
            <select value={awardForm.discountType} onChange={e => setAwardForm({ ...awardForm, discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })} style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7 }}>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed ($)</option>
            </select>
          </label>
          <Field label="Discount value" type="number" value={String(awardForm.discountValue)} onChange={v => setAwardForm({ ...awardForm, discountValue: Number(v) || 0 })} required />
        </div>
        <Field label="Notes (optional)" value={awardForm.notes} onChange={v => setAwardForm({ ...awardForm, notes: v })} placeholder="e.g. Certificate verified 06 Sept 2026" />
        {awardError && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{awardError}</p>}
        <Button variant="primary" type="submit" disabled={awarding || (awardForm.track === 'MOU_PARTNER' && !application.partnerSchool)} style={{ width: '100%', marginTop: 4 }}>{awarding ? 'Awarding...' : 'Award scholarship'}</Button>
      </form>
    </Modal>
  </>;
}

const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 } as const;
const heading = { margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontSize: 16 } as const;
function Info({ label: infoLabel, value }: { label: string; value: string }) { return <div style={{ padding: '12px 0', borderBottom: '1px dotted #cbd5e1' }}><div style={{ color: '#64748b', fontSize: 11 }}>{infoLabel}</div><div style={{ color: '#0f172a', fontSize: 13, marginTop: 4 }}>{value}</div></div>; }
