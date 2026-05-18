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
      });
  }
});

export default inventorySlice.reducer;
