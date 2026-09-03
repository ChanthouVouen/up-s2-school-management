import Button from "~/components/ui/Button";
import Toast from "~/components/ui/Toast";
import AdminLayout from "~/layouts/AdminLayout";
import { useToast } from "~/hooks/useToast";
import { useAuth } from "~/auth/AuthContext";
import { PERMISSIONS } from "~/types/permissions";
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
    fetchRoles,
    fetchPermissions,
    updateRolePermissions,
    fetchUsers,
    type Role,
    type PermissionRecord,
} from "~/services/userService";
import {
    Shield,
    Users,
    ClipboardList,
    FileText,
    CreditCard,
    UserCog,
    ShieldCheck,
    LayoutGrid,
    History,
    Check,
    Minus,
    Save,
    Plus,
} from 'lucide-react';
import Modal from "~/components/ui/Modal";
import FormField from "~/components/ui/FormField";
import { createRole } from "~/services/rolePermission";

const MODULE_META: Record<string, { label: string; icon: ComponentType<{ className?: string }> }> = {
    dashboard: { label: 'Dashboard', icon: LayoutGrid },
    student: { label: 'Students', icon: Users },
    application: { label: 'Applications', icon: ClipboardList },
    document: { label: 'Documents', icon: FileText },
    payment: { label: 'Payments', icon: CreditCard },
    user: { label: 'User Management', icon: UserCog },
    role: { label: 'Roles & Permissions', icon: ShieldCheck },
    activity: { label: 'Activity Logs', icon: History },
};

const ACTION_LABELS: Record<string, string> = {
    view: 'View',
    create: 'Create',
    update: 'Edit',
    delete: 'Delete',
    approve: 'Approve',
    reject: 'Reject',
};

const ACTION_ORDER = ['view', 'create', 'update', 'delete', 'approve', 'reject'];

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

interface Module {
    resource: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
    actions: Set<string>;
}

export default function RoleBasePermission() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [pendingByRole, setPendingByRole] = useState<Record<string, Set<string>>>({});
    const [assignedCounts, setAssignedCounts] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState(false);

    const { toast, showToast } = useToast();
    const { hasPermission } = useAuth();
    const canEdit = hasPermission(PERMISSIONS.ROLE_UPDATE);

    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    const fieldInputStyle = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        fontSize: '14px',
    };

    const onFormDataChange = (data: typeof formData) => setFormData(data);
    const onClose = () => setIsOpen(false);
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        await createRole(formData);
        loadData();
        setSubmitting(false);
        onClose();
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [rolesRes, permissionsRes] = await Promise.all([fetchRoles(), fetchPermissions()]);
            setRoles(rolesRes);
            setPermissions(permissionsRes);
            setPendingByRole(
                Object.fromEntries(rolesRes.map((role) => [role.id, new Set(role.permissions?.map((p) => p.id) ?? [])])),
            );
            setSelectedRoleId((current) => current ?? rolesRes[0]?.id ?? null);
        } catch (err) {
            console.error('Failed to load roles/permissions:', err);
            setError('Failed to fetch roles and permissions from server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!selectedRoleId || assignedCounts[selectedRoleId] !== undefined) return;
        fetchUsers({ roleId: selectedRoleId, limit: 1 })
            .then((res) => setAssignedCounts((prev) => ({ ...prev, [selectedRoleId]: res.pagination.total })))
            .catch((err) => console.error('Failed to load assigned user count:', err));
    }, [selectedRoleId]);

    // Modules & their available actions are derived from whatever permissions
    // actually exist on the backend — nothing here is hardcoded per role/module.
    const modules = useMemo<Module[]>(() => {
        const byResource = new Map<string, Module>();
        for (const permission of permissions) {
            const [resource, action] = permission.name.split(':');
            if (!resource || !action) continue;
            if (!byResource.has(resource)) {
                const meta = MODULE_META[resource] ?? { label: capitalize(resource), icon: Shield };
                byResource.set(resource, { resource, label: meta.label, icon: meta.icon, actions: new Set() });
            }
            byResource.get(resource)!.actions.add(action);
        }
        return Array.from(byResource.values());
    }, [permissions]);

    const actionColumns = useMemo(() => {
        const all = new Set<string>();
        modules.forEach((m) => m.actions.forEach((a) => all.add(a)));
        return Array.from(all).sort((a, b) => {
            const ai = ACTION_ORDER.indexOf(a);
            const bi = ACTION_ORDER.indexOf(b);
            if (ai === -1 && bi === -1) return a.localeCompare(b);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });
    }, [modules]);

    const permissionIdByName = useMemo(() => new Map(permissions.map((p) => [p.name, p.id])), [permissions]);

    const selectedRole = roles.find((r) => r.id === selectedRoleId);
    const selectedPending = (selectedRoleId && pendingByRole[selectedRoleId]) || new Set<string>();

    const togglePermission = (resource: string, action: string) => {
        if (!selectedRoleId) return;
        const permissionId = permissionIdByName.get(`${resource}:${action}`);
        if (!permissionId) return;

        setPendingByRole((prev) => {
            const current = new Set(prev[selectedRoleId] ?? []);
            if (current.has(permissionId)) {
                current.delete(permissionId);
            } else {
                current.add(permissionId);
            }
            return { ...prev, [selectedRoleId]: current };
        });
    };

    const handleSave = async () => {
        if (!selectedRoleId) return;
        try {
            setSaving(true);
            const updated = await updateRolePermissions(selectedRoleId, Array.from(selectedPending));
            setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            showToast('success', `Permissions updated for "${selectedRole?.name}".`);
        } catch (err: any) {
            showToast('error', 'Failed to save permissions: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout
            headerAction={
                <div className="flex gap-[20px]">
                    <Button variant="secondary" icon={<Plus size={16} />} onClick={() => setIsOpen(true)}>
                        new role
                    </Button>
                    {canEdit && (
                        <Button variant="primary" icon={<Save size={16} />} onClick={handleSave} disabled={saving || loading || !selectedRoleId}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    )}
                </div>
            }
        >
            {toast && <Toast type={toast.type} message={toast.message} />}

            {loading ? (
                <div className="p-10 text-center text-slate-500 text-sm">Loading roles and permissions...</div>
            ) : error ? (
                <div className="p-10 text-center text-red-500 text-sm">{error}</div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 pt-[20px] min-h-screen text-slate-700 font-sans">
                    {/* Sidebar: Select Role */}
                    <div className="w-full lg:w-72 bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-fit">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4 px-2">Select Role to Edit</h2>
                        <div className="space-y-1">
                            {roles.map((role) => {
                                const isSelected = role.id === selectedRoleId;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isSelected
                                            ? 'border-2 border-indigo-600 text-indigo-700 bg-indigo-50/30'
                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            <span>{role.name}</span>
                                        </div>
                                        {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content: Permissions Matrix */}
                    <div className="h-full w-full bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-100">
                            <h1 className="text-base font-semibold text-slate-800">
                                Permissions Matrix: <span className="text-slate-900">{selectedRole?.name}</span>
                            </h1>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                                <Users className="w-3.5 h-3.5" />
                                <span>
                                    {selectedRoleId && assignedCounts[selectedRoleId] !== undefined
                                        ? assignedCounts[selectedRoleId]
                                        : '...'}{' '}
                                    Assigned Users
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-500 text-xs font-medium">
                                        <th className="py-3 px-4 w-1/3">System Module</th>
                                        {actionColumns.map((action) => (
                                            <th key={action} className="py-3 px-4 text-center capitalize">
                                                {ACTION_LABELS[action] ?? capitalize(action)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {modules.map((module) => {
                                        const ModuleIcon = module.icon;
                                        return (
                                            <tr key={module.resource} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <ModuleIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm font-semibold text-slate-800">{module.label}</span>
                                                    </div>
                                                </td>

                                                {actionColumns.map((action) => {
                                                    const isSupported = module.actions.has(action);
                                                    const permissionId = permissionIdByName.get(`${module.resource}:${action}`);
                                                    const isChecked = !!permissionId && selectedPending.has(permissionId);

                                                    return (
                                                        <td key={action} className="py-4 px-4 text-center">
                                                            {isSupported ? (
                                                                <button
                                                                    type="button"
                                                                    disabled={saving || !canEdit}
                                                                    onClick={() => togglePermission(module.resource, action)}
                                                                    className={`w-5 h-5 rounded mx-auto flex items-center justify-center transition-all ${isChecked
                                                                        ? 'bg-indigo-900 text-white'
                                                                        : 'border-2 border-slate-200 hover:border-slate-300 bg-white'
                                                                        } ${!canEdit ? 'cursor-not-allowed opacity-70' : ''}`}
                                                                >
                                                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                                </button>
                                                            ) : (
                                                                <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Create New Role"
            >
                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <FormField label="Role Name">
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                            style={fieldInputStyle}
                        />
                    </FormField>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
