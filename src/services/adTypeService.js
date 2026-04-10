import api from './api';

export const adTypeService = {
  getAll: (params) => api.get('/ad-types', { params }),
  getOne: (id) => api.get(`/ad-types/${id}`),
  create: (data) => api.post('/ad-types', data),
  update: (id, data) => api.patch(`/ad-types/${id}`, data),
  delete: (id) => api.delete(`/ad-types/${id}`),
  toggleActive: (id) => api.patch(`/ad-types/${id}/toggle-active`),
};
