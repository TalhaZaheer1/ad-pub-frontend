import api from './api';

export const publicationIssueService = {
  getAll: (params) => api.get('/publication-issues', { params }),
  getOne: (id) => api.get(`/publication-issues/${id}`),
  updateStatus: (id, status) => api.patch(`/publication-issues/${id}/status`, { status }),
  toggleLock: (id) => api.patch(`/publication-issues/${id}/lock`),
};
