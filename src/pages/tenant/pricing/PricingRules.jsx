import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { pricingService } from '../../../services/pricingService';
import { adSizeService } from '../../../services/adSizeService';
import { publicationTypeService } from '../../../services/publicationTypeService';
import {
    Calculator, Plus, Tag, Layers, Percent, Search, Shield, ChevronDown, CheckCircle2, MoreVertical, Edit2, Trash2
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const AREAS = ['COVER_PAGE', 'INTERIOR_LEFT', 'INTERIOR_RIGHT', 'CLASSIFIED_SECTION', 'BACK_COVER'];
const SIZES = []; // Replaced by dynamic adSizes from DB
const COLORS = ['FULL_COLOR', 'GRAYSCALE', 'BLACK_WHITE'];

export const PricingRules = () => {
    const [activeTab, setActiveTab] = useState('base'); 
    const [rules, setRules] = useState([]);
    const [pubTypes, setPubTypes] = useState([]);
    const [adSizes, setAdSizes] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    // Form inputs for rules
    const [ruleForm, setRuleForm] = useState({
        name: '', description: '', ruleType: 'BASE_RATE',
        publicationTypeId: '', adTypeId: '', adSizeName: '', area: '', colorProfile: '',
        discountType: 'PERCENTAGE', value: '', condition: '', priority: 0, isActive: true
    });

    // Sandbox Calculator
    const [sandboxForm, setSandboxForm] = useState({
        publicationTypeId: '', adSizeName: 'FULL_PAGE', area: 'COVER_PAGE', colorProfile: 'FULL_COLOR'
    });
    const [previewResult, setPreviewResult] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [rulesRes, pubsRes, sizesRes] = await Promise.all([
                pricingService.getRules(),
                publicationTypeService.getAll(),
                adSizeService.getAll()
            ]);
            
            const fetchedRules = Array.isArray(rulesRes.data.data) ? rulesRes.data.data : (rulesRes.data.data.rules || []);
            setRules(fetchedRules);
            setAdSizes(sizesRes.data.data.adSizes || []);
            
            setPubTypes(pubsRes.data.data.publicationTypes || []);
            if (pubsRes.data.data.publicationTypes?.length > 0) {
                setSandboxForm(prev => ({ ...prev, publicationTypeId: pubsRes.data.data.publicationTypes[0].id }));
            }
        } catch (error) {
            console.error('Failed to load rules', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRule = (type = 'BASE_RATE') => {
        setEditingRule(null);
        setRuleForm({
            name: '', description: '', ruleType: type,
            publicationTypeId: '', adTypeId: '', adSizeName: '', area: '', colorProfile: '',
            discountType: 'PERCENTAGE', value: '', condition: '', priority: 0, isActive: true
        });
        setIsRuleModalOpen(true);
    };

    const handleEditRule = (rule) => {
        setEditingRule(rule);
        setActiveMenu(null);
        setRuleForm({
            name: rule.name, description: rule.description || '', ruleType: rule.ruleType,
            publicationTypeId: rule.publicationTypeId || '', adTypeId: rule.adTypeId || '', 
            adSizeName: rule.adSizeName || '', area: rule.area || '', colorProfile: rule.colorProfile || '',
            discountType: rule.discountType || 'PERCENTAGE', value: parseFloat(rule.value) || '', 
            condition: rule.condition ? JSON.stringify(rule.condition) : '', priority: rule.priority, isActive: rule.isActive
        });
        setIsRuleModalOpen(true);
    };

    const handleSaveRule = async () => {
        try {
            let parsedCondition = null;
            if (ruleForm.condition) {
                try { parsedCondition = JSON.parse(ruleForm.condition); } 
                catch (e) { alert("Condition must be valid JSON format"); return; }
            }

            const payload = {
                ...ruleForm,
                value: parseFloat(ruleForm.value),
                condition: parsedCondition,
                
                // Clear out empty blanks for db nullable mappings
                publicationTypeId: ruleForm.publicationTypeId || null,
                adTypeId: ruleForm.adTypeId || null,
                adSizeName: ruleForm.adSizeName || null,
                area: ruleForm.area || null,
                colorProfile: ruleForm.colorProfile || null,
                discountType: (ruleForm.ruleType === 'BASE_RATE') ? null : ruleForm.discountType
            };

            if (editingRule) await pricingService.updateRule(editingRule.id, payload);
            else await pricingService.createRule(payload);
            
            setIsRuleModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save rule');
        }
    };

    const handleDeleteRule = async (id) => {
        if (!window.confirm("Delete this rule?")) return;
        try {
            await pricingService.deleteRule(id);
            fetchData();
        } catch (error) {
            alert("Failed to delete rule");
        }
    };

    const calculatePreview = async () => {
        try {
            const payload = {
                publicationTypeId: sandboxForm.publicationTypeId,
                adSizeName: sandboxForm.adSizeName,
                area: sandboxForm.area,
                colorProfile: sandboxForm.colorProfile
            };
            const res = await pricingService.previewPrice(payload);
            setPreviewResult(res.data.data.payload || res.data.data);
        } catch (error) {
            alert("Calculation failed");
        }
    };

    const renderRuleCard = (rule) => (
        <div key={rule.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent hover:shadow-sm transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{rule.name}</h3>
                    {rule.isActive ? (
                        <span className="inline-flex items-center text-success bg-success/10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-success/20">Active</span>
                    ) : (
                        <span className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-gray-200">Inactive</span>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                    {/* Constraints Block */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg opacity-80">
                        <span className="font-bold text-gray-400 text-xs">LIMIT TO:</span>
                        <span className="font-medium text-gray-700 text-xs text-nowrap">
                           {[rule.publicationType?.name, rule.adSizeName, rule.area, rule.colorProfile].filter(Boolean).join(" • ") || "Global (All Ads)"}
                        </span>
                    </div>
                    {rule.condition && (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg opacity-80 mt-1 sm:mt-0">
                            <span className="font-bold text-gray-400 text-xs">CONDITION:</span>
                            <span className="font-medium text-gray-700 text-xs truncate max-w-[200px]">{JSON.stringify(rule.condition)}</span>
                        </div>
                    )}
                    <span className="text-gray-300 mx-2">&rarr;</span>
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border", 
                        rule.ruleType === 'BASE_RATE' ? "bg-indigo/5 border-indigo/20 text-indigo" :
                        rule.ruleType === 'SURCHARGE' ? "bg-warning/5 border-warning/20 text-warning" :
                        rule.ruleType === 'DISCOUNT' ? "bg-success/5 border-success/20 text-success" :
                        rule.ruleType === 'TAX' ? "bg-blue-50 border-blue-200 text-blue-600" :
                        "bg-danger/5 border-danger/20 text-danger"
                    )}>
                        {rule.ruleType === 'BASE_RATE' ? `BASE SET: $${rule.value}` :
                         rule.ruleType === 'SURCHARGE' ? `ADD ${rule.value}${rule.discountType === 'PERCENTAGE' ? '%' : '$'}` :
                         rule.ruleType === 'DISCOUNT' ? `SUBTRACT ${rule.value}${rule.discountType === 'PERCENTAGE' ? '%' : '$'}` :
                         rule.ruleType === 'TAX' ? `TAX ${rule.value}${rule.discountType === 'PERCENTAGE' ? '%' : '$'}` :
                         `LIMIT OVERRIDE TO ${rule.value}${rule.discountType === 'PERCENTAGE' ? '%' : '$'}`
                        }
                    </div>
                </div>
            </div>

            <div className="relative shrink-0 text-right">
                <button 
                    onClick={() => setActiveMenu(activeMenu === rule.id ? null : rule.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors bg-white border border-gray-100"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
                {activeMenu === rule.id && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 top-12 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-20 text-left">
                            <div className="p-1">
                                <button onClick={() => handleEditRule(rule)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Edit2 className="w-4 h-4 text-gray-400" /> Edit Logic
                                </button>
                            </div>
                            <div className="p-1">
                                <button onClick={() => { setActiveMenu(null); handleDeleteRule(rule.id); }} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" /> Delete Rule
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Calculator className="w-7 h-7 text-accent" /> Pricing Engine
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Configure foundational rate matrices, dynamic surcharges, and discount logic.</p>
                </div>
                {activeTab !== 'sandbox' && (
                    <Button onClick={() => handleCreateRule(activeTab === 'overrides' ? 'OVERRIDE_LIMIT' : activeTab === 'modifiers' ? 'DISCOUNT' : activeTab === 'taxes' ? 'TAX' : 'BASE_RATE')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Rule
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 pt-4 lg:px-8 overflow-x-auto whitespace-nowrap">
                    {[ { id: 'base', icon: Layers, label: 'Base Pricing' },
                       { id: 'modifiers', icon: Percent, label: 'Surcharges & Discounts' },
                       { id: 'taxes', icon: Calculator, label: 'Tax Rules' },
                       { id: 'overrides', icon: Shield, label: 'Override Controls' },
                       { id: 'sandbox', icon: Search, label: 'Preview Sandbox' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn("flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors", 
                                activeTab === tab.id ? "border-accent text-accent bg-white" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-t-xl"
                            )}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 bg-gray-50/20">
                    
                    {/* BASE PRICING TAB */}
                    {activeTab === 'base' && (
                        <div className="p-6 lg:p-8 space-y-4">
                            <div className="mb-6"><h2 className="text-lg font-bold text-gray-900">Base Cost Foundations</h2><p className="text-sm text-gray-500 mt-1">Top priorities execute first. If an ad matches two base rates, the higher priority binds.</p></div>
                            {isLoading ? <p>Loading...</p> : rules.filter(r => r.ruleType === 'BASE_RATE').map(renderRuleCard)}
                            {rules.filter(r => r.ruleType === 'BASE_RATE').length === 0 && <p className="text-gray-400">No base rates declared yet.</p>}
                        </div>
                    )}

                    {/* MODIFIERS TAB */}
                    {activeTab === 'modifiers' && (
                        <div className="p-6 lg:p-8 space-y-4">
                            <div className="mb-6"><h2 className="text-lg font-bold text-gray-900">Conditional Modifiers</h2><p className="text-sm text-gray-500 mt-1">Surcharges add to the base rate. Discounts deduct from the sequence.</p></div>
                            {rules.filter(r => r.ruleType === 'SURCHARGE' || r.ruleType === 'DISCOUNT').map(renderRuleCard)}
                            {rules.filter(r => r.ruleType === 'SURCHARGE' || r.ruleType === 'DISCOUNT').length === 0 && <p className="text-gray-400">No matching rules.</p>}
                        </div>
                    )}

                    {/* OVERRIDES TAB */}
                    {activeTab === 'overrides' && (
                        <div className="p-6 lg:p-8 space-y-4">
                            <div className="mb-6"><h2 className="text-lg font-bold text-gray-900">Sales Constraints</h2><p className="text-sm text-gray-500 mt-1">Limits allowed deductions executed manually by intake teams.</p></div>
                            {rules.filter(r => r.ruleType === 'OVERRIDE_LIMIT').map(renderRuleCard)}
                        </div>
                    )}

                    {/* TAXES TAB */}
                    {activeTab === 'taxes' && (
                        <div className="p-6 lg:p-8 space-y-4">
                            <div className="mb-6"><h2 className="text-lg font-bold text-gray-900">Tax Configurations</h2><p className="text-sm text-gray-500 mt-1">Configure automated tax rates applied to final invoices based on constraints.</p></div>
                            {rules.filter(r => r.ruleType === 'TAX').map(renderRuleCard)}
                            {rules.filter(r => r.ruleType === 'TAX').length === 0 && <p className="text-gray-400">No tax rules declared yet.</p>}
                        </div>
                    )}

                    {/* SANDBOX CALCULATOR */}
                    {activeTab === 'sandbox' && (
                        <div className="p-6 lg:p-8 grid md:grid-cols-2 gap-8">
                            <div className="space-y-5 bg-white border border-gray-200 p-6 rounded-2xl">
                                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Inputs Vector</h3>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Publication Type</label>
                                    <select className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20" value={sandboxForm.publicationTypeId} onChange={e => setSandboxForm({...sandboxForm, publicationTypeId: e.target.value})}>
                                        {pubTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Size</label>
                                        <select className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20" value={sandboxForm.adSizeName} onChange={e => setSandboxForm({...sandboxForm, adSizeName: e.target.value})}>
                                            {[...new Set(adSizes.map(s => s.name))].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Area</label>
                                        <select className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20" value={sandboxForm.area} onChange={e => setSandboxForm({...sandboxForm, area: e.target.value})}>
                                            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Color Profile</label>
                                    <select className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20" value={sandboxForm.colorProfile} onChange={e => setSandboxForm({...sandboxForm, colorProfile: e.target.value})}>
                                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                
                                <Button onClick={calculatePreview} className="w-full py-3 mt-4">Simulate Calculation Routine</Button>
                            </div>

                            <div>
                                {previewResult ? (
                                    <div className="bg-gray-900 rounded-2xl p-6 text-white space-y-4 shadow-xl">
                                        <h3 className="font-bold text-gray-400 border-b border-gray-800 pb-2 uppercase tracking-wider text-xs">Pipeline Audit</h3>
                                        
                                        <div className="flex justify-between items-center text-sm font-medium">
                                           <span>Raw Base Binding</span>
                                           <span>${previewResult.basePrice.toFixed(2)}</span>
                                        </div>

                                        {previewResult.surcharges.length > 0 && (
                                            <div className="space-y-1 py-2 border-y border-gray-800 text-sm">
                                                <p className="text-warning text-xs font-bold uppercase">Surcharges Applied</p>
                                                {previewResult.surcharges.map((s, i) => (
                                                    <div key={i} className="flex justify-between text-gray-300">
                                                        <span>+ {s.name}</span><span>${s.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {previewResult.discounts.length > 0 && (
                                            <div className="space-y-1 py-2 border-b border-gray-800 text-sm">
                                                <p className="text-success text-xs font-bold uppercase">Discounts Executed</p>
                                                {previewResult.discounts.map((d, i) => (
                                                    <div key={i} className="flex justify-between text-gray-300">
                                                        <span>- {d.name}</span><span>${d.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {previewResult.taxes && previewResult.taxes.length > 0 && (
                                            <>
                                                <div className="flex justify-between items-center text-sm font-medium pt-2 pb-1 text-gray-300">
                                                   <span>Subtotal</span>
                                                   <span>${previewResult.subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="space-y-1 py-2 border-b border-gray-800 text-sm">
                                                    <p className="text-blue-400 text-xs font-bold uppercase">Taxes Applied</p>
                                                    {previewResult.taxes.map((t, i) => (
                                                        <div key={i} className="flex justify-between text-gray-300">
                                                            <span>+ {t.name}</span><span>${t.amount.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        <div className="flex justify-between items-center text-2xl font-bold text-white pt-2">
                                           <span>Final Estimated</span>
                                           <span className="text-accent">${previewResult.finalPrice.toFixed(2)}</span>
                                        </div>

                                        {previewResult.overrideLimits.length > 0 && (
                                            <div className="bg-white/10 p-3 rounded-lg text-xs mt-4">
                                                <strong className="block text-gray-300 mb-1 flex items-center"><Shield className="w-3 h-3 mr-1 inline"/> Detected Override Constraints:</strong>
                                                {previewResult.overrideLimits.map((ol, i) => <span key={i} className="block text-gray-400">&bull; bounded to {ol.value}{ol.type === 'PERCENTAGE' ? '%' : '$'} max variance.</span>)}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 p-10 text-center font-medium">
                                        Adjust variables on the left and click Simulate to preview the Pricing Engine logic flow here.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Rule Modal */}
            {isRuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsRuleModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 shrink-0">
                            <h3 className="text-lg font-bold text-gray-900">{editingRule ? 'Edit Settings' : 'Create Pipeline Rule'}</h3>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Rule Type</label>
                                    <select className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20" value={ruleForm.ruleType} onChange={e => setRuleForm({...ruleForm, ruleType: e.target.value})}>
                                        <option value="BASE_RATE">Base Rate Setting</option>
                                        <option value="SURCHARGE">Add Surcharge</option>
                                        <option value="DISCOUNT">Deduct Discount</option>
                                        <option value="TAX">Apply Tax</option>
                                        <option value="OVERRIDE_LIMIT">Sales Override Restraint</option>
                                    </select>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <Input label="Rule Name Descriptor" placeholder="e.g. VIP Pricing" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} />
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dimension Match Constraints</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <label className="text-gray-500 font-medium">Issue Publication</label>
                                        <select className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm" value={ruleForm.publicationTypeId} onChange={e => setRuleForm({...ruleForm, publicationTypeId: e.target.value})}>
                                            <option value="">Any Publication</option>
                                            {pubTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 font-medium">Size Mapping</label>
                                        <select className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm" value={ruleForm.adSizeName} onChange={e => setRuleForm({...ruleForm, adSizeName: e.target.value})}>
                                            <option value="">Any Size</option>
                                            {[...new Set(adSizes.map(s => s.name))].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 font-medium">Placement Area</label>
                                        <select className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm" value={ruleForm.area} onChange={e => setRuleForm({...ruleForm, area: e.target.value})}>
                                            <option value="">Any Area</option>
                                            {AREAS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-500 font-medium">Color Scheme</label>
                                        <select className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm" value={ruleForm.colorProfile} onChange={e => setRuleForm({...ruleForm, colorProfile: e.target.value})}>
                                            <option value="">Any Color Scheme</option>
                                            {COLORS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <Input label="Custom JSON Condition (Advanced)" placeholder='e.g. {"customerType": "VIP"}' value={ruleForm.condition} onChange={(e) => setRuleForm({ ...ruleForm, condition: e.target.value })} />
                            </div>

                            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 space-y-4">
                                <h4 className="text-xs font-bold text-accent uppercase tracking-wider opacity-80">Mathematical Modifier</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 sm:col-span-1">
                                        <Input type="number" label="Execute Value" placeholder="e.g. 50" value={ruleForm.value} onChange={(e) => setRuleForm({ ...ruleForm, value: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        {ruleForm.ruleType !== 'BASE_RATE' && (
                                            <div>
                                                 <label className="text-xs font-bold text-gray-500 uppercase mt-1">Value Type</label>
                                                 <select className="w-full border border-white rounded-xl px-4 py-[11px] bg-white/60 shadow-sm text-sm focus:ring-2 focus:ring-accent/20" value={ruleForm.discountType} onChange={e => setRuleForm({...ruleForm, discountType: e.target.value})}>
                                                    <option value="PERCENTAGE">Percentage (%)</option>
                                                    <option value="FIXED_AMOUNT">Fixed Value ($)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <Input type="number" label="Execution Priority (Higher numbers evaluate first over bounds)" value={ruleForm.priority} onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end gap-3 shrink-0">
                            <Button variant="outline" onClick={() => setIsRuleModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveRule}>{editingRule ? 'Save' : 'Register'} Routine</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
