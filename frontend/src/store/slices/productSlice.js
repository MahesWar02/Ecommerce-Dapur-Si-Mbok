import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as productService from "../../services/productService";

export const fetchProducts = createAsyncThunk(
  "product/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await productService.getAllProducts(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchProductById = createAsyncThunk(
  "product/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await productService.getProductById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
    filters: { search: "", category: "" },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { search: "", category: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
