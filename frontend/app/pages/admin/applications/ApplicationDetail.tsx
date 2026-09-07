import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../auth/AuthContext';
import { PERMISSIONS } from '../../../types/permissions';
import {
  Application,
  ApplicationStatus,
  fetchApplicationById,
  updateApplicationStatus,
} from '../../../services/applicationService';
import { getPayments, type Payment } from '../../../services/paymentService';
import { card, formatDate, heading, Info, Shell, StatusBadge, TERMINAL_APPLICATION_STATUSES } from './shared';

// The single-application detail page (/applications/:id) — approve/reject, scholarship info,
// fee & payment status, and a timeline, each broken out into its own small card component below.

type TimelineState = 'complete' | 'active' | 'pending' | 'rejected';
interface TimelineStep { title: string; description: string; state: TimelineState; }

/**
 * The discount is resolved from the real scholarship-code/grade-tier/MOU tables the moment the applicant
 * requests it (see applyPublic) — approving the application just applies whatever is already stored here,
 * no separate staff "award" action is needed.
 */
function describeScholarship(application: Application): { label: string; detail: string; resolved: boolean } {
  if (!application.scholarshipRequested) return { label: 'Not requested', detail: '', resolved: false };
  if (application.discountValue != null) {
    const amount = application.discountType === 'FIXED_AMOUNT' ? `$${application.discountValue}` : `${application.discountValue}%`;
    return { label: `${amount} discount requested`, detail: application.scholarshipDetails || '', resolved: true };
  }
  return { label: 'Requested — discount could not be resolved', detail: application.scholarshipDetails || '', resolved: false };
}

/** Every step here is derived from real application/payment/student data — no placeholder checkpoints. */
function buildTimeline(application: Application, payments: Payment[]): TimelineStep[] {
  const isRejected = application.status === 'REJECTED';
  const isApproved = application.status === 'SCHOOL_APPROVED' || application.status === 'APPROVED';
  const isEnrolled = application.student?.status === 'ENROLLED';
  const completedPayment = payments.find((p) => p.status === 'COMPLETED');
  const pendingPayment = payments.find((p) => p.status === 'PENDING');

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
      description: `${scholarship.label}${scholarship.detail ? ` — ${scholarship.detail}` : ''}`,
      state: scholarship.resolved ? 'complete' : 'active',
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

function timelineIcon(state: TimelineState) {
  if (state === 'rejected') return <XCircle size={17} />;
  if (state === 'complete') return <CheckCircle2 size={17} />;
  return <Clock3 size={17} />;
}

function timelineColor(state: TimelineState) {
  if (state === 'rejected') return '#dc2626';
  if (state === 'complete') return '#2563eb';
  if (state === 'active') return '#d97706';
  return '#94a3b8';
}

function ApplicationHeader({ application, canApprove, onApprove, onReject }: {
  application: Application;
  canApprove: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isFinalDecision = TERMINAL_APPLICATION_STATUSES.includes(application.status);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, margin: '14px 0 20px' }}>
      <div>
        <div style={{ color: '#64748b', fontSize: 12 }}>{application.applicationCode}</div>
        <h2 style={{ margin: '4px 0', color: '#0f172a', fontSize: 25 }}>{application.applicantName}</h2>
        <div style={{ color: '#64748b', fontSize: 13 }}>Admission application for {application.program}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {canApprove && !isFinalDecision && (
          <>
            <Button variant="danger" icon={<XCircle size={15} />} onClick={onReject}>Reject</Button>
            <Button variant="primary" icon={<CheckCircle2 size={15} />} onClick={onApprove}>Approve</Button>
          </>
        )}
        <StatusBadge status={application.status} />
      </div>
    </div>
  );
}

function ApplicantProfileCard({ application }: { application: Application }) {
  return (
    <section style={card}>
      <h3 style={heading}>Applicant profile</h3>
      <Info label="Full name" value={application.applicantName} />
      <Info label="Email" value={application.email} />
      <Info label="Application date" value={formatDate(application.applicationDate)} />
      <Info label="Partner school" value={application.partnerSchool?.name || 'Not linked'} />
      <Info label="Responsible staff" value={application.responsibleStaff?.name || 'Assigned admissions staff'} />
      <Info
        label="Student record"
        value={application.student ? `${application.student.name} (${application.student.studentCode})` : 'Not linked yet'}
      />
    </section>
  );
}

function ApplicationDetailsCard({ application, scholarship }: { application: Application; scholarship: ReturnType<typeof describeScholarship> }) {
  return (
    <section style={card}>
      <h3 style={heading}>Application details</h3>

      <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: 16, borderRadius: 8 }}>
        <div style={{ color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>PROGRAMME / MAJOR</div>
        <strong style={{ display: 'block', marginTop: 8, color: '#0f172a' }}>{application.program}</strong>
        <span style={{ color: '#64748b', fontSize: 12 }}>Cambodian university admissions intake</span>
      </div>

      <div style={{ padding: '12px 0', borderBottom: '1px dotted #cbd5e1' }}>
        <div style={{ color: '#64748b', fontSize: 11 }}>Scholarship</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge
            bg={scholarship.resolved ? '#dcfce7' : application.scholarshipRequested ? '#fef3c7' : '#f1f5f9'}
            color={scholarship.resolved ? '#16a34a' : application.scholarshipRequested ? '#a16207' : '#64748b'}
          >
            {scholarship.label}
          </Badge>
        </div>
        {scholarship.detail && <div style={{ color: '#0f172a', fontSize: 13, marginTop: 8 }}>{scholarship.detail}</div>}
      </div>

      <Info label="Approval result" value={application.approvalResult || 'Pending school decision'} />
    </section>
  );
}

function FeePaymentCard({ application, payments }: { application: Application; payments: Payment[] }) {
  return (
    <section style={card}>
      <h3 style={heading}>
        Fee &amp; payment <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>generated automatically on approval</span>
      </h3>

      {!application.student ? (
        <p style={{ color: '#64748b', fontSize: 12 }}>
          No student record linked yet — a tuition invoice can only be generated once this application has a linked student.
        </p>
      ) : payments.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: 12 }}>
          No tuition invoice yet. Approving this application will generate one automatically (base fee minus any scholarship discount).
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {payments.map((payment) => (
            <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{payment.reference}</div>
                <div style={{ color: '#334155', fontSize: 12, marginTop: 2 }}>{payment.description || payment.method}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>${payment.amount.toFixed(2)}</div>
                <Badge
                  bg={payment.status === 'COMPLETED' ? '#dcfce7' : payment.status === 'PENDING' ? '#fef3c7' : '#fee2e2'}
                  color={payment.status === 'COMPLETED' ? '#16a34a' : payment.status === 'PENDING' ? '#a16207' : '#dc2626'}
                >
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineCard({ timeline }: { timeline: TimelineStep[] }) {
  return (
    <section style={card}>
      <h3 style={heading}>Application timeline</h3>
      {timeline.map((step, index) => (
        <div key={step.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: index ? '1px solid #f1f5f9' : 'none' }}>
          <div style={{ color: timelineColor(step.state) }}>{timelineIcon(step.state)}</div>
          <div>
            <strong style={{ color: '#334155', fontSize: 13 }}>{step.title}</strong>
            <div style={{ color: '#64748b', fontSize: 12 }}>{step.description}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

function NotesCard({ notes }: { notes: string | null }) {
  return (
    <section style={card}>
      <h3 style={heading}>Staff notes <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>stored with application</span></h3>
      <div style={{ padding: 12, background: '#fffbeb', borderLeft: '3px solid #f59e0b', color: '#475569', fontSize: 12 }}>
        {notes || 'No staff notes recorded.'}
      </div>
    </section>
  );
}

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const canApprove = hasPermission(PERMISSIONS.APPLICATION_APPROVE) || hasPermission(PERMISSIONS.APPLICATION_REJECT);

  const load = async () => {
    try {
      setApplication(await fetchApplicationById(Number(id)));
    } catch {
      setError('Application not found.');
    }
  };
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const studentId = application?.student?.id;
    if (!studentId) { setPayments([]); return; }
    getPayments({ studentId }).then(setPayments).catch(() => setPayments([]));
  }, [application?.student?.id, application?.status]);

  const changeStatus = async (next: ApplicationStatus) => {
    if (!application) return;
    await updateApplicationStatus(application.id, next);
    load();
  };

  if (error) {
    return (
      <Shell hidePageHeader>
        <Button icon={<ArrowLeft size={15} />} onClick={() => navigate('/applications')}>Back to applications</Button>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </Shell>
    );
  }
  if (!application) {
    return (
      <Shell hidePageHeader>
        <p style={{ color: '#64748b' }}>Loading application...</p>
      </Shell>
    );
  }

  const timeline = buildTimeline(application, payments);
  const scholarship = describeScholarship(application);

  return (
    <Shell hidePageHeader>
      <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => navigate('/applications')}>Back to applications</Button>

      <ApplicationHeader
        application={application}
        canApprove={canApprove}
        onApprove={() => changeStatus('SCHOOL_APPROVED')}
        onReject={() => changeStatus('REJECTED')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, .8fr) minmax(320px, 1.5fr)', gap: 16 }}>
        <ApplicantProfileCard application={application} />

        <div style={{ display: 'grid', gap: 16 }}>
          <ApplicationDetailsCard application={application} scholarship={scholarship} />
          <FeePaymentCard application={application} payments={payments} />
          <TimelineCard timeline={timeline} />
          <NotesCard notes={application.notes} />
        </div>
      </div>
    </Shell>
  );
}
