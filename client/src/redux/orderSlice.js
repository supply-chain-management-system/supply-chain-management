import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

const BASE = '/supplier-manager/orders';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(BASE + '/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to load orders.');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE + '/', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to create order.');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
      });
  }
});

export default orderSlice.reducer;
