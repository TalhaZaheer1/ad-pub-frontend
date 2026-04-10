import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { announcementTemplateService } from '../../../services/announcementTemplateService';
import { adTypeService } from '../../../services/adTypeService';
import {
  LayoutTemplate, Plus, Search, Heart, Gift, PartyPopper, MoreVertical,
  Edit2, Copy, Trash2, Eye, Star, Globe, BookOpen, X, AlertCircle,
  ChevronDown, CheckCircle2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// Language display map
const LANGUAGES = { en: 'English', he: 'עברית', yi: 'ייִדיש' };
const LANGUAGE_OPTIONS = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'HEBREW', label: 'Hebrew (עברית)' },
  { value: 'YIDDISH', label: 'Yiddish (ייִדיש)' },
];

// Substitute placeholders in template content with sample values
const renderPreview = (content) => {
  let result = content || '';
  // (placeholders || []).forEach(({ key, example }) => {
  //   result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), example || `[${key}]`);
  // });
  return result;
};

// Empty form state
const emptyForm = {
  name: '', description: '', adTypeId: '', language: 'ENGLISH',
  subjectLine: '', templateContent: '',
  isActive: true, isDefault: false, sortOrder: 0,
};

export const AnnouncementTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [adTypes, setAdTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterAdTypeId, setFilterAdTypeId] = useState('');
  const [filterActive, setFilterActive] = useState('');  // '' | 'true' | 'false'
  const [filterDefault, setFilterDefault] = useState(false);

  // Modal state
  const [activeMenu, setActiveMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterAdTypeId) params.adTypeId = filterAdTypeId;
      if (filterActive !== '') params.isActive = filterActive;
      if (filterDefault) params.isDefault = true;

      const res = await announcementTemplateService.getAll(params);
      setTemplates(res.data.data?.templates || []);
    } catch (err) {
      setError('Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterAdTypeId, filterActive, filterDefault]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    adTypeService.getAll({ isActive: true }).then(res => {
      setAdTypes(res.data.data?.adTypes || []);
    }).catch(() => { });
  }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingTemplate(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (tpl) => {
    setEditingTemplate(tpl);
    setActiveMenu(null);
    setForm({
      name: tpl.name || '',
      description: tpl.description || '',
      adTypeId: tpl.adTypeId || '',
      language: tpl.language || 'ENGLISH',
      subjectLine: tpl.subjectLine || '',
      templateContent: tpl.templateContent || '',
      // placeholders: tpl.placeholders || [],
      isActive: tpl.isActive ?? true,
      isDefault: tpl.isDefault ?? false,
      sortOrder: tpl.sortOrder ?? 0,
    });
    setIsModalOpen(true);
  };

  const openPreview = (tpl) => {
    setPreviewTemplate(tpl);
    setActiveMenu(null);
    setIsPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.templateContent.trim()) {
      alert('Name and template content are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        adTypeId: form.adTypeId || null,
      };
      if (editingTemplate) {
        await announcementTemplateService.update(editingTemplate.id, payload);
      } else {
        await announcementTemplateService.create(payload);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (tpl) => {
    setActiveMenu(null);
    try {
      await announcementTemplateService.toggleActive(tpl.id);
      fetchTemplates();
    } catch {
      alert('Failed to toggle status.');
    }
  };

  const handleDuplicate = async (tpl) => {
    setActiveMenu(null);
    try {
      await announcementTemplateService.duplicate(tpl.id);
      fetchTemplates();
    } catch {
      alert('Failed to duplicate template.');
    }
  };

  const handleDelete = async (tpl) => {
    setActiveMenu(null);
    if (!window.confirm(`Deactivate "${tpl.name}"? It will be hidden from new use but its history is preserved.`)) return;
    try {
      await announcementTemplateService.delete(tpl.id);
      fetchTemplates();
    } catch {
      alert('Failed to deactivate template.');
    }
  };

  // ── Placeholder builder helpers ───────────────────────────────────────────
  // const addPlaceholder = () => {
  //   setForm(f => ({ ...f, placeholders: [...f.placeholders, { key: '', label: '', example: '' }] }));
  // };

  // const updatePlaceholder = (idx, field, value) => {
  //   setForm(f => {
  //     const updated = [...f.placeholders];
  //     updated[idx] = { ...updated[idx], [field]: value };
  //     return { ...f, placeholders: updated };
  //   });
  // };
  //
  // const removePlaceholder = (idx) => {
  //   setForm(f => ({ ...f, placeholders: f.placeholders.filter((_, i) => i !== idx) }));
  // };
  //
  // // Insert placeholder tag into textarea
  // const insertPlaceholder = (key) => {
  //   setForm(f => ({ ...f, templateContent: f.templateContent + `{${key}}` }));
  // };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="w-7 h-7 text-accent" />
            Ad Templates
          </h1>
          {/* <p className="text-sm text-gray-500 mt-1"> */}
          {/*   Reusable content blueprints for recurring announcements — with live placeholder substitution. */}
          {/* </p> */}
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Ad Type filter (using adTypes list as filter options) */}
        <select
          value={filterAdTypeId}
          onChange={e => setFilterAdTypeId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 min-w-[170px]"
        >
          <option value="">All Ad Types</option>
          {adTypes.map(at => (
            <option key={at.id} value={at.id}>{at.name}</option>
          ))}
        </select>

        {/* Active filter */}
        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 min-w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>

        {/* Defaults toggle */}
        <button
          onClick={() => setFilterDefault(v => !v)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors shrink-0',
            filterDefault
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <Star className={cn('w-4 h-4', filterDefault ? 'fill-amber-500 text-amber-500' : 'text-gray-400')} />
          Defaults only
        </button>
      </div>

      {/* ── Template Grid ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 text-danger rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <LayoutTemplate className="w-12 h-12 opacity-30" />
          <p className="font-medium">No templates found.</p>
          <p className="text-sm">Create your first template to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onEdit={openEdit}
              onPreview={openPreview}
              onToggle={handleToggleActive}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <TemplateModal
          form={form}
          setForm={setForm}
          editingTemplate={editingTemplate}
          adTypes={adTypes}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
          // addPlaceholder={addPlaceholder}
          // updatePlaceholder={updatePlaceholder}
          // removePlaceholder={removePlaceholder}
          // insertPlaceholder={insertPlaceholder}
          LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
        />
      )}

      {/* ── Preview Modal ───────────────────────────────────────────────── */}
      {isPreviewOpen && previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setIsPreviewOpen(false)}
          LANGUAGES={LANGUAGES}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Template Card
// ─────────────────────────────────────────────────────────────────────────────
const TemplateCard = ({ tpl, activeMenu, setActiveMenu, onEdit, onPreview, onToggle, onDuplicate, onDelete }) => {
  const preview = renderPreview(tpl.templateContent);
  const langLabel = { ENGLISH: 'EN', HEBREW: 'HE', YIDDISH: 'YI' }[tpl.language] || tpl.language;

  return (
    <div className={cn(
      'bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col',
      tpl.isActive ? 'border-gray-200 hover:border-accent/40' : 'border-gray-200 opacity-60'
    )}>
      {/* Card preview area */}
      <div className="h-36 bg-gray-50 border-b border-gray-100 p-4 relative group-hover:bg-accent/5 transition-colors overflow-hidden">
        <p className="text-xs text-gray-500 font-mono leading-relaxed line-clamp-5 whitespace-pre-wrap">
          {preview || <span className="italic text-gray-300">No content</span>}
        </p>
        {/* Language badge */}
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-md">
          {langLabel}
        </span>
        {tpl.isDefault && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded-md">
            <Star className="w-2.5 h-2.5 fill-amber-500" /> Default
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 leading-tight">{tpl.name}</h3>
          {!tpl.isActive && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">
              Inactive
            </span>
          )}
        </div>

        {tpl.adType && (
          <p className="text-xs text-accent font-medium mb-2">{tpl.adType.name}</p>
        )}

        {tpl.subjectLine && (
          <p className="text-xs text-gray-500 mb-3 italic truncate">"{tpl.subjectLine}"</p>
        )}

        {/* Placeholder tags */}
        {/* {tpl.placeholders?.length > 0 && ( */}
        {/*   <div className="flex flex-wrap gap-1 mb-3"> */}
        {/*     {tpl.placeholders.slice(0, 4).map((p) => ( */}
        {/*       <span key={p.key} className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono border border-accent/20"> */}
        {/*         {`{${p.key}}`} */}
        {/*       </span> */}
        {/*     ))} */}
        {/*     {tpl.placeholders.length > 4 && ( */}
        {/*       <span className="text-[10px] text-gray-400">+{tpl.placeholders.length - 4} more</span> */}
        {/*     )} */}
        {/*   </div> */}
        {/* )} */}

        {/* Stats */}
        <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 px-3 py-2 rounded-xl">
            <p className="text-xs text-gray-500 mb-0.5">Times Used</p>
            <p className="font-semibold text-gray-900">{tpl.usageCount ?? 0}</p>
          </div>
          {/* <div className="bg-gray-50 px-3 py-2 rounded-xl"> */}
          {/*   <p className="text-xs text-gray-500 mb-0.5">Placeholders</p> */}
          {/*   <p className="font-semibold text-gray-900">{tpl.placeholders?.length ?? 0}</p> */}
          {/* </div> */}
        </div>

        {/* Action row */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => onPreview(tpl)}
            className="text-xs py-1.5 border-accent text-accent hover:bg-accent hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>

          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === tpl.id ? null : tpl.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {activeMenu === tpl.id && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                <div className="absolute right-0 bottom-10 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-20 text-left">
                  <div className="p-1">
                    <button onClick={() => onEdit(tpl)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Edit2 className="w-4 h-4 text-gray-400" /> Edit
                    </button>
                    <button onClick={() => onDuplicate(tpl)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Copy className="w-4 h-4 text-gray-400" /> Duplicate
                    </button>
                    <button onClick={() => onToggle(tpl)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                      {tpl.isActive
                        ? <ToggleLeft className="w-4 h-4 text-gray-400" />
                        : <ToggleRight className="w-4 h-4 text-gray-400" />}
                      {tpl.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                  <div className="p-1">
                    <button onClick={() => onDelete(tpl)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg">
                      <Trash2 className="w-4 h-4" /> Deactivate & Hide
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Create / Edit Modal
// ─────────────────────────────────────────────────────────────────────────────
const TemplateModal = ({
  form, setForm, editingTemplate, adTypes, isSaving,
  onSave, onClose, LANGUAGE_OPTIONS
  // addPlaceholder, updatePlaceholder, removePlaceholder,
  // insertPlaceholder, 
}) => {
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'preview'
  const preview = renderPreview(form.templateContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl relative z-10 flex flex-col max-h-[92vh]">

        {/* Modal header */}
        <div className="p-6 border-b border-gray-100 shrink-0 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Define reusable content with dynamic placeholder substitution.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/50 shrink-0">
          {[
            { id: 'content', label: 'Content', icon: BookOpen },
            { id: 'preview', label: 'Preview', icon: Eye },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-accent text-accent bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Template Name *"
                    placeholder="e.g. Wedding Standard"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase block mb-1.5">Ad Type</label>
                  <select
                    value={form.adTypeId}
                    onChange={e => setForm(f => ({ ...f, adTypeId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="">General (no specific type)</option>
                    {adTypes.map(at => <option key={at.id} value={at.id}>{at.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase block mb-1.5">Language</label>
                  <select
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {LANGUAGE_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Subject / Headline"
                    placeholder="e.g. Mazal Tov on your wedding!"
                    value={form.subjectLine}
                    onChange={e => setForm(f => ({ ...f, subjectLine: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Description (internal note)"
                    placeholder="Short note for staff..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Template content */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-1.5">
                  Template Content *
                </label>
                <textarea
                  rows={8}
                  value={form.templateContent}
                  onChange={e => setForm(f => ({ ...f, templateContent: e.target.value }))}
                  placeholder={"Mazal Tov to the {family_name} family\non the wedding of {person_name}\nto {partner_name}\non {event_date}"}
                  className={cn(
                    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono",
                    form.language === 'he' || form.language === 'yi' ? 'text-right direction-rtl' : ''
                  )}
                  dir={form.language === 'he' || form.language === 'yi' ? 'rtl' : 'ltr'}
                />
                <p className="text-xs text-gray-400 mt-1">{form.templateContent.length} characters</p>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'isActive', label: 'Active', hint: 'Available for use in new ads' },
                  { key: 'isDefault', label: 'Default for this type', hint: 'Auto-suggested when creating ads' },
                ].map(flag => (
                  <label key={flag.key} className="flex items-start gap-3 p-4 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={form[flag.key]}
                      onChange={e => setForm(f => ({ ...f, [flag.key]: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 accent-accent rounded"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{flag.label}</p>
                      <p className="text-xs text-gray-500">{flag.hint}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* {/* PLACEHOLDERS TAB */}
          {/* {activeTab === 'placeholders' && ( */}
          {/*   <div className="space-y-4"> */}
          {/*     <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 text-sm text-accent"> */}
          {/*       <strong>How it works:</strong> Define variables like <code className="bg-white px-1 rounded">{'{family_name}'}</code> here. */}
          {/*       When staff selects this template, they'll be prompted to fill in each placeholder before the ad is generated. */}
          {/*     </div> */}
          {/**/}
          {/*     {form.placeholders.length === 0 && ( */}
          {/*       <p className="text-gray-400 text-sm text-center py-8">No placeholders defined yet.</p> */}
          {/*     )} */}
          {/**/}
          {/*     {form.placeholders.map((p, idx) => ( */}
          {/*       <div key={idx} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-4"> */}
          {/*         <div className="grid grid-cols-3 gap-3 flex-1"> */}
          {/*           <input */}
          {/*             placeholder="key (e.g. family_name)" */}
          {/*             value={p.key} */}
          {/*             onChange={e => updatePlaceholder(idx, 'key', e.target.value.replace(/\s/g, '_').toLowerCase())} */}
          {/*             className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/20" */}
          {/*           /> */}
          {/*           <input */}
          {/*             placeholder="Label (e.g. Family Name)" */}
          {/*             value={p.label} */}
          {/*             onChange={e => updatePlaceholder(idx, 'label', e.target.value)} */}
          {/*             className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" */}
          {/*           /> */}
          {/*           <input */}
          {/*             placeholder="Example (e.g. Cohen)" */}
          {/*             value={p.example} */}
          {/*             onChange={e => updatePlaceholder(idx, 'example', e.target.value)} */}
          {/*             className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" */}
          {/*           /> */}
          {/*         </div> */}
          {/*         <button */}
          {/*           onClick={() => removePlaceholder(idx)} */}
          {/*           className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-colors shrink-0" */}
          {/*         > */}
          {/*           <X className="w-4 h-4" /> */}
          {/*         </button> */}
          {/*       </div> */}
          {/*     ))} */}
          {/**/}
          {/*     <Button variant="outline" onClick={addPlaceholder} className="flex items-center gap-2 w-full justify-center border-dashed"> */}
          {/*       <Plus className="w-4 h-4" /> Add Placeholder */}
          {/*     </Button> */}
          {/*   </div> */}
          {/* )} */}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="space-y-5">
              {form.subjectLine && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Headline</p>
                  <p className="font-bold text-gray-900 text-lg">{form.subjectLine}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Generated Content</p>
                <div
                  className={cn(
                    "bg-gray-50 border border-gray-200 rounded-2xl p-6 whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed",
                    form.language === 'he' || form.language === 'yi' ? 'text-right' : ''
                  )}
                  dir={form.language === 'he' || form.language === 'yi' ? 'rtl' : 'ltr'}
                >
                  {preview || <span className="text-gray-400 italic">Nothing to preview yet.</span>}
                </div>
              </div>
              {/*   {form.placeholders.length > 0 && ( */}
              {/*     <div> */}
              {/*       <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sample Values Used</p> */}
              {/*       <div className="flex flex-wrap gap-2"> */}
              {/*         {form.placeholders.map((p, i) => ( */}
              {/*           <span key={i} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5"> */}
              {/*             <span className="font-mono text-accent">{`{${p.key}}`}</span> */}
              {/*             <span className="text-gray-400 mx-1">→</span> */}
              {/*             <span className="text-gray-700">{p.example || '(empty)'}</span> */}
              {/*           </span> */}
              {/*         ))} */}
              {/*       </div> */}
              {/*     </div> */}
              {/*   )} */}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Preview Modal (standalone view of a saved template)
// ─────────────────────────────────────────────────────────────────────────────
const PreviewModal = ({ template, onClose, LANGUAGES }) => {
  const preview = renderPreview(template.templateContent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl relative z-10 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {template.adType && <span className="text-xs text-accent font-medium">{template.adType.name}</span>}
              <span className="text-xs text-gray-400">{LANGUAGES[template.language] || template.language}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5">
          {template.subjectLine && (
            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Headline</p>
              <p className="font-bold text-gray-900">{template.subjectLine}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Content (sample values)</p>
            <div
              className="bg-gray-50 border border-gray-200 rounded-2xl p-5 whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed"
              dir={template.language === 'he' || template.language === 'yi' ? 'rtl' : 'ltr'}
            >
              {preview}
            </div>
          </div>
          {/* {template.placeholders?.length > 0 && ( */}
          {/*   <div> */}
          {/*     <p className="text-xs font-bold text-gray-500 uppercase mb-2">Required Fields</p> */}
          {/*     <div className="space-y-2"> */}
          {/*       {template.placeholders.map((p, i) => ( */}
          {/*         <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-2"> */}
          {/*           <span className="text-gray-700 font-medium">{p.label}</span> */}
          {/*           <span className="font-mono text-accent text-xs">{`{${p.key}}`}</span> */}
          {/*         </div> */}
          {/*       ))} */}
          {/*     </div> */}
          {/*   </div> */}
          {/* )} */}
        </div>
        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};
