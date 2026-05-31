import api from "./axiosInstance";

export const createReview = (data) => api.post("/reviews", data);

export const getReviewsByProduct = (productId) =>
  api.get(`/reviews/product/${productId}`);

export const checkReviewed = (productId, orderId) =>
  api.get("/reviews/check", { params: { productId, orderId } });
