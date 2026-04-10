import api from './api';

export const pricingService = {
  getRules: () => api.get('/pricing-rules'),
  createRule: (data) => api.post('/pricing-rules', data),
  updateRule: (id, data) => api.patch(`/pricing-rules/${id}`, data),
  deleteRule: (id) => api.delete(`/pricing-rules/${id}`),
  previewPrice: (payload) => api.post('/pricing-rules/preview', payload)
};
