import { useEffect, useState, FormEvent, useMemo } from 'react';
import {
  Typography, Stack, TextField, MenuItem, Button, Box,
  Chip, Tooltip, Snackbar, Alert
} from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useCrudApi } from '../hooks/useCrudApi';
import ContentCard from '../components/ui/ContentCard';
import SubmitButton from '../components/ui/SubmitButton';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import axios from 'axios';

// Veri yapıları
interface Daire {
  id: string;
  blokId: string;
  kapiNo: number;
  mulkSahibiAdi: string;
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

interface AidatTakipView {
  id: string; // GenericTable için daireId'yi kullanıyoruz
  aidatId?: string;
  daireAdi: string;
  mulkSahibi: string;
  borc: number;
  durum: 'Ödendi' | 'Ödenmedi' | 'Borç Tanımlanmamış';
  odemeTarihi?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const getCurrentDonem = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}

function AidatYonetimi() {
  const { data: daireler, fetchData: fetchDaireler } = useCrudApi<Daire>('/daireler');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');
  
  const [aidatKayitlari, setAidatKayitlari] = useState<AidatKaydi[]>([]);
  const [seciliDonem, setSeciliDonem] = useState(getCurrentDonem());
  const [borcTutar, setBorcTutar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(true);

  const [notification, setNotification] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchAidatlar = () => {
    if (seciliDonem) {
      setIsLoadingTable(true);
      axios.get(`http://localhost:8080/api/aidatlar?donem=${seciliDonem}`)
        .then(response => setAidatKayitlari(response.data))
        .catch(err => console.error("Aidat verisi çekilemedi:", err))
        .finally(() => setIsLoadingTable(false));
    }
  }

  useEffect(() => {
    fetchDaireler();
    fetchBloklar();
  }, []);

  useEffect(() => {
    fetchAidatlar();
  }, [seciliDonem]);

  const showNotification = (type: Notification['type'], message: string) => {
    setNotification({ type, message });
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleTopluBorcOlustur = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:8080/api/aidatlar/toplu-borc-olustur?donem=${seciliDonem}&tutar=${borcTutar}`);
      showNotification('success', `${seciliDonem} dönemi için aidat borçları başarıyla oluşturuldu!`);
      fetchAidatlar();
    } catch (err: any) {
      showNotification('error', 'Borç oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOdemeAl = async (aidatId: string) => {
    try {
        await axios.post(`http://localhost:8080/api/aidatlar/${aidatId}/odeme-yap`);
        showNotification('success', 'Ödeme başarıyla kaydedildi!');
        fetchAidatlar();
    } catch (err: any) {
        showNotification('error', 'Ödeme alınırken bir hata oluştu.');
    }
  };

  const aidatTakipViewData: AidatTakipView[] = useMemo(() => {
    const blokMap = new Map(bloklar.map(b => [b.id, b.ad]));
    return daireler.map(daire => {
      const aidatKaydi = aidatKayitlari.find(a => a.daireId === daire.id);
      const daireAdi = `${blokMap.get(daire.blokId) || ''} - Daire ${daire.kapiNo}`;

      return {
        id: daire.id,
        aidatId: aidatKaydi?.id,
        daireAdi: daireAdi,
        mulkSahibi: daire.mulkSahibiAdi,
        borc: aidatKaydi?.borcTutari || 0,
        durum: aidatKaydi ? (aidatKaydi.odendiMi ? 'Ödendi' : 'Ödenmedi') : 'Borç Tanımlanmamış',
        odemeTarihi: aidatKaydi?.odemeTarihi
      };
    });
  }, [daireler, bloklar, aidatKayitlari]);

  const columns: ColumnDef<AidatTakipView>[] = [
    { header: 'Daire', accessorKey: 'daireAdi' },
    { header: 'Mülk Sahibi', accessorKey: 'mulkSahibi' },
    { header: 'Borç Tutarı', accessorKey: 'borc' },
    { 
      header: 'Durum', 
      accessorKey: 'durum',
      cell: (item) => (
        <Chip 
          label={item.durum}
          color={
            item.durum === 'Ödendi' ? 'success' :
            item.durum === 'Ödenmedi' ? 'error' : 'default'
          }
          size="small"
        />
      )
    },
    { header: 'Ödeme Tarihi', accessorKey: 'odemeTarihi' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Toplu Aidat Borcu Oluştur" component="form" onSubmit={handleTopluBorcOlustur}>
        <Stack direction="row" spacing={2} alignItems="center">
            <TextField
                label="Dönem (Yıl-Ay)"
                type="month"
                value={seciliDonem}
                onChange={(e) => setSeciliDonem(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
            />
            <TextField
                label="Aylık Aidat Tutarı (₺)"
                type="number"
                value={borcTutar}
                onChange={(e) => setBorcTutar(e.target.value)}
                required
                fullWidth
                inputProps={{ step: "0.01" }}
            />
            <SubmitButton isLoading={isSubmitting} startIcon={<RequestQuoteIcon />} sx={{ minWidth: 200, height: 56 }}>
                Borç Oluştur
            </SubmitButton>
        </Stack>
      </ContentCard>
      
      <ContentCard title={`${seciliDonem} Dönemi Aidat Takibi`} spacing={0}>
        <GenericTable
            columns={columns}
            data={aidatTakipViewData}
            isLoading={isLoadingTable}
            error={null}
            defaultRowsPerPage={20} // Varsayılan satır sayısını 20 yaptık
            exportFileName={`${seciliDonem}_Aidat_Durumu`}
            renderActions={(kayit) => (
                <>
                  {kayit.durum === 'Ödenmedi' && (
                    <Tooltip title="Ödeme Al">
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<PaidIcon />}
                        onClick={() => handleOdemeAl(kayit.aidatId!)}
                      >
                        Ödeme Al
                      </Button>
                    </Tooltip>
                  )}
                </>
            )}
        />
      </ContentCard>

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

export default AidatYonetimi;
