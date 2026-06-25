import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/authSlice';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Tickets from './pages/Tickets/Tickets';
import TicketDetails from './pages/Tickets/TicketDetails';
import Users from './pages/Users/Users';
import Reports from './pages/Reports/Reports';
import Integrations from './pages/Integrations/Integrations';
import AIInsights from './pages/AIInsights/AIInsights';
import WhiteLabel from './pages/WhiteLabel/WhiteLabel';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';

function TenantApp({ darkMode, setDarkMode }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="login"
        element={
          isAuthenticated ? (
            <Navigate to="dashboard" replace />
          ) : (
            <AuthLayout>
              <Login />
            </AuthLayout>
          )
        }
      />
      <Route
        path="dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="tickets"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Tickets />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="tickets/:ticketId"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <TicketDetails />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="users"
        element={
          <RoleRoute allowedRoles={['superadmin', 'admin', 'manager']}>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Users />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="reports"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Reports />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="integrations"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Integrations />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="ai-insights"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <AIInsights />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="white-label"
        element={
          <RoleRoute allowedRoles={['superadmin', 'admin']}>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <WhiteLabel />
            </DashboardLayout>
          </RoleRoute>
        }
      />
      <Route
        path="settings"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Settings />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="profile"
        element={
          <PrivateRoute>
            <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Profile />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route path="" element={<Navigate to="dashboard" replace />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useDispatch();
  const { primaryColor, secondaryColor } = useSelector((state) => state.whiteLabel);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: primaryColor },
      secondary: { main: secondaryColor },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Super Admin Route (no tenant domain) */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthLayout>
                  <Login />
                </AuthLayout>
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Dashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Tickets />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <TicketDetails />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={['superadmin', 'admin', 'manager']}>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Users />
                </DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Reports />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/integrations"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Integrations />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/ai-insights"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <AIInsights />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/white-label"
            element={
              <RoleRoute allowedRoles={['superadmin', 'admin']}>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <WhiteLabel />
                </DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Settings />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
                  <Profile />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          
          {/* Tenant-specific Routes */}
          <Route path="/:tenantDomain/*" element={<TenantApp darkMode={darkMode} setDarkMode={setDarkMode} />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
