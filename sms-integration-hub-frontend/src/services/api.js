// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOverviewMetrics = async (period = 'daily', startDate, endDate) => {
  try {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/overview/metrics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    throw error;
  }
};

export const getBackofficeRecords = async (startDate, endDate, page = 1, limit = 50) => {
  try {
    const response = await api.get('/backoffice/records', {
      params: { startDate, endDate, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching backoffice records:', error);
    throw error;
  }
};

export const getRecordDetail = async (id) => {
  try {
    const response = await api.get(`/backoffice/record/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching record detail:', error);
    throw error;
  }
};

export default api;