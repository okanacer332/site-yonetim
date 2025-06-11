// client/src/components/EditBlokModal.js
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Modal, Box, Typography, Alert } from '@mui/material';
import { UPDATE_BLOK } from '../graphql/mutations/blokMutations';
import { GET_BLOKS } from '../graphql/queries/blokQueries';
import BlokForm from './BlokForm';

const modalStyle = {
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
};

function EditBlokModal({ open, handleClose, blok, onSuccess }) {
  const [error, setError] = useState(null);

  const [updateBlokMutation, { loading }] = useMutation(UPDATE_BLOK, {
    refetchQueries: [{ query: GET_BLOKS }],
    onCompleted: (data) => {
      onSuccess(`"${data.updateBlok.name}" bloğu başarıyla güncellendi.`);
      handleClose();
    },
    onError: (err) => { setError(err.message); }
  });

  const handleFormSubmit = ({ name }) => {
    setError(null);
    if (!name) {
      setError('Blok adı boş bırakılamaz.');
      return;
    }
    updateBlokMutation({ variables: { id: blok.id, name } });
  };

  if (!blok) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Blok Düzenle
        </Typography>
        <BlokForm
          onSubmit={handleFormSubmit} // onSubmit prop'u burada aktarılıyor
          initialData={blok}
          isLoading={loading}
          submitButtonText="Güncelle"
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    </Modal>
  );
}

export default EditBlokModal;