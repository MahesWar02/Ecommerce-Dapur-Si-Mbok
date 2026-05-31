import api from "./axiosInstance";

export const createOrder = (data) => api.post("/orders", data);

export const getMyOrders = () => api.get("/orders/my");

export const getOrderById = (id) => api.get(`/orders/${id}`);

export const confirmOrderReceived = (id) =>
  api.put(`/orders/${id}/confirm-received`);

export const getPaymentToken = (orderId) =>
  api.post(`/orders/${orderId}/payment`);

export const markOrderPaid = (id) => api.put(`/orders/${id}/mark-paid`);

export const getAllOrders = () => api.get("/orders");

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });

export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);

export const getSalesReport = (params) => api.get("/orders/report", { params });

export const createOfflineOrder = (data) => api.post("/orders/offline", data);
