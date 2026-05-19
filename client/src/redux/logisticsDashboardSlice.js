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

const logisticsDashboardSlice = createSlice({
  name: 'logisticsDashboard',
  initialState: {
    stats: null,
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
      });
  },
});

export default logisticsDashboardSlice.reducer;
