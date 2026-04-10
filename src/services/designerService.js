import api from './api';

export const designerService = {
  // Get jobs assigned to the current user
  getMyQueue: (params = {}) => api.get('/ad-units', { params: { ...params, assignedDesignerId: 'me' } }),

  // Get unassigned jobs ready for design
  getUnassignedQueue: (params = {}) => api.get('/ad-units', { params: { ...params, assignedDesignerId: 'unassigned' } }),

  // Get all grouped
  getAllTasks: (params = {}) => api.get('/ad-units', { params }),

  // Workflows
  assignDesigner: (id, designedById) => api.patch(`/ad-units/${id}/assign`, { designedById }),
  updateDesignStatus: (id, designStatus) => api.patch(`/ad-units/${id}/design-status`, { designStatus }),

  // Bulk Operations
  bulkAssignDesigner: (adUnitIds, designedById) => api.patch('/ad-units/bulk/assign', { adUnitIds, designedById }),
  bulkUpdateDesignStatus: (adUnitIds, designStatus) => api.patch('/ad-units/bulk/design-status', { adUnitIds, designStatus }),

  // Exports
  exportInDesignSnippet: (params = {}) => api.get('/ad-units/export/indesign', { params }),
  exportGroupedPdf: (params = {}) => api.get('/ad-units/export/pdf', { params }),
};
