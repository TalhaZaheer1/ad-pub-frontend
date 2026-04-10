import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search, Plus } from 'lucide-react';

export const CompanyUsers = () => {
    const { id } = useParams();
    const { company, isLoading: contextLoading } = useOutletContext();
    const { users, fetchUsers, createUser, deleteUser, isLoading, error } = useUserStore();
    const currentUser = useAuthStore(state => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'SALES' // default
    });

    useEffect(() => {
        if (id) {
            fetchUsers({ companyId: id });
        }
    }, [id, fetchUsers]);

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    // Available roles to assign (SUPER_ADMIN cannot be assigned scoped to a company)
    const availableRoles = ['COMPANY_ADMIN', 'SALES', 'DESIGNER', 'PRODUCTION'];

    const filteredUsers = users?.filter(user => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        return matchesSearch && matchesRole;
    }) || [];

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const res = await createUser({
            ...createForm,
            companyId: id
        });
        if (res.success) {
            setIsCreateModalOpen(false);
            setCreateForm({ firstName: '', lastName: '', email: '', password: '', role: 'SALES' });
        }
    };

    const handleToggleStatus = async (userId) => {
        // Utilizing the generic deleteUser (soft delete / toggle active status)
        await deleteUser(userId);
    };

    if (contextLoading) return <div className="h-32 rounded-xl bg-gray-100 animate-pulse"></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Users</h3>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500">
                        Manage all individuals accessing {company?.name}.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New User
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="block w-full sm:w-48 rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    {availableRoles.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            {error && <div className="p-4 bg-danger/10 text-danger rounded-xl text-sm mb-6">{error}</div>}

            {/* User Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
                        </TableRow>
                    ) : filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No users found matching your filters.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                    <div className="text-gray-500">{user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="default" className="text-xs">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.isActive ? 'success' : 'default'}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={user.isActive ? 'text-danger hover:text-red-700' : 'text-success hover:text-green-700'}
                                        onClick={() => handleToggleStatus(user.id)}
                                        disabled={user.id === currentUser?.id} // Prevent self lock-out UI
                                    >
                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={`Add User to ${company?.name || 'Company'}`}
            >
                <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            required
                            value={createForm.firstName}
                            onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                        />
                        <Input
                            label="Last Name"
                            required
                            value={createForm.lastName}
                            onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                        />
                    </div>
                    <Input
                        type="email"
                        label="Email Address"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                    <Input
                        type="password"
                        label="Temporary Password"
                        required
                        minLength={6}
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Role</label>
                        <select
                            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                            value={createForm.role}
                            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        >
                            {availableRoles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
