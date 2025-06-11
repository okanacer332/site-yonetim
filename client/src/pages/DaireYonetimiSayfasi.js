// client/src/pages/DaireYonetimiSayfasi.js
import React, { useState } from 'react';
import { Typography, Box, Snackbar, Alert, Slide } from '@mui/material';
import DaireList from '../components/DaireList';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

function DaireYonetimiSayfasi() {
  // Daireler için de Snackbar yönetimi ileride lazım olacak
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });
  
  const showSnackbar = (message, severity = 'success') => setSnackbarState({ open: true, message, severity });
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Daire Listesi ve Yönetimi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Blok seçimi yaparak o bloktaki tüm daireleri listeleyebilir, arama yapabilir ve düzenleyebilirsiniz.
      </Typography>
      
      <DaireList showSnackbar={showSnackbar} />

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarState.severity} sx={{ width: '100%' }} variant="filled">
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DaireYonetimiSayfasi;