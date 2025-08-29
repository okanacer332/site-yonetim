import { useEffect, useState, FormEvent, useMemo } from 'react';
import {
  Typography, Stack, TextField, MenuItem,
  // GÜNCELLEME 1: Durum etiketleri için Chip bileşenini ekliyoruz.
  IconButton, Tooltip, Snackbar, Alert, Box, FormControlLabel, Checkbox, Chip
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

import { useCrudApi } from '../hooks/useCrudApi';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentCard from '../components/ui/ContentCard';
import SubmitButton from '../components/ui/SubmitButton';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';

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
  isIptalEdildi?: boolean;
  duzeltmeKaydiId?: string;
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
  const { data: islemler, isLoading, error, fetchData: fetchIslemler, addItem } = useCrudApi<FinansalIslem>('/kasa-hareketleri');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');

  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yansitilsinMi, setYansitilsinMi] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
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
        const response = await fetch('http://localhost:8080/api/borclandirma/olaganustu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSubmit)
        });
        if (!response.ok) throw new Error('Olağanüstü borç yansıtılırken bir hata oluştu.');
        showNotification('success', 'Gider kasaya işlendi ve dairelere borç olarak yansıtıldı!');
      } else {
        await addItem(dataToSubmit);
        showNotification('success', 'İşlem başarıyla eklendi!');
      }
      setFormState(initialFormState);
      setYansitilsinMi(false);
    } catch (err: any) {
      showNotification('error', 'Bir hata oluştu: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIptalEt = async () => {
    if (!selectedIslem) return;
    try {
        await axios.post(`http://localhost:8080/api/kasa-hareketleri/${selectedIslem.id}/iptal`);
        showNotification('success', 'İşlem başarıyla iptal edildi ve düzeltme kaydı oluşturuldu!');
        handleCloseConfirm();
        fetchIslemler();
    } catch (err: any) {
        showNotification('error', 'İşlem iptal edilirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenConfirm = (islem: FinansalIslem) => {
    setSelectedIslem(islem);
    setConfirmOpen(true);
  };
  const handleCloseConfirm = () => setConfirmOpen(false);

  // GÜNCELLEME 2: Sütunları yeniden düzenliyoruz.
  // Üzeri çizili stilini kaldırıp yerine "Durum" sütunu ekliyoruz.
  const columns: ColumnDef<FinansalIslemView>[] = [
    { header: 'Tarih', accessorKey: 'tarih' },
    { header: 'Açıklama', accessorKey: 'aciklama' },
    { 
      header: 'Durum', 
      accessorKey: 'isIptalEdildi', // Sıralama için anahtar olarak kullanabiliriz
      cell: (item) => {
        if (item.isIptalEdildi) {
          return <Chip label="İptal Edildi" color="default" size="small" variant="outlined" />;
        }
        if (item.kategori === 'İptal/Düzeltme') {
          return <Chip label="Düzeltme Kaydı" color="info" size="small" variant="outlined" />;
        }
        return <Chip label="Onaylandı" color="success" size="small" />;
      }
    },
    { header: 'Kategori', accessorKey: 'kategori' },
    { header: 'Tutar', accessorKey: 'formattedTutar' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Yeni Kasa Hareketi Ekle" component="form" onSubmit={handleEkle}>
        { /* Form içeriği aynı */ }
        <Stack spacing={2}>
            <Stack direction="row" spacing={2}><TextField select label="İşlem Tipi" name="tip" value={formState.tip} onChange={handleFormChange} required fullWidth><MenuItem value="GIDER">Gider</MenuItem><MenuItem value="GELIR">Gelir</MenuItem></TextField><TextField label="Tarih" name="tarih" type="date" value={formState.tarih} onChange={handleFormChange} required fullWidth InputLabelProps={{ shrink: true }} /><TextField label="Tutar (₺)" name="tutar" type="number" value={formState.tutar} onChange={handleFormChange} required fullWidth inputProps={{ step: "0.01" }} /></Stack>
            <TextField label="Açıklama" name="aciklama" value={formState.aciklama} onChange={handleFormChange} required fullWidth />
            {formState.tip === 'GIDER' && (<Stack spacing={2}><Stack direction="row" spacing={2}><TextField select label="İlgili Blok (Opsiyonel)" name="blokId" value={formState.blokId} onChange={handleFormChange} fullWidth><MenuItem value="">Genel Gider</MenuItem>{bloklar.map(blok => <MenuItem key={blok.id} value={blok.id}>{blok.ad}</MenuItem>)}</TextField><TextField select label="Gider Kategorisi" name="kategori" value={formState.kategori} onChange={handleFormChange} required fullWidth>{giderKategorileri.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}</TextField></Stack><FormControlLabel control={<Checkbox checked={yansitilsinMi} onChange={(e) => setYansitilsinMi(e.target.checked)} />} label="Bu gideri tüm dairelere borç olarak yansıt (Olağanüstü Gider)" /></Stack>)}
        </Stack>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}><SubmitButton isLoading={isSubmitting}>Kasa Hareketi Ekle</SubmitButton></Box>
      </ContentCard>

      <ContentCard title="Kasa Hareketleri" spacing={0}>
        <GenericTable
          columns={columns}
          data={islemlerViewData}
          isLoading={isLoading}
          error={error}
          renderActions={(islem) => (
            <Tooltip title="İşlemi İptal Et">
              <span>
                <IconButton size="small" color="error" onClick={() => handleOpenConfirm(islem)} disabled={islem.isIptalEdildi || islem.kategori === 'İptal/Düzeltme'}>
                  <CancelIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        />
      </ContentCard>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={handleCloseConfirm}
        onConfirm={handleIptalEt}
        title="İşlem İptal Edilsin mi?"
        message={`"${selectedIslem?.aciklama}" açıklamasındaki işlem iptal edilecektir. Bu işlem, orijinal kaydı pasif hale getirir ve zıt yönde bir düzeltme kaydı oluşturur. Emin misiniz?`}
      />

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default KasaHareketleri;