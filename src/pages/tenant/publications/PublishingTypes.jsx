import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { publicationTypeService } from '../../../services/publicationTypeService';
import { adTypeService } from '../../../services/adTypeService';
import { adSizeService } from '../../../services/adSizeService';
import { announcementTemplateService } from '../../../services/announcementTemplateService';
import {
  Settings,
  Plus,
  BookOpen,
  LayoutTemplate,
  MoreVertical,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Tag,
  Hash,
  FileText,
  X,
  Star,
  Globe,
  Maximize2
} from 'lucide-react';
import { cn } from '../../../utils/cn';


const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyAdTypeForm = { name: '', description: '', isActive: true, sortOrder: 0 };

export const PublishingTypes = () => {
  const [activeTab, setActiveTab] = useState('publishing'); // 'publishing' or 'ads'
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Publication Types State
  const [publicationTypes, setPublicationTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ad Types State
  const [adTypes, setAdTypes] = useState([]);
  const [adTypesLoading, setAdTypesLoading] = useState(false);
  const [adTypeForm, setAdTypeForm] = useState(emptyAdTypeForm);
  const [adTypeMenu, setAdTypeMenu] = useState(null);
  const [adTypeMenuPos, setAdTypeMenuPos] = useState({ top: 0, right: 0 });
  const [isAdTypeModalOpen, setIsAdTypeModalOpen] = useState(false);
  const [editingAdType, setEditingAdType] = useState(null);
  
  // Ad Sizes State
  const [adSizes, setAdSizes] = useState([]);
  const [adSizesLoading, setAdSizesLoading] = useState(false);
  const [isAdSizeModalOpen, setIsAdSizeModalOpen] = useState(false);
  const [editingAdSize, setEditingAdSize] = useState(null);
  const [adSizeForm, setAdSizeForm] = useState({ name: '', widthBig: '', heightBig: '', widthSmall: '', heightSmall: '', unit: 'mm' });

  // Templates panel state
  const [templatesPanel, setTemplatesPanel] = useState(null); // { adType, templates, loading }

  const [pubTypeForm, setPubTypeForm] = useState({
    name: '',
    frequency: 'WEEKLY',
    defaultPublishDay: 'Friday',
    defaultPublishDate: '',
    specialPublicationDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchPublicationTypes();
    fetchAdTypes();
    fetchAdSizes();
  }, []);

  const fetchPublicationTypes = async () => {
    setIsLoading(true);
    try {
      const res = await publicationTypeService.getAll();
      setPublicationTypes(res.data.data.publicationTypes);
    } catch (error) {
      console.error('Failed to fetch publication types', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdTypes = async () => {
    setAdTypesLoading(true);
    try {
      const res = await adTypeService.getAll();
      setAdTypes(res.data.data.adTypes || []);
    } catch (error) {
      console.error('Failed to fetch ad types', error);
    } finally {
      setAdTypesLoading(false);
    }
  };

  const fetchAdSizes = async () => {
    setAdSizesLoading(true);
    try {
      const res = await adSizeService.getAll();
      setAdSizes(res.data.data.adSizes || []);
    } catch (error) {
      console.error('Failed to fetch ad sizes', error);
    } finally {
      setAdSizesLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'publishing') {
      setPubTypeForm({
        name: '',
        frequency: 'WEEKLY',
        defaultPublishDay: 'Friday',
        defaultPublishDate: '',
        specialPublicationDate: '',
        isActive: true
      });
    } else if (activeTab === 'sizes') {
      handleOpenAdSizeModal();
      return; // handleOpenAdSizeModal handles its own modal state
    }
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    if (activeTab === 'publishing') {
      setPubTypeForm({
        name: item.name,
        frequency: item.frequency,
        defaultPublishDay: item.defaultPublishDay || '',
        defaultPublishDate: item.defaultPublishDate || '',
        specialPublicationDate: item.specialPublicationDate ? item.specialPublicationDate.split('T')[0] : '',
        isActive: item.isActive
      });
    }
    setActiveMenu(null);
    setIsCreateModalOpen(true);
  };

  const handleSavePublicationType = async () => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await publicationTypeService.update(editingItem.id, { ...pubTypeForm, defaultPublishDate: pubTypeForm.defaultPublishDate || null });
      } else {
        await publicationTypeService.create({ ...pubTypeForm, defaultPublishDate: pubTypeForm.defaultPublishDate || null });
      }
      fetchPublicationTypes();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || 'Failed to save publication type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePublicationType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this publication type?')) return;
    try {
      await publicationTypeService.delete(id);
      fetchPublicationTypes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete publication type');
    }
  };

  // ── Ad Type Handlers ──────────────────────────────────────────────────────
  const handleOpenAdTypeModal = (adType = null) => {
    setEditingAdType(adType);
    setAdTypeForm(
      adType
        ? { name: adType.name, description: adType.description || '', isActive: adType.isActive, sortOrder: adType.sortOrder }
        : emptyAdTypeForm
    );
    setAdTypeMenu(null);
    setIsAdTypeModalOpen(true);
  };

  const handleSaveAdType = async () => {
    setIsSubmitting(true);
    try {
      if (editingAdType) {
        await adTypeService.update(editingAdType.id, adTypeForm);
      } else {
        await adTypeService.create(adTypeForm);
      }
      fetchAdTypes();
      setIsAdTypeModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save ad type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAdType = async (id) => {
    setAdTypeMenu(null);
    try {
      await adTypeService.toggleActive(id);
      fetchAdTypes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle ad type');
    }
  };

  const handleDeleteAdType = async (id, name) => {
    setAdTypeMenu(null);
    if (!window.confirm(`Remove ad type "${name}"? If it has linked ads it will be deactivated instead.`)) return;
    try {
      const res = await adTypeService.delete(id);
      const msg = res.data?.message || 'Done.';
      if (res.data?.message?.includes('deactivated')) alert(msg);
      fetchAdTypes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove ad type');
    }
  };

  // ── Ad Size Handlers ──────────────────────────────────────────────────────
  const handleOpenAdSizeModal = (adSize = null) => {
    setEditingAdSize(adSize);
    setAdSizeForm(
      adSize
        ? { 
            name: adSize.name, 
            widthBig: adSize.widthBig, 
            heightBig: adSize.heightBig, 
            widthSmall: adSize.widthSmall, 
            heightSmall: adSize.heightSmall, 
            unit: adSize.unit 
          }
        : { name: '', widthBig: '', heightBig: '', widthSmall: '', heightSmall: '', unit: 'mm' }
    );
    setIsAdSizeModalOpen(true);
  };

  const handleSaveAdSize = async () => {
    setIsSubmitting(true);
    try {
      if (editingAdSize) {
        await adSizeService.update(editingAdSize.id, adSizeForm);
      } else {
        await adSizeService.create(adSizeForm);
      }
      fetchAdSizes();
      setIsAdSizeModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save ad size');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdSize = async (id, name) => {
    if (!window.confirm(`Delete "${name}" size? This may affect existing ads or pricing rules.`)) return;
    try {
      await adSizeService.delete(id);
      fetchAdSizes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete ad size');
    }
  };

  const handleViewTemplates = async (adType) => {
    setAdTypeMenu(null);
    setTemplatesPanel({ adType, templates: [], loading: true });
    try {
      const res = await announcementTemplateService.getAll({ adTypeId: adType.id });
      setTemplatesPanel({ adType, templates: res.data.data?.templates || [], loading: false });
    } catch {
      setTemplatesPanel({ adType, templates: [], loading: false });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await publicationTypeService.toggleActive(id);
      fetchPublicationTypes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global publication streams and ad format constraints.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={
              activeTab === 'publishing' ? handleOpenCreateModal : 
              activeTab === 'ads' ? () => handleOpenAdTypeModal() :
              () => handleOpenAdSizeModal()
            }
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'publishing' ? 'New Publication Type' : activeTab === 'ads' ? 'New Ad Type' : 'New Ad Size'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-scroll md:flex-row min-h-[600px]">

        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-64 bg-gray-50/50 border-b md:border-b-0 md:border-r  border-gray-100 p-6 shrink-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Settings Menu</p>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('publishing')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                activeTab === 'publishing' ? "bg-accent/10 text-accent" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <BookOpen className="w-5 h-5" />
              Publication Types
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                activeTab === 'ads' ? "bg-accent/10 text-accent" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <LayoutTemplate className="w-5 h-5" />
              Ad Formats
            </button>
            <button
              onClick={() => setActiveTab('sizes')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left",
                activeTab === 'sizes' ? "bg-accent/10 text-accent" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Maximize2 className="w-5 h-5" />
              Ad Sizes
            </button>
          </nav>
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 p-6 lg:p-10 relative">

          {/* Publishing Types Tab */}
          {activeTab === 'publishing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Publication Types</h2>
                <p className="text-sm text-gray-500 mt-1">Define the properties for the master publications you produce.</p>
                <div className="mt-4 p-4 bg-indigo/5 border border-indigo/10 rounded-xl">
                  <p className="text-sm text-indigo font-medium">
                    Note: The system automatically schedules and generates publication issues up to 6 months in advance whenever you create or modify a publication type, ensuring a predictable calendar without duplicate schedules.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="text-gray-500 py-10">Loading publication types...</div>
              ) : publicationTypes.length === 0 ? (
                <div className="text-gray-500 py-10">No publication types found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {publicationTypes.map(pub => (
                    <div key={pub.id} className={cn("border border-gray-200 rounded-2xl p-5 hover:border-accent hover:shadow-md transition-all group bg-white relative", !pub.isActive && "opacity-75")}>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === pub.id ? null : pub.id)}
                          className="absolute -right-2 -top-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {activeMenu === pub.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <div className="origin-top-right absolute right-0 top-6 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-20 animate-in fade-in zoom-in-95 duration-100 text-left">
                              <div className="p-1">
                                <button
                                  onClick={() => handleOpenEditModal(pub)}
                                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                  <Edit2 className="w-4 h-4 text-gray-400" /> Edit Details
                                </button>
                                <button
                                  onClick={() => { setActiveMenu(null); handleToggleActive(pub.id); }}
                                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                  {pub.isActive ? <ToggleLeft className="w-4 h-4 text-warning" /> : <ToggleRight className="w-4 h-4 text-success" />}
                                  {pub.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                              <div className="p-1">
                                <button
                                  onClick={() => { setActiveMenu(null); handleDeletePublicationType(pub.id); }}
                                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg">
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-indigo/10 flex items-center justify-center mb-4 text-indigo">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-accent transition-colors">{pub.name}</h3>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Frequency</span>
                          <span className="font-medium text-gray-900">{pub.frequency === 'SPECIAL' ? `Special (${pub.specialPublicationDate ? pub.specialPublicationDate.split('T')[0] : ''})` : pub.frequency}</span>
                        </div>
                        {pub.frequency !== 'SPECIAL' && pub.frequency !== 'MONTHLY' && pub.frequency !== 'QUARTERLY' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Default Publish Day</span>
                            <span className="font-medium text-gray-900">{pub.defaultPublishDay || 'N/A'}</span>
                          </div>
                        )}
                        {(pub.frequency === 'MONTHLY' || pub.frequency === 'QUARTERLY') && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Publish Date (1-31)</span>
                            <span className="font-medium text-gray-900">{pub.defaultPublishDate || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                          {pub.issueCount} Issues Created
                        </span>
                        {!pub.isActive && (
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ad Types Tab */}
          {activeTab === 'ads' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ad Formats</h2>
                <p className="text-sm text-gray-500 mt-1">Manage the categories of ads you sell and their template associations.</p>
              </div>

              {adTypesLoading ? (
                <div className="text-gray-500 py-10">Loading ad formats...</div>
              ) : adTypes.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <LayoutTemplate className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-medium">No ad formats created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adTypes.map(adType => (
                    <div key={adType.id} className={cn("border border-gray-200 rounded-2xl p-5 hover:border-accent hover:shadow-md transition-all group bg-white relative", !adType.isActive && "opacity-75")}>
                      <div className="relative">
                        <button
                          onClick={() => setAdTypeMenu(adTypeMenu === adType.id ? null : adType.id)}
                          className="absolute -right-2 -top-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {adTypeMenu === adType.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setAdTypeMenu(null)} />
                            <div className="origin-top-right absolute right-0 top-6 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-20 animate-in fade-in zoom-in-95 duration-100 text-left">
                              <div className="p-1">
                                <button
                                  onClick={() => handleOpenAdTypeModal(adType)}
                                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                                  <Edit2 className="w-4 h-4 text-gray-400" /> Edit Type
                                </button>
                                <button
                                  onClick={() => handleViewTemplates(adType)}
                                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                                  <FileText className="w-4 h-4 text-gray-400" /> View Templates
                                </button>
                                <button
                                  onClick={() => handleToggleAdType(adType.id)}
                                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                                  {adType.isActive ? <ToggleLeft className="w-4 h-4 text-warning" /> : <ToggleRight className="w-4 h-4 text-success" />}
                                  {adType.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                              <div className="p-1">
                                <button
                                  onClick={() => handleDeleteAdType(adType.id, adType.name)}
                                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg font-medium">
                                  <Trash2 className="w-4 h-4" /> Delete Type
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent">
                          <LayoutTemplate className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-accent transition-colors truncate">{adType.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              Order: {adType.sortOrder}
                            </span>
                            {!adType.isActive && (
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 border border-gray-200 rounded">
                                  Inactive
                                </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {adType.description && (
                        <p className="mt-4 text-sm text-gray-600 line-clamp-2">{adType.description}</p>
                      )}

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <Tag className="w-3.5 h-3.5" />
                          {adType.adCount || 0} Ads
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <FileText className="w-3.5 h-3.5" />
                          {adType.templateCount || 0} Templates
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ad Sizes Tab */}
          {activeTab === 'sizes' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Ad Sizes & Dimensions</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage the dimensions for each ad format. Most sizes should have both a BIG and SMALL variant.
                  </p>
                </div>
              </div>

              {adSizesLoading ? (
                <div className="text-gray-500 py-10">Loading ad sizes...</div>
              ) : adSizes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Maximize2 className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-medium">No ad sizes created yet.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-4">Size Name</th>
                        <th className="px-5 py-4">Big Variant</th>
                        <th className="px-5 py-4">Small Variant</th>
                        <th className="px-5 py-4">Unit</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {adSizes.map(size => (
                        <tr key={size.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 font-semibold text-gray-900">{size.name}</td>
                          <td className="px-5 py-4 text-gray-700 font-mono">
                            <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-tighter">Big</span>
                            {size.widthBig} × {size.heightBig}
                          </td>
                          <td className="px-5 py-4 text-gray-700 font-mono">
                            <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-tighter">Small</span>
                            {size.widthSmall} × {size.heightSmall}
                          </td>
                          <td className="px-5 py-4 text-gray-500">{size.unit}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenAdSizeModal(size)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo hover:bg-indigo/5 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteAdSize(size.id, size.name)} className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/5 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Publication Type Modal */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => { setIsCreateModalOpen(false); setEditingItem(null); }}></div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-[110] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Publication Type' : 'Create Publication Type'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Update the publication stream configuration.</p>
            </div>
            <div className="p-6 space-y-5">
              <Input
                label="Name"
                placeholder="e.g. Weekly Magazine"
                value={pubTypeForm.name}
                onChange={(e) => setPubTypeForm({ ...pubTypeForm, name: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Frequency</label>
                <select
                  value={pubTypeForm.frequency}
                  onChange={(e) => setPubTypeForm({ ...pubTypeForm, frequency: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="SPECIAL">Special (Specific Date)</option>
                </select>
              </div>
              {pubTypeForm.frequency !== 'SPECIAL' && pubTypeForm.frequency !== 'MONTHLY' && pubTypeForm.frequency !== 'QUARTERLY' ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Default Publish Day (Optional)</label>
                  <select
                    value={pubTypeForm.defaultPublishDay}
                    onChange={(e) => setPubTypeForm({ ...pubTypeForm, defaultPublishDay: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20">
                    <option value="">None</option>
                    {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
              ) : (pubTypeForm.frequency === 'MONTHLY' || pubTypeForm.frequency === 'QUARTERLY') ? (
                <div>
                  <Input
                    type="number" min="1" max="31"
                    label="Date of the month (1-31)"
                    placeholder="e.g. 15"
                    value={pubTypeForm.defaultPublishDate}
                    onChange={(e) => setPubTypeForm({ ...pubTypeForm, defaultPublishDate: parseInt(e.target.value) || '' })}
                  />
                  <p className="text-xs text-gray-500 mt-1.5 ml-1">
                    If the month has fewer days than selected (e.g. 31st in February), it will automatically default to the last day of that month.
                  </p>
                </div>
              ) : (
                <Input
                  type="date" label="Special Publication Date"
                  value={pubTypeForm.specialPublicationDate}
                  onChange={(e) => setPubTypeForm({ ...pubTypeForm, specialPublicationDate: e.target.value })}
                />
              )}
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button" role="switch"
                  onClick={() => setPubTypeForm({ ...pubTypeForm, isActive: !pubTypeForm.isActive })}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50",
                    pubTypeForm.isActive ? "bg-success" : "bg-gray-200"
                  )}
                >
                  <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", pubTypeForm.isActive ? "translate-x-5" : "translate-x-0")} />
                </button>
                <span className="text-sm font-medium text-gray-900">Active</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); setEditingItem(null); }}>Cancel</Button>
              <Button onClick={handleSavePublicationType} isLoading={isSubmitting}>
                {editingItem ? 'Update' : 'Save'} Publication
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ad Type Modal */}
      {isAdTypeModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => { setIsAdTypeModalOpen(false); setEditingAdType(null); }}></div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-[110] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingAdType ? 'Edit Ad Type' : 'Create Ad Type'}</h3>
              <p className="text-sm text-gray-500 mt-1">Define a category for organising ad orders, templates, and reporting.</p>
            </div>
            <div className="p-6 space-y-5">
              <Input
                label="Name *"
                placeholder="e.g. Wedding, Birthday, Simcha"
                value={adTypeForm.name}
                onChange={(e) => setAdTypeForm({ ...adTypeForm, name: e.target.value })}
              />
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Optional description for staff..."
                  value={adTypeForm.description}
                  onChange={(e) => setAdTypeForm({ ...adTypeForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <Input
                type="number" label="Sort Order" placeholder="0" min="0"
                value={adTypeForm.sortOrder}
                onChange={(e) => setAdTypeForm({ ...adTypeForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button" role="switch"
                  onClick={() => setAdTypeForm({ ...adTypeForm, isActive: !adTypeForm.isActive })}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50",
                    adTypeForm.isActive ? "bg-success" : "bg-gray-200"
                  )}
                >
                  <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", adTypeForm.isActive ? "translate-x-5" : "translate-x-0")} />
                </button>
                <span className="text-sm font-medium text-gray-900">Active (available for new ads)</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsAdTypeModalOpen(false); setEditingAdType(null); }}>Cancel</Button>
              <Button onClick={handleSaveAdType} isLoading={isSubmitting}>
                {editingAdType ? 'Update' : 'Create'} Ad Type
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Templates Slide-over Panel */}
      {templatesPanel && createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setTemplatesPanel(null)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-accent" />
                      {templatesPanel.adType.name} Templates
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Showing all announcement templates for this type.</p>
                  </div>
                  <button onClick={() => setTemplatesPanel(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {templatesPanel.loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : templatesPanel.templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                      <FileText className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No templates linked to this type.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {templatesPanel.templates.map(tpl => (
                        <div key={tpl.id} className="border border-gray-200 rounded-2xl p-4 hover:border-accent/40 transition-colors bg-white group">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">{tpl.name}</h4>
                            <div className="flex items-center gap-1.5">
                              {tpl.isDefault && (
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" title="Default Template" />
                              )}
                              <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                {tpl.language}
                              </span>
                            </div>
                          </div>

                          {tpl.subjectLine && (
                            <p className="text-xs text-gray-500 mb-3 italic line-clamp-1">"{tpl.subjectLine}"</p>
                          )}

                          <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <p className="text-[11px] text-gray-600 line-clamp-3 font-mono leading-relaxed">
                              {tpl.templateContent}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Updated {new Date(tpl.updatedAt).toLocaleDateString()}
                            </span>
                            {!tpl.isActive && (
                              <span className="text-danger font-bold uppercase">Inactive</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <Button variant="outline" className="w-full" onClick={() => setTemplatesPanel(null)}>
                    Close Panel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ad Size Modal */}
      {isAdSizeModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsAdSizeModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-[110] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingAdSize ? 'Edit Ad Size' : 'Create Ad Size'}</h3>
              <p className="text-sm text-gray-500 mt-1">Specify dimensions and variant for this ad size.</p>
            </div>
            <div className="p-6 space-y-5">
              <Input
                label="Size Name *"
                placeholder="e.g. FULL_PAGE, HALF_PAGE, or custom"
                value={adSizeForm.name}
                onChange={(e) => setAdSizeForm({ ...adSizeForm, name: e.target.value })}
              />

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Big Variant Dimensions
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Width"
                      placeholder="210"
                      value={adSizeForm.widthBig}
                      onChange={(e) => setAdSizeForm({ ...adSizeForm, widthBig: parseFloat(e.target.value) || '' })}
                    />
                    <Input
                      type="number"
                      label="Height"
                      placeholder="297"
                      value={adSizeForm.heightBig}
                      onChange={(e) => setAdSizeForm({ ...adSizeForm, heightBig: parseFloat(e.target.value) || '' })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    Small Variant Dimensions
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Width"
                      placeholder="180"
                      value={adSizeForm.widthSmall}
                      onChange={(e) => setAdSizeForm({ ...adSizeForm, widthSmall: parseFloat(e.target.value) || '' })}
                    />
                    <Input
                      type="number"
                      label="Height"
                      placeholder="250"
                      value={adSizeForm.heightSmall}
                      onChange={(e) => setAdSizeForm({ ...adSizeForm, heightSmall: parseFloat(e.target.value) || '' })}
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Unit"
                placeholder="mm"
                value={adSizeForm.unit}
                onChange={(e) => setAdSizeForm({ ...adSizeForm, unit: e.target.value })}
              />
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAdSizeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAdSize} isLoading={isSubmitting}>
                {editingAdSize ? 'Update' : 'Create'} Size
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
