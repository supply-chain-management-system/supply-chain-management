import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import requestsReducer from "./requestsSlice";
// import factoryManagerReducer from './factoryManagerSlice';
import warehouseManagerReducer from './warehouseManagerSlice';
import logisticsManagerReducer from './logisticsManagerSlice';
import supplierReducer from './supplierSlice';
import logisticsDashboardReducer from './logisticsDashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // factoryManager: factoryManagerReducer,
    warehouseManager: warehouseManagerReducer,
    logisticsManager: logisticsManagerReducer,
    requests: requestsReducer,
    supplier: supplierReducer,
    logisticsDashboard: logisticsDashboardReducer,
  },
});

export default store;