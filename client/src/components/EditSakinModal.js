// client/src/components/EditSakinModal.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Modal, Box, Typography, Alert } from '@mui/material';
import { UPDATE_SAKIN } from '../graphql/mutations/sakinMutations';
import { GET_SAKINLER } from '../graphql/queries/sakinQueries';
import SakinForm from './SakinForm';

const modalStyle = { /* ... önceki gibi ... */ };

function EditSakinModal({ open, handleClose, sakin, onSuccess }) {
  const [error, setError] = useState(null);

  const [updateSakinMutation, { loading }] = useMutation(UPDATE_SAKIN, {
    refetchQueries: [{ query: GET_SAKINLER }],
    onCompleted: (data) => {
      onSuccess(`"${data.updateSakin.adSoyad}" kişisi başarıyla güncellendi.`);
      handleClose();
    },
    onError: (err) => { setError(err.message); }
  });

  const handleFormSubmit = (formData) => {
    setError(null);
    if (!formData.adSoyad) { setError('Ad Soyad boş bırakılamaz.'); return; }
    const {__typename, id, createdAt, updatedAt, ...inputForMutation} = formData;
    updateSakinMutation({ variables: { id: sakin.id, input: inputForMutation } });
  };

  if (!sakin) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>Sakin Bilgilerini Düzenle</Typography>
        <SakinForm
          onSubmit={handleFormSubmit}
          initialData={sakin}
          isLoading={loading}
          submitButtonText="Güncelle"
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Modal>
  );
}

export default EditSakinModal;