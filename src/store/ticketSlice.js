import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ticketService } from '../services/ticketService';

const initialState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null
};

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (filters, { rejectWithValue }) => {
    try {
      const tickets = await ticketService.getTickets(filters);
      return tickets;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTicket = createAsyncThunk(
  'tickets/fetchTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      return ticket;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentTicket } = ticketSlice.actions;
export default ticketSlice.reducer;
