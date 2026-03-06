import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useCompanyStore } from '../../store/companyStore';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const CompanySettings = () => {
    const { id } = useParams();
    const { company, isLoading: contextLoading } = useOutletContext();
    const { updateCompany } = useCompanyStore();
    const currentUser = useAuthStore(state => state.user);

    const [formData, setFormData] = useState({ name: '', slug: '', isActive: false });
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingIsActive, setPendingIsActive] = useState(null);

    // Hydrate form when company data is available
    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                slug: company.slug,
                isActive: company.isActive
            });
        }
    }, [company]);

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const handleSave = async (e) => {
        e?.preventDefault();
        setIsSaving(true);
        setStatusMessage(null);

        const res = await updateCompany(id, {
            name: formData.name,
            slug: formData.slug,
            isActive: formData.isActive
        });

        setIsSaving(false);
        if (res.success) {
            setStatusMessage({ type: 'success', text: 'Settings saved successfully.' });
            // Clear success message after 3 seconds
            setTimeout(() => setStatusMessage(null), 3000);
        } else {
            setStatusMessage({ type: 'error', text: res.error });
        }
    };

    const handleStatusToggle = (newStatus) => {
        if (newStatus === false) {
            // Approaching destructive action, require confirmation
            setPendingIsActive(false);
            setConfirmModalOpen(true);
        } else {
            // Safe to activate immediately in local state (must still hit save)
            setFormData(prev => ({ ...prev, isActive: true }));
        }
    };

    const confirmDeactivation = () => {
        setFormData(prev => ({ ...prev, isActive: false }));
        setConfirmModalOpen(false);
        setPendingIsActive(null);
    };

    if (contextLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>;
    }

    return (
        <div className="max-w-2xl animate-in fade-in duration-300 relative">

            {/* Toast Placement */}
            {statusMessage && (
                <div className={`absolute -top-16 left-0 right-0 p-3 rounded-lg flex items-center gap-2 ${statusMessage.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                    {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{statusMessage.text}</span>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Update your company details and core parameters.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 bg-surface p-6 sm:p-8 shadow-sm border border-gray-100 rounded-2xl">

                <Input
                    label="Company Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                    label="Company Slug (Identifier)"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    disabled={!isSuperAdmin}
                    helperText={!isSuperAdmin ? "Only Super Admins can change the slug." : "Used for URLs. Alphanumeric and hyphens only."}
                />

                <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Danger Zone</h4>
                    <ToggleSwitch
                        label="Tenant Account Status"
                        description="Controls whether this company and all its users can log in and access the system."
                        checked={formData.isActive}
                        onChange={handleStatusToggle}
                        disabled={!isSuperAdmin}
                    />
                    {!isSuperAdmin && (
                        <p className="text-xs text-danger mt-2">You do not have permission to alter the tenant status.</p>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button type="submit" isLoading={isSaving} disabled={!formData.name || !formData.slug}>
                        Save Changes
                    </Button>
                </div>
            </form>

            {/* Confirm destructive toggle modal */}
            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setPendingIsActive(null);
                }}
                onConfirm={confirmDeactivation}
                title="Deactivate Company?"
                message={`Are you sure you want to deactivate ${company?.name}? This will instantly lock out all users associated with this tenant.`}
                confirmText="Yes, Deactivate"
                cancelText="Keep Active"
                isDestructive={true}
            />
        </div>
    );
};
