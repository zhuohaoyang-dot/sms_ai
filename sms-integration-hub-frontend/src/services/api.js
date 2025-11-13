// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getOverviewMetrics = async (period = 'daily', startDate, endDate, dateMode = 'range') => {
  try {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (dateMode) params.dateMode = dateMode;

    const response = await api.get('/overview/metrics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    throw error;
  }
};

export const getBackofficeRecords = async (startDate, endDate, page = 1, limit = 50, needHumanReview = 'all', flagStatus = 'all') => {
  try {
    const response = await api.get('/backoffice/records', {
      params: { startDate, endDate, page, limit, needHumanReview, flagStatus }
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

// Review Queue API calls
export const getReviewQueueItems = async (startDate, endDate, page = 1, limit = 50, needHumanReview = 'all', flagStatus = 'all') => {
  try {
    const response = await api.get('/review-queue/items', {
      params: { startDate, endDate, page, limit, needHumanReview, flagStatus }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching review queue items:', error);
    throw error;
  }
};

export const addToReviewQueue = async (aiResultIds) => {
  try {
    const response = await api.post('/review-queue/add', { aiResultIds });
    return response.data;
  } catch (error) {
    console.error('Error adding to review queue:', error);
    throw error;
  }
};

export const updateReviewStatus = async (id, reviewed, notes = '') => {
  try {
    const response = await api.put(`/review-queue/${id}/review`, { reviewed, notes });
    return response.data;
  } catch (error) {
    console.error('Error updating review status:', error);
    throw error;
  }
};

export const autoPopulateReviewQueue = async (startDate, endDate) => {
  try {
    const response = await api.post('/review-queue/auto-populate', { startDate, endDate });
    return response.data;
  } catch (error) {
    console.error('Error auto-populating review queue:', error);
    throw error;
  }
};

export default api;