// client/src/components/SakinForm.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Grid, Stack } from '@mui/material';

// DÜZELTME 1: Varsayılan obje, yeniden render'lardan etkilenmemesi için dışarıda tanımlanıyor.
const defaultInitialData = {
  adSoyad: '',
  telefon: '',
  email: '',
  tcNo: '',
  notlar: '',
};

function SakinForm({
  onSubmit,
  onCancel,
  initialData = defaultInitialData, // DÜZELTME 2: Sabit obje varsayılan olarak kullanılıyor.
  isLoading = false,
  submitButtonText = "Kaydet"
}) {
  const [formState, setFormState] = useState(initialData);

  // Bu useEffect artık sadece gerçekten farklı bir sakin düzenlenmek istendiğinde çalışacak.
  useEffect(() => {
    setFormState(initialData || defaultInitialData);
  }, [initialData]);

  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Ad Soyad"
        name="adSoyad"
        value={formState.adSoyad || ''}
        onChange={handleChange}
        required
        fullWidth
        autoFocus
      />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Telefon"
            name="telefon"
            value={formState.telefon || ''}
            onChange={handleChange}
            fullWidth
            // Not: Telefon maskesi için 'MaskedInput' burada da kullanılabilir.
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="E-posta"
            name="email"
            type="email"
            value={formState.email || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>
      <TextField
        label="TC Kimlik No (Opsiyonel)"
        name="tcNo"
        value={formState.tcNo || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        label="Notlar (Opsiyonel)"
        name="notlar"
        value={formState.notlar || ''}
        onChange={handleChange}
        multiline
        rows={3}
        fullWidth
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        {/* 'Geri' butonu için onCancel prop'unu kontrol ediyoruz */}
        {onCancel && <Button variant="outlined" color="inherit" onClick={onCancel} disabled={isLoading}>Geri</Button>}
        <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : submitButtonText}
        </Button>
      </Stack>
    </Box>
  );
}

export default SakinForm;