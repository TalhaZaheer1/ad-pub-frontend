import { create } from 'zustand';
import api from '../services/api';

export const useUserStore = create((set) => ({
    users: [],
    isLoading: false,
    error: null,

    // Fetch all users
    fetchUsers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/users', { params });
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
            const response = await api.post('/users', userData);
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
            const response = await api.patch(`/users/${id}`, updateData);
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
    removeUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/users/${id}`);

            // Assuming soft delete updates the isActive status in the UI or removes it
            set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, isActive: false } : u),
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
