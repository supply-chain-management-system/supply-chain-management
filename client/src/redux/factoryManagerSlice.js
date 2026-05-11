import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchFactoryManagers = createAsyncThunk(
  'factoryManager/fetchAll',
  async ({ page = 1, size = 9, factory_id } = {}, { rejectWithValue }) => {
    try {
      const params = { page, size };
      if (factory_id) params.factory_id = factory_id;

      const [rosterRes, countRes] = await Promise.all([
        api.get('/business-manager/factory-managers', { params }),
        api.get('/business-manager/factory-managers/count', { params: factory_id ? { factory_id } : {} }),
      ]);
      return { managers: rosterRes.data, total: countRes.data.total };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load managers.');
    }
  }
);

export const createFactoryManager = createAsyncThunk(
  'factoryManager/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/business-manager/factory-managers', formData);
      return res.data;  // returns the newly created card
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to create manager.');
    }
  }
);

export const fetchManagerAnalytics = createAsyncThunk(
  'factoryManager/fetchAnalytics',
  async (managerId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/business-manager/factory-managers/${managerId}/analytics`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to load analytics.');
    }
  }
);

export const removeFactoryManager = createAsyncThunk(
  'factoryManager/remove',
  async (managerId, { rejectWithValue }) => {
    try {
      await api.delete(`/business-manager/factory-managers/${managerId}`);
      return managerId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to remove manager.');
    }
  }
);

// ==========================================
// INITIAL FORM STATE
// ==========================================

const initialForm = {
  name: '',
  email: '',
  phone: '',
  shift: 'Day',
  department: 'Assembly',
  factory_id: 1,
};

// ==========================================
// SLICE
// ==========================================

const factoryManagerSlice = createSlice({
  name: 'factoryManager',
  initialState: {
    // --- roster ---
    managers: [],
    total: 0,
    currentPage: 1,

    // --- form ---
    form: initialForm,
    isFormOpen: false,

    // --- selected manager + analytics ---
    selectedManager: null,
    analytics: null,

    // --- ui state ---
    view: 'roster',           // 'roster' | 'analytics'
    loading: false,
    inviteLoading: false,
    analyticsLoading: false,
    error: null,
    toast: null,              // { msg, type }
  },
  reducers: {
    setView(state, action) {
      state.view = action.payload;
    },
    setSelectedManager(state, action) {
      state.selectedManager = action.payload;
      state.analytics = null;   // clear stale analytics on new selection
      state.view = 'analytics';
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    toggleForm(state) {
      state.isFormOpen = !state.isFormOpen;
      if (!state.isFormOpen) state.form = initialForm; // reset on close
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
      state.toast = action.payload; // { msg, type }
    },
  },
  extraReducers: (builder) => {
    // --- fetchFactoryManagers ---
    builder
      .addCase(fetchFactoryManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFactoryManagers.fulfilled, (state, action) => {
        state.loading = false;
        state.managers = action.payload.managers;
        state.total = action.payload.total;
      })
      .addCase(fetchFactoryManagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.toast = { msg: action.payload, type: 'error' };
      });

    // --- createFactoryManager ---
    builder
      .addCase(createFactoryManager.pending, (state) => {
        state.inviteLoading = true;
        state.error = null;
      })
      .addCase(createFactoryManager.fulfilled, (state, action) => {
        state.inviteLoading = false;
        state.managers = [action.payload, ...state.managers]; // prepend new card
        state.total += 1;
        state.form = initialForm;
        state.isFormOpen = false;
        state.toast = { msg: `Manager card created & invite sent to ${action.payload.email}`, type: 'success' };
      })
      .addCase(createFactoryManager.rejected, (state, action) => {
        state.inviteLoading = false;
        state.toast = { msg: action.payload, type: 'error' };
      });

    // --- fetchManagerAnalytics ---
    builder
      .addCase(fetchManagerAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchManagerAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchManagerAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.toast = { msg: action.payload, type: 'error' };
      });

    // --- removeFactoryManager ---
    builder
      .addCase(removeFactoryManager.fulfilled, (state, action) => {
        state.managers = state.managers.filter(m => m.id !== action.payload);
        state.total -= 1;
        if (state.selectedManager?.id === action.payload) {
          state.selectedManager = null;
          state.analytics = null;
          state.view = 'roster';
        }
        state.toast = { msg: 'Manager removed.', type: 'success' };
      })
      .addCase(removeFactoryManager.rejected, (state, action) => {
        state.toast = { msg: action.payload, type: 'error' };
      });
  },
});

export const {
  setView,
  setSelectedManager,
  setCurrentPage,
  toggleForm,
  updateForm,
  resetForm,
  clearToast,
  showToast,
} = factoryManagerSlice.actions;

export default factoryManagerSlice.reducer;