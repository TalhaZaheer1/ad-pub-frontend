import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { useCompanyStore } from '../../store/companyStore';
import { useAuthStore } from '../../store/authStore';
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

export const Users = () => {
    const { users, isLoading, error, fetchUsers, createUser, updateUser, clearError } = useUserStore();
    const { companies, fetchCompanies } = useCompanyStore();
    const currentUser = useAuthStore(state => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'ADMIN',
        companyId: currentUser?.companyId || ''
    });

    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
        // If super admin, fetch companies for the select dropdown
        if (currentUser?.role === 'SUPER_ADMIN') {
            fetchCompanies();
        }
        return () => clearError();
    }, [fetchUsers, fetchCompanies, clearError, currentUser]);

    const filteredUsers = users.filter(u =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: currentUser?.role === 'SUPER_ADMIN' ? 'ADMIN' : 'SALES',
            companyId: currentUser?.role === 'SUPER_ADMIN' ? (companies[0]?.id || '') : currentUser.companyId,
            isActive: true
        });
        setFormError('');
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            companyId: user.companyId || '',
            isActive: user.isActive
        });
        setFormError('');
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const res = await createUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            companyId: formData.companyId
        });

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

        const res = await updateUser(selectedUser.id, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            isActive: formData.isActive
        });

        setIsSubmitting(false);
        if (res.success) {
            setIsEditModalOpen(false);
        } else {
            setFormError(res.error);
        }
    };

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'danger';
            case 'ADMIN': return 'primary';
            case 'SALES': return 'success';
            case 'DESIGNER': return 'warning';
            case 'PRODUCTION': return 'default';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage user accounts and roles.</p>
                </div>
                <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="rounded-xl bg-danger/10 p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-danger mt-0.5 mr-3 shrink-0" />
                    <div>
                        <h3 className="text-sm font-medium text-danger">Error loading users</h3>
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
                        placeholder="Search users..."
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
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        {currentUser?.role === 'SUPER_ADMIN' && <TableHead>Company</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading && users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={currentUser?.role === 'SUPER_ADMIN' ? 5 : 4} className="text-center py-8 text-gray-500">
                                Loading users...
                            </TableCell>
                        </TableRow>
                    ) : filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={currentUser?.role === 'SUPER_ADMIN' ? 5 : 4} className="text-center py-8 text-gray-500">
                                No users found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                {currentUser?.role === 'SUPER_ADMIN' && (
                                    <TableCell className="text-gray-500 text-sm">
                                        {user.Company?.name || 'Unknown'}
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Badge variant={user.isActive ? 'success' : 'default'}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenEdit(user)}
                                        disabled={user.role === 'SUPER_ADMIN' && currentUser.id !== user.id}
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
                title="Create New User"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    {formError && <div className="text-sm text-danger mb-4">{formError}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="Last Name"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <Input
                        label="Password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">Role</label>
                            <select
                                className="flex h-10 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                                <option value="ADMIN">Admin</option>
                                <option value="SALES">Sales</option>
                                <option value="DESIGNER">Designer</option>
                                <option value="PRODUCTION">Production</option>
                            </select>
                        </div>

                        {currentUser?.role === 'SUPER_ADMIN' && formData.role !== 'SUPER_ADMIN' && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Company</label>
                                <select
                                    className="flex h-10 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={formData.companyId}
                                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Company</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

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
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => !isSubmitting && setIsEditModalOpen(false)}
                title="Edit User Details"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {formError && <div className="text-sm text-danger mb-4">{formError}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="Last Name"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        disabled
                        value={formData.email}
                        helperText="Email cannot be changed."
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <select
                            className="flex h-10 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                            disabled={selectedUser?.role === 'SUPER_ADMIN' || selectedUser?.id === currentUser?.id}
                        >
                            {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                            <option value="ADMIN">Admin</option>
                            <option value="SALES">Sales</option>
                            <option value="DESIGNER">Designer</option>
                            <option value="PRODUCTION">Production</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between py-2 mt-2">
                        <div>
                            <span className="text-sm font-medium text-gray-700">Active Status</span>
                            <p className="text-xs text-gray-500">Enable or block this user's access.</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            disabled={selectedUser?.id === currentUser?.id}
                            aria-checked={formData.isActive}
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                                formData.isActive ? "bg-success" : "bg-gray-200",
                                selectedUser?.id === currentUser?.id && "opacity-50 cursor-not-allowed"
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
