import api from "./axiosInstance";

export const getAllProducts = (params) => api.get("/products", { params });

export const getProductById = (id) => api.get(`/products/${id}`);
