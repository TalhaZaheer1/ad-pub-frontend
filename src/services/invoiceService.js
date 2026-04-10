import api from './api';

export const invoiceService = {
  getMetrics: () => api.get('/billing/invoices/metrics'),
  getAll: (params) => api.get('/billing/invoices', { params }),
  getOne: (id) => api.get(`/billing/invoices/${id}`),
  create: (data) => api.post('/billing/invoices', data),
  updateStatus: (id, status) => api.patch(`/billing/invoices/${id}/status`, { status }),
  recordPayment: (id, data) => api.post(`/billing/invoices/${id}/payments`, data),
};
