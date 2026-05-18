import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Pages,
  Verified,
  Settings,
  Logout,
  Send,
  Search
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Generate Certificates', icon: <Pages />, path: '/generate', adminOnly: true },

  { text: 'View Certificates', icon: <Pages />, path: '/certificates' },
  { text: 'Sent Certificates', icon: <Send />, path: '/sent-certificates' },
  { text: 'Verify Certificate', icon: <Verified />, path: '/verify' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLabel = menuItems.find((item) => item.path === location.pathname)?.text || 'Dashboard';

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <Box>
        <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              mx: 'auto',
              mb: 1,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            SE
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
            Sepiri EduHub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Modern certificate control.
          </Typography>
        </Box>

        <Box sx={{ px: 2 }}>
          <List sx={{ px: 0 }}>
            {menuItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = location.pathname === item.path;

              return (
                <ListItem key={item.text} disablePadding >
                  <ListItemButton
                    selected={isActive}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.primary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'transparent' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          py: 0.5,
          borderBottom: '1px dashed rgba(145, 158, 171, 0.24)',
        }}
      >
        <Toolbar sx={{ gap: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap fontWeight={800} sx={{ fontSize: '1.25rem' }}>
              {activeLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Sepiri EduHub Workspace
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, width: '100%', maxWidth: 500 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'transparent' }}
            />
            {isAdmin && (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/generate')}
                sx={{ whiteSpace: 'nowrap', px: 3 }}
              >
                + New
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="large">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                navigate('/settings');
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 3, md: 4 },
          minHeight: '100vh',
          background: 'transparent',
        }}
      >
        <Toolbar sx={{ mb: 3 }} />
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
