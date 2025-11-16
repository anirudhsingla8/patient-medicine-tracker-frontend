
import { useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Medication as MedicationIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import Logo from './Logo';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const { mode, toggleMode } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDrawerToggle = () => setMobileOpen((v) => !v);

  const DrawerContent = (
    <Box
      role="presentation"
      onClick={handleDrawerToggle}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}
    >
      <Logo sx={{ mb: 2 }} />
      <Divider sx={{ mb: 1 }} />
      <List>
        <ListItemButton component={RouterLink} to="/app/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/app/medicines">
          <ListItemIcon>
            <MedicationIcon />
          </ListItemIcon>
          <ListItemText primary="Medicines" />
        </ListItemButton>
        <ListItemButton component={RouterLink} to="/app/profiles">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Profiles" />
        </ListItemButton>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ mb: 1 }} />
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
            {/* Mobile menu button */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Logo sx={{ flexGrow: 1 }} />

            {/* Desktop nav */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={RouterLink} to="/app/dashboard" color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/app/medicines" color="inherit">
                Medicines
              </Button>
              <Button component={RouterLink} to="/app/profiles" color="inherit">
                Profiles
              </Button>
            </Stack>

            {/* Theme toggle */}
            <IconButton onClick={toggleMode} color="inherit" sx={{ ml: 1 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              Logout
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 260 },
        }}
      >
        {DrawerContent}
      </Drawer>

      <Container maxWidth="lg" component="main" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
