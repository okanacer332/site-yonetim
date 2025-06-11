// client/src/components/AddBlokForm.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { TextField, Button, Box, CircularProgress, Typography, Paper } from '@mui/material';
import { CREATE_BLOK } from '../graphql/mutations/blokMutations';
import { GET_BLOKS } from '../graphql/queries/blokQueries';
import AddIcon from '@mui/icons-material/Add'; // İkon ekleyelim

function AddBlokForm({ showSnackbar }) { 
  const [name, setName] = useState('');

  const [createBlokMutation, { loading }] = useMutation(CREATE_BLOK, {
    refetchQueries: [{ query: GET_BLOKS }],
    onCompleted: (data) => {
      setName('');
      if (showSnackbar) showSnackbar(`"${data.createBlok.name}" bloğu başarıyla eklendi!`, 'success');
    },
    onError: (err) => {
      if (showSnackbar) showSnackbar(err.message || 'Blok oluşturulurken bir hata oluştu.', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      if (showSnackbar) showSnackbar('Blok adı boş bırakılamaz.', 'error');
      return;
    }
    createBlokMutation({ variables: { name: name.trim() } });
  };

  return (
    <Paper elevation={3}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          Yeni Blok Ekle
        </Typography>
        <TextField
          label="Blok Adı"
          variant="outlined"
          size="small" // Alanı küçülttük
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading} 
          fullWidth
          size="medium" // Buton boyutunu küçülttük
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
        >
          {loading ? 'Ekleniyor...' : 'Ekle'}
        </Button>
      </Box>
    </Paper>
  );
}

export default AddBlokForm;