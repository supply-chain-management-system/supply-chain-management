import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

const BASE = '/business-manager/logistics-managers';

/* ══════════════════════════════════════════════════════════
   THUNKS
═══════════════════════════════════════════════════════════ */

export const fetchLogisticsManagers = createAsyncThunk(
  'logisticsManager/fetchAll',
  async ({ page = 1, size = 9, logistics_id } = {}, { rejectWithValue }) => {
    try {
      const params = { page, size };
      if (logistics_id) params.logistics_id = logistics_id;

      const [rosterRes, countRes] = await Promise.all([
        api.get(BASE + '/', { params }),
        api.get(BASE + '/count', { params: logistics_id ? { logistics_id } : {} }),
      ]);
      return { managers: rosterRes.data, total: countRes.data.total, page };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to load managers.');
    }
  }
);

export const createLogisticsManager = createAsyncThunk(
  'logisticsManager/create',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE + '/', {
        name:         formData.name.trim(),
        email:        formData.email.trim(),
        phone:        formData.phone?.trim() || null,
        shift:        formData.shift,
        route:        formData.route,
        logistics_id: formData.logistics_id || 1,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to create manager.');
    }
  }
);

export const fetchManagerAnalytics = createAsyncThunk(
  'logisticsManager/analytics',
  async (managerId, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/${managerId}/analytics`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.detail || 'Failed to fetch analytics.');
    }
  }
);

export const removeLogisticsManager = createAsyncThunk(
  'logisticsManager/remove',
  async (managerId, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.delete(`${BASE}/${managerId}`);
      const { currentPage } = getState().logisticsManager;
      dispatch(fetchLogisticsManagers({ page: currentPage }));
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
  route:        'Local',
  logistics_id: 1,
};

const logisticsManagerSlice = createSlice({
  name: 'logisticsManager',
  initialState: {
    managers:         [],
    total:            0,
    currentPage:      1,
    form:             initialForm,
    isFormOpen:       false,
    selectedManager:  null,
    analytics:        null,
    view:             'roster',       // 'roster' | 'analytics'
    loading:          false,
    inviteLoading:    false,
    analyticsLoading: false,
    error:            null,
    toast:            null,           // { msg: string, type: 'success' | 'error' }
  },
  reducers: {
    setView(state, action) {
      state.view = action.payload;
    },
    setSelectedManager(state, action) {
      state.selectedManager = action.payload;
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
    /* fetchLogisticsManagers */
    builder
      .addCase(fetchLogisticsManagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogisticsManagers.fulfilled, (state, action) => {
        state.loading    = false;
        state.managers   = action.payload.managers;
        state.total      = action.payload.total;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchLogisticsManagers.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.toast   = { msg: action.payload, type: 'error' };
      });

    /* createLogisticsManager */
    builder
      .addCase(createLogisticsManager.pending, (state) => {
        state.inviteLoading = true;
        state.error = null;
      })
      .addCase(createLogisticsManager.fulfilled, (state, action) => {
        state.inviteLoading = false;
        state.managers      = [action.payload, ...state.managers];
        state.total        += 1;
        state.form          = initialForm;
        state.isFormOpen    = false;
        state.toast         = { msg: `Manager card created & invite sent to ${action.payload.email}`, type: 'success' };
      })
      .addCase(createLogisticsManager.rejected, (state, action) => {
        state.inviteLoading = false;
        state.toast         = { msg: action.payload, type: 'error' };
      });

    /* fetchManagerAnalytics */
    builder
      .addCase(fetchManagerAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analytics = null;
      })
      .addCase(fetchManagerAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics        = action.payload;
      })
      .addCase(fetchManagerAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.toast = { msg: action.payload, type: 'error' };
      });

    /* removeLogisticsManager */
    builder
      .addCase(removeLogisticsManager.fulfilled, (state, action) => {
        state.managers = state.managers.filter(m => m.id !== action.payload);
        state.total   -= 1;
        if (state.selectedManager?.id === action.payload) {
          state.selectedManager = null;
          state.analytics       = null;
          state.view            = 'roster';
        }
        state.toast = { msg: 'Manager removed.', type: 'success' };
      })
      .addCase(removeLogisticsManager.rejected, (state, action) => {
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
} = logisticsManagerSlice.actions;

export default logisticsManagerSlice.reducer;