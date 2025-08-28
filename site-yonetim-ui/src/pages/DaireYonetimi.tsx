import { useEffect, useState, FormEvent, useMemo } from 'react';
import {
  Typography, Stack, TextField, MenuItem,
  IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, Button, Snackbar, Alert, Divider, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useCrudApi } from '../hooks/useCrudApi';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentCard from '../components/ui/ContentCard';
import SubmitButton from '../components/ui/SubmitButton';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';

// Veri yapılarını tanımlıyoruz
interface Blok {
  id: string;
  ad: string;
}

type DaireDurumu = 'MULK_SAHIBI' | 'KIRACI' | 'BOS';

interface Daire {
  id: string;
  blokId: string;
  kapiNo: number;
  mulkSahibiAdi: string;
  mulkSahibiTelefonu: string;
  durum: DaireDurumu;
  kiraciAdi?: string;
  kiraciTelefonu?: string;
}

// Tabloda gösterilecek veri için yeni bir arayüz
interface DaireView {
  id: string;
  blokAdi: string;
  kapiNo: number;
  mulkSahibiAdi: string;
  durum: DaireDurumu;
  oturanKisi: string; // Yeni alan
  original: Daire; // Silme ve düzenleme için orijinal daire nesnesi
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const initialFormState = {
  blokId: '',
  kapiNo: '',
  mulkSahibiAdi: '',
  mulkSahibiTelefonu: '',
  durum: 'BOS' as DaireDurumu,
  kiraciAdi: '',
  kiraciTelefonu: ''
};

function DaireYonetimi() {
  const { data: daireler, isLoading: dairelerLoading, error: dairelerError, fetchData: fetchDaireler, addItem, updateItem, deleteItem } = useCrudApi<Daire>('/daireler');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');

  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDaire, setSelectedDaire] = useState<Daire | null>(null);
  const [editedDaire, setEditedDaire] = useState<Partial<Daire>>({});

  useEffect(() => {
    fetchDaireler();
    fetchBloklar();
  }, []);

  // HATA DÜZELTMESİ: blokMap'i bileşenin ana kapsamında tanımlıyoruz.
  // useMemo kullanarak, sadece 'bloklar' dizisi değiştiğinde yeniden hesaplanmasını sağlıyoruz.
  const blokMap = useMemo(() => new Map(bloklar.map(blok => [blok.id, blok.ad])), [bloklar]);

  // Ham daire verisini, tabloda gösterilecek formata dönüştürüyoruz
  const daireViewData: DaireView[] = useMemo(() => {
    return daireler.map(daire => {
      let oturanKisi = '---'; // Varsayılan değer
      if (daire.durum === 'KIRACI' && daire.kiraciAdi) {
        oturanKisi = daire.kiraciAdi;
      } else if (daire.durum === 'MULK_SAHIBI') {
        oturanKisi = daire.mulkSahibiAdi; // Mülk sahibi oturuyorsa, oturan kişi kendisidir
      }
      return {
        ...daire,
        blokAdi: blokMap.get(daire.blokId) || 'Bilinmeyen Blok',
        oturanKisi: oturanKisi,
        original: daire // Orijinal veriyi sakla
      };
    });
  }, [daireler, blokMap]); // Artık 'blokMap'e bağımlı
  
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
      const dataToSubmit = { 
        ...formState, 
        kapiNo: Number(formState.kapiNo),
        kiraciAdi: formState.durum === 'KIRACI' ? formState.kiraciAdi : '',
        kiraciTelefonu: formState.durum === 'KIRACI' ? formState.kiraciTelefonu : '',
      };
      await addItem(dataToSubmit);
      showNotification('success', 'Daire başarıyla eklendi!');
      setFormState(initialFormState);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuncelle = async () => {
    if (!selectedDaire) return;
    try {
      const dataToUpdate = {
        ...editedDaire,
        kapiNo: Number(editedDaire.kapiNo),
        kiraciAdi: editedDaire.durum === 'KIRACI' ? editedDaire.kiraciAdi : '',
        kiraciTelefonu: editedDaire.durum === 'KIRACI' ? editedDaire.kiraciTelefonu : '',
      };
      await updateItem(selectedDaire.id, dataToUpdate);
      showNotification('success', 'Daire başarıyla güncellendi!');
      handleCloseEditModal();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleSil = async () => {
    if (!selectedDaire) return;
    try {
      await deleteItem(selectedDaire.id);
      showNotification('error', 'Daire başarıyla silindi!');
      handleCloseDeleteConfirm();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleOpenEditModal = (daire: Daire) => {
    setSelectedDaire(daire);
    setEditedDaire(daire);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => setEditModalOpen(false);
  const handleOpenDeleteConfirm = (daire: Daire) => {
    setSelectedDaire(daire);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => setDeleteConfirmOpen(false);
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedDaire(prev => ({ ...prev, [name!]: value }));
  };

  const columns: ColumnDef<DaireView>[] = [
    { header: 'Blok', accessorKey: 'blokAdi' },
    { header: 'Kapı No', accessorKey: 'kapiNo' },
    { header: 'Mülk Sahibi', accessorKey: 'mulkSahibiAdi' },
    { header: 'Durum', accessorKey: 'durum' },
    { header: 'Oturan Kişi', accessorKey: 'oturanKisi' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Yeni Daire Ekle" component="form" onSubmit={handleEkle}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField select label="Blok" name="blokId" value={formState.blokId} onChange={handleFormChange} required fullWidth>
              {bloklar.map(blok => <MenuItem key={blok.id} value={blok.id}>{blok.ad}</MenuItem>)}
            </TextField>
            <TextField label="Kapı No" name="kapiNo" type="number" value={formState.kapiNo} onChange={handleFormChange} required fullWidth />
            <TextField select label="Durum" name="durum" value={formState.durum} onChange={handleFormChange} required fullWidth>
              <MenuItem value="MULK_SAHIBI">Mülk Sahibi Oturuyor</MenuItem>
              <MenuItem value="KIRACI">Kiracı Oturuyor</MenuItem>
              <MenuItem value="BOS">Boş</MenuItem>
            </TextField>
          </Stack>
          <Divider sx={{ my: 1 }}><Typography variant="body2">Mülk Sahibi Bilgileri</Typography></Divider>
          <Stack direction="row" spacing={2}>
            <TextField label="Mülk Sahibi Adı Soyadı" name="mulkSahibiAdi" value={formState.mulkSahibiAdi} onChange={handleFormChange} required fullWidth />
            <TextField label="Mülk Sahibi Telefonu" name="mulkSahibiTelefonu" value={formState.mulkSahibiTelefonu} onChange={handleFormChange} required fullWidth />
          </Stack>
          {formState.durum === 'KIRACI' && (
            <>
              <Divider sx={{ my: 1 }}><Typography variant="body2">Kiracı Bilgileri</Typography></Divider>
              <Stack direction="row" spacing={2}>
                <TextField label="Kiracı Adı Soyadı" name="kiraciAdi" value={formState.kiraciAdi} onChange={handleFormChange} fullWidth />
                <TextField label="Kiracı Telefonu" name="kiraciTelefonu" value={formState.kiraciTelefonu} onChange={handleFormChange} fullWidth />
              </Stack>
            </>
          )}
        </Stack>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <SubmitButton isLoading={isSubmitting}>Daire Ekle</SubmitButton>
        </Box>
      </ContentCard>

      <ContentCard title="Mevcut Daireler" spacing={0}>
        <GenericTable
          columns={columns}
          data={daireViewData}
          isLoading={dairelerLoading}
          error={dairelerError}
          renderActions={(daireView) => (
            <>
              <Tooltip title="Düzenle"><IconButton size="small" color="primary" onClick={() => handleOpenEditModal(daireView.original)}><EditIcon /></IconButton></Tooltip>
              <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleOpenDeleteConfirm(daireView.original)}><DeleteIcon /></IconButton></Tooltip>
            </>
          )}
        />
      </ContentCard>
      
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Daire Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select label="Blok" name="blokId" value={editedDaire.blokId || ''} onChange={handleEditFormChange} required fullWidth>
              {bloklar.map(blok => <MenuItem key={blok.id} value={blok.id}>{blok.ad}</MenuItem>)}
            </TextField>
            <TextField label="Kapı No" name="kapiNo" type="number" value={editedDaire.kapiNo || ''} onChange={handleEditFormChange} required fullWidth />
            <TextField select label="Durum" name="durum" value={editedDaire.durum || 'BOS'} onChange={handleEditFormChange} required fullWidth>
              <MenuItem value="MULK_SAHIBI">Mülk Sahibi Oturuyor</MenuItem>
              <MenuItem value="KIRACI">Kiracı Oturuyor</MenuItem>
              <MenuItem value="BOS">Boş</MenuItem>
            </TextField>
            <Divider sx={{ my: 1 }}><Typography variant="body2">Mülk Sahibi Bilgileri</Typography></Divider>
            <TextField label="Mülk Sahibi Adı Soyadı" name="mulkSahibiAdi" value={editedDaire.mulkSahibiAdi || ''} onChange={handleEditFormChange} required fullWidth />
            <TextField label="Mülk Sahibi Telefonu" name="mulkSahibiTelefonu" value={editedDaire.mulkSahibiTelefonu || ''} onChange={handleEditFormChange} required fullWidth />
            {editedDaire.durum === 'KIRACI' && (
              <>
                <Divider sx={{ my: 1 }}><Typography variant="body2">Kiracı Bilgileri</Typography></Divider>
                <TextField label="Kiracı Adı Soyadı" name="kiraciAdi" value={editedDaire.kiraciAdi || ''} onChange={handleEditFormChange} fullWidth />
                <TextField label="Kiracı Telefonu" name="kiraciTelefonu" value={editedDaire.kiraciTelefonu || ''} onChange={handleEditFormChange} fullWidth />
              </>
            )}
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
        title="Daire Silinsin mi?"
        message={`"${blokMap.get(selectedDaire?.blokId || '')} - Kapı No: ${selectedDaire?.kapiNo}" dairesini silmek istediğinizden emin misiniz?`}
      />

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default DaireYonetimi;
