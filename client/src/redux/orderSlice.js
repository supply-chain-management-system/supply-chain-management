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

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${orderId}/status?status=${status}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to update order status.');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/update',
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${orderId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to update order.');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async (orderId, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE}/${orderId}`);
      return orderId;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to delete order.');
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
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(o => o.id !== action.payload);
      });
  }
});

export default orderSlice.reducer;
