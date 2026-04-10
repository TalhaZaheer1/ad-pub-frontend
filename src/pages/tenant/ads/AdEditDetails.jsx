import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { adUnitService } from '../../../services/adUnitService';
import { publicationIssueService } from '../../../services/publicationIssueService';
import { companyCustomerService } from '../../../services/companyCustomerService';
import { pricingService } from '../../../services/pricingService';
import { adTypeService } from '../../../services/adTypeService';
import { adSizeService } from '../../../services/adSizeService';
import { announcementTemplateService } from '../../../services/announcementTemplateService';
import {
  ArrowLeft, CheckCircle2, UploadCloud, User, LayoutTemplate, BookOpen,
  Image as ImageIcon, CreditCard, Search, ChevronRight, AlertTriangle,
  Tag, DollarSign, FileText, Save, X, Paperclip, FileImage, Trash2, ExternalLink
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuthStore } from '../../../store/authStore';

// SIZE_OPTIONS removed in favor of dynamic adSizes from DB
const AREA_OPTIONS = [
  { value: 'COVER_PAGE', label: 'Cover Page' },
  { value: 'INTERIOR_LEFT', label: 'Interior Left' },
  { value: 'INTERIOR_RIGHT', label: 'Interior Right' },
  { value: 'CLASSIFIED_SECTION', label: 'Classified Section' },
  { value: 'BACK_COVER', label: 'Back Cover' },
];
const COLOR_OPTIONS = [
  { value: 'FULL_COLOR', label: 'Full Color' },
  { value: 'GRAYSCALE', label: 'Grayscale' },
  { value: 'BLACK_WHITE', label: 'Black & White' },
];
const OP_TAG_OPTIONS = [
  { value: 'FREE', label: 'Free', desc: 'No charge' },
  { value: 'FILLER', label: 'Filler', desc: 'Fills unused space' },
  { value: 'EXCHANGE', label: 'Exchange', desc: 'Ad-for-ad arrangement' },
];
const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'WAIVED', label: 'Waived' },
  { value: 'NOT_REQUIRED', label: 'Not Required' },
];

export const AdEditDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [assets, setAssets] = useState([]);
  const [uploadingAssets, setUploadingAssets] = useState(false);

  // Lookup data
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [adTypes, setAdTypes] = useState([]);
  const [adSizes, setAdSizes] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [formData, setFormData] = useState({
    customerId: '',
    publicationIssueId: '',
    adTypeId: '',
    templateId: '',
    adSizeName: 'FULL_PAGE',
    hasBigVariant: true,
    hasSmallVariant: false,
    area: 'COVER_PAGE',
    orientation: 'PORTRAIT',
    colorProfile: 'FULL_COLOR',
    postingMethod: 'EMPLOYEE_UPLOAD',
    title: '',
    bodyText: '',
    specialInstructions: '',
    operationalTags: [],
    paymentStatus: 'PENDING',
    finalPrice: 0,
    discountAmount: 0,
    pricingBreakdown: []
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // Load dependency data
  useEffect(() => {
    Promise.all([
      companyCustomerService.getAll({ limit: 500 }),
      publicationIssueService.getAll({ status: 'OPEN', limit: 100 }),
      adTypeService.getAll({ isActive: true }),
      adSizeService.getAll(),
      announcementTemplateService.getAll({ isActive: true })
    ]).then(([custRes, issueRes, typeRes, sizeRes, tempRes]) => {
      setCustomers(custRes.data?.data?.customers || []);
      setIssues(issueRes.data?.data?.issues || []);
      setAdTypes(typeRes.data?.data?.adTypes || []);
      setAdSizes(sizeRes.data?.data?.adSizes || []);
      setTemplates(tempRes.data?.data?.templates || []);
    }).catch(() => showToast('Failed to load dependency data', 'error'));
  }, []);

  // Load existing ad
  useEffect(() => {
    if (!id) return;
    adUnitService.getOne(id).then(res => {
      const ad = res.data?.data?.adUnit;
      if (ad) {
        setFormData({
          customerId: ad.customerId || '',
          publicationIssueId: ad.publicationIssueId || '',
          adTypeId: ad.adTypeId || '',
          templateId: ad.templateId || '',
          adSizeName: ad.adSizeName || 'FULL_PAGE',
          hasBigVariant: ad.hasBigVariant ?? true,
          hasSmallVariant: ad.hasSmallVariant ?? false,
          area: ad.area || 'COVER_PAGE',
          orientation: ad.orientation || 'PORTRAIT',
          colorProfile: ad.colorProfile || 'FULL_COLOR',
          postingMethod: ad.postingMethod || 'EMPLOYEE_UPLOAD',
          title: ad.title || '',
          bodyText: ad.bodyText || '',
          specialInstructions: ad.specialInstructions || '',
          operationalTags: ad.operationalTags || [],
          paymentStatus: ad.paymentStatus || 'PENDING',
          partialPaymentAmount: Number(ad.partialPaymentAmount) || 0,
          discountAmount: Number(ad.pricingBreakdown?.find(b => b.name === 'Manual Discount')?.amount || 0),
          finalPrice: Number(ad.finalPrice) || 0,
          pricingBreakdown: ad.pricingBreakdown || []
        });
        setAssets(ad.assets || []);
      }
      setLoading(false);
    }).catch(() => {
      showToast('Failed to load ad unit', 'error');
      setLoading(false);
    });
  }, [id]);

  // Pricing preview
  const currentIssue = issues.find(i => i.id === formData.publicationIssueId);
  const publicationTypeId = currentIssue?.publicationType?.id;

  useEffect(() => {
    if (!formData.adSizeName || !formData.area || !formData.colorProfile) return;
    setPricingLoading(true);
    pricingService.previewPrice({
      publicationTypeId,
      adTypeId: formData.adTypeId,
      adSizeName: formData.adSizeName,
      area: formData.area,
      colorProfile: formData.colorProfile,
      discountAmount: formData.discountAmount
    }).then(res => {
      if (res.data?.data) {
        const p = res.data.data;
        const breakdown = [
          { name: 'Base Placement', amount: p.basePrice, type: 'BASE' },
          ...p.surcharges,
          ...p.discounts,
          ...p.taxes
        ];
        if (formData.discountAmount > 0) {
          breakdown.push({ name: 'Manual Discount', amount: formData.discountAmount, type: 'DISCOUNT' });
        }

        setFormData(prev => ({
          ...prev,
          finalPrice: Number(p.finalPrice),
          pricingBreakdown: breakdown
        }));
      }
    }).finally(() => setPricingLoading(false));
  }, [formData.adSizeName, formData.area, formData.colorProfile, formData.discountAmount, formData.adTypeId, formData.publicationIssueId, issues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log(formData)
    try {
      await adUnitService.update(id, formData);
      showToast('Changes saved successfully');
      setTimeout(() => navigate('/ads'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save changes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === formData.templateId);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-indigo/20 border-t-indigo rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Loading ad details...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Toast */}
      {toast && createPortal(
        <div className={cn(
          'fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white animate-in slide-in-from-bottom-4 duration-300',
          toast.type === 'error' ? 'bg-danger' : 'bg-success'
        )}>
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/ads')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Ad Details</h1>
            <p className="text-sm text-gray-500 mt-1">Modify configuration, content, and artwork.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/ads')} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <LayoutTemplate className="w-5 h-5 text-indigo" />
              <h2 className="font-bold text-gray-900">Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</label>
                <select value={formData.customerId} onChange={e => update('customerId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Publication Issue</label>
                <select value={formData.publicationIssueId} onChange={e => update('publicationIssueId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  <option value="">Select Issue</option>
                  {issues.map(i => <option key={i.id} value={i.id}>{i.title} ({i.publicationType?.name})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ad Type</label>
                <select value={formData.adTypeId} onChange={e => update('adTypeId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  <option value="">General Ad</option>
                  {adTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Template (Optional)</label>
                <select value={formData.templateId} onChange={e => {
                  const t = templates.find(temp => temp.id === e.target.value);
                  update('templateId', e.target.value);
                  if (t) {
                    update('title', t.subjectLine || t.name);
                    update('bodyText', t.templateContent || '');
                    showToast(`Applied template: ${t.name}`, 'info');
                  }
                }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  <option value="">No Template</option>
                  {templates.filter(t => !formData.adTypeId || t.adTypeId === formData.adTypeId).map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</label>
                <select value={formData.adSizeName} onChange={e => update('adSizeName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  {[...new Set(adSizes.map(s => s.name))].map(name => (
                    <option key={name} value={name}>{name.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Variants</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => update('hasBigVariant', !formData.hasBigVariant)}
                    disabled={!formData.hasSmallVariant && formData.hasBigVariant}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                      formData.hasBigVariant ? "border-accent bg-accent/5 text-accent" : "border-gray-200 text-gray-400"
                    )}
                  >
                    BIG
                  </button>
                  <button
                    type="button"
                    onClick={() => update('hasSmallVariant', !formData.hasSmallVariant)}
                    disabled={!formData.hasBigVariant && formData.hasSmallVariant}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                      formData.hasSmallVariant ? "border-accent bg-accent/5 text-accent" : "border-gray-200 text-gray-400"
                    )}
                  >
                    SMALL
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Area</label>
                <select value={formData.area} onChange={e => update('area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  {AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orientation</label>
                <select value={formData.orientation} onChange={e => update('orientation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  <option value="PORTRAIT">Portrait</option>
                  <option value="LANDSCAPE">Landscape</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color Profile</label>
                <select value={formData.colorProfile} onChange={e => update('colorProfile', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                  {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <FileText className="w-5 h-5 text-indigo" />
              <h2 className="font-bold text-gray-900">Ad Content</h2>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ad Title / Reference</label>
              <Input value={formData.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Summer Festival Promo" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Body Text</label>
              <textarea
                value={formData.bodyText}
                onChange={e => update('bodyText', e.target.value)}
                placeholder="Content of the announcement or ad copy..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 resize-none transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Special Instructions</label>
              <Input value={formData.specialInstructions} onChange={e => update('specialInstructions', e.target.value)} placeholder="e.g. Please use the high-res logo" />
            </div>
          </section>
        </div>

        {/* Right Column: Pricing, Tags, Artwork */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <section className="bg-indigo text-white rounded-3xl p-6 shadow-xl shadow-indigo/20 space-y-4 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Pricing Summary</p>
                {pricingLoading && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {formData.pricingBreakdown.map((item, idx) => (
                  <div key={idx} className={cn(
                    "flex justify-between text-sm",
                    item.type === 'DISCOUNT' ? "text-green-200" : "text-indigo-100"
                  )}>
                    <span>{item.name}</span>
                    <span>
                      {item.type === 'DISCOUNT' ? '-' : item.type === 'SURCHARGE' ? '+' : ''}${Number(item.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="h-px bg-white/20 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium">Final Price</span>
                  <span className="text-3xl font-bold tracking-tight">${Number(formData.finalPrice).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block mb-1">Manual Discount ($)</label>
                <input
                  type="number"
                  value={formData.discountAmount}
                  onChange={e => update('discountAmount', Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 text-white placeholder-white/30"
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>

          {/* Assets Section */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
              <ImageIcon className="w-5 h-5 text-indigo" />
              <h2 className="font-bold text-gray-900">Source Assets</h2>
              <span className="ml-auto text-xs text-gray-400">{assets.length} file{assets.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Existing assets */}
            {assets.length > 0 && (
              <div className="space-y-2">
                {assets.map(asset => {
                  const isImage = asset.format?.startsWith('image/');
                  return (
                    <div key={asset.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-indigo/5 border border-indigo/10 flex items-center justify-center shrink-0">
                        {isImage ? <FileImage className="w-4 h-4 text-indigo" /> : <Paperclip className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{asset.filename || 'Asset'}</p>
                        <p className="text-xs text-gray-400 capitalize">{asset.assetRole?.toLowerCase().replace('_', ' ')}</p>
                      </div>
                      <a href={asset.url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-indigo rounded-lg hover:bg-indigo/5 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete this asset?')) return;
                          try {
                            await adUnitService.removeAsset(id, asset.id);
                            setAssets(prev => prev.filter(a => a.id !== asset.id));
                            showToast('Asset deleted');
                          } catch { showToast('Failed to delete asset', 'error'); }
                        }}
                        className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-danger/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drop Zone */}
            <label
              htmlFor="edit-asset-upload"
              onDragOver={e => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files);
                if (!dropped.length) return;
                setUploadingAssets(true);
                try {
                  const fd = new FormData();
                  dropped.forEach(f => fd.append('assets', f));
                  fd.append('assetRole', 'SOURCE');
                  const res = await adUnitService.uploadAssets(id, fd);
                  setAssets(res.data.data.assets);
                  showToast(`${dropped.length} file(s) uploaded`);
                } catch { showToast('Upload failed', 'error'); }
                finally { setUploadingAssets(false); }
              }}
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-8 hover:bg-indigo/5 hover:border-indigo/30 transition-all cursor-pointer group"
            >
              {uploadingAssets ? (
                <div className="w-6 h-6 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-indigo/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                    <UploadCloud className="w-6 h-6 text-indigo" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo transition-colors">Drop to upload or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (max 50MB each)</p>
                  <input
                    id="edit-asset-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const selected = Array.from(e.target.files);
                      if (!selected.length) return;
                      setUploadingAssets(true);
                      try {
                        const fd = new FormData();
                        selected.forEach(f => fd.append('assets', f));
                        fd.append('assetRole', 'SOURCE');
                        const res = await adUnitService.uploadAssets(id, fd);
                        setAssets(res.data.data.assets);
                        showToast(`${selected.length} file(s) uploaded`);
                      } catch { showToast('Upload failed', 'error'); }
                      finally { setUploadingAssets(false); e.target.value = ''; }
                    }}
                  />
                </>
              )}
            </label>
          </section>

          {/* Operational & Payment */}
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <Tag className="w-5 h-5 text-indigo" />
                <h2 className="font-bold text-gray-900">Operational Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {OP_TAG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const tags = formData.operationalTags.includes(opt.value)
                        ? formData.operationalTags.filter(t => t !== opt.value)
                        : [...formData.operationalTags, opt.value];
                      update('operationalTags', tags);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                      formData.operationalTags.includes(opt.value)
                        ? "bg-indigo text-white border-indigo shadow-md shadow-indigo/20"
                        : "bg-white text-gray-500 border-gray-200 hover:border-indigo/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <CreditCard className="w-5 h-5 text-indigo" />
                <h2 className="font-bold text-gray-900">Payment Status</h2>
              </div>
              <select value={formData.paymentStatus} onChange={e => update('paymentStatus', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20">
                {(() => {
                  const isAuth = user?.role === 'COMPANY_ADMIN' || user?.role === 'SALES';
                  const current = formData.paymentStatus;
                  if (!isAuth) return PAYMENT_STATUS_OPTIONS.filter(o => o.value === current).map(o => <option key={o.value} value={o.value}>{o.label}</option>);

                  const transitions = {
                    'PENDING': ['PENDING', 'PAID', 'PARTIAL', 'WAIVED'],
                    'PAID': ['PAID', 'REFUNDED'],
                    'PARTIAL': ['PARTIAL', 'PAID', 'REFUNDED', 'WAIVED'],
                  };
                  const restricted = ['NOT_REQUIRED', 'REFUNDED', 'WAIVED'];

                  let available = PAYMENT_STATUS_OPTIONS;
                  if (restricted.includes(current)) {
                    available = PAYMENT_STATUS_OPTIONS.filter(o => o.value === current);
                  } else if (transitions[current]) {
                    available = PAYMENT_STATUS_OPTIONS.filter(o => transitions[current].includes(o.value));
                  }

                  return available.map(o => <option key={o.value} value={o.value}>{o.label}</option>);
                })()}
              </select>
            </div>

            {formData.paymentStatus === 'PARTIAL' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-1.5">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Partial Payment Amount ($)</label>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.partialPaymentAmount || ''}
                  onChange={e => update('partialPaymentAmount', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            )}
          </section>
        </div>
      </form>
    </div>
  );
};
