import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartService from "../../services/cartService";

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartService.getCart();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartService.addToCart(productId, quantity);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const updateCartItemQty = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartService.updateCartItem(itemId, quantity);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (itemId, { rejectWithValue }) => {
    try {
      await cartService.removeCartItem(itemId);
      return itemId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export default cartSlice.reducer;
