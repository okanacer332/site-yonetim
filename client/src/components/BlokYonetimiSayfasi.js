// client/src/pages/BlokYonetimiSayfasi.js
import React from 'react';
import { Box, Typography } from '@mui/material';

function BlokYonetimiSayfasi() {
  return (
    <Box sx={{ p: 4, border: '5px dashed red' }}>
      <Typography variant="h2" align="center">
        TEST BAŞARILI
      </Typography>
      <Typography variant="h5" align="center" sx={{ mt: 2 }}>
        Blok Yönetimi Sayfası Burası
      </Typography>
    </Box>
  );
}

export default BlokYonetimiSayfasi;