// client/src/App.js
import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, createTheme, ThemeProvider, CssBaseline, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

// Sayfa Bileşenleri
import AnaSayfa from './pages/AnaSayfa';
import AidatYonetimiSayfasi from './pages/AidatYonetimiSayfasi';
import RaporlarSayfasi from './pages/RaporlarSayfasi';
import AyarlarSayfasi from './pages/AyarlarSayfasi';
// Artık ihtiyaç duyulmayan sayfaları import listesinden temizliyoruz
// import DaireYonetimiSayfasi from './pages/DaireYonetimiSayfasi';

// Tema tanımınız (değişiklik yok)
const theme = createTheme({ /* ... önceki tema kodunuz ... */ });

const menuItems = [
  { text: 'Ana Sayfa', path: '/', icon: <DashboardIcon /> },
  { text: 'Aidat Takibi', path: '/aidatlar', icon: <ReceiptIcon /> },
  { text: 'Raporlar', path: '/raporlar', icon: <AssessmentIcon /> },
];

function App() {
  const location = useLocation();
  const currentPageTitle = [...menuItems, { text: 'Yönetim & Ayarlar', path: '/ayarlar' }].find(item => item.path === location.pathname)?.text || 'Site Yönetimi';

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ width: `calc(100% - ${260}px)`, ml: `${260}px` }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">{currentPageTitle}</Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box' }}}>
          <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px' }}>
            <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight="bold">SİTE YÖNETİM</Typography>
          </Toolbar>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={NavLink} to={item.path} selected={location.pathname === item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <List>
            <ListItem disablePadding>
                <ListItemButton component={NavLink} to="/ayarlar" selected={location.pathname === '/ayarlar'}>
                  <ListItemIcon><SettingsIcon /></ListItemIcon>
                  <ListItemText primary="Yönetim & Ayarlar" />
                </ListItemButton>
              </ListItem>
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, height: '100vh', overflow: 'auto' }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<AnaSayfa />} />
            <Route path="/aidatlar" element={<AidatYonetimiSayfasi />} />
            <Route path="/raporlar" element={<RaporlarSayfasi />} />
            <Route path="/ayarlar" element={<AyarlarSayfasi />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;