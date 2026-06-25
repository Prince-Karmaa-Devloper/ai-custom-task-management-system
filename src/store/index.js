import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ticketReducer from './ticketSlice';
import userReducer from './userSlice';
import whiteLabelReducer from './whiteLabelSlice';
import tenantReducer from './tenantSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    users: userReducer,
    whiteLabel: whiteLabelReducer,
    tenants: tenantReducer
  }
});
