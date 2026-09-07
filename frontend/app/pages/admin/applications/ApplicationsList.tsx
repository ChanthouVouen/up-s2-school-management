import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Eye, Plus, Search } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField, { fieldInputStyle } from '../../../components/ui/FormField';
import Table, { type TableColumn } from '../../../components/ui/Table';
import {
  Application,
  ApplicationStatus,
  createApplication,
  fetchApplications,
} from '../../../services/applicationService';
import { fetchPartnerSchools, PartnerSchool } from '../../../services/partnerSchoolService';
import { PROGRAMS } from '../../../constants/programs';
import { Shell, StatusBadge, formatDate, label } from './shared';

// The applications list page (/applications) — search/filter table plus the "create application" modal.

const ALL_STATUSES: ApplicationStatus[] = [
  'REGISTRATION', 'DOCUMENT_SUBMISSION', 'DOCUMENT_REVIEW', 'DOCUMENTS_APPROVED', 'SCHOLARSHIP_APPLICATION',
  'APPLICATION_SUBMITTED', 'SCHOOL_REVIEW', 'SCHOOL_APPROVED', 'PAYMENT', 'ENROLLED', 'PENDING', 'APPROVED', 'REJECTED',
];

interface CreateApplicationForm {
  applicantName: string;
  email: string;
  program: string;
  partnerSchoolId: string;
  scholarshipRequested: boolean;
  scholarshipDetails: string;
  notes: string;
}

const EMPTY_CREATE_FORM: CreateApplicationForm = {
  applicantName: '', email: '', program: '', partnerSchoolId: '', scholarshipRequested: false, scholarshipDetails: '', notes: '',
};

function CreateApplicationModal({ isOpen, onClose, partnerSchools, onCreated }: {
  isOpen: boolean;
  onClose: () => void;
  partnerSchools: PartnerSchool[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateApplicationForm>(EMPTY_CREATE_FORM);

  const submit = async (event: FormEvent) => {
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
    setForm(EMPTY_CREATE_FORM);
    onClose();
    onCreated();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create admission application">
      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <FormField label="Applicant name *">
          <input required value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} style={fieldInputStyle} />
        </FormField>

        <FormField label="Email address *">
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={fieldInputStyle} />
        </FormField>

        <FormField label="Programme / major *">
          <select required value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} style={fieldInputStyle}>
            <option value="" disabled>Select a programme</option>
            {PROGRAMS.map((programme) => <option key={programme} value={programme}>{programme}</option>)}
          </select>
        </FormField>

        <FormField label="Partner school">
          <select value={form.partnerSchoolId} onChange={(e) => setForm({ ...form, partnerSchoolId: e.target.value })} style={fieldInputStyle}>
            <option value="">No partner school</option>
            {partnerSchools.map((school) => (
              <option key={school.id} value={school.id}>{school.name}{school.city ? `, ${school.city}` : ''}</option>
            ))}
          </select>
        </FormField>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#334155', fontSize: 13 }}>
          <input
            type="checkbox"
            checked={form.scholarshipRequested}
            onChange={(e) => setForm({ ...form, scholarshipRequested: e.target.checked })}
          />
          Scholarship requested
        </label>

        {form.scholarshipRequested && (
          <FormField label="Scholarship details">
            <input
              value={form.scholarshipDetails}
              onChange={(e) => setForm({ ...form, scholarshipDetails: e.target.value })}
              placeholder="e.g. 50% tuition waiver"
              style={fieldInputStyle}
            />
          </FormField>
        )}

        <FormField label="Initial staff notes">
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional admissions note"
            style={fieldInputStyle}
          />
        </FormField>

        <Button variant="primary" type="submit" style={{ width: '100%', marginTop: 4 }}>Create application</Button>
      </form>
    </Modal>
  );
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

  const load = async () => {
    setLoading(true);
    try {
      setApplications((await fetchApplications({ search, status })).data);
      setError('');
    } catch {
      setError('Applications could not be loaded. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchPartnerSchools({ limit: 100 }).then((response) => setPartnerSchools(response.data)).catch(() => setPartnerSchools([]));
  }, [search, status]);

  const columns: TableColumn<Application>[] = [
    { key: 'applicationCode', header: 'Application', render: (row) => <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{row.applicationCode}</span> },
    {
      key: 'applicant',
      header: 'Applicant',
      render: (row) => (
        <>
          <strong>{row.applicantName}</strong>
          <div style={{ color: '#64748b', fontSize: 12 }}>{row.email}</div>
        </>
      ),
    },
    { key: 'program', header: 'Programme', render: (row) => row.program },
    { key: 'createdAt', header: 'Submitted', render: (row) => formatDate(row.createdAt) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'view',
      header: '',
      align: 'right',
      render: (row) => (
        <Button variant="icon" icon={<Eye size={16} />} aria-label="View application" title="View application" onClick={() => navigate(`/applications/${row.id}`)} />
      ),
    },
  ];

  return (
    <Shell headerAction={<Button variant="primary" icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>New application</Button>}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant, email, or program"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', border: '1px solid #cbd5e1', borderRadius: 8 }}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ minWidth: 180, border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px' }}>
          <option value="">All statuses</option>
          {ALL_STATUSES.map((value) => <option key={value} value={value}>{label(value)}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={applications}
          rowKey={(row) => row.id}
          loading={loading}
          error={error}
          emptyMessage="No applications match these filters."
        />
      </div>

      <CreateApplicationModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        partnerSchools={partnerSchools}
        onCreated={load}
      />
    </Shell>
  );
}
