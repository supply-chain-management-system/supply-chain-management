import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import requestsReducer from "./requestsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestsReducer,
  },
});

export default store;