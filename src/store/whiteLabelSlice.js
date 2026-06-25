import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { whiteLabelService } from '../services/whiteLabelService';

const defaultSettings = {
  companyName: 'AI Task Manager',
  dashboardTitle: 'Dashboard',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  logoUrl: null
};

// Async thunks
export const fetchWhiteLabelSettings = createAsyncThunk(
  'whiteLabel/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await whiteLabelService.getSettings();
      return settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateWhiteLabelSettings = createAsyncThunk(
  'whiteLabel/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await whiteLabelService.updateSettings(settings);
      return response.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const whiteLabelSlice = createSlice({
  name: 'whiteLabel',
  initialState: {
    ...defaultSettings,
    loading: false,
    error: null
  },
  reducers: {
    resetWhiteLabel: () => {
      return {
        ...defaultSettings,
        loading: false,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchWhiteLabelSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhiteLabelSettings.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, {
          ...defaultSettings,
          ...action.payload
        });
      })
      .addCase(fetchWhiteLabelSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update settings
      .addCase(updateWhiteLabelSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWhiteLabelSettings.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, {
          ...defaultSettings,
          ...action.payload
        });
      })
      .addCase(updateWhiteLabelSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetWhiteLabel } = whiteLabelSlice.actions;
export default whiteLabelSlice.reducer;
