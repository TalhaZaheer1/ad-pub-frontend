import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '../../../components/ui/Button';
import { adUnitService } from '../../../services/adUnitService';
import { publicationIssueService } from '../../../services/publicationIssueService';
import { adTypeService } from '../../../services/adTypeService';
import { announcementTemplateService } from '../../../services/announcementTemplateService';
import { designerService } from '../../../services/designerService';
import { userService } from '../../../services/userService';
import { useAuthStore } from '../../../store/authStore';
import {
    Search, Plus, Filter, MoreVertical, Edit2, Trash2, Image as ImageIcon,
    CheckCircle, ArrowRightCircle, Eye, Copy, ChevronLeft, ChevronRight,
    X, RefreshCw, AlertTriangle, Tag, Clock, DollarSign, Layers,
    CheckCheck, Printer, ClipboardCopy, Download
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// ---- Constants ---------------------------------------------------------------

const STATUS_META = {
    IN_REVIEW: { label: 'In Review', color: 'bg-warning/10 text-warning border-warning/20' },
    APPROVED:  { label: 'Approved',  color: 'bg-success/10 text-success border-success/20' },
    REJECTED:  { label: 'Rejected',  color: 'bg-danger/10 text-danger border-danger/20' },
    READY:     { label: 'Ready',     color: 'bg-teal-50 text-teal-700 border-teal-200' },
    PRINTED:   { label: 'Printed',   color: 'bg-gray-100 text-gray-600 border-gray-300' },
    PUBLISHED: { label: 'Published', color: 'bg-indigo/10 text-indigo border-indigo/20' },
    ARCHIVED:  { label: 'Archived',  color: 'bg-gray-100 text-gray-500 border-gray-300 opacity-70' },
};

const DESIGN_STATUS_META = {
    NOT_STARTED:   { label: 'Not Started',   color: 'bg-gray-100 text-gray-500 border-gray-200' },
    QUEUED:        { label: 'Queued',        color: 'bg-blue-50 text-blue-600 border-blue-200' },
    IN_DESIGN:     { label: 'In Design',     color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    NEEDS_CONTENT: { label: 'Needs Content', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    CONTENT_ADDED: { label: 'Content Added', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    NEEDS_REVIEW:  { label: 'Needs Review',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    APPROVED:      { label: 'Approved',      color: 'bg-green-50 text-green-700 border-green-200' },
};

const PAYMENT_META = {
    PENDING:      { label: 'Pending',      color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    PARTIAL:      { label: 'Partial',      color: 'text-orange-600 bg-orange-50 border-orange-200' },
    PAID:         { label: 'Paid',         color: 'text-green-700 bg-green-50 border-green-200' },
    REFUNDED:     { label: 'Refunded',     color: 'text-blue-600 bg-blue-50 border-blue-200' },
    WAIVED:       { label: 'Waived',       color: 'text-gray-500 bg-gray-50 border-gray-200' },
    NOT_REQUIRED: { label: 'Free / N/A',   color: 'text-purple-600 bg-purple-50 border-purple-200' },
};

const OP_TAG_META = {
    PAID:     { label: 'Paid',     color: 'bg-green-100 text-green-700 border-green-200' },
    FREE:     { label: 'Free',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
    FILLER:   { label: 'Filler',   color: 'bg-gray-100 text-gray-500 border-gray-200' },
    EXCHANGE: { label: 'Exchange', color: 'bg-blue-100 text-blue-600 border-blue-200' },
};

const SIZE_LABELS = { FULL_PAGE:'Full Page', HALF_PAGE:'Half Page', QUARTER_PAGE:'Quarter Page', ONE_EIGTH_PAGE:'1/8 Page' };
const AREA_LABELS = { COVER_PAGE:'Cover', INTERIOR_LEFT:'Interior L', INTERIOR_RIGHT:'Interior R', CLASSIFIED_SECTION:'Classified', BACK_COVER:'Back Cover' };

// ---- Sub-components ----------------------------------------------------------

const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', m.color)}>{m.label}</span>;
};

const DesignStatusBadge = ({ status }) => {
    const m = DESIGN_STATUS_META[status] || DESIGN_STATUS_META.NOT_STARTED;
    return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border', m.color)}>{m.label}</span>;
};

const PaymentBadge = ({ status }) => {
    const m = PAYMENT_META[status] || { label: status, color: 'text-gray-500 bg-gray-50 border-gray-200' };
    return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', m.color)}>{m.label}</span>;
};

const OpTags = ({ tags = [] }) => (
    <div className="flex flex-wrap gap-1">
        {tags.map(t => {
            const m = OP_TAG_META[t] || { label: t, color: 'bg-gray-100 text-gray-500 border-gray-200' };
            return <span key={t} className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border', m.color)}>{m.label}</span>;
        })}
    </div>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <h3 className="font-bold text-gray-900">Confirm Action</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90 text-white" onClick={onConfirm}>Confirm</Button>
            </div>
        </div>
    </div>,
    document.body
);

// ---- Main Component ----------------------------------------------------------

export const AdsManagement = () => {
    const navigate = useNavigate();

    const { user } = useAuthStore();

    // Data state
    const [ads, setAds] = useState([]);
    const [total, setTotal] = useState(0);
    const [metrics, setMetrics] = useState(null);
    const [issues, setIssues] = useState([]);
    const [adTypes, setAdTypes] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [issueFilter, setIssueFilter] = useState('');
    const [adTypeFilter, setAdTypeFilter] = useState('');
    const [templateFilter, setTemplateFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    // UI state
    const [activeMenu, setActiveMenu] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null); // { top, right } for portal positioning
    const [actionLoading, setActionLoading] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [assignModal, setAssignModal] = useState({ isOpen: false, adId: null });
    const [toast, setToast] = useState(null);
    const searchDebounce = useRef(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = { page, limit: LIMIT };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (issueFilter) params.publicationIssueId = issueFilter;
            if (adTypeFilter) params.adTypeId = adTypeFilter;
            if (templateFilter) params.templateId = templateFilter;
            if (paymentFilter) params.paymentStatus = paymentFilter;

            const [adsRes, metricsRes, issuesRes, adTypesRes, templatesRes, designersRes] = await Promise.all([
                adUnitService.getAll(params),
                adUnitService.getMetrics(),
                publicationIssueService.getAll({ limit: 100 }),
                adTypeService.getAll({ isActive: true }),
                announcementTemplateService.getAll({ isActive: true }),
                user?.companyId ? userService.getCompanyUsers(user.companyId, { role: 'DESIGNER', limit: 100 }) : { data: { data: [] } }
            ]);

            setAds(adsRes.data?.data?.adUnits || []);
            setTotal(adsRes.data?.data?.total || 0);
            setMetrics(metricsRes.data?.data?.metrics || {});
            setIssues(issuesRes.data?.data?.issues || []);
            setAdTypes(adTypesRes.data?.data?.adTypes || []);
            setTemplates(templatesRes.data?.data?.templates || []);
            setDesigners(Array.isArray(designersRes.data?.data) ? designersRes.data.data : designersRes.data?.data?.users || []);
        } catch (e) {
            setError('Failed to load ads. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, issueFilter, adTypeFilter, templateFilter, paymentFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = (val) => {
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
    };

    const handleStatusAction = async (id, status) => {
        setActionLoading(id + status);
        try {
            await adUnitService.updateStatus(id, status);
            showToast(`Status updated to ${STATUS_META[status]?.label || status}`);
            await fetchData();
        } catch {
            showToast('Failed to update status.', 'error');
        } finally {
            setActionLoading(null);
            setActiveMenu(null);
        }
    };

    const handleDesignStatusAction = async (adId, designStatus) => {
        setActionLoading(adId);
        try {
            await adUnitService.updateDesignStatus(adId, designStatus);
            showToast(`Design status → ${DESIGN_STATUS_META[designStatus]?.label || designStatus}`);
            await fetchData();
        } catch (e) {
            showToast(e.response?.data?.message || 'Failed to update design status.', 'error');
        } finally {
            setActionLoading(null);
            setActiveMenu(null);
            setMenuAnchor(null);
        }
    };

    const handleDelete = async (id) => {
        setConfirm(null);
        setActionLoading(id);
        try {
            await adUnitService.delete(id);
            showToast('Ad unit deleted.');
            await fetchData();
        } catch (e) {
            showToast(e.response?.data?.message || 'Cannot delete this ad unit.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAssignDesigner = async (adId, designerId) => {
        setActionLoading(adId + 'assign');
        try {
            await designerService.assignDesigner(adId, designerId);
            showToast(designerId ? 'Designer assigned successfully' : 'Designer unassigned');
            await fetchData();
            setAssignModal({ isOpen: false, adId: null });
        } catch (e) {
            showToast(e.response?.data?.message || 'Failed to assign designer', 'error');
        } finally {
            setActionLoading(null);
            setActiveMenu(null);
        }
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'info');
    };

    const totalPages = Math.ceil(total / LIMIT);

    // Metric cards data
    const metricCards = metrics ? [
        { label: 'Total Ads', value: metrics.total || 0, icon: Layers, color: 'text-indigo' },
        { label: 'In Review', value: metrics.byStatus?.IN_REVIEW || 0, icon: Clock, color: 'text-warning' },
        { label: 'Ready', value: (metrics.byStatus?.READY || 0) + (metrics.byStatus?.APPROVED || 0), icon: CheckCheck, color: 'text-teal-600' },
        { label: 'Paid', value: metrics.byPayment?.PAID || 0, icon: DollarSign, color: 'text-green-600' },
    ] : [];

    const getAvailableStatuses = (ad) => {
        if (ad.status === 'IN_REVIEW') return ['APPROVED', 'REJECTED'];
        if (ad.status === 'APPROVED') {
            if (ad.designStatus === 'NEEDS_REVIEW') return ['READY', 'REJECTED'];
            return ['REJECTED'];
        }
        if (ad.status === 'REJECTED') return ['APPROVED'];
        return [];
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && createPortal(
                <div className={cn(
                    'fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white animate-in slide-in-from-bottom-4 duration-300',
                    toast.type === 'error' ? 'bg-danger' : toast.type === 'info' ? 'bg-indigo' : 'bg-success'
                )}>
                    {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>,
                document.body
            )}

            {/* Confirm Dialog */}
            {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

            {/* Portaled Action Dropdown Menu */}
            {activeMenu && menuAnchor && createPortal(
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => { setActiveMenu(null); setMenuAnchor(null); }} />
                    {ads.filter(ad => ad.id === activeMenu).map(ad => {
                        const isAdminOrProd = ['COMPANY_ADMIN', 'PRODUCTION'].includes(user?.role);
                        return (
                            <div
                                key={ad.id}
                                className="fixed z-[91] w-56 rounded-xl shadow-xl bg-white ring-1 ring-black/5 divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                                style={{ top: menuAnchor.top, right: menuAnchor.right }}
                            >
                                {/* General actions */}
                                <div className="p-1">
                                    <button onClick={() => { setActiveMenu(null); navigate(`/ads/${ad.id}/edit`); }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Edit2 className="w-4 h-4 text-gray-400" /> Edit Details
                                    </button>
                                    <button onClick={() => { setActiveMenu(null); copyText(ad.bodyText || ad.title || ''); }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Copy className="w-4 h-4 text-gray-400" /> Copy Ad Text
                                    </button>
                                </div>

                                {/* AdStatus transitions — COMPANY_ADMIN / PRODUCTION only */}
                                {isAdminOrProd && (
                                    <div className="p-1 bg-gray-50/50">
                                        <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Change Status</p>
                                        {getAvailableStatuses(ad).map((val) => {
                                            const meta = STATUS_META[val];
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleStatusAction(ad.id, val)}
                                                    disabled={!!actionLoading}
                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-lg transition-colors text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-30"
                                                >
                                                    <div className={cn("w-2 h-2 rounded-full", meta.color.split(' ')[0])} />
                                                    {meta.label}
                                                </button>
                                            );
                                        })}
                                        {getAvailableStatuses(ad).length === 0 && (
                                            <div className="px-3 py-2 text-xs text-gray-400 italic">No manual transitions available.</div>
                                        )}
                                    </div>
                                )}

                                {/* Design workflow actions */}
                                <div className="p-1 bg-gray-50/50">
                                    {/* Mark Content Added — only shown when designer flagged NEEDS_CONTENT */}
                                    {isAdminOrProd && ad.designStatus === 'NEEDS_CONTENT' && (
                                        <button
                                            onClick={() => handleDesignStatusAction(ad.id, 'CONTENT_ADDED')}
                                            disabled={!!actionLoading}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sky-700 hover:bg-sky-50 rounded-lg font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Mark Content Added
                                        </button>
                                    )}
                                    {isAdminOrProd && ad.status === 'APPROVED' && (
                                        <button
                                            onClick={() => { setActiveMenu(null); setMenuAnchor(null); setAssignModal({ isOpen: true, adId: ad.id }); }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-lg"
                                        >
                                            <Layers className="w-4 h-4 text-gray-400" /> Assign Designer...
                                        </button>
                                    )}
                                    {/* View Design Files — for admin/production to review designer's final PDF */}
                                    {isAdminOrProd && ad.assets?.some(a => a.assetRole === 'FINAL_PDF') && (
                                        <div className="px-3 py-2 space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Design Files</p>
                                            {ad.assets.filter(a => a.assetRole === 'FINAL_PDF').map(asset => (
                                                <a
                                                    key={asset.id}
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    <span className="truncate">{asset.filename || 'Final PDF'}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Delete */}
                                {isAdminOrProd && (
                                    <div className="p-1">
                                        <button
                                            onClick={() => { setActiveMenu(null); setMenuAnchor(null); setConfirm({ message: `Delete ad "${ad.title || ad.referenceCode}"? This action cannot be undone.`, onConfirm: () => handleDelete(ad.id) }); }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/5 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>,
                document.body
            )}


            {/* Assign Designer Modal */}
            {assignModal.isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Assign Designer</h3>
                                <p className="text-sm text-gray-500">Select a designer for this workflow task.</p>
                            </div>
                            <button onClick={() => setAssignModal({ isOpen: false, adId: null })} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar space-y-1 bg-gray-50/50">
                            {designers.map(d => {
                                const ad = ads.find(a => a.id === assignModal.adId);
                                const isCurrent = ad?.designedById === d.id;
                                return (
                                    <button
                                        key={d.id}
                                        onClick={() => handleAssignDesigner(assignModal.adId, d.id)}
                                        disabled={actionLoading}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-colors",
                                            isCurrent ? "bg-indigo/5 border-indigo/20 text-indigo" : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                                        )}
                                    >
                                        <div className="font-medium text-sm">{d.firstName} {d.lastName}</div>
                                        {isCurrent && <CheckCircle className="w-4 h-4 text-indigo" />}
                                    </button>
                                );
                            })}
                            
                            {ads.find(a => a.id === assignModal.adId)?.designedById && (
                                <button
                                    onClick={() => handleAssignDesigner(assignModal.adId, null)}
                                    disabled={actionLoading}
                                    className="w-full text-center px-4 py-3 mt-4 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                                >
                                    Unassign Designer
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Advertisements</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage, review, and track all your ad placements.</p>
                </div>
                <Button onClick={() => navigate('/ads/new')} className="flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Create Ad
                </Button>
            </div>

            {/* Metrics */}
            {metrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {metricCards.map(card => (
                        <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                <card.icon className={cn('w-5 h-5', card.color)} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{card.label}</p>
                                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-full sm:max-w-sm relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ref, or customer…"
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none">
                        <option value="">Status: All</option>
                        {Object.entries(STATUS_META).map(([val, m]) => <option key={val} value={val}>{m.label}</option>)}
                    </select>
                    <select value={issueFilter} onChange={e => { setIssueFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none">
                        <option value="">Issue: All</option>
                        {issues.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                    </select>
                    <select value={adTypeFilter} onChange={e => { setAdTypeFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none">
                        <option value="">Type: All</option>
                        {adTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select value={templateFilter} onChange={e => { setTemplateFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none">
                        <option value="">Template: All</option>
                        {templates.filter(t => !adTypeFilter || t.adTypeId === adTypeFilter).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 focus:outline-none">
                        <option value="">Payment: All</option>
                        {Object.entries(PAYMENT_META).map(([val, m]) => <option key={val} value={val}>{m.label}</option>)}
                    </select>
                    {(statusFilter || issueFilter || adTypeFilter || templateFilter || paymentFilter || search) && (
                        <button onClick={() => { setStatusFilter(''); setIssueFilter(''); setAdTypeFilter(''); setTemplateFilter(''); setPaymentFilter(''); setSearch(''); setPage(1); }}
                            className="text-xs text-danger hover:underline whitespace-nowrap flex items-center gap-1">
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>
                <button onClick={fetchData} className="ml-auto p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200">
                {error && (
                    <div className="p-8 text-center text-danger flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8" />
                        <p>{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
                    </div>
                )}

                {!error && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-5 py-3.5 rounded-tl-3xl">Ad Details</th>
                                    <th className="px-5 py-3.5">Publication / Issue</th>
                                    <th className="px-5 py-3.5">Size / Area</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Design</th>
                                    <th className="px-5 py-3.5">Payment</th>
                                    <th className="px-5 py-3.5">Tags</th>
                                    <th className="px-5 py-3.5 text-right">Price</th>
                                    <th className="px-5 py-3.5 rounded-tr-3xl"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 8 }).map((__, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className="h-4 bg-gray-100 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : ads.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <ImageIcon className="w-12 h-12" />
                                                <p className="font-medium text-gray-500">No ads found</p>
                                                <p className="text-sm">Try adjusting your filters or create a new ad.</p>
                                                <Button size="sm" onClick={() => navigate('/ads/new')} className="mt-2">
                                                    <Plus className="w-4 h-4 mr-1" /> Create Your First Ad
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : ads.map(ad => (
                                    <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors group">
                                        {/* Ad Details */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                                    {ad.artworkAssetUrl
                                                        ? <img src={ad.artworkAssetUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                                                        : <ImageIcon className="w-5 h-5 text-gray-400" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-accent transition-colors">
                                                        {ad.title || ad.adType?.name || 'Untitled Ad'}
                                                    </p>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-gray-500">
                                                                {ad.customer ? `${ad.customer.firstName} ${ad.customer.lastName}` : 'No customer'}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <button
                                                                onClick={() => copyText(ad.referenceCode)}
                                                                className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-accent font-mono"
                                                                title="Copy reference code"
                                                            >
                                                                {ad.referenceCode}
                                                                <ClipboardCopy className="w-3 h-3 ml-0.5" />
                                                            </button>
                                                        </div>
                                                        {ad.template && (
                                                            <div className="flex items-center gap-1 text-[10px] text-indigo font-medium">
                                                                <Layers className="w-3 h-3" />
                                                                Template: {ad.template.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Issue */}
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900 text-sm">{ad.publicationIssue?.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{ad.publicationIssue?.publicationType?.name}</p>
                                        </td>
                                        {/* Size/Area */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-gray-700">{SIZE_LABELS[ad.size]}</p>
                                            <p className="text-xs text-gray-500">{AREA_LABELS[ad.area]}</p>
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-4"><StatusBadge status={ad.status} /></td>
                                        {/* Design */}
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <DesignStatusBadge status={ad.designStatus} />
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    {ad.designedById 
                                                        ? designers.find(d => d.id === ad.designedById)?.firstName || 'Assigned' 
                                                        : 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Payment */}
                                        <td className="px-5 py-4"><PaymentBadge status={ad.paymentStatus} /></td>
                                        {/* Operational Tags */}
                                        <td className="px-5 py-4"><OpTags tags={ad.operationalTags} /></td>
                                        <td className="px-5 py-4 text-right">
                                            <p className="font-bold text-gray-900 cursor-help" title={ad.pricingBreakdown?.map(b => `${b.name}: $${Number(b.amount).toFixed(2)}`).join('\n')}>
                                                ${Number(ad.finalPrice).toFixed(2)}
                                            </p>
                                            {ad.invoice && (
                                                <span className={cn('text-xs font-medium',
                                                    ad.invoice.status === 'DRAFT' ? 'text-gray-400' :
                                                    ad.invoice.status === 'PAID' ? 'text-green-600' : 'text-warning'
                                                )}>
                                                    {ad.invoice.status === 'DRAFT' ? '· Draft Invoice' :
                                                     ad.invoice.status === 'PAID' ? '· Invoiced & Paid' :
                                                     `· ${ad.invoice.invoiceNumber}`}
                                                </span>
                                            )}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    if (activeMenu === ad.id) { setActiveMenu(null); setMenuAnchor(null); return; }
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setMenuAnchor({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                                    setActiveMenu(ad.id);
                                                }}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                disabled={actionLoading === ad.id}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="bg-gray-50/50 border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-3xl">
                    <p className="text-sm text-gray-500">
                        {loading ? '—' : `Showing ${Math.min((page - 1) * LIMIT + 1, total)}–${Math.min(page * LIMIT, total)} of ${total}`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}
                            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm text-gray-600 font-medium px-2">{page} / {totalPages || 1}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}
                            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
