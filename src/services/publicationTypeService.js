import api from './api';

export const publicationTypeService = {
    getAll: (params) => api.get('/publication-types', { params }),
    getOne: (id) => api.get(`/publication-types/${id}`),
    create: (data) => api.post('/publication-types', data),
    update: (id, data) => api.patch(`/publication-types/${id}`, data),
    delete: (id) => api.delete(`/publication-types/${id}`),
    toggleActive: (id) => api.patch(`/publication-types/${id}/toggle-active`),
};
