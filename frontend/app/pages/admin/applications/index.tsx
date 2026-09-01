import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock3, Eye, FileText, Plus, Search, XCircle } from 'lucide-react';
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

const colors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef3c7', color: '#a16207' },
  APPROVED: { bg: '#dcfce7', color: '#15803d' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
};
const PROGRAMMES = [
  'Bachelor of Computer Science',
  'Bachelor of Information Technology',
  'Bachelor of Business Administration',
  'Bachelor of Accounting',
  'Bachelor of Finance and Banking',
  'Bachelor of International Business',
  'Bachelor of English for Communication',
  'Bachelor of Education',
  'Bachelor of Architecture',
  'Bachelor of Civil Engineering',
  'Bachelor of Law',
  'Master of Business Administration',
];
const label = (status: ApplicationStatus) => status.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const icon = status === 'APPROVED' ? <CheckCircle2 size={12} /> : status === 'REJECTED' ? <XCircle size={12} /> : <Clock3 size={12} />;
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

const timeline = [
  ['Registration', 'Application profile was registered.'],
  ['Document Submission', 'Document submission checkpoint. Document module is not connected yet.'],
  ['Document Review', 'Admissions review checkpoint. Static until document review is implemented.'],
  ['Documents Approved', 'Document approval checkpoint. Static until document review is implemented.'],
  ['Scholarship Application', 'Scholarship request is recorded with this application.'],
  ['Application Submitted', 'Application package is ready for school review.'],
  ['School Review', 'Faculty or school admissions committee review.'],
  ['School Approved', 'School approval result is recorded here.'],
  ['Payment', 'Payment checkpoint before enrollment.'],
  ['Enrollment', 'Student enrollment checkpoint.'],
];

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState('');
  const canApprove = hasPermission(PERMISSIONS.APPLICATION_APPROVE);
  const load = async () => { try { setApplication(await fetchApplicationById(Number(id))); } catch { setError('Application not found.'); } };
  useEffect(() => { load(); }, [id]);
  const changeStatus = async (next: ApplicationStatus) => { if (!application) return; await updateApplicationStatus(application.id, next); load(); };

  if (error) return <Shell hidePageHeader><Button icon={<ArrowLeft size={15} />} onClick={() => navigate('/applications')}>Back to applications</Button><p style={{ color: '#dc2626' }}>{error}</p></Shell>;
  if (!application) return <Shell hidePageHeader><p style={{ color: '#64748b' }}>Loading application...</p></Shell>;
  const activeIndex = timeline.findIndex(([title]) => title.toUpperCase().replaceAll(' ', '_') === application.status || (title === 'Enrollment' && application.status === 'ENROLLED'));
  return <Shell hidePageHeader><Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate('/applications')}>Back to applications</Button><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, margin: '14px 0 20px' }}><div><div style={{ color: '#64748b', fontSize: 12 }}>{application.applicationCode}</div><h2 style={{ margin: '4px 0', color: '#0f172a', fontSize: 25 }}>{application.applicantName}</h2><div style={{ color: '#64748b', fontSize: 13 }}>Admission application for {application.program}</div></div><div style={{ display: 'flex', gap: 8 }}>{canApprove && (application.status === 'PENDING' || application.status === 'SCHOOL_REVIEW') && <><Button variant="danger" icon={<XCircle size={15} />} onClick={() => changeStatus('REJECTED')}>Reject</Button><Button variant="primary" icon={<CheckCircle2 size={15} />} onClick={() => changeStatus('SCHOOL_APPROVED')}>Approve</Button></>}<StatusBadge status={application.status} /></div></div><div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, .8fr) minmax(320px, 1.5fr)', gap: 16 }}><section style={card}><h3 style={heading}>Applicant profile</h3><Info label="Full name" value={application.applicantName} /><Info label="Email" value={application.email} /><Info label="Application date" value={formatDate(application.applicationDate)} /><Info label="Partner school" value={application.partnerSchool?.name || 'Not linked'} /><Info label="Responsible staff" value={application.responsibleStaff?.name || 'Assigned admissions staff'} /><Info label="Student record" value={application.student ? `${application.student.name} (${application.student.studentCode})` : 'Not linked yet'} /></section><div style={{ display: 'grid', gap: 16 }}><section style={card}><h3 style={heading}>Application details</h3><div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: 16, borderRadius: 8 }}><div style={{ color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>PROGRAMME / MAJOR</div><strong style={{ display: 'block', marginTop: 8, color: '#0f172a' }}>{application.program}</strong><span style={{ color: '#64748b', fontSize: 12 }}>Cambodian university admissions intake</span></div><Info label="Scholarship" value={application.scholarshipRequested ? application.scholarshipDetails || 'Requested' : 'Not requested'} /><Info label="Approval result" value={application.approvalResult || 'Pending school decision'} /></section><section style={card}><h3 style={heading}>Application timeline <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>document checkpoints are static</span></h3>{timeline.map(([title, description], index) => <div key={title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: index ? '1px solid #f1f5f9' : 'none' }}><div style={{ color: index <= activeIndex ? '#2563eb' : '#94a3b8' }}>{index <= activeIndex ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}</div><div><strong style={{ color: '#334155', fontSize: 13 }}>{title}</strong><div style={{ color: '#64748b', fontSize: 12 }}>{description}</div></div></div>)}</section><section style={card}><h3 style={heading}>Staff notes <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>stored with application</span></h3><div style={{ padding: 12, background: '#fffbeb', borderLeft: '3px solid #f59e0b', color: '#475569', fontSize: 12 }}>{application.notes || 'No staff notes recorded.'}</div></section></div></div></Shell>;
}

const card = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 } as const;
const heading = { margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontSize: 16 } as const;
function Info({ label: infoLabel, value }: { label: string; value: string }) { return <div style={{ padding: '12px 0', borderBottom: '1px dotted #cbd5e1' }}><div style={{ color: '#64748b', fontSize: 11 }}>{infoLabel}</div><div style={{ color: '#0f172a', fontSize: 13, marginTop: 4 }}>{value}</div></div>; }
