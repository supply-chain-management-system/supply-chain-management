import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

const BASE = '/business-manager/warehouse-managers';

/* ══════════════════════════════════════════════════════════
   THUNKS
═══════════════════════════════════════════════════════════ */
export const fetchWarehouseManagers = createAsyncThunk(
  'warehouseManager/fetchAll',
  async ({ page = 1, size = 9, warehouse_id } = {}, { rejectWithValue }) => {
    try {
      const params = { page, size };
      if (warehouse_id) params.warehouse_id = warehouse_id;
      const res = await apiClient.get(BASE + '/', { params });
      return { data: res.data, page };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to fetch warehouse managers.');
    }
  }
);

export const createWarehouseManager = createAsyncThunk(
  'warehouseManager/create',
  async (form, { rejectWithValue, dispatch }) => {
    try {
      const res = await apiClient.post(BASE + '/', {
        name:         form.name.trim(),
        email:        form.email.trim(),
        phone:        form.phone?.trim() || null,
        shift:        form.shift,
        zone:         form.zone,
        warehouse_id: form.warehouse_id || 1,
      });
      dispatch(fetchWarehouseManagers({ page: 1 }));
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to create manager.');
    }
  }
);

export const fetchManagerAnalytics = createAsyncThunk(
  'warehouseManager/analytics',
  async (managerId, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`${BASE}/${managerId}/analytics`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to fetch analytics.');
    }
  }
);

export const removeWarehouseManager = createAsyncThunk(
  'warehouseManager/remove',
  async (managerId, { rejectWithValue, dispatch, getState }) => {
    try {
      await apiClient.delete(`${BASE}/${managerId}`);
      const { currentPage } = getState().warehouseManager;
      dispatch(fetchWarehouseManagers({ page: currentPage }));
      return managerId;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to remove manager.');
    }
  }
);

/* ══════════════════════════════════════════════════════════
   SLICE
═══════════════════════════════════════════════════════════ */
const initialForm = {
  name:         '',
  email:        '',
  phone:        '',
  shift:        'Day',
  zone:         'Dry Goods',
  warehouse_id: 1,
};

const warehouseManagerSlice = createSlice({
  name: 'warehouseManager',
  initialState: {
    managers:         [],
    total:            0,
    currentPage:      1,
    form:             initialForm,
    isFormOpen:       false,
    selectedManager:  null,
    analytics:        null,
    view:             'roster',        // 'roster' | 'analytics'
    loading:          false,
    inviteLoading:    false,
    analyticsLoading: false,
    toast:            null,            // { type: 'success'|'error', msg: string }
  },
  reducers: {
    setView:            (s, a) => { s.view = a.payload; },
    setSelectedManager: (s, a) => { s.selectedManager = a.payload; s.view = 'analytics'; },
    setCurrentPage:     (s, a) => { s.currentPage = a.payload; },
    toggleForm:         (s)    => { s.isFormOpen = !s.isFormOpen; },
    updateForm:         (s, a) => { s.form = { ...s.form, ...a.payload }; },
    clearToast:         (s)    => { s.toast = null; },
  },
  extraReducers: (builder) => {
    /* fetch list */
    builder
      .addCase(fetchWarehouseManagers.pending,   (s) => { s.loading = true; })
      .addCase(fetchWarehouseManagers.fulfilled, (s, a) => {
        s.loading      = false;
        s.managers     = a.payload.data;
        s.total        = a.payload.data.length; // adjust if backend returns total separately
        s.currentPage  = a.payload.page;
      })
      .addCase(fetchWarehouseManagers.rejected,  (s, a) => {
        s.loading = false;
        s.toast   = { type: 'error', msg: a.payload };
      });

    /* create */
    builder
      .addCase(createWarehouseManager.pending,   (s) => { s.inviteLoading = true; })
      .addCase(createWarehouseManager.fulfilled, (s) => {
        s.inviteLoading = false;
        s.isFormOpen    = false;
        s.form          = initialForm;
        s.toast         = { type: 'success', msg: '✅ Manager card created & invite sent!' };
      })
      .addCase(createWarehouseManager.rejected,  (s, a) => {
        s.inviteLoading = false;
        s.toast         = { type: 'error', msg: a.payload };
      });

    /* analytics */
    builder
      .addCase(fetchManagerAnalytics.pending,   (s) => { s.analyticsLoading = true; s.analytics = null; })
      .addCase(fetchManagerAnalytics.fulfilled, (s, a) => { s.analyticsLoading = false; s.analytics = a.payload; })
      .addCase(fetchManagerAnalytics.rejected,  (s, a) => {
        s.analyticsLoading = false;
        s.toast = { type: 'error', msg: a.payload };
      });

    /* remove */
    builder
      .addCase(removeWarehouseManager.fulfilled, (s, a) => {
        if (s.selectedManager?.id === a.payload) {
          s.selectedManager = null;
          s.analytics       = null;
          s.view            = 'roster';
        }
        s.toast = { type: 'success', msg: '🗑️ Manager removed.' };
      })
      .addCase(removeWarehouseManager.rejected, (s, a) => {
        s.toast = { type: 'error', msg: a.payload };
      });
  },
});

export const {
  setView, setSelectedManager, setCurrentPage,
  toggleForm, updateForm, clearToast,
} = warehouseManagerSlice.actions;

export default warehouseManagerSlice.reducer;