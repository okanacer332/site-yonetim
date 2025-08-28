import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'; // Aidat için yeni ikon
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Kasa için yeni ikon
import ConstructionIcon from '@mui/icons-material/Construction';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const drawerWidth = 240;

// Menü elemanlarını yeni yapıya göre güncelliyoruz
const menuItems = [
  { text: 'Genel Bakış', icon: <DashboardIcon />, page: 'dashboard' },
  { text: 'Blok Yönetimi', icon: <BusinessIcon />, page: 'blok-yonetimi' },
  { text: 'Daire Yönetimi', icon: <HomeWorkIcon />, page: 'daire-yonetimi' },
  { text: 'Aidat Yönetimi', icon: <PointOfSaleIcon />, page: 'aidat-yonetimi' },
  { text: 'Kasa Hareketleri', icon: <AccountBalanceWalletIcon />, page: 'kasa-hareketleri' },
  { text: 'Demirbaşlar', icon: <ConstructionIcon />, page: 'demirbaslar' },
  { text: 'Daire Hesap Özeti', icon: <ReceiptLongIcon />, page: 'daire-hesap-ozeti' }, // Yeni menü elemanı
  { text: 'Raporlama', icon: <AssessmentIcon />, page: 'raporlama' },
];

interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

function Sidebar({ onPageChange, currentPage }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: '#EAE0C8', 
          color: '#5D4037' 
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2 }}>
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => onPageChange(item.page)} 
                selected={currentPage === item.page}
                sx={{ 
                  '&:hover': { backgroundColor: '#D7C7A8' },
                  '&.Mui-selected': {
                    backgroundColor: '#A0522D',
                    color: '#FFFFFF',
                    '&:hover': {
                      backgroundColor: '#8B4513',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#FFFFFF',
                    },
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#5D4037' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box>
          <Divider sx={{ backgroundColor: '#D7C7A8' }} />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#A1887F' }}>
              © 2025 acrTech
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
