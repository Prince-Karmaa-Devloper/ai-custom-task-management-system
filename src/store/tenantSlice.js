import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tenantService } from '../services/tenantService';

const initialState = {
  tenants: [],
  loading: false,
  error: null
};

export const fetchTenants = createAsyncThunk(
  'tenants/fetchTenants',
  async (_, { rejectWithValue }) => {
    try {
      const data = await tenantService.getTenants();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const addTenant = createAsyncThunk(
  'tenants/addTenant',
  async (tenantData, { rejectWithValue }) => {
    try {
      const data = await tenantService.createTenant(tenantData);
      return data.company;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const toggleTenantActive = createAsyncThunk(
  'tenants/toggleTenantActive',
  async ({ id, domain, isActive }, { rejectWithValue }) => {
    try {
      const data = await tenantService.toggleTenantStatus(id, isActive);
      return data.company;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTenant.fulfilled, (state, action) => {
        state.tenants.push(action.payload);
      })
      .addCase(toggleTenantActive.fulfilled, (state, action) => {
        const index = state.tenants.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
      });
  }
});

export default tenantSlice.reducer;
