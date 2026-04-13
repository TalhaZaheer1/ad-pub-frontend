import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { designerService } from '../../../services/designerService';
import { adUnitService } from '../../../services/adUnitService';
import { publicationIssueService } from '../../../services/publicationIssueService';
import { adTypeService } from '../../../services/adTypeService';
import { userService } from '../../../services/userService';
import { Button } from '../../../components/ui/Button';
import { LayoutDashboard, MoreVertical, Copy, CheckCircle, ArrowRightCircle, Download, FileText, FileCode2, Search, Filter, CheckSquare, Square, Save, Scissors, X, Paperclip, FileImage, UploadCloud, ExternalLink, Trash2, Eye, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../../utils/cn';
import { useAuthStore } from '../../../store/authStore';

const DESIGN_STATUS_META = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-gray-100 text-gray-500' },
  QUEUED: { label: 'Queued', color: 'bg-blue-50 text-blue-600' },
  IN_DESIGN: { label: 'In Design', color: 'bg-indigo-50 text-indigo-700' },
  NEEDS_CONTENT: { label: 'Needs Content', color: 'bg-orange-50 text-orange-600' },
  CONTENT_ADDED: { label: 'Content Added', color: 'bg-sky-50 text-sky-700' },
  NEEDS_REVIEW: { label: 'Needs Review', color: 'bg-yellow-50 text-yellow-700' },
  APPROVED: { label: 'Approved', color: 'bg-green-50 text-green-700' },
};

const OP_TAG_META = {
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  FREE: { label: 'Free', color: 'bg-purple-100 text-purple-700' },
  FILLER: { label: 'Filler', color: 'bg-gray-100 text-gray-500' },
  EXCHANGE: { label: 'Exchange', color: 'bg-blue-100 text-blue-600' },
};

// SIZE_LABELS removed in favor of dynamic name/dimensions from the ad unit object

const OpTags = ({ tags = [] }) => (
  <div className="flex flex-wrap gap-1">
    {tags.map(t => {
      const m = OP_TAG_META[t] || { label: t, color: 'bg-gray-100 text-gray-500' };
      return <span key={t} className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold border border-black/5', m.color)}>{m.label}</span>;
    })}
  </div>
);

export const DesignerDashboard = () => {
  const { user } = useAuthStore();

  // Core Data
  const [ads, setAds] = useState([]);
  const [issues, setIssues] = useState([]);
  const [adTypes, setAdTypes] = useState([]);
  const [designers, setDesigners] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState('ASSIGNED');
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null); // { top, right } for portal positioning
  const [selectedAd, setSelectedAd] = useState(null); // for asset panel
  const [uploadingFinal, setUploadingFinal] = useState(false);
  const [variantModal, setVariantModal] = useState(null); // { adId, hasBig, hasSmall }
  const [previewAsset, setPreviewAsset] = useState(null); // { url, filename, format }
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Filters
  const [issueFilter, setIssueFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab === 'ASSIGNED') params.assignedDesignerId = 'me';
      if (tab === 'UNASSIGNED') {
        params.assignedDesignerId = 'unassigned';
        params.status = 'APPROVED'; // Only approved ads enter the design queue
      }

      // Fast filters
      if (issueFilter) params.publicationIssueId = issueFilter;
      if (statusFilter) params.designStatus = statusFilter;
      if (tagFilter) params.operationalTag = tagFilter;


      const [adsRes, issuesRes, adTypesRes, usersRes] = await Promise.all([
        designerService.getAllTasks(params),
        publicationIssueService.getAll({ limit: 100 }),
        adTypeService.getAll({ isActive: true }),
        (user?.companyId && ['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(user.role))
          ? userService.getCompanyUsers(user.companyId, { role: 'DESIGNER', limit: 100 })
          : Promise.resolve({ data: { data: [] } })
      ]);

      let fetchedAds = adsRes.data?.data?.adUnits || [];

      // Handle local grouping if needed based on Tabs
      if (tab === 'BY_ISSUE') {
        fetchedAds.sort((a, b) => (a.publicationIssueId || '').localeCompare(b.publicationIssueId || ''));
      } else if (tab === 'BY_TYPE') {
        fetchedAds.sort((a, b) => (a.adTypeId || '').localeCompare(b.adTypeId || ''));
      }

      setAds(fetchedAds);
      setIssues(issuesRes.data?.data?.issues || []);
      setAdTypes(adTypesRes.data?.data?.adTypes || []);
      setDesigners(Array.isArray(usersRes.data?.data) ? usersRes.data.data : usersRes.data?.data?.users || []);
      setSelectedIds(new Set());
    } catch (e) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, issueFilter, statusFilter, tagFilter, user?.companyId]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  useEffect(() => {
    if (!previewAsset) return;
    const isPdf = previewAsset.format === 'application/pdf' || previewAsset.filename?.toLowerCase().endsWith('.pdf');
    if (!isPdf) return;

    let localUrl = null;
    const controller = new AbortController();

    const fetchPdf = async () => {
      setPdfLoading(true);
      try {
        const response = await fetch(previewAsset.url, { signal: controller.signal });
        const blob = await response.blob();
        localUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setPdfBlobUrl(localUrl);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch PDF for preview:', err);
          showToast('Failed to load PDF preview', 'error');
        }
      } finally {
        setPdfLoading(false);
      }
    };

    fetchPdf();

    return () => {
      controller.abort();
      if (localUrl) URL.revokeObjectURL(localUrl);
      setPdfBlobUrl(null);
      setPdfLoading(false);
    };
  }, [previewAsset]);

  const toggleSelection = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  const toggleAll = () => {
    if (selectedIds.size === ads.length && ads.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(ads.map(a => a.id)));
  };

  // --- Bulk Actions ---
  const handleBulkAssign = async (designerId) => {
    if (!selectedIds.size) return;
    setActionLoading('bulk-assign');
    try {
      await designerService.bulkAssignDesigner(Array.from(selectedIds), designerId);
      showToast('Bulk assignment successful');
      fetchDashboardData();
    } catch (e) {
      showToast('Bulk assignment failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDesignStatus = async (status) => {
    if (!selectedIds.size) return;
    setActionLoading('bulk-status');
    try {
      await designerService.bulkUpdateDesignStatus(Array.from(selectedIds), status);
      showToast('Bulk status updated');
      fetchDashboardData();
    } catch (e) {
      showToast('Bulk status update failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkExportSnippets = async (adUnitIds = null, forcedVariant = null) => {
    const ids = adUnitIds || Array.from(selectedIds);
    if (!ids.length) return;

    // If single ad and has both variants and no variant forced yet, show modal
    if (ids.length === 1 && !forcedVariant) {
      const ad = ads.find(a => a.id === ids[0]);
      if (ad && ad.hasBigVariant && ad.hasSmallVariant) {
        setVariantModal({ adId: ad.id, hasBig: true, hasSmall: true });
        return;
      }
    }

    setActionLoading('bulk-export');
    try {
      const res = await designerService.exportInDesignSnippet({
        adUnitIds: ids,
        variant: forcedVariant || undefined
      });
      // The response is now a raw XML string
      const xmlData = typeof res.data === 'string' ? res.data : res.data?.data?.snippets || '';
      const blob = new Blob([xmlData], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `indesign-snippet-${forcedVariant || 'export'}-${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('InDesign XML Downloaded');
      setSelectedIds(new Set());
      setVariantModal(null);
    } catch (e) {
      showToast('Export failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkExportPdf = async () => {
    if (!selectedIds.size) return;
    setActionLoading('bulk-export-pdf');
    showToast('Generating PDF Group...', 'info');
    try {
      const res = await designerService.exportGroupedPdf({ adUnitIds: Array.from(selectedIds) });
      const pdfsData = res.data?.data?.pdfs || [];
      const urls = pdfsData.map(p => p.url).filter(Boolean);

      if (urls.length === 0) {
        showToast('No PDF assets found for selected ads', 'error');
        return;
      }

      const mergedPdf = await PDFDocument.create();

      for (const url of urls) {
        try {
          const resp = await fetch(url);
          const bytes = await resp.arrayBuffer();

          // Check if it's a PDF or Image
          try {
            const doc = await PDFDocument.load(bytes);
            const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
          } catch (pdfErr) {
            // Attempt to embed as image if not a PDF
            try {
              const extension = url.split('.').pop().toLowerCase().split('?')[0]; // strip query params
              let image;
              if (extension === 'jpg' || extension === 'jpeg') {
                image = await mergedPdf.embedJpg(bytes);
              } else if (extension === 'png') {
                image = await mergedPdf.embedPng(bytes);
              }

              if (image) {
                const page = mergedPdf.addPage([image.width, image.height]);
                page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
              }
            } catch (imgErr) {
              console.warn('Skipping non-pdf/non-image asset:', url);
            }
          }
        } catch (fetchErr) {
          console.error('Failed to fetch asset:', url, fetchErr);
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `grouped-designs-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      showToast('PDF Export Complete');
      setSelectedIds(new Set());
    } catch (e) {
      console.error('Grouped PDF Export Error:', e);
      showToast('PDF Export failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Single Actions ---
  const handleUpdateStatus = async (adId, newStatus, showMsg) => {
    // Gate NEEDS_REVIEW — must have at least one FINAL_PDF asset
    if (newStatus === 'NEEDS_REVIEW') {
      const ad = ads.find(a => a.id === adId);
      const hasFinalPdf = ad?.assets?.some(a => a.assetRole === 'FINAL_PDF');
      if (!hasFinalPdf) {
        showToast('Upload a Final PDF design before sending for review.', 'error');
        return;
      }
    }
    setActionLoading(adId);
    try {
      await designerService.updateDesignStatus(adId, newStatus);
      if (showMsg) showToast(showMsg);
      await fetchDashboardData();
    } catch (e) {
      showToast('Error updating status', 'error');
    } finally {
      setActionLoading(null);
      setActiveMenu(null);
    }
  };

  const handleUploadFinalPdf = async (adId, files) => {
    if (!files.length) return;
    setUploadingFinal(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('assets', f));
      fd.append('assetRole', 'FINAL_PDF');
      const res = await adUnitService.uploadAssets(adId, fd);
      const updatedAssets = res.data.data.assets;
      setSelectedAd(prev => ({ ...prev, assets: updatedAssets }));
      setAds(prev => prev.map(a => a.id === adId ? { ...a, assets: updatedAssets } : a));
      showToast('Final PDF uploaded successfully');
    } catch (e) {
      showToast('Upload failed', 'error');
    } finally {
      setUploadingFinal(false);
    }
  };

  const copyText = (text, type = "Text") => {
    if (!text) return showToast('Nothing to copy', 'error');
    navigator.clipboard.writeText(text);
    showToast(`Copied ${type}`, 'info');
  };


  return (
    <div className="space-y-6">
      {toast && createPortal(
        <div className={cn('fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white animate-in slide-in-from-bottom-4', toast.type === 'error' ? 'bg-danger' : toast.type === 'info' ? 'bg-indigo' : 'bg-success')}>
          {toast.msg}
        </div>,
        document.body
      )}

      {/* Portaled Action Dropdown */}
      {activeMenu && menuAnchor && createPortal(
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => { setActiveMenu(null); setMenuAnchor(null); }} />
          {ads.filter(ad => ad.id === activeMenu).map(ad => (
            <div
              key={ad.id}
              className="fixed z-[91] w-56 rounded-xl shadow-xl bg-white ring-1 ring-black/5 divide-y divide-gray-100 text-left animate-in fade-in zoom-in-95 duration-100 origin-top-right"
              style={{ top: menuAnchor.top, right: menuAnchor.right }}
            >
              <div className="p-1">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                <button onClick={() => { setActiveMenu(null); setMenuAnchor(null); setSelectedAd(ad); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 rounded-lg"><FileImage className="w-3.5 h-3.5" /> View Assets & Upload</button>
                <button onClick={() => { setActiveMenu(null); setMenuAnchor(null); handleBulkExportSnippets([ad.id]); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 rounded-lg"><FileCode2 className="w-3.5 h-3.5" /> Export Snippet</button>
                <button onClick={() => { setActiveMenu(null); copyText(ad.bodyText, 'Body'); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Copy className="w-3.5 h-3.5" /> Copy Ad Text</button>
                <button onClick={() => { setActiveMenu(null); copyText(ad.title, 'Title'); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Copy className="w-3.5 h-3.5" /> Copy Title</button>
                <button onClick={() => { setActiveMenu(null); copyText(ad.referenceCode, 'Reference'); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><FileText className="w-3.5 h-3.5" /> Copy Ref ID</button>
              </div>
              <div className="p-1 bg-gray-50/50">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Workflow Transitions</p>
                <button onClick={() => handleUpdateStatus(ad.id, 'IN_DESIGN', 'Picked up & In Design')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 rounded-lg"><CheckCircle className="w-3.5 h-3.5" /> Complete &amp; Stay</button>
                <button onClick={() => handleUpdateStatus(ad.id, 'NEEDS_REVIEW', 'Sent to Needs Review')} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50 rounded-lg"><ArrowRightCircle className="w-3.5 h-3.5" /> Complete &amp; Move</button>
                <div className="mt-2 text-[10px] px-3 font-semibold text-gray-400">SET STATUS</div>
                <div className="grid grid-cols-2 gap-1 p-1">
                  {/* Designers can only set these 4 states — APPROVED/CONTENT_ADDED are set by admin */}
                  {['NOT_STARTED', 'IN_DESIGN', 'NEEDS_CONTENT', 'NEEDS_REVIEW'].map(k => (
                    <button key={k} onClick={() => handleUpdateStatus(ad.id, k, `Set to ${DESIGN_STATUS_META[k]?.label}`)} className="text-[10px] truncate px-1 py-1 hover:bg-white border border-transparent hover:border-gray-200 rounded text-gray-600">{DESIGN_STATUS_META[k]?.label}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>,
        document.body
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Production Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Manage, filter, and batch export jobs for print arrays.</p>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
        {[{ id: 'ASSIGNED', label: 'My Queue' }, { id: 'UNASSIGNED', label: 'Unassigned' }, { id: 'BY_ISSUE', label: 'Grouped by Issue' }, { id: 'BY_TYPE', label: 'Grouped by Category' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap", tab === t.id ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200")}
          >
            {t.label} {tab === t.id && `(${ads.length})`}
          </button>
        ))}
      </div>

      {/* Fast Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 ml-1 mr-2"><Filter className="w-4 h-4" /> Filters:</div>
        <select className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-accent" value={issueFilter} onChange={e => setIssueFilter(e.target.value)}>
          <option value="">All Issues</option>
          {issues.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
        <select className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-accent" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Design Statuses</option>
          {Object.entries(DESIGN_STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-accent" value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
          <option value="">All Tags</option>
          {Object.entries(OP_TAG_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={() => { setIssueFilter(''); setStatusFilter(''); setTagFilter(''); }} className="text-gray-500">Reset</Button>
      </div>

      {/* Bulk Action Bar Active State */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo text-white p-3 rounded-xl flex items-center justify-between shadow-lg sticky top-24 z-30 animate-in slide-in-from-top-4">
          <span className="font-semibold">{selectedIds.size} Jobs Selected</span>
          <div className="flex gap-2">
            {user?.role !== 'DESIGNER' && (
              <select
                className="text-sm bg-white text-gray-900 rounded-lg px-2 py-1 outline-none font-medium"
                onChange={e => { if (e.target.value) handleBulkAssign(e.target.value); e.target.value = ''; }}
                disabled={actionLoading}
              >
                <option value="">Bulk Assign...</option>
                <option value={user.id}>Assign to Me</option>
                {designers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                <option value="unassigned">Unassign</option>
              </select>
            )}

            <button onClick={handleBulkExportPdf} disabled={actionLoading} className="flex px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              <Download className="w-4 h-4 mr-1.5" /> Grouped PDF
            </button>
            <button onClick={() => handleBulkExportSnippets()} disabled={actionLoading} className="flex px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              <FileCode2 className="w-4 h-4 mr-1.5" /> Snippets
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-accent">
                    {selectedIds.size === ads.length && ads.length > 0 ? <CheckSquare className="w-5 h-5 text-accent" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-4 py-3">Ad Details</th>
                <th className="px-4 py-3">Issue & Tag</th>
                <th className="px-4 py-3">Variant / Size</th>
                <th className="px-4 py-3">Workflow State</th>
                <th className="px-4 py-3">Designer</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ads.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    No ads found in this queue. Refine filters or check other tabs.
                  </td>
                </tr>
              )}
              {ads.map(ad => (
                <tr key={ad.id} className={cn("hover:bg-gray-50/50 transition-colors", selectedIds.has(ad.id) && "bg-indigo-50/30")}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelection(ad.id)} className="text-gray-400 hover:text-accent">
                      {selectedIds.has(ad.id) ? <CheckSquare className="w-5 h-5 text-accent" /> : <Square className="w-5 h-5" />}
                    </button>
                  </td>

                  {/* Ad Details */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 truncate max-w-[200px]" title={ad.title || ad.adType?.name}>{ad.title || ad.adType?.name || 'Untitled'}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-xs text-gray-400">{ad.referenceCode}</span>
                      <button onClick={() => copyText(ad.bodyText, 'Body Content')} className="p-0.5 text-gray-400 hover:text-indigo rounded" title="Copy Ad Body Text">
                        <Scissors className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{ad.customer ? `${ad.customer.firstName} ${ad.customer.lastName}` : 'N/A'}</p>
                  </td>

                  {/* Issue and Tag */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">{ad.publicationIssue?.title || 'No Issue'}</p>
                    <div className="mt-1"><OpTags tags={ad.operationalTags} /></div>
                  </td>

                  {/* Size and Variant */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{ad.adSizeName?.replace(/_/g, ' ')}</p>
                    <div className="flex gap-1 mt-1">
                      {ad.hasBigVariant && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-orange-50 text-orange-700 border-orange-200">BIG</span>
                      )}
                      {ad.hasSmallVariant && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-sky-50 text-sky-700 border-sky-200">SMALL</span>
                      )}
                    </div>
                  </td>

                  {/* Workflow Status */}
                  <td className="px-4 py-3">
                    <span className={cn('px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider', DESIGN_STATUS_META[ad.designStatus]?.color || 'bg-gray-100 text-gray-500')}>
                      {DESIGN_STATUS_META[ad.designStatus]?.label || ad.designStatus}
                    </span>
                    {ad.lastDesignActionAt && <p className="text-[10px] text-gray-400 mt-1">Updated {new Date(ad.lastDesignActionAt).toLocaleDateString()}</p>}
                  </td>

                  {/* Assigned To */}
                  <td className="px-4 py-3">
                    {ad.designedById === user.id ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo bg-indigo/10 px-2 py-0.5 rounded-md">Assigned (Me)</span>
                    ) : ad.designedById ? (
                      <span className="text-xs text-gray-600 font-medium">Assigned</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        if (activeMenu === ad.id) { setActiveMenu(null); setMenuAnchor(null); return; }
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuAnchor({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                        setActiveMenu(ad.id);
                      }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Asset Selection Side Panel (Portaled) */}
      {selectedAd && createPortal(
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedAd(null)} />
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900">Assets</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">{selectedAd.title || selectedAd.referenceCode}</p>
              </div>
              <button onClick={() => setSelectedAd(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Ad Content */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 text-left">Ad Content</p>
                {selectedAd.bodyText ? (
                  <p className="text-sm text-gray-700 leading-relaxed text-left">{selectedAd.bodyText}</p>
                ) : (
                  <p className="text-xs text-gray-400 italic text-left">No body text.</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => copyText(selectedAd.title, 'Ad Title')}
                    className="flex items-center gap-1.5 text-xs text-indigo font-semibold hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Title
                  </button>
                  <button
                    onClick={() => copyText(selectedAd.bodyText, 'Ad Content')}
                    className="flex items-center gap-1.5 text-xs text-indigo font-semibold hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Body
                  </button>
                </div>
              </div>

              {/* Source Assets */}
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 text-left">Source Assets ({selectedAd.assets?.filter(a => a.assetRole === 'SOURCE').length})</p>
                {selectedAd.assets?.filter(a => a.assetRole === 'SOURCE').length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-left">No source assets uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAd.assets?.filter(a => a.assetRole === 'SOURCE').map(asset => (
                      <div key={asset.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo/5 flex items-center justify-center shrink-0">
                          {asset.format?.startsWith('image/') ? <FileImage className="w-4 h-4 text-indigo" /> : <Paperclip className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate text-left">{asset.filename || 'Asset'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewAsset(asset)}
                            className="p-1.5 text-gray-400 hover:text-indigo rounded-lg hover:bg-indigo/5 transition-colors" title="Preview">
                            <Eye className="w-4 h-4" />
                          </button>
                          <a href={asset.url} target="_blank" rel="noreferrer" download
                            className="p-1.5 text-gray-400 hover:text-indigo rounded-lg hover:bg-indigo/5 transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Final PDF Upload */}
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 text-left">Final Design PDF ({selectedAd.assets?.filter(a => a.assetRole === 'FINAL_PDF').length})</p>
                {selectedAd.assets?.filter(a => a.assetRole === 'FINAL_PDF').map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate text-left">{asset.filename || 'Final PDF'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="p-1.5 text-gray-400 hover:text-green-700 rounded-lg hover:bg-green-100 transition-colors" title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <a href={asset.url} target="_blank" rel="noreferrer" download
                        className="p-1.5 text-gray-400 hover:text-green-700 rounded-lg hover:bg-green-100 transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}

                <label
                  htmlFor="final-pdf-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-indigo/5 hover:border-indigo/30 transition-all cursor-pointer group mt-2"
                >
                  {uploadingFinal ? (
                    <div className="w-5 h-5 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-7 h-7 text-indigo mb-2 group-hover:scale-110 transition-all" />
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo transition-colors">Upload Final PDF</p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF format preferred</p>
                    </>
                  )}
                  <input
                    id="final-pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleUploadFinalPdf(selectedAd.id, Array.from(e.target.files))}
                  />
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
              {!(selectedAd.assets?.some(a => a.assetRole === 'FINAL_PDF')) && (
                <p className="text-xs text-warning font-semibold flex items-center gap-1.5">
                  ⚠ Upload a Final PDF before sending for review.
                </p>
              )}
              <Button
                className={cn("w-full flex justify-center gap-2", (selectedAd.assets?.some(a => a.assetRole === 'FINAL_PDF')) ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed text-white")}
                disabled={!(selectedAd.assets?.some(a => a.assetRole === 'FINAL_PDF')) || !!actionLoading}
                onClick={() => handleUpdateStatus(selectedAd.id, 'NEEDS_REVIEW', 'Sent for Review')}
              >
                <ArrowRightCircle className="w-4 h-4" /> Send for Review
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Online Preview Modal (Portaled) */}
      {previewAsset && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewAsset(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo/5 flex items-center justify-center">
                  {(previewAsset.format === 'application/pdf' || previewAsset.filename?.toLowerCase().endsWith('.pdf')) ? <FileText className="w-5 h-5 text-indigo" /> : <FileImage className="w-5 h-5 text-indigo" />}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">{previewAsset.filename}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">{(previewAsset.format === 'application/pdf' || previewAsset.filename?.toLowerCase().endsWith('.pdf')) ? 'PDF Design' : 'Image Asset'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewAsset.url} download className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-hidden relative">
              {(previewAsset.format === 'application/pdf' || previewAsset.filename?.toLowerCase().endsWith('.pdf')) ? (
                <div className="w-full h-full relative">
                  {pdfLoading && (
                    <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-indigo border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-sm text-gray-500 font-medium animate-pulse">Fetching high-resolution design...</p>
                    </div>
                  )}
                  {pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=0`}
                      className="w-full h-full border-none"
                      title="PDF Preview"
                    />
                  ) : !pdfLoading && (
                    <div className="text-center p-8">
                      <p className="text-gray-500 font-medium">Preparing PDF preview...</p>
                    </div>
                  )}
                </div>
              ) : previewAsset.format?.startsWith('image/') ? (
                <div className="w-full h-full p-4 flex items-center justify-center">
                  <img
                    src={previewAsset.url}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm bg-white shadow-xl ring-1 ring-black/5"
                    alt={previewAsset.filename}
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Preview not available for this file type.</p>
                  <a href={previewAsset.url} download className="text-indigo font-bold hover:underline mt-2 inline-block">Download instead</a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Variant Selection Modal */}
      {variantModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setVariantModal(null)}></div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-sm relative z-[120] animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Select Variant</h3>
                <p className="text-sm text-gray-500">Which dimensions should we use?</p>
              </div>
              <button onClick={() => setVariantModal(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {variantModal.hasBig && (
                <button
                  onClick={() => handleBulkExportSnippets([variantModal.adId], 'BIG')}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-orange-100 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-200 transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-orange-800">BIG Variant</p>
                    <p className="text-xs text-orange-600 mt-0.5">Primary larger layout</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {variantModal.hasSmall && (
                <button
                  onClick={() => handleBulkExportSnippets([variantModal.adId], 'SMALL')}
                  className="w-full py-4 px-6 rounded-2xl border-2 border-sky-100 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-200 transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-sky-800">SMALL Variant</p>
                    <p className="text-xs text-sky-600 mt-0.5">Compact layout version</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
