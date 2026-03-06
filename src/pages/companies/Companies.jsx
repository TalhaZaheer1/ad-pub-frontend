import React, { useEffect, useState } from 'react';
import { useCompanyStore } from '../../store/companyStore';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, Edit2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Companies = () => {
    const { companies, isLoading, error, fetchCompanies, createCompany, updateCompany, clearError } = useCompanyStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentCompany, setCurrentCompany] = useState(null);

    // Form state
    const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCompanies();
        return () => clearError();
    }, [fetchCompanies, clearError]);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setFormData({ name: '', slug: '', isActive: true });
        setFormError('');
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (company) => {
        setCurrentCompany(company);
        setFormData({ name: company.name, slug: company.slug, isActive: company.isActive });
        setFormError('');
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const res = await createCompany({ name: formData.name, slug: formData.slug });

        setIsSubmitting(false);
        if (res.success) {
            setIsCreateModalOpen(false);
        } else {
            setFormError(res.error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const res = await updateCompany(currentCompany.id, {
            name: formData.name,
            slug: formData.slug,
            isActive: formData.isActive
        });

        setIsSubmitting(false);
        if (res.success) {
            setIsEditModalOpen(false);
        } else {
            setFormError(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage tenant companies in the system.</p>
                </div>
                <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="rounded-xl bg-danger/10 p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-danger mt-0.5 mr-3 shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-danger">Error loading companies</h3>
                        <div className="mt-1 text-sm text-danger/80">{error}</div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between bg-surface p-4 rounded-t-2xl border border-gray-100 border-b-0">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Table */}
            <Table className="border-t-0 rounded-t-none">
                <TableHeader>
                    <tr>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading && companies.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                Loading companies...
                            </TableCell>
                        </TableRow>
                    ) : filteredCompanies.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                No companies found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredCompanies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell>
                                    <Link to={`/companies/${company.id}`} className="block group">
                                        <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                            {company.name}
                                        </div>
                                        <div className="text-gray-500 font-mono text-xs mt-0.5">{company.slug}</div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={company.isActive ? 'success' : 'default'}>
                                        {company.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {new Date(company.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenEdit(company)}
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                title="Create New Company"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    {formError && <div className="text-sm text-danger mb-4">{formError}</div>}

                    <Input
                        label="Company Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Acme Corp"
                    />

                    <Input
                        label="Company Slug"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="acme-corp"
                        helperText="Used for identifiers. Alphanumeric and hyphens only."
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Create Company
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => !isSubmitting && setIsEditModalOpen(false)}
                title="Edit Company"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {formError && <div className="text-sm text-danger mb-4">{formError}</div>}

                    <Input
                        label="Company Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <Input
                        label="Company Slug"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    />

                    <div className="flex items-center justify-between py-2 mt-2">
                        <div>
                            <span className="text-sm font-medium text-gray-700">Active Status</span>
                            <p className="text-xs text-gray-500">Enable or disable this company.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={formData.isActive}
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                                formData.isActive ? "bg-success" : "bg-gray-200"
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    formData.isActive ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
