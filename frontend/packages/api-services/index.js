import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export const authService = {
  login: async (email, password) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    return res.data;
  },
  resetData: async () => {
    const res = await apiClient.post(API_ENDPOINTS.AUTH.RESET_DATA);
    return res.data;
  }
};

export const transactionService = {
  getTransactions: async (params = {}) => {
    const res = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.LIST, { params });
    return res.data;
  },
  createTransaction: async (data) => {
    const res = await apiClient.post(API_ENDPOINTS.TRANSACTIONS.CREATE, data);
    return res.data;
  },
  deleteTransaction: async (id) => {
    const res = await apiClient.delete(API_ENDPOINTS.TRANSACTIONS.DELETE(id));
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.CATEGORIES);
    return res.data;
  }
};

export const dashboardService = {
  getOverview: async () => {
    const res = await apiClient.get(API_ENDPOINTS.DASHBOARD.OVERVIEW);
    return res.data;
  }
};

export const academicService = {
  getOverview: async () => {
    const res = await apiClient.get(API_ENDPOINTS.ACADEMICS.OVERVIEW);
    return res.data;
  },
  createFeeObligation: async (data) => {
    const res = await apiClient.post(API_ENDPOINTS.ACADEMICS.FEES, data);
    return res.data;
  },
  recordInstallment: async (feeId, data) => {
    const res = await apiClient.post(API_ENDPOINTS.ACADEMICS.RECORD_INSTALLMENT(feeId), data);
    return res.data;
  }
};

export const budgetService = {
  getMonthBudget: async (monthKey) => {
    const res = await apiClient.get(API_ENDPOINTS.BUDGETS.GET_MONTH(monthKey));
    return res.data;
  },
  updateMonthBudget: async (monthKey, data) => {
    const res = await apiClient.put(API_ENDPOINTS.BUDGETS.UPDATE_MONTH(monthKey), data);
    return res.data;
  }
};

export const reportService = {
  getMonthlySummary: async (monthKey) => {
    const res = await apiClient.get(API_ENDPOINTS.REPORTS.SUMMARY, { params: { month: monthKey } });
    return res.data;
  }
};
