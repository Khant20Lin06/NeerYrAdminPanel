// Base URLs
export const API_BASE_URL = "https://neeyrapi.dynamixwave.com"; // no trailing slash
// export const IMAGE_BASE_URL = 'https://fothubtvapi.fothubtv.com';
// export const API_BASE_URL = 'http://127.0.0.1:8000/api';
// export const IMAGE_BASE_URL = 'http://127.0.0.1:8000';

export const API_V1 = `${API_BASE_URL}/api`;        // accounts/users/me/auth
export const API_V2 = `${API_BASE_URL}/api/api`;    // branches/businesses/... (api/api)

// Helpers (optional)
const byId = (base, id) => `${base}/${id}`;
const withAction = (base, id, action) => `${base}/${id}/${action}`;

// Endpoints
export const EndPoint = {
  // =========================
  // Auth & Profile (API_V1)
  // =========================
  REGISTER: `${API_V1}/auth/register`,
  LOGIN: `${API_V1}/auth/login`,
  REFRESH: `${API_V1}/auth/refresh`,
  LOGOUT: `${API_V1}/auth/logout`,
  ME: `${API_V1}/me`,

  // =========================
  // Admin Users (API_V1)
  // =========================
  USERS_LIST: `${API_V1}/users`,
  USERS_CREATE: `${API_V1}/users/create`,
  USER_DETAIL: (userId) => `${API_V1}/users/${userId}`,
  USER_UPDATE: (userId) => `${API_V1}/users/${userId}/update`,
  USER_DELETE: (userId) => `${API_V1}/users/${userId}/delete`,
  USERS_BULK_DELETE: `${API_V1}/users/bulk-delete`,

  // =========================
  // Branches (API_V2)
  // =========================
  BRANCHES_PUBLIC_LIST: `${API_V2}/public/branches`,
  BRANCHES_LIST: `${API_V2}/branches`,
  BRANCHES_CREATE: `${API_V2}/branches/create`,
  BRANCH_DETAIL: (branchId) => `${API_V2}/branches/${branchId}`,
  BRANCH_UPDATE: (branchId) => `${API_V2}/branches/${branchId}/update`,
  BRANCH_DELETE: (branchId) => `${API_V2}/branches/${branchId}/delete`,
  BRANCH_BULK_DELETE: `${API_V2}/branches/bulk-delete`,

  // =========================
  // Businesses (API_V2)
  // =========================
  BUSINESSES_LIST: `${API_V2}/businesses`,
  BUSINESSES_CREATE: `${API_V2}/businesses/create`,
  BUSINESS_DETAIL: (businessId) => `${API_V2}/businesses/${businessId}`,
  BUSINESS_UPDATE: (businessId) => `${API_V2}/businesses/${businessId}/update`,
  BUSINESS_DELETE: (businessId) => `${API_V2}/businesses/${businessId}/delete`,
  BUSINESSES_BULK_DELETE: `${API_V2}/businesses/bulk-delete`,

  // =========================
  // Business Images (API_V2)
  // =========================
  BUSINESS_IMAGES_PUBLIC_LIST: `${API_V2}/public/business-images`,
  BUSINESS_IMAGES_LIST: `${API_V2}/business-images`,
  BUSINESS_IMAGES_CREATE: `${API_V2}/business-images/create`,
  BUSINESS_IMAGE_DETAIL: (imageId) => `${API_V2}/business-images/${imageId}`,
  BUSINESS_IMAGE_UPDATE: (imageId) => `${API_V2}/business-images/${imageId}/update`,
  BUSINESS_IMAGE_DELETE: (imageId) => `${API_V2}/business-images/${imageId}/delete`,
  BUSINESS_IMAGES_BULK_DELETE: `${API_V2}/business-images/bulk-delete`,

  // =========================
  // Comments (API_V2)
  // =========================
  COMMENTS_PUBLIC_LIST: `${API_V2}/public/comments`,
  COMMENTS_CREATE: `${API_V2}/comments/create`,
  COMMENT_DELETE: (commentId) => `${API_V2}/comments/${commentId}/delete`,
  ADMIN_COMMENTS_BULK_DELETE: `${API_V2}/admin/comments/bulk-delete`,

  // =========================
  // Payment Accounts (API_V2)
  // =========================
  PAYMENT_ACCOUNTS_PUBLIC_LIST: `${API_V2}/payment-accounts`,
  PAYMENT_ACCOUNTS_ADMIN_LIST: `${API_V2}/admin/payment-accounts`,
  PAYMENT_ACCOUNT_CREATE: `${API_V2}/admin/payment-accounts/create`,
  PAYMENT_ACCOUNT_DETAIL: (accountId) => `${API_V2}/admin/payment-accounts/${accountId}`,
  PAYMENT_ACCOUNT_UPDATE: (accountId) => `${API_V2}/admin/payment-accounts/${accountId}/update`,
  PAYMENT_ACCOUNT_DELETE: (accountId) => `${API_V2}/admin/payment-accounts/${accountId}/delete`,
  PAYMENT_ACCOUNTS_BULK_DELETE: `${API_V2}/admin/payment-accounts/bulk-delete`,

  // =========================
  // Points (API_V2)
  // =========================
  POINTS_ME: `${API_V2}/points/me`,
  POINTS_TRANSACTIONS_LIST: `${API_V2}/points/transactions`,
  POINTS_REDEMPTIONS_LIST: `${API_V2}/points/redemptions`,
  POINTS_REDEEM: `${API_V2}/points/redeem`,
  ADMIN_WALLETS_LIST: `${API_V2}/admin/points/wallets`,
  ADMIN_WALLET_DETAIL: (walletId) => `${API_V2}/admin/points/wallets/${walletId}`,
  ADMIN_WALLET_UPDATE: (walletId) => `${API_V2}/admin/points/wallets/${walletId}/update`,
  ADMIN_WALLET_DELETE: (walletId) => `${API_V2}/admin/points/wallets/${walletId}/delete`,
  ADMIN_WALLETS_BULK_DELETE: `${API_V2}/admin/points/wallets/bulk-delete`,

  // =========================
  // Promotions (API_V2)
  // =========================
  PROMOTIONS_PUBLIC_LIST: `${API_V2}/promotions`,
  PROMOTIONS_ADMIN_LIST: `${API_V2}/admin/promotions`,
  PROMOTION_CREATE: `${API_V2}/admin/promotions/create`,
  PROMOTION_DETAIL: (promoId) => `${API_V2}/admin/promotions/${promoId}`,
  PROMOTION_UPDATE: (promoId) => `${API_V2}/admin/promotions/${promoId}/update`,
  PROMOTION_DELETE: (promoId) => `${API_V2}/admin/promotions/${promoId}/delete`,
  PROMOTIONS_BULK_DELETE: `${API_V2}/admin/promotions/bulk-delete`,

  // =========================
  // Reviews (API_V2)
  // =========================
  REVIEWS_PUBLIC_LIST: `${API_V2}/public/reviews`,
  REVIEWS_ME_LIST: `${API_V2}/reviews/me`,
  REVIEW_CREATE: `${API_V2}/reviews`,
  REVIEW_DELETE: (reviewId) => `${API_V2}/reviews/${reviewId}/delete`,
  ADMIN_REVIEWS_LIST: `${API_V2}/admin/reviews`,
  ADMIN_REVIEW_DETAIL: (reviewId) => `${API_V2}/admin/reviews/${reviewId}`,
  ADMIN_REVIEW_UPDATE: (reviewId) => `${API_V2}/admin/reviews/${reviewId}/update`,
  ADMIN_REVIEW_DELETE: (reviewId) => `${API_V2}/admin/reviews/${reviewId}/delete`,
  ADMIN_REVIEWS_BULK_DELETE: `${API_V2}/admin/reviews/bulk-delete`,

  // =========================
  // Categories (API_V2)
  // =========================
  CATEGORIES_PUBLIC_LIST: `${API_V2}/categories`,
  CATEGORIES_ADMIN_LIST: `${API_V2}/admin/categories`,
  CATEGORY_CREATE: `${API_V2}/admin/categories/create`,
  CATEGORY_DETAIL: (categoryId) => `${API_V2}/admin/categories/${categoryId}`,
  CATEGORY_UPDATE: (categoryId) => `${API_V2}/admin/categories/${categoryId}/update`,
  CATEGORY_DELETE: (categoryId) => `${API_V2}/admin/categories/${categoryId}/delete`,
  CATEGORIES_BULK_DELETE: `${API_V2}/admin/categories/bulk-delete`,

  // =========================
  // Subscriptions (API_V2)
  // =========================
  SUBSCRIPTIONS_LIST: `${API_V2}/subscriptions`,
  SUBSCRIPTIONS_BUY: `${API_V2}/subscriptions/buy`,
  SUBSCRIPTION_DETAIL: (subId) => `${API_V2}/subscriptions/${subId}`,
  ADMIN_SUBSCRIPTION_SET_STATUS: (subId) => `${API_V2}/admin/subscriptions/${subId}/status`,
  ADMIN_SUBSCRIPTION_DELETE: (subId) => `${API_V2}/admin/subscriptions/${subId}/delete`,
  ADMIN_SUBSCRIPTIONS_BULK_DELETE: `${API_V2}/admin/subscriptions/bulk-delete`,
};
