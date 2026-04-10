import { create } from 'zustand';
import { userService } from '../services/userService';
import { useAuthStore } from './authStore';

export const useUserStore = create((set) => ({
    users: [],
    isLoading: false,
    error: null,

    // Fetch all users
    fetchUsers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            // If they pass an explicit companyId (like in CompanyUsers.jsx), use it.
            // Otherwise if they are COMPANY_ADMIN, restrict to their own company bounds.
            const targetCompanyId = params.companyId || (user?.role !== 'SUPER_ADMIN' ? user?.companyId : null);

            let response;
            if (targetCompanyId) {
                const { companyId, ...restParams } = params;
                response = await userService.getCompanyUsers(targetCompanyId, restParams);
            } else {
                response = await userService.getPlatformUsers(params);
            }

            set({ users: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch users.',
                isLoading: false
            });
        }
    },

    // Create a new user
    createUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            const targetCompanyId = userData.companyId || (user?.role !== 'SUPER_ADMIN' ? user?.companyId : null);

            let response;
            if (targetCompanyId && user?.role !== 'SUPER_ADMIN') {
                response = await userService.createCompanyUser(targetCompanyId, userData);
            } else {
                response = await userService.createPlatformUser(userData);
            }

            const newUser = response.data.data;

            set((state) => ({
                users: [newUser, ...state.users],
                isLoading: false
            }));
            return { success: true, data: newUser };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to create user.';
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
        }
    },

    // Update an existing user
    updateUser: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            const targetCompanyId = user?.role !== 'SUPER_ADMIN' ? user?.companyId : updateData.companyId;

            let response;
            if (targetCompanyId && user?.role !== 'SUPER_ADMIN') {
                response = await userService.updateCompanyUser(targetCompanyId, id, updateData);
            } else {
                response = await userService.updatePlatformUser(id, updateData);
            }

            const updatedUser = response.data.data;

            set((state) => ({
                users: state.users.map(u => u.id === id ? updatedUser : u),
                isLoading: false
            }));
            return { success: true, data: updatedUser };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to update user.';
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
        }
    },

    // Deactivate/remove a user
    deleteUser: async (id, overrideCompanyId = null) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            const targetCompanyId = overrideCompanyId || (user?.role !== 'SUPER_ADMIN' ? user?.companyId : null);

            if (targetCompanyId && user?.role !== 'SUPER_ADMIN') {
                await userService.deleteCompanyUser(targetCompanyId, id);
            } else {
                await userService.deletePlatformUser(id);
            }

            // Remove the deleted user from the UI state
            set((state) => ({
                users: state.users.filter(u => u.id !== id),
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to delete user.';
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
        }
    },

    clearError: () => set({ error: null })
}));
