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
  Tag, DollarSign, FileText, X, Paperclip, FileImage
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const STEPS = [
  { id: 'customer', title: 'Customer', icon: User },
  { id: 'config', title: 'Ad Configuration', icon: LayoutTemplate },
  { id: 'publication', title: 'Publication', icon: BookOpen },
  { id: 'content', title: 'Content & Tags', icon: FileText },
  { id: 'artwork', title: 'Artwork', icon: ImageIcon },
  { id: 'summary', title: 'Review & Confirm', icon: CreditCard },
];

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
  { value: 'FREE', label: 'Free', desc: 'No charge — complementary placement' },
  { value: 'FILLER', label: 'Filler', desc: 'Fills unused space in the issue' },
  { value: 'EXCHANGE', label: 'Exchange', desc: 'Ad-for-ad or barter arrangement' },
];
const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'NOT_REQUIRED', label: 'Not Required (Free/Filler)' },
];

export const AdCreateWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [files, setFiles] = useState([]);

  // Lookup data
  const [customers, setCustomers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [adTypes, setAdTypes] = useState([]);
  const [adSizes, setAdSizes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [pricingPreview, setPricingPreview] = useState(null);
  const [currentPublicationTypeId, setCurrentPublicationTypeId] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Customer
    customerId: '',
    customerName: '',
    // Config
    adTypeId: '',
    templateId: '',
    adSizeName: 'FULL_PAGE',
    hasBigVariant: true,
    hasSmallVariant: false,
    area: 'COVER_PAGE',
    orientation: 'PORTRAIT',
    colorProfile: 'FULL_COLOR',
    postingMethod: 'EMPLOYEE_UPLOAD',
    // Publication
    publicationIssueId: '',
    // Content
    title: '',
    bodyText: '',
    specialInstructions: '',
    // Tags
    operationalTags: [],
    paymentStatus: 'PENDING',
    partialPaymentAmount: 0,
    finalPrice: 0,
    discountAmount: 0,
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load customers
  useEffect(() => {
    companyCustomerService.getAll({ limit: 200 })
      .then(res => setCustomers(res.data?.data?.customers || []))
      .catch(() => { });
  }, []);

  // Load open publication issues
  useEffect(() => {
    // TODO: add a search option in publication issue selector
    publicationIssueService.getAll({ status: 'OPEN', limit: 100 })
      .then(res => setIssues(res.data?.data?.issues || []))
      .catch(() => { });
  }, []);

  // Load ad types and templates
  useEffect(() => {
    adTypeService.getAll({ isActive: true })
      .then(res => setAdTypes(res.data?.data?.adTypes || []))
      .catch(() => { });
    adSizeService.getAll()
      .then(res => setAdSizes(res.data?.data?.adSizes || []))
      .catch(() => { });
    announcementTemplateService.getAll({ isActive: true })
      .then(res => setTemplates(res.data?.data?.templates || []))
      .catch(() => { });
  }, []);

  // Load existing ad data if editing
  // Pricing preview
  useEffect(() => {
    if (!formData.publicationIssueId || !formData.adSizeName) return;
    setPricingLoading(true);
    pricingService.previewPrice({
      publicationTypeId: currentPublicationTypeId,
      adSizeName: formData.adSizeName,
      area: formData.area,
      colorProfile: formData.colorProfile,
      discountAmount: formData.discountAmount
    }).then(res => {
      const data = res.data?.data;
      if (data) {
        setPricingPreview(data);
        update('finalPrice', data.finalPrice);
      }
    }).catch(() => {
      setPricingPreview(null);
    }).finally(() => setPricingLoading(false));
  }, [formData.adSizeName, formData.area, formData.colorProfile, formData.publicationIssueId, formData.discountAmount]);

  const handleNext = () => { if (currentStep < STEPS.length - 1) setCurrentStep(p => p + 1); };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(p => p - 1);
    else navigate('/ads');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      showToast('Creating ad...', 'info');
      const res = await adUnitService.create(formData);
      const adId = res.data.data.adUnit.id;

      if (files.length > 0) {
        showToast('Uploading assets, please wait...', 'info');
        const uploadData = new FormData();
        files.forEach(file => uploadData.append('assets', file));
        uploadData.append('assetRole', 'SOURCE');
        await adUnitService.uploadAssets(adId, uploadData);
      }

      showToast('Ad unit and assets created successfully!');
      setTimeout(() => navigate('/ads'), 1500);
    } catch (err) {
      let errMsg = err.response?.data?.message || 'Failed to create ad unit.';
      if (err.response?.data?.errors) {
        errMsg += ' ' + err.response.data.errors.map(e => e.message || e).join(', ');
      }
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle operational tag
  const toggleOpTag = (tag) => {
    update('operationalTags', formData.operationalTags.includes(tag)
      ? formData.operationalTags.filter(t => t !== tag)
      : [...formData.operationalTags, tag]);
    // If adding FREE, FILLER, EXCHANGE → suggest NOT_REQUIRED for payment
    if (['FREE', 'FILLER', 'EXCHANGE'].includes(tag) && !formData.operationalTags.includes(tag)) {
      update('paymentStatus', 'NOT_REQUIRED');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return (c.firstName + ' ' + c.lastName + ' ' + (c.businessName || '')).toLowerCase().includes(q);
  });

  // ---- Step Renders ----

  const renderCustomerStep = () => (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Select Customer</h3>
        <p className="text-sm text-gray-500 mt-0.5">Who is this advertisement for?</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers…"
          value={customerSearch}
          onChange={e => setCustomerSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredCustomers.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">No customers found. <span className="text-accent cursor-pointer hover:underline" onClick={() => navigate('/customers/new')}>Create one?</span></p>
        )}
        {filteredCustomers.map(c => (
          <button
            key={c.id}
            onClick={() => { update('customerId', c.id); update('customerName', `${c.firstName} ${c.lastName}`); }}
            className={cn(
              'w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between',
              formData.customerId === c.id
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <div>
              <p className={cn('font-semibold text-sm', formData.customerId === c.id ? 'text-accent' : 'text-gray-900')}>
                {c.firstName} {c.lastName}
              </p>
              {c.businessName && <p className="text-xs text-gray-500 mt-0.5">{c.businessName}</p>}
            </div>
            {formData.customerId === c.id && <CheckCircle2 className="w-5 h-5 text-accent" />}
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100">
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox"
            checked={!formData.customerId}
            onChange={() => { update('customerId', ''); update('customerName', ''); }}
            className="rounded"
          />
          No customer (internal / filler ad)
        </label>
      </div>
    </div>
  );

  const renderConfigStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Ad Configuration</h3>
        <p className="text-sm text-gray-500 mt-0.5">Define physical dimensions and styling.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Ad Type</label>
          <select value={formData.adTypeId} onChange={e => { update('adTypeId', e.target.value); update('templateId', ''); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm">
            <option value="">Select Ad Type...</option>
            {adTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 col-span-full md:col-span-1">
          <label className="text-sm font-semibold text-gray-900">Size</label>
          <select value={formData.adSizeName} onChange={e => update('adSizeName', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm">
            {[...new Set(adSizes.map(s => s.name))].map(name => (
              <option key={name} value={name}>{name.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 col-span-full md:col-span-1">
          <label className="text-sm font-semibold text-gray-900">Layout Variants</label>
          <div className="flex gap-2 h-[46px]">
            <button
              onClick={() => update('hasBigVariant', !formData.hasBigVariant)}
              disabled={!formData.hasSmallVariant && formData.hasBigVariant}
              className={cn(
                "flex-1 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                formData.hasBigVariant ? "border-accent bg-accent/5 text-accent" : "border-gray-200 text-gray-400 grayscale opacity-60"
              )}
            >
              BIG {formData.hasBigVariant && <CheckCircle2 className="w-3 h-3" />}
            </button>
            <button
              onClick={() => update('hasSmallVariant', !formData.hasSmallVariant)}
              disabled={!formData.hasBigVariant && formData.hasSmallVariant}
              className={cn(
                "flex-1 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                formData.hasSmallVariant ? "border-accent bg-accent/5 text-accent" : "border-gray-200 text-gray-400 grayscale opacity-60"
              )}
            >
              SMALL {formData.hasSmallVariant && <CheckCircle2 className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400">At least one variant must be selected.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Placement / Area</label>
          <select value={formData.area} onChange={e => update('area', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm">
            {AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Orientation</label>
          <div className="flex gap-3">
            {['PORTRAIT', 'LANDSCAPE'].map(v => (
              <button key={v} onClick={() => update('orientation', v)}
                className={cn('flex-1 p-3 rounded-xl border text-sm font-medium transition-all',
                  formData.orientation === v ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 hover:border-gray-300 text-gray-600')}>
                {v.charAt(0) + v.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Posting Method</label>
          <div className="flex gap-3">
            {[{ v: 'EMPLOYEE_UPLOAD', l: 'Staff Upload' }, { v: 'CUSTOMER_UPLOAD', l: 'Customer Upload' }].map(o => (
              <button key={o.v} onClick={() => update('postingMethod', o.v)}
                className={cn('flex-1 p-3 rounded-xl border text-sm font-medium transition-all',
                  formData.postingMethod === o.v ? 'border-indigo bg-indigo/5 text-indigo' : 'border-gray-200 hover:border-gray-300 text-gray-600')}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-900">Color Profile</label>
        <div className="grid grid-cols-3 gap-3">
          {COLOR_OPTIONS.map(o => (
            <button key={o.value} onClick={() => update('colorProfile', o.value)}
              className={cn('p-3 rounded-xl border text-sm font-medium transition-all',
                formData.colorProfile === o.value ? 'border-indigo bg-indigo/5 text-indigo' : 'border-gray-200 hover:border-gray-300 text-gray-600')}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPublicationStep = () => (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Target Publication Issue</h3>
        <p className="text-sm text-gray-500 mt-0.5">Which upcoming issue is this ad for?</p>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {issues.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400">
            No open issues found. Please create a publication issue first.
          </div>
        )}
        {issues.map(issue => (
          <div
            key={issue.id}
            onClick={() => {
              setCurrentPublicationTypeId(issue.publicationType.id)
              update('publicationIssueId', issue.id)
            }}
            className={cn(
              'p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between',
              formData.publicationIssueId === issue.id
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50'
            )}
          >
            <div>
              <p className={cn('font-bold text-sm', formData.publicationIssueId === issue.id ? 'text-accent' : 'text-gray-900')}>
                {issue.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {issue.publicationType?.name} · Issue {new Date(issue.issueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-white border border-gray-100 text-gray-600">
                Deadline: {new Date(issue.deadlineAt).toLocaleDateString()}
              </span>
              {formData.publicationIssueId === issue.id && <CheckCircle2 className="w-5 h-5 text-accent ml-2 inline" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Content & Tags</h3>
        <p className="text-sm text-gray-500 mt-0.5">Ad text, instructions, and operational tags.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Choose Template <span className="text-gray-400 font-normal">(optional)</span></label>
          <select
            value={formData.templateId}
            onChange={e => {
              const tid = e.target.value;
              update('templateId', tid);
              if (tid) {
                const t = templates.find(x => x.id === tid);
                if (t) {
                  update('title', t.subjectLine || t.name);
                  update('bodyText', t.templateContent || '');
                  showToast(`Template "${t.name}" applied.`);
                }
              }
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm"
          >
            <option value="">No Template (Manual Entry)</option>
            {templates.filter(t => !formData.adTypeId || t.adTypeId === formData.adTypeId).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <Input label="Ad Title / Headline" placeholder="e.g. Grand Opening Sale" value={formData.title} onChange={e => update('title', e.target.value)} />
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Body Text</label>
          <textarea rows={4} value={formData.bodyText} onChange={e => update('bodyText', e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            placeholder="Full ad copy / announcement text…" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-900">Special Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea rows={2} value={formData.specialInstructions} onChange={e => update('specialInstructions', e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            placeholder="E.g. Place near front cover, use bold for name…" />
        </div>
      </div>

      {/* Operational Tags */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">Operational Classification</p>
        </div>
        <p className="text-xs text-gray-500">Select if this ad is non-commercial. Selecting one will auto-suggest "Not Required" for payment status.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OP_TAG_OPTIONS.map(o => (
            <button key={o.value} onClick={() => toggleOpTag(o.value)}
              className={cn('p-3 rounded-xl border text-left transition-all',
                formData.operationalTags.includes(o.value)
                  ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
                  : 'border-gray-200 hover:border-gray-300')}>
              <p className={cn('text-sm font-semibold', formData.operationalTags.includes(o.value) ? 'text-purple-700' : 'text-gray-800')}>{o.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{o.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Status */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">Payment Status</label>
        <select value={formData.paymentStatus} onChange={e => update('paymentStatus', e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm">
          {PAYMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {formData.paymentStatus === 'PARTIAL' && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
            <label className="text-xs font-bold text-accent uppercase tracking-wider">Partial Payment Amount ($)</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={formData.partialPaymentAmount} 
              onChange={e => update('partialPaymentAmount', Number(e.target.value))} 
            />
          </div>
        )}
        {formData.paymentStatus === 'NOT_REQUIRED' && (
          <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 px-3 py-2 rounded-lg">
            A Draft Invoice will still be created with $0 value for internal tracking.
          </p>
        )}
      </div>
    </div>
  );

  const renderArtworkStep = () => {
    const handleDrop = (e) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...dropped]);
    };
    const handleFileChange = (e) => {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected]);
    };
    const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Source Assets</h3>
          <p className="text-sm text-gray-500 mt-0.5">Upload images or PDFs for this ad. You can add more later.</p>
        </div>

        {/* Drop Zone */}
        <label
          htmlFor="asset-upload"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-gray-50/50 hover:bg-indigo/5 hover:border-indigo/30 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 group-hover:bg-indigo/10 transition-all">
            <UploadCloud className="w-8 h-8 text-indigo" />
          </div>
          <p className="text-base font-semibold text-gray-900 group-hover:text-indigo transition-colors">Drop files here or click to browse</p>
          <p className="text-sm text-gray-500 mt-1">PNG, JPG, PDF, SVG (max 50MB each)</p>
          <input id="asset-upload" type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
        </label>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
            {files.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-indigo/5 border border-indigo/10 flex items-center justify-center shrink-0">
                    {isImage ? <FileImage className="w-4 h-4 text-indigo" /> : <Paperclip className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => removeFile(idx)} className="p-1 text-gray-400 hover:text-danger rounded-full hover:bg-danger/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <ImageIcon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Assets are optional</p>
            <p className="text-sm text-gray-600 mt-0.5">You can skip this step. Source assets can always be added or replaced from the ad details page.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-gray-900">Final Summary</h3>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{formData.customerName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue / Publication</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{issues.find(i => i.id === formData.publicationIssueId)?.title || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ad Configuration</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formData.adSizeName.replace(/_/g, ' ')} ({formData.hasBigVariant ? 'BIG' : ''}{formData.hasBigVariant && formData.hasSmallVariant ? ' + ' : ''}{formData.hasSmallVariant ? 'SMALL' : ''})
              · {formData.area.replace(/_/g, ' ')} · {formData.colorProfile.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posting Method</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{formData.postingMethod}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Breakdown</p>
            {pricingLoading && <div className="w-3 h-3 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />}
          </div>

          {pricingLoading ? (
            <div className="h-20 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <span className="text-xs text-gray-400">Re-calculating price...</span>
            </div>
          ) : pricingPreview ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base Placement</span>
                <span className="font-medium text-gray-900">${Number(pricingPreview.basePrice).toFixed(2)}</span>
              </div>
              {pricingPreview.surcharges?.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">+ {s.name}</span>
                  <span className="font-medium text-gray-900">${Number(s.amount).toFixed(2)}</span>
                </div>
              ))}
              {pricingPreview.discounts?.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">– {d.name}</span>
                  <span className="font-medium text-success">-${Number(d.amount).toFixed(2)}</span>
                </div>
              ))}
              {formData.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">– Manual Discount</span>
                  <span className="font-medium text-success">-${Number(formData.discountAmount).toFixed(2)}</span>
                </div>
              )}
              {pricingPreview.taxes?.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax: {t.name}</span>
                  <span className="font-medium text-blue-600">${Number(t.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No pricing calculated.</p>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-4 w-1/2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Apply Manual Discount ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.discountAmount}
                onChange={e => update('discountAmount', Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Final Total</p>
              <p className="text-4xl font-black text-gray-900 mt-1 tracking-tight">${Number(pricingPreview?.finalPrice || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex gap-4 text-sm text-indigo-900 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-bold">Automated Billing</p>
          <p className="text-indigo-600 mt-0.5 opacity-80">A Draft Invoice will be generated automatically. No immediate payment is required now.</p>
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderCustomerStep, renderConfigStep, renderPublicationStep, renderContentStep, renderArtworkStep, renderSummaryStep];
  const canProceed = () => {
    if (currentStep === 2 && !formData.publicationIssueId) return false;
    return true;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Toast */}
      {toast && createPortal(
        <div className={cn(
          'fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white animate-in slide-in-from-bottom-4 duration-300',
          toast.type === 'error' ? 'bg-danger' : toast.type === 'info' ? 'bg-indigo' : 'bg-success'
        )}>
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={handleBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Advertisement</h1>
          <p className="text-sm text-gray-500 mt-1">Set up a new ad placement for a customer.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full md:w-60 shrink-0 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 hidden md:block">
          <ul className="space-y-5 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-gray-100 before:-z-0">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isPast = index < currentStep;
              return (
                <li key={step.id} className="relative z-10 flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all',
                    isActive ? 'bg-accent border-accent text-white shadow-md shadow-accent/20' :
                      isPast ? 'bg-success border-success text-white' :
                        'bg-white border-gray-200 text-gray-400'
                  )}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className={cn('text-sm font-medium',
                    isActive ? 'text-gray-900 font-bold' : isPast ? 'text-gray-500' : 'text-gray-400')}>
                    {step.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Content Pane */}
        <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[520px] flex flex-col relative overflow-hidden">
          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            {STEPS.map((_, i) => <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= currentStep ? 'bg-accent' : 'bg-gray-200')} />)}
          </div>

          <div className="flex-1 pb-24">
            {stepRenderers[currentStep]?.()}
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur border-t border-gray-100 flex items-center justify-between">
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Step {currentStep + 1} of {STEPS.length}</span>
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-1.5">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={isSubmitting}
                  className="bg-success hover:bg-success/90 text-white">
                  {isSubmitting ? 'Submitting...' : 'Create Ad Placement'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
