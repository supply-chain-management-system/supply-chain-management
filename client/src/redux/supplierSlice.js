import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

const BASE = '/supplier-manager/suppliers';

/* ══════════════════════════════════════════════════════════
   THUNKS
═══════════════════════════════════════════════════════════ */

export const fetchSuppliers = createAsyncThunk(
  'supplier/fetchAll',
  async ({ page = 1, size = 9, category } = {}, { rejectWithValue }) => {
    try {
      const params = { page, size };
      if (category) params.category = category;

      const [rosterRes, countRes] = await Promise.all([
        api.get(BASE + '/', { params }),
        api.get(BASE + '/count', { params: category ? { category } : {} }),
      ]);
      return { suppliers: rosterRes.data, total: countRes.data.total, page };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to load suppliers.');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'supplier/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE + '/', {
        name:           formData.name.trim(),
        category:       formData.category,
        contact_email:  formData.contact_email.trim(),
        phone:          formData.phone?.trim() || null,
        lead_time_days: parseInt(formData.lead_time_days) || 14,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to onboard supplier.');
    }
  }
);

export const fetchSupplierAnalytics = createAsyncThunk(
  'supplier/analytics',
  async (supplierId, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/${supplierId}/analytics`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to fetch analytics.');
    }
  }
);

export const removeSupplier = createAsyncThunk(
  'supplier/remove',
  async (supplierId, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.delete(`${BASE}/${supplierId}`);
      const { currentPage } = getState().supplier;
      dispatch(fetchSuppliers({ page: currentPage }));
      return supplierId;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to remove supplier.');
    }
  }
);

/* ══════════════════════════════════════════════════════════
   SLICE
═══════════════════════════════════════════════════════════ */

const initialForm = {
  name:           '',
  category:       'Electronics',
  contact_email:  '',
  phone:          '',
  lead_time_days: 14,
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState: {
    suppliers:        [],
    total:            0,
    currentPage:      1,
    form:             initialForm,
    isFormOpen:       false,
    selectedSupplier: null,
    analytics:        null,
    view:             'roster',       // 'roster' | 'analytics'
    loading:          false,
    createLoading:    false,
    analyticsLoading: false,
    error:            null,
    toast:            null,           // { msg: string, type: 'success' | 'error' }
  },
  reducers: {
    setView(state, action) {
      state.view = action.payload;
    },
    setSelectedSupplier(state, action) {
      state.selectedSupplier = action.payload;
      state.analytics = null;
      state.view = 'analytics';
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    toggleForm(state) {
      state.isFormOpen = !state.isFormOpen;
      if (!state.isFormOpen) state.form = initialForm;
    },
    updateForm(state, action) {
      state.form = { ...state.form, ...action.payload };
    },
    resetForm(state) {
      state.form = initialForm;
      state.isFormOpen = false;
    },
    clearToast(state) {
      state.toast = null;
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
  },
  extraReducers: (builder) => {
    /* fetchSuppliers */
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading     = false;
        state.suppliers   = action.payload.suppliers;
        state.total       = action.payload.total;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.toast   = { msg: action.payload, type: 'error' };
      });

    /* createSupplier */
    builder
      .addCase(createSupplier.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.createLoading = false;
        state.suppliers     = [action.payload, ...state.suppliers];
        state.total        += 1;
        state.form          = initialForm;
        state.isFormOpen    = false;
        state.toast         = { msg: `${action.payload.name} onboarded successfully!`, type: 'success' };
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.createLoading = false;
        state.toast         = { msg: action.payload, type: 'error' };
      });

    /* fetchSupplierAnalytics */
    builder
      .addCase(fetchSupplierAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analytics = null;
      })
      .addCase(fetchSupplierAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics        = action.payload;
      })
      .addCase(fetchSupplierAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.toast = { msg: action.payload, type: 'error' };
      });

    /* removeSupplier */
    builder
      .addCase(removeSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
        state.total    -= 1;
        if (state.selectedSupplier?.id === action.payload) {
          state.selectedSupplier = null;
          state.analytics        = null;
          state.view             = 'roster';
        }
        state.toast = { msg: 'Supplier removed from registry.', type: 'success' };
      })
      .addCase(removeSupplier.rejected, (state, action) => {
        state.toast = { msg: action.payload, type: 'error' };
      });
  },
});

export const {
  setView,
  setSelectedSupplier,
  setCurrentPage,
  toggleForm,
  updateForm,
  resetForm,
  clearToast,
  showToast,
} = supplierSlice.actions;

export default supplierSlice.reducer;