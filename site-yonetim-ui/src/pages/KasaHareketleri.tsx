import { useEffect, useState, FormEvent, useMemo } from 'react';
import {
  Typography, Stack, TextField, MenuItem,
  IconButton, Tooltip, Snackbar, Alert, Box, FormControlLabel, Checkbox
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

interface FinansalIslem {
  id: string;
  tip: 'GELIR' | 'GIDER';
  aciklama: string;
  tutar: number;
  tarih: string;
  blokId?: string;
  kategori?: string;
}

interface FinansalIslemView extends FinansalIslem {
    blokAdi: string;
    formattedTutar: string;
}

const initialFormState = {
    tip: 'GIDER' as 'GELIR' | 'GIDER',
    aciklama: '',
    tutar: '',
    tarih: new Date().toISOString().split('T')[0],
    blokId: '',
    kategori: ''
};

const giderKategorileri = ["Elektrik", "Su", "Doğalgaz", "Personel Maaşı", "Bakım-Onarım", "Temizlik", "Diğer"];

function KasaHareketleri() {
  const { data: islemler, isLoading, error, fetchData: fetchIslemler, addItem, deleteItem } = useCrudApi<FinansalIslem>('/kasa-hareketleri');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');

  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yansitilsinMi, setYansitilsinMi] = useState(false); // Yeni state
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedIslem, setSelectedIslem] = useState<FinansalIslem | null>(null);


  useEffect(() => {
    fetchIslemler();
    fetchBloklar();
  }, []);

  const blokMap = useMemo(() => new Map(bloklar.map(b => [b.id, b.ad])), [bloklar]);

  const islemlerViewData: FinansalIslemView[] = useMemo(() => {
    return islemler.map(islem => ({
        ...islem,
        blokAdi: islem.blokId ? blokMap.get(islem.blokId) || 'Bilinmeyen Blok' : 'Genel Kasa',
        formattedTutar: `${islem.tip === 'GIDER' ? '-' : '+'}${islem.tutar.toFixed(2)} ₺`
    }));
  }, [islemler, blokMap]);

  const showNotification = (type: 'success' | 'error', message: string) => {
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
        tutar: Number(formState.tutar),
        blokId: formState.blokId || undefined,
        kategori: formState.tip === 'GIDER' ? formState.kategori : undefined,
      };

      if (formState.tip === 'GIDER' && yansitilsinMi) {
        // Olağanüstü borçlandırma API'sini çağır
        const response = await fetch('http://localhost:8080/api/borclandirma/olaganustu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSubmit)
        });
        if (!response.ok) throw new Error('Olağanüstü borç yansıtılırken bir hata oluştu.');
        showNotification('success', 'Gider kasaya işlendi ve dairelere borç olarak yansıtıldı!');
      } else {
        // Normal kasa hareketi ekle
        await addItem(dataToSubmit);
        showNotification('success', 'İşlem başarıyla eklendi!');
      }
      
      setFormState(initialFormState);
      setYansitilsinMi(false); // Checkbox'ı sıfırla
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSil = async () => {
    if (!selectedIslem) return;
    try {
        await deleteItem(selectedIslem.id);
        showNotification('error', 'İşlem başarıyla silindi!');
        handleCloseDeleteConfirm();
    } catch (err: any) {
        showNotification('error', err.message);
    }
  };

  const handleOpenDeleteConfirm = (islem: FinansalIslem) => {
    setSelectedIslem(islem);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => setDeleteConfirmOpen(false);

  const columns: ColumnDef<FinansalIslemView>[] = [
    { header: 'Tarih', accessorKey: 'tarih' },
    { header: 'Açıklama', accessorKey: 'aciklama' },
    { header: 'İlgili Blok', accessorKey: 'blokAdi' },
    { header: 'Kategori', accessorKey: 'kategori' },
    { header: 'Tutar', accessorKey: 'formattedTutar' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Yeni Kasa Hareketi Ekle" component="form" onSubmit={handleEkle}>
        <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
                <TextField select label="İşlem Tipi" name="tip" value={formState.tip} onChange={handleFormChange} required fullWidth>
                    <MenuItem value="GIDER">Gider</MenuItem>
                    <MenuItem value="GELIR">Gelir</MenuItem>
                </TextField>
                <TextField label="Tarih" name="tarih" type="date" value={formState.tarih} onChange={handleFormChange} required fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Tutar (₺)" name="tutar" type="number" value={formState.tutar} onChange={handleFormChange} required fullWidth inputProps={{ step: "0.01" }} />
            </Stack>
            <TextField label="Açıklama" name="aciklama" value={formState.aciklama} onChange={handleFormChange} required fullWidth />
            {formState.tip === 'GIDER' && (
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <TextField select label="İlgili Blok (Opsiyonel)" name="blokId" value={formState.blokId} onChange={handleFormChange} fullWidth>
                            <MenuItem value="">Genel Gider</MenuItem>
                            {bloklar.map(blok => <MenuItem key={blok.id} value={blok.id}>{blok.ad}</MenuItem>)}
                        </TextField>
                        <TextField select label="Gider Kategorisi" name="kategori" value={formState.kategori} onChange={handleFormChange} required fullWidth>
                            {giderKategorileri.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </TextField>
                    </Stack>
                    <FormControlLabel
                        control={<Checkbox checked={yansitilsinMi} onChange={(e) => setYansitilsinMi(e.target.checked)} />}
                        label="Bu gideri tüm dairelere borç olarak yansıt (Olağanüstü Gider)"
                    />
                </Stack>
            )}
        </Stack>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <SubmitButton isLoading={isSubmitting}>Kasa Hareketi Ekle</SubmitButton>
        </Box>
      </ContentCard>

      <ContentCard title="Kasa Hareketleri" spacing={0}>
        <GenericTable
          columns={columns}
          data={islemlerViewData}
          isLoading={isLoading}
          error={error}
          renderActions={(islem) => (
            <>
              {/* Düzenleme butonu ileride eklenebilir */}
              {/* <Tooltip title="Düzenle"><IconButton size="small" color="primary"><EditIcon /></IconButton></Tooltip> */}
              <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleOpenDeleteConfirm(islem)}><DeleteIcon /></IconButton></Tooltip>
            </>
          )}
        />
      </ContentCard>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={handleCloseDeleteConfirm}
        onConfirm={handleSil}
        title="İşlem Silinsin mi?"
        message={`"${selectedIslem?.aciklama}" açıklamasındaki işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default KasaHareketleri;
