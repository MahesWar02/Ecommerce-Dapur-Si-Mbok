import api from "./axiosInstance";

export const createOrder = (data) => api.post("/orders", data);

export const getMyOrders = () => api.get("/orders/my");

export const getOrderById = (id) => api.get(`/orders/${id}`);

export const confirmOrderReceived = (id) =>
  api.put(`/orders/${id}/confirm-received`);

export const getPaymentToken = (orderId) =>
  api.post(`/orders/${orderId}/payment`);
