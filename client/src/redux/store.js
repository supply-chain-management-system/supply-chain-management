import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import requestsReducer from "./requestsSlice";
// import factoryManagerReducer from './factoryManagerSlice';
import warehouseManagerReducer from './warehouseManagerSlice';
import logisticsManagerReducer from './logisticsManagerSlice';
import supplierReducer from './supplierSlice';
import inventoryReducer from './inventorySlice';
import orderReducer from './orderSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestsReducer,
    // factoryManager: factoryManagerReducer,
    warehouseManager: warehouseManagerReducer,
    logisticsManager: logisticsManagerReducer,
    supplier: supplierReducer,
    inventory: inventoryReducer,
    order: orderReducer,
  },
});

export default store;