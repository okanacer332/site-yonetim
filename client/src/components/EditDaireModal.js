// client/src/components/EditDaireModal.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Modal, Box, Typography, Alert } from '@mui/material';
import { UPDATE_DAIRE } from '../graphql/mutations/daireMutations';
import DaireForm from './DaireForm';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 550 },
  maxHeight: '90vh', // Ekranı taşmasını engelle
  overflowY: 'auto', // Gerektiğinde scroll bar çıksın
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
};

function EditDaireModal({ open, handleClose, daire, onSuccess }) {
  const [error, setError] = useState(null);

  const [updateDaireMutation, { loading }] = useMutation(UPDATE_DAIRE, {
    onCompleted: (data) => {
      onSuccess(`Daire No: "${data.updateDaire.daireNo}" başarıyla güncellendi.`);
      handleClose();
    },
    onError: (err) => { setError(err.message); }
  });

  const handleFormSubmit = (formData) => {
    setError(null);
    if (!formData.blok || !formData.daireNo || !formData.kat.toString() || !formData.evSahibi) {
      setError("Blok, Daire No, Kat ve Ev Sahibi alanları zorunludur."); return;
    }
    if (formData.durum === 'Kiracı Oturuyor' && !formData.kiraci) {
      setError("Lütfen ikamet edecek kiracıyı seçin."); return;
    }
    const katAsInt = parseInt(formData.kat, 10);
    if (isNaN(katAsInt)) { setError('Kat numarası geçerli bir sayı olmalıdır.'); return; }
    
    const inputForMutation = {
      blok: formData.blok,
      daireNo: formData.daireNo.trim(),
      kat: katAsInt,
      evSahibi: formData.evSahibi.id,
      durum: formData.durum,
      kiraci: formData.kiraci?.id || null,
    };
    
    updateDaireMutation({ variables: { id: daire.id, input: inputForMutation } });
  };

  if (!daire) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Daire Bilgilerini Düzenle
        </Typography>
        <DaireForm
          onSubmit={handleFormSubmit}
          initialData={daire}
          isLoading={loading}
          submitButtonText="Güncelle"
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Modal>
  );
}

export default EditDaireModal;