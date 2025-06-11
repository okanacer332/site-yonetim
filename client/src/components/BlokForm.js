// client/src/components/BlokForm.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';

const defaultInitialData = { name: '' };

function BlokForm({ onSubmit, initialData = defaultInitialData, isLoading = false, submitButtonText = "Kaydet" }) {
  const [name, setName] = useState('');

  useEffect(() => {
    // initialData geldiğinde veya değiştiğinde state'i güncelle
    if (initialData) {
      setName(initialData.name || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: name.trim() });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Blok Adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        autoFocus
      />
      <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ py: 1.25 }}>
        {isLoading ? <CircularProgress size={24} /> : submitButtonText}
      </Button>
    </Box>
  );
}
export default BlokForm;