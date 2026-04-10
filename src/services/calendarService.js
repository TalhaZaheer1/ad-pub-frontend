import api from './api';

export const calendarService = {
  getIssues: (startDate, endDate) => api.get(`/calendar/issues?startDate=${startDate}&endDate=${endDate}`),
};
