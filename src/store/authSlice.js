import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

const initialState = {
  user: null,
  tenantDomain: localStorage.getItem('tenantDomain') || null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, tenantDomain }, { rejectWithValue }) => {
    try {
      const data = await authService.login(email, password, tenantDomain);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  return authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      console.log("initializeAuth called");
      const user = authService.getCurrentUser();
      console.log("initializeAuth user from getCurrentUser:", user);
      const tenantDomain = localStorage.getItem('tenantDomain');
      if (user) {
        state.user = user;
        state.tenantDomain = tenantDomain;
        state.isAuthenticated = true;
      }
      console.log("initializeAuth final state:", state);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("login.fulfilled action.payload:", action.payload);
        state.loading = false;
        state.user = action.payload.user;
        state.tenantDomain = action.payload.user.tenantDomain === 'global' 
          ? null 
          : action.payload.user.tenantDomain;
        state.isAuthenticated = true;
        console.log("login.fulfilled state.user:", state.user);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tenantDomain = null;
        state.isAuthenticated = false;
      });
  }
});

export const { initializeAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
