import api from "./axiosInstance";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/change-password", data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);
export const getAddresses = () => api.get("/auth/addresses");
export const addAddress = (data) => api.post("/auth/addresses", data);
export const updateAddress = (id, data) =>
  api.put(`/auth/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/auth/addresses/${id}`);
