import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice";
import requestsReducer from "./requestsSlice";
// import factoryManagerReducer from './factoryManagerSlice';
import warehouseManagerReducer from './warehouseManagerSlice';
import logisticsManagerReducer from './logisticsManagerSlice';
import supplierReducer from './supplierSlice';
import inventoryReducer from './inventorySlice';
import orderReducer from './orderSlice';
import logisticsDashboardReducer from './logisticsDashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // factoryManager: factoryManagerReducer,
    warehouseManager: warehouseManagerReducer,
    logisticsManager: logisticsManagerReducer,
    requests: requestsReducer,
    supplier: supplierReducer,
    inventory: inventoryReducer,
    order: orderReducer,
    logisticsDashboard: logisticsDashboardReducer,
  },
});

export default store;