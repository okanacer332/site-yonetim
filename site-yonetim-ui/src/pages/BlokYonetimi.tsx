import { useEffect, useState, FormEvent } from 'react';
import {
  TextField, Stack, IconButton, Tooltip, Dialog, DialogActions,
  DialogContent, DialogTitle, Button, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Oluşturduğumuz yeniden kullanılabilir bileşenler ve hook
import { useCrudApi } from '../hooks/useCrudApi';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import ContentCard from '../components/ui/ContentCard';
import SubmitButton from '../components/ui/SubmitButton';

// Veri yapısını tanımlıyoruz
interface Blok {
  id: string;
  ad: string;
}

// Bildirim yapısını tanımlıyoruz
interface Notification {
  type: 'success' | 'error';
  message: string;
}

function BlokYonetimi() {
  // Tüm API ve veri yönetimi mantığını tek bir yerden alıyoruz
  const { data: bloklar, isLoading, error, fetchData, addItem, updateItem, deleteItem } = useCrudApi<Blok>('/bloklar');
  
  const [yeniBlokAdi, setYeniBlokAdi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [notification, setNotification] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedBlok, setSelectedBlok] = useState<Blok | null>(null);
  const [editedBlokAdi, setEditedBlokAdi] = useState('');

  // Sayfa ilk yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, []);

  // Bildirim gösterme ve kapatma fonksiyonları
  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({ type, message });
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Ekleme, Güncelleme, Silme işlemleri
  const handleEkle = async (event: FormEvent) => {
    event.preventDefault();
    if (!yeniBlokAdi.trim()) return;
    
    setIsSubmitting(true);
    try {
      const yeniBlok = await addItem({ ad: yeniBlokAdi });
      showNotification('success', 'Blok başarıyla eklendi!');
      setYeniBlokAdi('');
      setHighlightedRow(yeniBlok.id);
      setTimeout(() => setHighlightedRow(null), 1500);
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuncelle = async () => {
    if (!selectedBlok || !editedBlokAdi.trim()) return;
    try {
      await updateItem(selectedBlok.id, { ad: editedBlokAdi });
      showNotification('success', 'Blok başarıyla güncellendi!');
      handleCloseEditModal();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleSil = async () => {
    if (!selectedBlok) return;
    try {
      await deleteItem(selectedBlok.id);
      showNotification('error', 'Blok başarıyla silindi!');
      handleCloseDeleteConfirm();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Modal açma/kapama fonksiyonları
  const handleOpenEditModal = (blok: Blok) => {
    setSelectedBlok(blok);
    setEditedBlokAdi(blok.ad);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => setEditModalOpen(false);
  const handleOpenDeleteConfirm = (blok: Blok) => {
    setSelectedBlok(blok);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => setDeleteConfirmOpen(false);

  // GenericTable için sütun tanımları
  const columns: ColumnDef<Blok>[] = [
    { header: 'Blok Adı', accessorKey: 'ad' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Yeni Blok Ekle" component="form" onSubmit={handleEkle}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Blok Adı"
            variant="outlined"
            fullWidth
            value={yeniBlokAdi}
            onChange={(e) => setYeniBlokAdi(e.target.value)}
            disabled={isSubmitting}
            required // GÜNCELLEME: Bu alanın boş gönderilmesini engeller.
          />
          <SubmitButton
            isLoading={isSubmitting}
            startIcon={<AddIcon />}
            sx={{ minWidth: 120, height: 56 }}
          >
            Ekle
          </SubmitButton>
        </Stack>
      </ContentCard>

      <ContentCard title="Mevcut Bloklar">
        <GenericTable
          columns={columns}
          data={bloklar}
          isLoading={isLoading}
          error={error}
          highlightedRowId={highlightedRow}
          renderActions={(blok) => (
            <>
              <Tooltip title="Düzenle">
                <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(blok)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sil">
                <IconButton size="small" color="error" onClick={() => handleOpenDeleteConfirm(blok)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        />
      </ContentCard>

      <Dialog open={editModalOpen} onClose={handleCloseEditModal}>
        <DialogTitle>Blok Adını Düzenle</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Blok Adı" type="text" fullWidth variant="standard" value={editedBlokAdi} onChange={(e) => setEditedBlokAdi(e.target.value)} />
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
        title="Blok Silinsin mi?"
        message={`"${selectedBlok?.ad}" adlı bloğu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default BlokYonetimi;