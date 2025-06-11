// client/src/components/DeleteBlokDialog.js
import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function DeleteBlokDialog({ open, handleClose, handleConfirmDelete, blokName, isLoading }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          <Typography variant="h6" component="span">Blok Silme Onayı</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          "{blokName}" isimli bloğu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="inherit" variant="outlined" disabled={isLoading}>
          İptal
        </Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isLoading} autoFocus>
          {isLoading ? 'Siliniyor...' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteBlokDialog;