import { useEffect, useState, useMemo } from 'react';
import {
  Typography, Stack, TextField, MenuItem, Box, Chip, Button, Snackbar, Alert, Tooltip
} from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import { useCrudApi } from '../hooks/useCrudApi';
import ContentCard from '../components/ui/ContentCard';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import axios from 'axios';

// Veri yapıları
interface Daire {
  id: string;
  blokId: string;
  kapiNo: number;
}
interface Blok {
  id: string;
  ad: string;
}
interface AidatKaydi {
  id: string;
  daireId: string;
  donem: string;
  borcTutari: number;
  odendiMi: boolean;
  odemeTarihi?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

function DaireHesapOzeti() {
  const { data: daireler, fetchData: fetchDaireler } = useCrudApi<Daire>('/daireler');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');
  
  const [selectedBlokId, setSelectedBlokId] = useState<string>('');
  const [selectedDaireId, setSelectedDaireId] = useState<string>('');
  const [aidatKayitlari, setAidatKayitlari] = useState<AidatKaydi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [notification, setNotification] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchDaireler();
    fetchBloklar();
  }, []);

  const fetchAidatKayitlari = () => {
    if (selectedDaireId) {
      setIsLoading(true);
      fetch(`http://localhost:8080/api/aidatlar/daire/${selectedDaireId}`)
        .then(res => res.json())
        .then(data => setAidatKayitlari(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setAidatKayitlari([]); // Daire seçimi kalkınca tabloyu temizle
    }
  };

  useEffect(() => {
    fetchAidatKayitlari();
  }, [selectedDaireId]);

  const blokMap = useMemo(() => new Map(bloklar.map(b => [b.id, b.ad])), [bloklar]);

  const filteredDaireler = useMemo(() => {
    if (!selectedBlokId) return [];
    return daireler.filter(daire => daire.blokId === selectedBlokId);
  }, [selectedBlokId, daireler]);

  const handleBlokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBlokId(e.target.value);
    setSelectedDaireId('');
  };

  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({ type, message });
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleOdemeAl = async (aidatId: string) => {
    try {
        await axios.post(`http://localhost:8080/api/aidatlar/${aidatId}/odeme-yap`);
        showNotification('success', 'Ödeme başarıyla kaydedildi!');
        fetchAidatKayitlari(); // Tabloyu yenile
    } catch (err: any) {
        showNotification('error', 'Ödeme alınırken bir hata oluştu.');
    }
  };

  const summary = useMemo(() => {
    const toplamBorc = aidatKayitlari.reduce((acc, kayit) => acc + kayit.borcTutari, 0);
    const odenenTutar = aidatKayitlari.filter(k => k.odendiMi).reduce((acc, k) => acc + k.borcTutari, 0);
    const kalanBakiye = toplamBorc - odenenTutar;
    return { toplamBorc, odenenTutar, kalanBakiye };
  }, [aidatKayitlari]);

  const columns: ColumnDef<AidatKaydi>[] = [
    { header: 'Dönem', accessorKey: 'donem' },
    { header: 'Borç Tutarı', accessorKey: 'borcTutari' },
    {
      header: 'Durum',
      accessorKey: 'odendiMi',
      cell: (item) => <Chip label={item.odendiMi ? 'Ödendi' : 'Ödenmedi'} color={item.odendiMi ? 'success' : 'error'} size="small" />
    },
    { header: 'Ödeme Tarihi', accessorKey: 'odemeTarihi' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Daire Hesap Özeti Sorgulama">
        <Stack direction="row" spacing={2}>
            <TextField select label="Önce Blok Seçiniz" value={selectedBlokId} onChange={handleBlokChange} fullWidth>
                <MenuItem value=""><em>-- Blok Seçin --</em></MenuItem>
                {bloklar.map(blok => (<MenuItem key={blok.id} value={blok.id}>{blok.ad}</MenuItem>))}
            </TextField>
            <TextField select label="Sonra Daire Seçiniz" value={selectedDaireId} onChange={(e) => setSelectedDaireId(e.target.value)} fullWidth disabled={!selectedBlokId}>
                <MenuItem value=""><em>-- Daire Seçin --</em></MenuItem>
                {filteredDaireler.map(daire => (<MenuItem key={daire.id} value={daire.id}>Daire {daire.kapiNo}</MenuItem>))}
            </TextField>
        </Stack>
      </ContentCard>

      {selectedDaireId && (
        <>
        <Stack direction="row" spacing={3}>
            <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">{summary.toplamBorc.toFixed(2)} ₺</Typography>
                <Typography variant="body2">Toplam Borç</Typography>
            </ContentCard>
            <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h5" fontWeight="bold">{summary.odenenTutar.toFixed(2)} ₺</Typography>
                <Typography variant="body2">Ödenen Tutar</Typography>
            </ContentCard>
            <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1, backgroundColor: summary.kalanBakiye > 0 ? '#FFCDD2' : '#C8E6C9' }}>
                <Typography variant="h5" fontWeight="bold">{summary.kalanBakiye.toFixed(2)} ₺</Typography>
                <Typography variant="body2">Kalan Bakiye</Typography>
            </ContentCard>
        </Stack>

        <ContentCard title="Aidat Geçmişi" spacing={0}>
          <GenericTable
            columns={columns}
            data={aidatKayitlari}
            isLoading={isLoading}
            error={null}
            renderActions={(kayit) => (
                <>
                  {!kayit.odendiMi && (
                    <Tooltip title="Ödeme Al">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<PaidIcon />}
                        onClick={() => handleOdemeAl(kayit.id)}
                      >
                        Ödeme Al
                      </Button>
                    </Tooltip>
                  )}
                </>
            )}
          />
        </ContentCard>
        </>
      )}

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default DaireHesapOzeti;
