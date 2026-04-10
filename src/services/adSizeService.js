import api from './api';

export const adSizeService = {
  getAll: (params) => api.get('/ad-sizes', { params }),
  create: (data) => api.post('/ad-sizes', data),
  update: (id, data) => api.put(`/ad-sizes/${id}`, data),
  delete: (id) => api.delete(`/ad-sizes/${id}`),
};
