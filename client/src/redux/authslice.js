import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, remember, navigate }, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", { email, password, remember });

      // Store token if returned
      const token = response.data?.token || response.data?.access;
      if (token) {
        remember
          ? localStorage.setItem("token", token)
          : sessionStorage.setItem("token", token);
      }

      // Navigate AFTER success — called here from the thunk using the passed fn
      navigate("/business-manager/dashboard");

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Something went wrong. Please try again." }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || sessionStorage.getItem("token") || null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || action.payload.access || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.detail || "Login failed. Please try again.";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;