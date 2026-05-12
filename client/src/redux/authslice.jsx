import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";


// ─────────────────────────────
// LOGIN
// ─────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, remember, navigate }, { rejectWithValue }) => {
    try {

      const response = await api.post(
        "/login",
        { email, password, remember }
      );

      console.log("Login response:", response.data);

      const role = response.data.user.role;

      if (response.data.user.company_verified === true) {

        if (role === "admin") {
          navigate("/admindashboard");

        } else if (role === "business_manager") {
          navigate("/business-manager/dashboard");

        } else if (role === "warehouse_manager") {
          navigate("/ware_dashboard");

        } else if (role === "factory_manager") {
          navigate("/factorydash");

        } else {
          navigate("/");
        }

      } else {
        navigate("/company-onboarding");
      }

      return {
        ...response.data,
        remember,
      };

    } catch (err) {

      console.log(err);

      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 403 && data?.user?.is_verified === false) {

        navigate("/verify-email");

        return rejectWithValue({
          detail: "Email not verified",
          silent: true,
        });
      }

      return rejectWithValue(
        err.response?.data || {
          detail: "Something went wrong. Please try again.",
        }
      );
    }
  }
);


// ─────────────────────────────
// FETCH CURRENT USER (/me)
// ─────────────────────────────
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {

      const response = await api.get("/me");

      console.log(response.data);

      return response.data;

    } catch (err) {

      return rejectWithValue(
        err.response?.data || {
          detail: "Failed to fetch user",
        }
      );
    }
  }
);


// ─────────────────────────────
// LOGOUT
// ─────────────────────────────
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {

      const response = await api.post("/logout");

      return response.data;

    } catch (err) {

      return rejectWithValue(
        err.response?.data || {
          detail: "Logout failed",
        }
      );
    }
  }
);


// ─────────────────────────────
// SLICE
// ─────────────────────────────
const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    role: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    remember: false,
  },

  reducers: {

    clearError: (state) => {
      state.error = null;
    },

    setCompany: (state, action) => {
      if (state.user) {
        state.user.companyId = action.payload.id;
        state.user.companyName = action.payload.name;
        state.user.companyVerified = action.payload.is_verified;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      // ─────────────────────────────
      // LOGIN
      // ─────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.isAuthenticated = true;

        state.user = {
          ...action.payload.user,
          public_id: action.payload.user.public_id,
        };

        state.role = action.payload.user.role;

        state.remember = action.payload.remember;

        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        state.isAuthenticated = false;

        state.error =
          action.payload?.detail ||
          "Login failed. Please try again.";
      })


      // ─────────────────────────────
      // FETCH ME
      // ─────────────────────────────
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;

        state.isAuthenticated = true;

        state.user = action.payload.user;

        state.role = action.payload.user.role;

        state.error = null;
      })

      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;

        state.user = null;
        state.role = null;

        state.isAuthenticated = false;
      })


      // ─────────────────────────────
      // LOGOUT
      // ─────────────────────────────
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;

        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
        state.remember = false;
      })

      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  clearError,
  setCompany,
} = authSlice.actions;

export default authSlice.reducer;