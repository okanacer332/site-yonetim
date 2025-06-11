// client/src/components/DeleteSakinDialog.js
import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function DeleteSakinDialog({ open, handleClose, handleConfirmDelete, sakinName, isLoading }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          <Typography variant="h6" component="span">Sakin Silme Onayı</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          "{sakinName}" isimli kişiyi kalıcı olarak silmek istediğinizden emin misiniz? <br/><br/>
          <Typography variant="caption" color="error">
            Uyarı: Eğer bu kişi bir dairenin mal sahibi ise veya bir dairede ikamet ediyorsa, silme işlemi sorunlara yol açabilir. İleride bu kontroller eklenecektir.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="inherit" variant="outlined" disabled={isLoading}>İptal</Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isLoading} autoFocus>
          {isLoading ? 'Siliniyor...' : 'Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteSakinDialog;