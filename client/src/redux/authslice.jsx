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
      const companyVerified = response.data.user.company_verified;

      // Only check company_verified for business manager and owner roles
      const needsOnboarding = (role === "owner" || role === "business_manager") && companyVerified !== true;

      if (needsOnboarding) {
        navigate("/company-onboarding");
      } else {
        if (role === "admin" || role === "owner") {
          navigate("/admindashboard");
        } else if (role === "business_manager") {
          navigate("/business-manager/dashboard");
        } else if (role === "warehouse_manager") {
          navigate("/ware_dashboard");
        } else if (role === "factory_manager") {
          navigate("/factorydash");
        } else if (role === "supply_manager") {
          navigate("/supplier-manager/dashboard");
        } else if (role === "logistics_manager") {
          navigate("/logistics_dashboard");
        } else {
          navigate("/");
        }
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
// GOOGLE LOGIN
// ─────────────────────────────
export const loginGoogle = createAsyncThunk(
  "auth/loginGoogle",
  async ({ code, navigate }, { rejectWithValue }) => {
    try {
      const response = await api.post("/google", { code });

      console.log("Google login response:", response.data);

      const role = response.data.user.role;
      const companyVerified = response.data.user.company_verified;

      // Only check company_verified for business manager and owner roles
      const needsOnboarding = (role === "owner" || role === "business_manager") && companyVerified !== true;

      if (needsOnboarding) {
        navigate("/company-onboarding");
      } else {
        if (role === "admin" || role === "owner") {
          navigate("/admindashboard");
        } else if (role === "business_manager") {
          navigate("/business-manager/dashboard");
        } else if (role === "warehouse_manager") {
          navigate("/ware_dashboard");
        } else if (role === "factory_manager") {
          navigate("/factorydash");
        } else if (role === "supply_manager") {
          navigate("/supplier-manager/dashboard");
        } else if (role === "logistics_manager") {
          navigate("/logistics_dashboard");
        } else {
          navigate("/");
        }
      }

      return response.data;

    } catch (err) {
      console.log(err);
      return rejectWithValue(
        err.response?.data || {
          detail: "Google login failed. Please try again.",
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

    cancelAuthCheck: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
    },

    setCompany: (state, action) => {
      if (state.user) {
        state.user.companyId = action.payload.id;
        state.user.companyName = action.payload.name;
        state.user.companyVerified = action.payload.is_verified;
        state.user.company_id = action.payload.id;
        state.user.company_name = action.payload.name;
        state.user.company_verified = action.payload.is_verified;
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
        localStorage.setItem("has_session", "true");
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;

        state.isAuthenticated = false;

        state.error =
          action.payload?.detail ||
          "Login failed. Please try again.";
      })

      // ─────────────────────────────
      // GOOGLE LOGIN
      // ─────────────────────────────
      .addCase(loginGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = {
          ...action.payload.user,
          public_id: action.payload.user.public_id,
        };
        state.role = action.payload.user.role;
        state.error = null;
        localStorage.setItem("has_session", "true");
      })

      .addCase(loginGoogle.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error =
          action.payload?.detail ||
          "Google login failed. Please try again.";
      })


      // ─────────────────────────────
      // FETCH ME
      // ─────────────────────────────
      .addCase(fetchMe.pending, (state) => {
        // Do not set loading to true on background polling if we are already authenticated
        if (!state.isAuthenticated) {
          state.loading = true;
        }
      })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;

        state.isAuthenticated = true;

        state.user = action.payload.user;

        state.role = action.payload.user.role;

        state.error = null;
        localStorage.setItem("has_session", "true");
      })

      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;

        state.user = null;
        state.role = null;

        state.isAuthenticated = false;
        localStorage.removeItem("has_session");
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
        localStorage.removeItem("has_session");
      })

      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
        state.remember = false;
        localStorage.removeItem("has_session");
      });
  },
});

export const {
  clearError,
  setCompany,
  cancelAuthCheck,
} = authSlice.actions;

export default authSlice.reducer;