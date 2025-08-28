import { useEffect, useState, FormEvent } from 'react';
import {
  Typography, Stack, TextField, MenuItem,
  IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, Button, Snackbar, Alert, Box, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useCrudApi } from '../hooks/useCrudApi';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentCard from '../components/ui/ContentCard';
import SubmitButton from '../components/ui/SubmitButton';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';

// Veri yapılarını tanımlıyoruz
type DemirbasDurumu = 'KULLANIMDA' | 'ARIZALI' | 'DEPODA' | 'SERVISTE' | 'SATILDI' | 'HURDA';

interface Demirbas {
  id: string;
  ad: string;
  alinmaTarihi: string;
  adet: number;
  durum: DemirbasDurumu;
  notlar?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const initialFormState = {
  ad: '',
  alinmaTarihi: new Date().toISOString().split('T')[0],
  adet: 1,
  durum: 'KULLANIMDA' as DemirbasDurumu,
  notlar: ''
};

const durumRenkleri: Record<DemirbasDurumu, "success" | "error" | "info" | "warning" | "default"> = {
    KULLANIMDA: 'success',
    ARIZALI: 'error',
    SERVISTE: 'warning',
    DEPODA: 'info',
    SATILDI: 'default',
    HURDA: 'default'
};

function DemirbasYonetimi() {
  const { data: demirbaslar, isLoading, error, fetchData: fetchDemirbaslar, addItem, updateItem, deleteItem } = useCrudApi<Demirbas>('/demirbaslar');

  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDemirbas, setSelectedDemirbas] = useState<Demirbas | null>(null);
  const [editedDemirbas, setEditedDemirbas] = useState<Partial<Demirbas>>({});

  useEffect(() => {
    fetchDemirbaslar();
  }, []);
  
  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({ type, message });
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name!]: value }));
  };

  const handleEkle = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formState, adet: Number(formState.adet) };
      await addItem(dataToSubmit);
      showNotification('success', 'Demirbaş başarıyla eklendi!');
      setFormState(initialFormState);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuncelle = async () => {
    if (!selectedDemirbas) return;
    try {
      await updateItem(selectedDemirbas.id, { ...editedDemirbas, adet: Number(editedDemirbas.adet) });
      showNotification('success', 'Demirbaş başarıyla güncellendi!');
      handleCloseEditModal();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleSil = async () => {
    if (!selectedDemirbas) return;
    try {
      await deleteItem(selectedDemirbas.id);
      showNotification('error', 'Demirbaş başarıyla silindi!');
      handleCloseDeleteConfirm();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleOpenEditModal = (demirbas: Demirbas) => {
    setSelectedDemirbas(demirbas);
    setEditedDemirbas(demirbas);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => setEditModalOpen(false);
  const handleOpenDeleteConfirm = (demirbas: Demirbas) => {
    setSelectedDemirbas(demirbas);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => setDeleteConfirmOpen(false);
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedDemirbas(prev => ({ ...prev, [name!]: value }));
  };

  const columns: ColumnDef<Demirbas>[] = [
    { header: 'Adı', accessorKey: 'ad' },
    { header: 'Alınma Tarihi', accessorKey: 'alinmaTarihi' },
    { header: 'Adet', accessorKey: 'adet' },
    { 
      header: 'Durum', 
      accessorKey: 'durum',
      cell: (item) => (
        <Chip 
          label={item.durum}
          color={durumRenkleri[item.durum]}
          size="small"
        />
      )
    },
    { header: 'Notlar', accessorKey: 'notlar' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Yeni Demirbaş Ekle" component="form" onSubmit={handleEkle}>
        <Stack spacing={2}>
            <TextField label="Demirbaş Adı" name="ad" value={formState.ad} onChange={handleFormChange} required fullWidth />
            <Stack direction="row" spacing={2}>
                <TextField label="Alınma Tarihi" name="alinmaTarihi" type="date" value={formState.alinmaTarihi} onChange={handleFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Adet" name="adet" type="number" value={formState.adet} onChange={handleFormChange} required fullWidth />
                <TextField select label="Durum" name="durum" value={formState.durum} onChange={handleFormChange} required fullWidth>
                    {Object.keys(durumRenkleri).map(durum => <MenuItem key={durum} value={durum}>{durum}</MenuItem>)}
                </TextField>
            </Stack>
            <TextField label="Notlar (Opsiyonel)" name="notlar" value={formState.notlar} onChange={handleFormChange} fullWidth multiline rows={2} />
        </Stack>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <SubmitButton isLoading={isSubmitting}>Demirbaş Ekle</SubmitButton>
        </Box>
      </ContentCard>

      <ContentCard title="Mevcut Demirbaşlar" spacing={0}>
        <GenericTable
          columns={columns}
          data={demirbaslar}
          isLoading={isLoading}
          error={error}
          renderActions={(demirbas) => (
            <>
              <Tooltip title="Düzenle"><IconButton size="small" color="primary" onClick={() => handleOpenEditModal(demirbas)}><EditIcon /></IconButton></Tooltip>
              <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleOpenDeleteConfirm(demirbas)}><DeleteIcon /></IconButton></Tooltip>
            </>
          )}
        />
      </ContentCard>
      
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Demirbaş Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField label="Demirbaş Adı" name="ad" value={editedDemirbas.ad || ''} onChange={handleEditFormChange} required fullWidth />
                <TextField label="Alınma Tarihi" name="alinmaTarihi" type="date" value={editedDemirbas.alinmaTarihi || ''} onChange={handleEditFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Adet" name="adet" type="number" value={editedDemirbas.adet || 1} onChange={handleEditFormChange} required fullWidth />
                <TextField select label="Durum" name="durum" value={editedDemirbas.durum || 'KULLANIMDA'} onChange={handleEditFormChange} required fullWidth>
                    {Object.keys(durumRenkleri).map(durum => <MenuItem key={durum} value={durum}>{durum}</MenuItem>)}
                </TextField>
                <TextField label="Notlar" name="notlar" value={editedDemirbas.notlar || ''} onChange={handleEditFormChange} fullWidth multiline rows={3} />
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>İptal</Button>
          <Button onClick={handleGuncelle}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={handleCloseDeleteConfirm}
        onConfirm={handleSil}
        title="Demirbaş Silinsin mi?"
        message={`"${selectedDemirbas?.ad}" adlı demirbaşı silmek istediğinizden emin misiniz?`}
      />

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default DemirbasYonetimi;
