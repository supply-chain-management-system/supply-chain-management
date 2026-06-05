import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchDashboardStats = createAsyncThunk(
  'logisticsDashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/logistics-dashboard/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch stats');
    }
  }
);

export const fetchShipments = createAsyncThunk(
  'logisticsDashboard/fetchShipments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/logistics-dashboard/shipments');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch shipments');
    }
  }
);

export const fetchActivities = createAsyncThunk(
  'logisticsDashboard/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/logistics-dashboard/activities');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch activities');
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  'logisticsDashboard/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/logistics-dashboard/vehicles');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch vehicles');
    }
  }
);

export const fetchVehicleWarehouses = createAsyncThunk(
  'logisticsDashboard/fetchVehicleWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/logistics-dashboard/warehouse-stands');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch warehouse manager cards');
    }
  }
);

export const fetchPhysicalWarehouses = createAsyncThunk(
  'logisticsDashboard/fetchPhysicalWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ware_house');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch warehouses');
    }
  }
);

export const addVehicle = createAsyncThunk(
  'logisticsDashboard/addVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/logistics-dashboard/vehicles', vehicleData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add vehicle');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'logisticsDashboard/updateVehicle',
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/logistics-dashboard/vehicles/${id}`, vehicleData);
      return response.data; // Server returns updated vehicle
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update vehicle');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'logisticsDashboard/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/logistics-dashboard/vehicles/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete vehicle');
    }
  }
);

export const addShipment = createAsyncThunk(
  'logisticsDashboard/addShipment',
  async (shipmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/logistics-dashboard/shipments', shipmentData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add shipment');
    }
  }
);

export const updateShipment = createAsyncThunk(
  'logisticsDashboard/updateShipment',
  async ({ id, shipmentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/logistics-dashboard/shipments/${id}`, shipmentData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update shipment');
    }
  }
);

export const deleteShipment = createAsyncThunk(
  'logisticsDashboard/deleteShipment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/logistics-dashboard/shipments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete shipment');
    }
  }
);

export const addActivity = createAsyncThunk(
  'logisticsDashboard/addActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/logistics-dashboard/activities', activityData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add activity');
    }
  }
);

export const fetchSettings = createAsyncThunk(
  'logisticsDashboard/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/logistics-dashboard/settings');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch settings');
    }
  }
);

export const saveSettings = createAsyncThunk(
  'logisticsDashboard/saveSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const response = await api.post('/logistics-dashboard/settings', settingsData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to save settings');
    }
  }
);

const logisticsDashboardSlice = createSlice({
  name: 'logisticsDashboard',
  initialState: {
    stats: null,
    kpis: null,
    settings: null,
    shipments: [],
    activities: [],
    vehicles: [],
    warehouses: [],
    loading: {
      stats: false,
      shipments: false,
      activities: false,
      vehicles: false,
      warehouses: false,
      settings: false,
    },
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => { state.loading.stats = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload.stats;
        state.kpis = action.payload.kpis;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload;
      })
      // Shipments
      .addCase(fetchShipments.pending, (state) => { state.loading.shipments = true; })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading.shipments = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading.shipments = false;
        state.error = action.payload;
      })
      // Activities
      .addCase(fetchActivities.pending, (state) => { state.loading.activities = true; })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading.activities = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading.activities = false;
        state.error = action.payload;
      })
      // Vehicles
      .addCase(fetchVehicles.pending, (state) => { state.loading.vehicles = true; })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading.vehicles = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading.vehicles = false;
        state.error = action.payload;
      })
      // Warehouses for vehicle stand selection
      .addCase(fetchVehicleWarehouses.pending, (state) => { state.loading.warehouses = true; })
      .addCase(fetchVehicleWarehouses.fulfilled, (state, action) => {
        state.loading.warehouses = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchVehicleWarehouses.rejected, (state, action) => {
        state.loading.warehouses = false;
        state.error = action.payload;
      })
      // Add Vehicle
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.vehicles = [action.payload, ...state.vehicles];
      })
      // Update Vehicle
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      // Delete Vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      })
      // Add Shipment
      .addCase(addShipment.fulfilled, (state, action) => {
        state.shipments = [action.payload, ...state.shipments];
      })
      // Update Shipment
      .addCase(updateShipment.fulfilled, (state, action) => {
        const index = state.shipments.findIndex(s => {
          const sId = s.db_id ? Number(s.db_id) : (s.id.startsWith('#SHP-1') ? parseInt(s.id.replace('#SHP-1', ''), 10) : parseInt(s.id.replace(/^\D+/g, ''), 10));
          const pId = action.payload.db_id ? Number(action.payload.db_id) : (action.payload.id.startsWith('#SHP-1') ? parseInt(action.payload.id.replace('#SHP-1', ''), 10) : parseInt(action.payload.id.replace(/^\D+/g, ''), 10));
          return sId === pId;
        });
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      })
      // Delete Shipment
      .addCase(deleteShipment.fulfilled, (state, action) => {
        state.shipments = state.shipments.filter(s => {
          const sId = s.db_id ? Number(s.db_id) : (s.id.startsWith('#SHP-1') ? parseInt(s.id.replace('#SHP-1', ''), 10) : parseInt(s.id.replace(/^\D+/g, ''), 10));
          return sId !== action.payload;
        });
      })
      // Add Activity
      .addCase(addActivity.fulfilled, (state, action) => {
        state.activities = [action.payload, ...state.activities];
      })
      // Settings
      .addCase(fetchSettings.pending, (state) => { state.loading.settings = true; })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.error = action.payload;
      })
      .addCase(saveSettings.pending, (state) => { state.loading.settings = true; })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.meta.arg;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.error = action.payload;
      });
  },
});

export default logisticsDashboardSlice.reducer;
