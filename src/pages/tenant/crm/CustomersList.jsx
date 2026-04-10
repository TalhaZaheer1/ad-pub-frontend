import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { companyCustomerService } from '../../../services/companyCustomerService';
import {
  Users, Search, Filter, MoreHorizontal, Edit2, Eye, Plus, Mail, Phone,
  TrendingUp, DollarSign, Activity, FileText, MessageSquare, Clock, X, Building, Tag, Calendar, LayoutTemplate
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export const CustomersList = () => {
  // Data State
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({ totalActive: 0, totalLTV: 0, topSpenders: 0 });
  const [loading, setLoading] = useState(true);

  // UI State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // 360-Panel State
  const [profilePanel, setProfilePanel] = useState(null); // customer object
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, ads
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', businessName: '',
    address: '', customerType: 'BUSINESS', leadStatus: 'PROSPECT', tags: '', isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await companyCustomerService.getAll({ search, leadStatus: filterType });
      setCustomers(res.data.data.customers || []);
      if (res.data.data.metrics) {
        setMetrics(res.data.data.metrics);
      }
    } catch (error) {
      console.error('Failed to load customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search, filterType]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', businessName: '',
      address: '', customerType: 'BUSINESS', leadStatus: 'PROSPECT', tags: '', isActive: true
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setFormData({
      firstName: c.firstName, lastName: c.lastName, email: c.email || '',
      phone: c.phone || '', businessName: c.businessName || '', address: c.address || '',
      customerType: c.customerType, leadStatus: c.leadStatus,
      tags: c.tags ? c.tags.join(', ') : '', isActive: c.isActive
    });
    setActiveMenu(null);
    setIsCreateModalOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };

      if (editingCustomer) {
        await companyCustomerService.update(editingCustomer.id, payload);
      } else {
        await companyCustomerService.create(payload);
      }
      setIsCreateModalOpen(false);
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer', error);
      alert(error.response?.data?.message || 'Error saving customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProfilePanel = async (c) => {
    setActiveMenu(null);
    setProfilePanel(c);
    setActiveTab('overview');
    loadActivities(c.id);
  };

  const loadActivities = async (id) => {
    setActivitiesLoading(true);
    try {
      const res = await companyCustomerService.getActivities(id);
      setActivities(res.data.data.activities || []);
    } catch (error) {
      console.error(error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await companyCustomerService.addActivity(profilePanel.id, {
        type: 'NOTE',
        content: newNote
      });
      setNewNote('');
      loadActivities(profilePanel.id);
    } catch (error) {
      console.error(error);
    }
  };

  // High Level Metrics are now calculated in the backend and passed via state
  const { totalActive, totalLTV, topSpenders } = metrics;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM & Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tenant ad-buyers, track interactions, and analyze lifetime value.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Smart Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-accent/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Clients</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalActive}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-success/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">${totalLTV.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-warning/30 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500">VIP Spenders (&gt;$1k)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{topSpenders}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:max-w-md relative z-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="">All Tags</option>
            <option value="PROSPECT">Prospects</option>
            <option value="ACTIVE">Active</option>
            <option value="COLD_LEAD">Cold Leads</option>
            <option value="INACTIVE_CHURNED">Churned</option>
          </select>
        </div>
      </div>

      {/* Premium Customers Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Lifetime Value</th>
                <th className="px-6 py-4 text-right">Target Metrics</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">Loading CRM data...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">No customers found matching your criteria.</td>
                </tr>
              ) : customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo flex-shrink-0 font-bold border border-indigo-100">
                        {customer.businessName ? customer.businessName.charAt(0) : customer.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-accent transition-colors cursor-pointer" onClick={() => openProfilePanel(customer)}>
                          {customer.businessName || `${customer.firstName} ${customer.lastName}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {customer.businessName ? `${customer.firstName} ${customer.lastName}` : customer.customerType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs text-gray-600">
                      {customer.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" /> {customer.email}</div>}
                      {customer.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {customer.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        customer.leadStatus === 'ACTIVE' ? "bg-success/10 text-success border-success/20" :
                          customer.leadStatus === 'PROSPECT' ? "bg-accent/10 text-accent border-accent/20" :
                            customer.leadStatus === 'COLD_LEAD' ? "bg-gray-100 text-gray-600 border-gray-200" :
                              "bg-danger/10 text-danger border-danger/20"
                      )}>
                        {customer.leadStatus.replace('_', ' ')}
                      </span>
                      {customer.tags && customer.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{customer.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", customer.isActive ? "bg-success" : "bg-gray-300")} />
                      <span className={cn("text-xs font-medium", customer.isActive ? "text-gray-900" : "text-gray-500")}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-semibold text-gray-900">${parseFloat(customer.lifetimeValue).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{customer.totalAdsPlaced} Total Ads</div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    <div className="text-xs">
                      <span className="text-gray-400">Last Order:</span><br />
                      {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center relative isolate">
                    <button
                      onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {activeMenu === customer.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-20 animate-in fade-in zoom-in-95 duration-100 text-left">
                          <div className="p-1">
                            <button
                              onClick={() => openProfilePanel(customer)}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                              <Eye className="w-4 h-4 text-gray-400" /> View 360 Profile
                            </button>
                            <button
                              onClick={() => openEditModal(customer)}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4 text-gray-400" /> Edit Details
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal using createPortal to bypass stacking context */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl relative z-[110] animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
              </h3>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto w-full">
              <div className="grid grid-cols-2 gap-4 w-full">
                <Input label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <Input label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <Input label="Business/Entity Name (Optional)" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <Input label="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <Input label="Street Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Customer Type</label>
                  <select
                    value={formData.customerType} onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="BUSINESS">Business</option>
                    <option value="INDIVISUAL">Individual</option>
                    <option value="AGENCY">Agency</option>
                    <option value="NON_PROFIT">Non-Profit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Lead Status</label>
                  <select
                    value={formData.leadStatus} onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COLD_LEAD">Cold Lead</option>
                    <option value="INACTIVE_CHURNED">Churned / Inactive</option>
                  </select>
                </div>
              </div>
              <Input label="Tags (Comma separated)" placeholder="VIP, Holiday Shopper, Real Estate" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">Account Status</label>
                  <p className="text-xs text-gray-500">Deactivating an account restricts their ability to place new orders.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/50",
                    formData.isActive ? "bg-success" : "bg-gray-200"
                  )}
                >
                  <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", formData.isActive ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} isLoading={isSubmitting}>
                {editingCustomer ? 'Update' : 'Create'} Customer
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Slide-over 360-View Panel */}
      {profilePanel && createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setProfilePanel(null)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-2xl">
              <div className="h-full flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 relative z-[110]">
                {/* Panel Header */}
                <div className="px-6 py-8 border-b border-gray-100 bg-gradient-to-br from-indigo-900 to-indigo text-white relative isolate overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold border border-white/30 shadow-lg">
                        {profilePanel.businessName ? profilePanel.businessName.charAt(0) : profilePanel.firstName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{profilePanel.businessName || `${profilePanel.firstName} ${profilePanel.lastName}`}</h2>
                        <p className="text-indigo-100 text-sm flex items-center gap-2 mt-1">
                          <Building className="w-4 h-4" /> {profilePanel.businessName ? `${profilePanel.firstName} ${profilePanel.lastName}` : profilePanel.customerType}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setProfilePanel(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white backdrop-blur-sm">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200 px-6 mt-2">
                  <button onClick={() => setActiveTab('overview')} className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'overview' ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-900")}>Overview</button>
                  <button onClick={() => setActiveTab('timeline')} className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'timeline' ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-900")}>Timeline & Notes</button>
                  <button onClick={() => setActiveTab('ads')} className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeTab === 'ads' ? "border-accent text-accent" : "border-transparent text-gray-500 hover:text-gray-900")}>Ads History</button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-white border md:grid md:grid-cols-2 border-gray-100 rounded-2xl p-5 shadow-sm gap-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Details</h4>
                          <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex items-center gap-2 max-w-full"><Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{profilePanel.email || 'N/A'}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {profilePanel.phone || 'N/A'}</div>
                            <div className="flex items-start gap-2"><Building className="w-4 h-4 text-gray-400 mt-0.5" /> <p className="leading-tight">{profilePanel.address || 'N/A'}</p></div>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">CRM Context</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Status</span>
                              <span className="font-semibold text-gray-900">{profilePanel.leadStatus}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Created At</span>
                              <span className="text-gray-900">{new Date(profilePanel.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Origin</span>
                              <span className={cn("text-xs font-bold px-2 py-0.5 rounded", profilePanel.globalCustomerId ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-600")}>
                                {profilePanel.globalCustomerId ? 'PLATFORM USER' : 'MANUAL ENTRY'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Financials</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 font-medium">Lifetime Value</p>
                            <p className="text-xl font-bold text-gray-900 mt-1">${parseFloat(profilePanel.lifetimeValue).toLocaleString()}</p>
                          </div>
                          <div className="bg-danger/5 rounded-xl p-4 border border-danger/10">
                            <p className="text-sm text-danger font-medium">Outstanding AR</p>
                            <p className="text-xl font-bold text-danger mt-1">${parseFloat(profilePanel.outstandingBalance).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      {/* Add Note */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
                        <textarea
                          rows="2"
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Log a call, meeting, or internal note..."
                          className="w-full resize-none text-sm text-gray-700 bg-transparent focus:outline-none"
                        />
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                          <div className="flex gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"><Phone className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"><Mail className="w-4 h-4" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"><Calendar className="w-4 h-4" /></button>
                          </div>
                          <Button onClick={handleAddNote} disabled={!newNote.trim() || activitiesLoading} size="sm">Log Note</Button>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="px-2">
                        {activitiesLoading ? (
                          <p className="text-center text-sm text-gray-500 py-8">Loading history...</p>
                        ) : activities.length === 0 ? (
                          <div className="text-center py-10 flex flex-col items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No activity logged yet.</p>
                          </div>
                        ) : (
                          <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-10">
                            {activities.map((act) => (
                              <div key={act.id} className="relative pl-6">
                                <div className="absolute -left-3 top-1 max-h-min max-w-min w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                  {act.type === 'NOTE' && <FileText className="w-3 h-3 text-gray-400" />}
                                  {act.type === 'ORDER_PLACED' && <DollarSign className="w-3 h-3 text-success" />}
                                  {act.type === 'SYSTEM_STATUS_CHANGE' && <Activity className="w-3 h-3 text-accent" />}
                                  {!['NOTE', 'ORDER_PLACED', 'SYSTEM_STATUS_CHANGE'].includes(act.type) && <Clock className="w-3 h-3 text-gray-400" />}
                                </div>
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                      {act.user ? `${act.user.firstName} ${act.user.lastName}` : 'System'} <span className="text-gray-300">•</span> {act.type}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(act.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{act.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'ads' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 text-center py-20 flex flex-col items-center justify-center">
                      <LayoutTemplate className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-500 font-medium text-sm">Ad History functionality pending full Ad Order module implementation.</p>
                      <Button variant="outline" className="mt-4">Place New Ad Order</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
