import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  People,
  Assessment,
  IntegrationInstructions,
  SmartToy,
  Palette,
  Settings,
  AccountCircle,
  Notifications,
  ChevronLeft,
  Logout
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { fetchWhiteLabelSettings } from '../store/whiteLabelSlice';
import { motion, AnimatePresence } from 'framer-motion';
import useTenantPath from '../hooks/useTenantPath';

const drawerWidth = 240;

const DashboardLayout = ({ children, darkMode, setDarkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const tenantPath = useTenantPath();
  const { user } = useSelector(state => state.auth);
  console.log("DashboardLayout user object:", user);
  const { companyName, dashboardTitle, logoUrl, primaryColor, secondaryColor } = useSelector(state => state.whiteLabel);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchWhiteLabelSettings());
    }
  }, [dispatch, user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    const result = await dispatch(logout());
    const slug = result.payload || 'global';
    navigate(`/${slug}/login`);
  };

  const getMenuItems = () => {
    console.log("getMenuItems user.role:", user?.role);
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: tenantPath('/dashboard') },
      { text: 'Tickets', icon: <Assignment />, path: tenantPath('/tickets') },
    ];

    if (user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'manager') {
      console.log("Adding Users menu item");
      baseItems.push({ text: 'Users', icon: <People />, path: tenantPath('/users') });
    }

    baseItems.push(
      { text: 'Reports', icon: <Assessment />, path: tenantPath('/reports') },
      { text: 'Integrations', icon: <IntegrationInstructions />, path: tenantPath('/integrations') },
      { text: 'AI Insights', icon: <SmartToy />, path: tenantPath('/ai-insights') }
    );

    if (user?.role === 'superadmin' || user?.role === 'admin') {
      baseItems.push({ text: 'White Label', icon: <Palette />, path: tenantPath('/white-label') });
    }

    baseItems.push(
      { text: 'Settings', icon: <Settings />, path: tenantPath('/settings') },
      { text: 'Profile', icon: <AccountCircle />, path: tenantPath('/profile') }
    );

    return baseItems;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
          {logoUrl ? (
            <Box component="img" src={logoUrl} alt="Company logo" sx={{ height: 32, width: 32, objectFit: 'contain', borderRadius: 1 }} />
          ) : null}
          <Typography variant="h6" noWrap component="div">
            {companyName}
          </Typography>
        </Box>
        <IconButton onClick={handleSidebarToggle}>
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {sidebarOpen && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 64}px)` },
          ml: { sm: `${sidebarOpen ? drawerWidth : 64}px` },
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {dashboardTitle}
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
            label={darkMode ? 'Dark' : 'Light'}
            sx={{ mr: 2 }}
          />
          <IconButton color="inherit" onClick={handleNotificationMenu}>
            <Badge badgeContent={3} color="secondary">
              <Notifications />
            </Badge>
          </IconButton>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar>{user.avatar}</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { handleClose(); navigate(tenantPath('/profile')); }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate(tenantPath('/settings')); }}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: sidebarOpen ? drawerWidth : 64 }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarOpen ? drawerWidth : 64,
              transition: 'width 0.3s ease',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 64}px)` },
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      >
        <MenuItem onClick={handleNotificationClose}>New ticket assigned</MenuItem>
        <MenuItem onClick={handleNotificationClose}>Project update available</MenuItem>
        <MenuItem onClick={handleNotificationClose}>AI insight generated</MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardLayout;
