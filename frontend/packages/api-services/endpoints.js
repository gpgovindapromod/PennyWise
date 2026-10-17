export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    RESET_DATA: '/auth/reset-data'
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview'
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    DELETE: (id) => `/transactions/${id}`,
    CATEGORIES: '/categories'
  },
  ACADEMICS: {
    OVERVIEW: '/academics/overview',
    FEES: '/academics/fees',
    RECORD_INSTALLMENT: (feeId) => `/academics/fees/${feeId}/installment`
  },
  BUDGETS: {
    GET_MONTH: (monthKey) => `/budgets/${monthKey}`,
    UPDATE_MONTH: (monthKey) => `/budgets/${monthKey}`
  },
  REPORTS: {
    SUMMARY: '/reports/monthly-summary'
  }
};
