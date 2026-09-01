import React, { useEffect, useState } from 'react';
import {
    Filter,
    Calendar,
    Download,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    GraduationCap,
    CreditCard,
    Settings,
    Folder,
    ClipboardList,
    Users,
    UserCog,
    ShieldCheck,
} from 'lucide-react';
import AdminLayout from '~/layouts/AdminLayout';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import {
    fetchActivityLogs,
    fetchActivityLogStats,
    ActivityLog,
    ActivityLogStats,
    ActivityType,
} from '../../../services/activityLogService';

const MODULE_META: Record<string, { label: string; icon: typeof GraduationCap }> = {
    STUDENT: { label: 'Students', icon: GraduationCap },
    TEACHER: { label: 'Teachers', icon: Users },
    DOCUMENT: { label: 'Documents', icon: Folder },
    APPLICATION: { label: 'Applications', icon: ClipboardList },
    PAYMENT: { label: 'Payments', icon: CreditCard },
    USER: { label: 'User Management', icon: UserCog },
    ROLE: { label: 'Roles & Permissions', icon: ShieldCheck },
    SYSTEM: { label: 'System', icon: Settings },
};

const PAGE_SIZE = 8;

function getModuleMeta(type: string | null) {
    return MODULE_META[type ?? ''] ?? { label: 'General', icon: Settings };
}

function formatDateTime(iso: string) {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        + '\n' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function toCsv(logs: ActivityLog[]) {
    const header = ['Date/Time', 'Module', 'Title', 'Description'];
    const rows = logs.map((log) => [
        new Date(log.createdAt).toLocaleString(),
        getModuleMeta(log.type).label,
        log.title,
        log.description,
    ]);
    return [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

export default function SystemActivityLogs() {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 400);
    const [moduleFilter, setModuleFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [page, setPage] = useState(1);

    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState<ActivityLogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);

            const from = dateFilter ? `${dateFilter}T00:00:00` : undefined;
            const to = dateFilter ? `${dateFilter}T23:59:59` : undefined;

            const [logsRes, statsRes] = await Promise.all([
                fetchActivityLogs({
                    search: debouncedSearch || undefined,
                    type: moduleFilter || undefined,
                    from,
                    to,
                    page,
                    limit: PAGE_SIZE,
                }),
                fetchActivityLogStats(),
            ]);

            setLogs(logsRes.data);
            setTotal(logsRes.pagination.total);
            setTotalPages(logsRes.pagination.totalPages || 1);
            setStats(statsRes);
        } catch (err) {
            console.error('Failed to load activity logs:', err);
            setError('Failed to load activity logs from server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, moduleFilter, dateFilter, page]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, moduleFilter, dateFilter]);

    const handleReset = () => {
        setSearch('');
        setModuleFilter('');
        setDateFilter('');
    };

    const handleExport = () => {
        const csv = toCsv(logs);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity-logs-page-${page}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const topType = stats && Object.keys(stats.byType).length > 0
        ? Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]
        : null;

    return (
        <AdminLayout>
            <div className="h-full font-sans text-slate-800">

                {/* Top Grid: Filter + Activity Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Filter Card */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-slate-600" />
                            <h2 className="text-lg font-semibold text-slate-900">Filter Activity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search title or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Module</label>
                                <select
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Modules</option>
                                    {Object.values(ActivityType).map((type) => (
                                        <option key={type} value={type}>{getModuleMeta(type).label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="w-full border border-slate-300 rounded-md p-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={load}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Activity Summary</h2>
                            <p className="text-xs text-slate-400">Live overview</p>
                        </div>

                        <div className="space-y-4 my-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Today's Actions</span>
                                <span className="text-xl font-bold text-blue-900">{stats?.totalToday ?? '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Total Actions</span>
                                <span className="text-xl font-bold text-slate-800">{stats?.total ?? '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Most Active Module</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {topType ? getModuleMeta(topType[0]).label : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Table Header Controls */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900">Log Entries</h2>
                        <button
                            onClick={handleExport}
                            disabled={logs.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                                    <th className="py-3 px-6">DATE/TIME</th>
                                    <th className="py-3 px-6">MODULE</th>
                                    <th className="py-3 px-6">TITLE</th>
                                    <th className="py-3 px-6">DESCRIPTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 px-6 text-center text-slate-400">Loading activity logs...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 px-6 text-center text-red-500">{error}</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 px-6 text-center text-slate-400">No activity logs found.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const { label, icon: Icon } = getModuleMeta(log.type);
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-4 px-6 text-xs text-slate-500 whitespace-pre-line leading-relaxed">
                                                    {formatDateTime(log.createdAt)}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
                                                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                                                        {label}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 font-medium text-slate-800">
                                                    {log.title}
                                                </td>
                                                <td className="py-4 px-6 text-slate-600">
                                                    {log.description}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer / Pagination */}
                    <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
                        <div>
                            {total === 0
                                ? 'No entries'
                                : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, total)} of ${total} entries`}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-slate-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="p-1 border border-slate-300 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
