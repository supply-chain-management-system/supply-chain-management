import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

const BASE = '/supplier-manager/inventory';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(BASE + '/');
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to load inventory.');
    }
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/add',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE + '/', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to add item.');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/update',
  async ({ itemId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${itemId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to update item.');
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/delete',
  async (itemId, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE}/${itemId}`);
      return itemId;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to delete item.');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export default inventorySlice.reducer;
