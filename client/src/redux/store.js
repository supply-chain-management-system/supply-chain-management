import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import requestsReducer from "./requestsSlice";
import factoryManagerReducer from './factoryManagerSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestsReducer,
    factoryManager: factoryManagerReducer,
  },
});

export default store;