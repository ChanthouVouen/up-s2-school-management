import React, { useEffect, useState } from 'react';
import {
    Building2,
    Upload,
    Save,
    Loader2,
} from 'lucide-react';
import AdminLayout from '~/layouts/AdminLayout';
import Toast from '~/components/ui/Toast';
import { useToast } from '~/hooks/useToast';
import { useAuth } from '~/auth/AuthContext';
import { PERMISSIONS } from '~/types/permissions';
import {
    fetchSettings,
    updateSettings,
    OrganizationSettings as OrganizationSettingsData,
    OrganizationSettingsInput,
} from '~/services/settingsService';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const EMPTY_FORM: OrganizationSettingsInput = {
    orgName: '',
    slogan: '',
    logoUrl: '',
    primaryEmail: '',
    supportPhone: '',
    websiteUrl: '',
    supportPortal: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
};

function toFormData(settings: OrganizationSettingsData): OrganizationSettingsInput {
    return {
        orgName: settings.orgName ?? '',
        slogan: settings.slogan ?? '',
        logoUrl: settings.logoUrl ?? '',
        primaryEmail: settings.primaryEmail ?? '',
        supportPhone: settings.supportPhone ?? '',
        websiteUrl: settings.websiteUrl ?? '',
        supportPortal: settings.supportPortal ?? '',
        streetAddress: settings.streetAddress ?? '',
        city: settings.city ?? '',
        state: settings.state ?? '',
        postalCode: settings.postalCode ?? '',
        country: settings.country ?? '',
    };
}

export default function OrganizationSettings() {
    const [activeTab, setActiveTab] = useState('General');
    const [formData, setFormData] = useState<OrganizationSettingsInput>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { toast, showToast } = useToast();
    const { hasPermission } = useAuth();
    const canUpdate = hasPermission(PERMISSIONS.SETTINGS_UPDATE);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const settings = await fetchSettings();
            setFormData(toFormData(settings));
        } catch (err) {
            console.error('Failed to load organization settings:', err);
            setError('Failed to load organization settings from server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_LOGO_SIZE) {
            showToast('error', 'Logo image must be 2MB or smaller.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleCancel = () => {
        load();
    };

    const handleSave = async () => {
        if (!formData.orgName.trim()) {
            showToast('error', 'Organization name is required.');
            return;
        }

        try {
            setSaving(true);
            const updated = await updateSettings(formData);
            setFormData(toFormData(updated));
            showToast('success', 'Organization settings saved.');
        } catch (err: any) {
            console.error('Failed to save organization settings:', err);
            showToast('error', err?.response?.data?.message || 'Failed to save organization settings.');
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { name: 'General', icon: Building2 },
    ];

    return (
        <AdminLayout>
            {toast && <Toast type={toast.type} message={toast.message} />}
            <div className="h-full font-sans text-slate-800">
                <div className="w-full mx-auto flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Sidebar Navigation */}
                    <aside className="w-full md:w-64 bg-white rounded-xl border border-slate-200 p-2 shadow-sm shrink-0">
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.name;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => setActiveTab(item.name)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Right Main Content Area */}
                    <main className="flex-1 w-full space-y-6">
                        {loading ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm text-center text-slate-400 text-sm">
                                Loading organization settings...
                            </div>
                        ) : error ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm text-center text-red-500 text-sm">
                                {error}
                            </div>
                        ) : (
                            <>
                                {!canUpdate && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-lg px-4 py-3">
                                        You have read-only access to organization settings. Contact an administrator to make changes.
                                    </div>
                                )}
                                <fieldset disabled={!canUpdate || saving} className="space-y-6">
                                    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-8">
                                        {/* Organization Profile Section */}
                                        <section className="space-y-4">
                                            <h2 className="text-lg font-bold text-slate-900">Organization Profile</h2>

                                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                                {/* Logo Upload Box */}
                                                <div className="flex flex-col items-center">
                                                    <label className="w-28 h-28 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors group overflow-hidden">
                                                        {formData.logoUrl ? (
                                                            <img src={formData.logoUrl} alt="Organization logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <>
                                                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-1" />
                                                                <span className="text-xs text-slate-500 font-medium group-hover:text-blue-600">
                                                                    Upload Logo
                                                                </span>
                                                            </>
                                                        )}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} disabled={!canUpdate || saving} />
                                                    </label>
                                                    <span className="text-[11px] text-slate-400 mt-2 font-medium">Max size: 2MB</span>
                                                </div>

                                                {/* Profile Fields */}
                                                <div className="flex-1 w-full space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                            Organization Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="orgName"
                                                            value={formData.orgName}
                                                            onChange={handleChange}
                                                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                            Official Slogan / Tagline
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="slogan"
                                                            value={formData.slogan ?? ''}
                                                            onChange={handleChange}
                                                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Contact Details Section */}
                                        <section className="space-y-4">
                                            <h2 className="text-lg font-bold text-slate-900">Contact Details</h2>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                        Primary Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="primaryEmail"
                                                        value={formData.primaryEmail ?? ''}
                                                        onChange={handleChange}
                                                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                        Support Phone
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="supportPhone"
                                                        value={formData.supportPhone ?? ''}
                                                        onChange={handleChange}
                                                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                        Website URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="websiteUrl"
                                                        value={formData.websiteUrl ?? ''}
                                                        onChange={handleChange}
                                                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                        Support Portal
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="supportPortal"
                                                        value={formData.supportPortal ?? ''}
                                                        onChange={handleChange}
                                                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Physical Address Section */}
                                        <section className="space-y-4">
                                            <h2 className="text-lg font-bold text-slate-900">Physical Address</h2>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                        Street Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="streetAddress"
                                                        value={formData.streetAddress ?? ''}
                                                        onChange={handleChange}
                                                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city ?? ''}
                                                            onChange={handleChange}
                                                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                            State/Province
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={formData.state ?? ''}
                                                            onChange={handleChange}
                                                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                            Postal Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="postalCode"
                                                            value={formData.postalCode ?? ''}
                                                            onChange={handleChange}
                                                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                            Country
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="country"
                                                            value={formData.country ?? ''}
                                                            onChange={handleChange}
                                                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Form Actions */}
                                    {canUpdate && (
                                        <div className="flex justify-end items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </fieldset>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </AdminLayout>
    );
}
