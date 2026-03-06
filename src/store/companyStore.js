import { create } from 'zustand';
import api from '../services/api';

export const useCompanyStore = create((set, get) => ({
    companies: [],
    isLoading: false,
    error: null,

    // Fetch all companies
    fetchCompanies: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/companies', { params });
            set({ companies: response.data.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch companies.',
                isLoading: false
            });
        }
    },

    // Fetch single company by ID
    fetchCompanyById: async (id) => {
        try {
            const response = await api.get(`/companies/${id}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to fetch company details.';
            return { success: false, error: errMsg };
        }
    },

    // Create a new company
    createCompany: async (companyData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/companies', companyData);
            const newCompany = response.data.data;

            set((state) => ({
                companies: [newCompany, ...state.companies],
                isLoading: false
            }));
            return { success: true, data: newCompany };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to create company.';
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
        }
    },

    // Update an existing company
    updateCompany: async (id, updateData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.patch(`/companies/${id}`, updateData);
            const updatedCompany = response.data.data;

            set((state) => ({
                companies: state.companies.map(c => c.id === id ? updatedCompany : c),
                isLoading: false
            }));
            return { success: true, data: updatedCompany };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to update company.';
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
        }
    },

    // Soft delete / deactivate (Toggle active status uses update instead, but defining remove just in case)
    removeCompany: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/companies/${id}`);
            set((state) => ({
                companies: state.companies.filter(c => c.id !== id),
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to delete company.';
            set({ error: errMsg, isLoading: false });
            return { success: false, error: errMsg };
        }
    },

    clearError: () => set({ error: null })
}));
