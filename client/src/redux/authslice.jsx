import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, remember, navigate }, { rejectWithValue }) => {
    try {
      
      const response = await api.post("/login", { email, password, remember });


      if (response.data.user.is_approved_company == true) {

        navigate("/admindashboard");
      }else{
        navigate("/company-onboarding");
      }

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
      setCompany: (state, action) => {
    if (state.user) {
      state.user.companyId       = action.payload.id;
      state.user.companyName     = action.payload.name;
      state.user.companyVerified = action.payload.is_verified;
    }
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

export const { logout, clearError, setCompany } = authSlice.actions;
export default authSlice.reducer;