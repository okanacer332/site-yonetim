import { useState } from 'react';
import { 
  CssBaseline, Box, createTheme, ThemeProvider, Typography
} from '@mui/material';
import Sidebar from './components/Sidebar';
import BlokYonetimi from './pages/BlokYonetimi';
import DaireYonetimi from './pages/DaireYonetimi';
import KasaHareketleri from './pages/KasaHareketleri';
import AidatYonetimi from './pages/AidatYonetimi';
import GenelBakis from './pages/GenelBakis';
import DemirbasYonetimi from './pages/DemirbasYonetimi';
import Raporlama from './pages/Raporlama';
import DaireHesapOzeti from './pages/DaireHesapOzeti'; 

const drawerWidth = 240;

const parchmentTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A0522D',
    },
    background: {
      default: '#FAF8F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5D4037',
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h6: { fontWeight: 600, }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: '1px solid #D7C7A8',
          boxShadow: 'none',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          }
        }
      }
    }
  }
});

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <GenelBakis />;
      case 'blok-yonetimi':
        return <BlokYonetimi />;
      case 'daire-yonetimi':
        return <DaireYonetimi />;
      case 'aidat-yonetimi':
        return <AidatYonetimi />;
      case 'kasa-hareketleri':
        return <KasaHareketleri />;
      case 'demirbaslar':
        return <DemirbasYonetimi />;
      case 'daire-hesap-ozeti': // Yeni sayfa için case eklendi
        return <DaireHesapOzeti />;
      case 'raporlama': // Yeni sayfa için case eklendi
        return <Raporlama />;
      default:
        return <Typography>Sayfa bulunamadı veya henüz oluşturulmadı.</Typography>;
    }
  };

  return (
    <ThemeProvider theme={parchmentTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />

        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            bgcolor: 'background.default',
            p: 3,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {renderPage()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
