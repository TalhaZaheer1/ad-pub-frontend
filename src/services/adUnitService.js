import api from './api';

export const adUnitService = {
  getAll: (params) => api.get('/ad-units', { params }),
  getOne: (id) => api.get(`/ad-units/${id}`),
  getMetrics: (params) => api.get('/ad-units/metrics', { params }),
  create: (data) => api.post('/ad-units', data),
  update: (id, data) => api.patch(`/ad-units/${id}`, data),
  updateStatus: (id, status) => api.patch(`/ad-units/${id}/status`, { status }),
  updateDesignStatus: (id, designStatus) => api.patch(`/ad-units/${id}/design-status`, { designStatus }),
  assignDesigner: (id, designedById) => api.patch(`/ad-units/${id}/assign`, { designedById }),
  delete: (id) => api.delete(`/ad-units/${id}`),
  uploadAssets: (id, formData) => api.post(`/ad-units/${id}/assets`, formData),
  removeAsset: (id, assetId) => api.delete(`/ad-units/${id}/assets/${assetId}`),
};

