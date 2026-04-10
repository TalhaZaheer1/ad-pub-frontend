import api from './api';

export const announcementTemplateService = {
  getAll: (params) => api.get('/announcement-templates', { params }),
  getOne: (id) => api.get(`/announcement-templates/${id}`),
  create: (data) => api.post('/announcement-templates', data),
  update: (id, data) => api.patch(`/announcement-templates/${id}`, data),
  delete: (id) => api.delete(`/announcement-templates/${id}`),
  toggleActive: (id) => api.patch(`/announcement-templates/${id}/toggle-active`),
  duplicate: (id) => api.post(`/announcement-templates/${id}/duplicate`),
};
