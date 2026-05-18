import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

// ─── THUNKS ─────────────────────────────────────────────────────────────────

export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/business-manager/requests");
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Failed to fetch requests." }
      );
    }
  }
);

export const approveRequest = createAsyncThunk(
  "requests/approveRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      await api.put(`/business-manager/requests/${requestId}/action`, { action: "APPROVE" });
      return requestId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Approval failed." }
      );
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "requests/rejectRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      await api.put(`/business-manager/requests/${requestId}/action`, { action: "REJECT" });
      return requestId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Rejection failed." }
      );
    }
  }
);

export const handleRequestAction = createAsyncThunk(
  "requests/handleRequestAction",
  async ({ requestId, action }, { rejectWithValue }) => {
    try {
      await api.put(`/business-manager/requests/${requestId}/action`, { action });
      return { requestId, action };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { detail: "Action failed." }
      );
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

const requestsSlice = createSlice({
  name: "requests",
  initialState: {
    items: [],               // list of request objects from backend
    loading: false,
    error: null,
    actionLoadingId: null,   // requestId currently being approved/rejected
    actionError: null,
  },
  reducers: {
    clearRequestsError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    // Useful for optimistic/mock updates from components
    setRequests: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch all requests ──
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Failed to load requests.";
      });

    // ── Approve ──
    builder
      .addCase(approveRequest.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const req = state.items.find((r) => r.id === action.payload);
        if (req) req.status = "approved";
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload?.detail || "Approval failed.";
      });

    // ── Reject ──
    builder
      .addCase(rejectRequest.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.actionError = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const req = state.items.find((r) => r.id === action.payload);
        if (req) req.status = "rejected";
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload?.detail || "Rejection failed.";
      });

    // ── Handle Request Action ──
    builder
      .addCase(handleRequestAction.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.requestId;
        state.actionError = null;
      })
      .addCase(handleRequestAction.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        const { requestId, action: actionType } = action.payload;
        const req = state.items.find((r) => r.id === requestId);
        if (req) {
          req.status = actionType.toLowerCase() === "approve" ? "approved" : "rejected";
        }
      })
      .addCase(handleRequestAction.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.actionError = action.payload?.detail || "Action failed.";
      });
  },
});

export const { clearRequestsError, setRequests } = requestsSlice.actions;
export default requestsSlice.reducer;