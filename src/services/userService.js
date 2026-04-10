import api from './api';

export const userService = {
    // ─── Platform Routes (SUPER_ADMIN) ───
    getPlatformUsers: (params) => api.get('/users', { params }),
    getPlatformUser: (id) => api.get(`/users/${id}`),
    createPlatformUser: (data) => api.post('/users', data),
    updatePlatformUser: (id, data) => api.patch(`/users/${id}`, data),
    deletePlatformUser: (id) => api.delete(`/users/${id}`),

    // ─── Company Routes (COMPANY_ADMIN) ───
    getCompanyUsers: (companyId, params) => api.get(`/companies/${companyId}/users`, { params }),
    getCompanyUser: (companyId, userId) => api.get(`/companies/${companyId}/users/${userId}`),
    createCompanyUser: (companyId, data) => api.post(`/companies/${companyId}/users`, data),
    updateCompanyUser: (companyId, userId, data) => api.patch(`/companies/${companyId}/users/${userId}`, data),
    deleteCompanyUser: (companyId, userId) => api.delete(`/companies/${companyId}/users/${userId}`)
};
