// client/src/pages/AnaSayfa.js
import React from 'react';
import { Typography, Box, Grid, Paper, CircularProgress, Alert, Icon, Button } from '@mui/material';
import { useQuery, gql } from '@apollo/client';

// İkonlar için (MUI Icons kütüphanesinden)
import ApartmentIcon from '@mui/icons-material/Apartment'; // Bloklar için
import HomeWorkIcon from '@mui/icons-material/HomeWork'; // Daireler için
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'; // Sakinler için
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Borçlar için

// Blok sayısını almak için GraphQL sorgusu (BlokList.js'teki ile aynı olabilir)
const GET_BLOK_SAYISI = gql`
  query GetBlokSayisi {
    getBloks {
      id # Sadece sayıyı almak için id yeterli, ama tüm listeyi çekiyoruz
    }
  }
`;

// Bilgi Kartı Bileşeni (Tekrar kullanılabilir)
function BilgiKarti({ title, value, icon, color = "primary.main", isLoading = false }) {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%', // Grid içinde eşit yükseklik için
        textAlign: 'center'
      }}
    >
      <Icon component={icon} sx={{ fontSize: 48, color: color, mb: 1 }} />
      <Typography variant="h6" component="div" gutterBottom>
        {title}
      </Typography>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <Typography variant="h4" component="div" sx={{ color: color, fontWeight: 'bold' }}>
          {value}
        </Typography>
      )}
    </Paper>
  );
}

function AnaSayfa() {
  const { loading: blokLoading, error: blokError, data: blokData } = useQuery(GET_BLOK_SAYISI);

  const blokSayisi = blokData?.getBloks?.length || 0;

  // Dummy veriler (Backend hazır olana kadar)
  const daireSayisi = 60; // Dummy
  const toplamSakin = 152; // Dummy
  const toplamBorc = "2,750 ₺"; // Dummy

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Siteye Genel Bakış
      </Typography>
      
      {blokError && <Alert severity="error" sx={{ mb: 2 }}>Blok sayısı yüklenirken hata: {blokError.message}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <BilgiKarti 
            title="Toplam Blok" 
            value={blokSayisi} 
            icon={ApartmentIcon}
            isLoading={blokLoading}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BilgiKarti 
            title="Toplam Daire" 
            value={daireSayisi} 
            icon={HomeWorkIcon}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BilgiKarti 
            title="Toplam Sakin" 
            value={toplamSakin} 
            icon={PeopleAltIcon}
            color="success.main" // Temada success rengi tanımlı değilse default primary kullanılır
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <BilgiKarti 
            title="Güncel Borç Toplamı" 
            value={toplamBorc} 
            icon={AccountBalanceWalletIcon}
            color="error.main" // Temada error rengi tanımlı değilse default primary kullanılır
          />
        </Grid>
      </Grid>

      {/* İleride buraya grafikler veya son duyurular gibi ek bölümler eklenebilir */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Hızlı İşlemler (Yakında)
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Button variant="outlined" fullWidth sx={{py: 2}}>Yeni Aidat Girişi</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button variant="outlined" fullWidth sx={{py: 2}}>Yeni Gider Ekle</Button>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Button variant="outlined" fullWidth sx={{py: 2}}>Duyuru Yayınla</Button>
            </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AnaSayfa;