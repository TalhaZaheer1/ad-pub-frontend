import api from './api';

export const companyCustomerService = {
  getAll: (params) => api.get('/crm/customers', { params }),
  getOne: (id) => api.get(`/crm/customers/${id}`),
  create: (data) => api.post('/crm/customers', data),
  update: (id, data) => api.patch(`/crm/customers/${id}`, data),
  remove: (id) => api.delete(`/crm/customers/${id}`),
  getActivities: (id) => api.get(`/crm/customers/${id}/activities`),
  addActivity: (id, data) => api.post(`/crm/customers/${id}/activities`, data),
};
