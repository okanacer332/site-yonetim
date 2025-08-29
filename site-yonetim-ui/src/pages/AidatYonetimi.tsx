import { useEffect, useState, FormEvent, useMemo } from 'react';
import {
  Typography, Stack, TextField, MenuItem, Button, Box,
  Chip, Tooltip, Snackbar, Alert, LinearProgress,
} from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PageviewIcon from '@mui/icons-material/Pageview';
import { useCrudApi } from '../hooks/useCrudApi';
import ContentCard from '../components/ui/ContentCard';
import SubmitButton from '../components/ui/SubmitButton';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import axios from 'axios';

// --- VERİ MODELLERİ ---
interface DonemOzetiDto {
  donem: string;
  toplamBorc: number;
  odenenTutar: number;
  toplamDaireSayisi: number;
  odenenDaireSayisi: number;
}
interface DonemOzetiView extends DonemOzetiDto {
  id: string;
  kalanBorc: number;
  tahsilatOrani: number;
}
interface Daire { id: string; blokId: string; kapiNo: number; mulkSahibiAdi: string; }
interface Blok { id: string; ad: string; }
interface AidatKaydi { id: string; daireId: string; donem: string; borcTutari: number; odendiMi: boolean; odemeTarihi?: string; }
interface AidatTakipView { id: string; aidatId?: string; daireAdi: string; mulkSahibi: string; borc: number; durum: 'Ödendi' | 'Ödenmedi' | 'Borç Tanımlanmamış'; odemeTarihi?: string; }
interface Notification { type: 'success' | 'error'; message: string; }

const getCurrentDonemForForm = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}

function AidatYonetimi() {
  const { data: daireler, fetchData: fetchDaireler } = useCrudApi<Daire>('/daireler');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');
  
  const [donemOzetleri, setDonemOzetleri] = useState<DonemOzetiView[]>([]);
  const [isOzetLoading, setIsOzetLoading] = useState(true);
  const [aidatKayitlari, setAidatKayitlari] = useState<AidatKaydi[]>([]);
  const [seciliDonem, setSeciliDonem] = useState<string | null>(null);
  const [isDetayLoading, setIsDetayLoading] = useState(false);
  const [formDonem, setFormDonem] = useState(getCurrentDonemForForm());
  const [borcTutar, setBorcTutar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchDonemOzetleri = () => {
    setIsOzetLoading(true);
    axios.get('http://localhost:8080/api/raporlar/aidat/donem-ozetleri')
      .then(response => {
        const viewData = response.data.map((dto: DonemOzetiDto) => ({
          ...dto,
          id: dto.donem,
          kalanBorc: dto.toplamBorc - dto.odenenTutar,
          tahsilatOrani: dto.toplamBorc > 0 ? (dto.odenenTutar / dto.toplamBorc) * 100 : 100,
        }));
        setDonemOzetleri(viewData);
      })
      .catch(err => console.error("Dönem özetleri çekilemedi:", err))
      .finally(() => setIsOzetLoading(false));
  };

  const fetchAidatDetaylari = () => {
    if (seciliDonem) {
      setIsDetayLoading(true);
      axios.get(`http://localhost:8080/api/aidatlar?donem=${seciliDonem}`)
        .then(response => setAidatKayitlari(response.data))
        .catch(err => console.error("Aidat detay verisi çekilemedi:", err))
        .finally(() => setIsDetayLoading(false));
    }
  }

  useEffect(() => {
    fetchDaireler();
    fetchBloklar();
    fetchDonemOzetleri();
  }, []);

  useEffect(() => {
    fetchAidatDetaylari();
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
      await axios.post(`http://localhost:8080/api/aidatlar/toplu-borc-olustur?donem=${formDonem}&tutar=${borcTutar}`);
      showNotification('success', `Toplu borçlandırma işlemi arka planda başlatıldı. Özet tablo birazdan güncellenecektir.`);
      setTimeout(() => {
        fetchDonemOzetleri();
      }, 5000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Borç oluşturulurken bir hata oluştu.';
      showNotification('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOdemeAl = async (aidatId: string) => {
    try {
        await axios.post(`http://localhost:8080/api/aidatlar/${aidatId}/odeme-yap`);
        showNotification('success', 'Ödeme başarıyla kaydedildi!');
        fetchAidatDetaylari();
        fetchDonemOzetleri();
    } catch (err: any) {
        showNotification('error', 'Ödeme alınırken bir hata oluştu.');
    }
  };

  // GÜNCELLEME 1: Hatalı olan kopya tanımlama kaldırıldı.
  // Hesaplama mantığı, olması gerektiği gibi `useMemo` içine taşındı.
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

  const detayColumns: ColumnDef<AidatTakipView>[] = [
      { header: 'Daire', accessorKey: 'daireAdi' },
      { header: 'Mülk Sahibi', accessorKey: 'mulkSahibi' },
      { header: 'Borç Tutarı', accessorKey: 'borc', cell: (item) => `${item.borc.toFixed(2)} ₺` },
      { header: 'Durum', accessorKey: 'durum', cell: (item) => (<Chip label={item.durum} color={item.durum === 'Ödendi' ? 'success' : item.durum === 'Ödenmedi' ? 'error' : 'default'} size="small"/>)},
      { header: 'Ödeme Tarihi', accessorKey: 'odemeTarihi' },
  ];
  
  const ozetColumns: ColumnDef<DonemOzetiView>[] = [
    { header: 'Dönem', accessorKey: 'donem' },
    { header: 'Toplam Borç', accessorKey: 'toplamBorc', cell: (item) => `${item.toplamBorc.toFixed(2)} ₺` },
    { header: 'Kalan Alacak', accessorKey: 'kalanBorc', cell: (item) => `${item.kalanBorc.toFixed(2)} ₺` },
    { 
      header: 'Tahsilat Oranı', 
      accessorKey: 'tahsilatOrani',
      cell: (item) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}><LinearProgress variant="determinate" value={item.tahsilatOrani} color={item.tahsilatOrani < 50 ? 'error' : item.tahsilatOrani < 85 ? 'warning' : 'success'} /></Box>
          <Box sx={{ minWidth: 35 }}><Typography variant="body2" color="text.secondary">{`${Math.round(item.tahsilatOrani)}%`}</Typography></Box>
        </Box>
      )
    },
    { header: 'Borçlu Daire', accessorKey: 'toplamDaireSayisi', cell: (item) => `${item.toplamDaireSayisi - item.odenenDaireSayisi}` },
  ];


  return (
    <Stack spacing={4}>
      <ContentCard title="Toplu Aidat Borcu Oluştur" component="form" onSubmit={handleTopluBorcOlustur}>
       <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="Dönem (Yıl-Ay)" type="month" value={formDonem} onChange={(e) => setFormDonem(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }}/>
            <TextField label="Aylık Aidat Tutarı (₺)" type="number" value={borcTutar} onChange={(e) => setBorcTutar(e.target.value)} required fullWidth inputProps={{ step: "0.01" }}/>
            <SubmitButton isLoading={isSubmitting} startIcon={<RequestQuoteIcon />} sx={{ minWidth: 200, height: 56 }}>Borç Oluştur</SubmitButton>
       </Stack>
      </ContentCard>
      
      <ContentCard title="Dönem Bazında Aidat Özeti" spacing={0}>
        <GenericTable
            columns={ozetColumns}
            data={donemOzetleri}
            isLoading={isOzetLoading}
            error={null}
            renderActions={(ozet) => (
              <Tooltip title="Dönem Detaylarını Gör"><Button size="small" startIcon={<PageviewIcon />} onClick={() => setSeciliDonem(ozet.donem)}>Detaylar</Button></Tooltip>
            )}
        />
      </ContentCard>

      {seciliDonem && (
        <ContentCard title={`${seciliDonem} Dönemi Aidat Detayları`} spacing={0}>
          <GenericTable
              columns={detayColumns}
              data={aidatTakipViewData}
              isLoading={isDetayLoading}
              error={null}
              defaultRowsPerPage={20}
              exportFileName={`${seciliDonem}_Aidat_Durumu`}
              renderActions={(kayit) => (
                  <>{kayit.durum === 'Ödenmedi' && (<Tooltip title="Ödeme Al"><Button variant="contained" size="small" color="primary" startIcon={<PaidIcon />} onClick={() => handleOdemeAl(kayit.aidatId!)}>Ödeme Al</Button></Tooltip>)}</>
              )}
          />
        </ContentCard>
      )}

      {notification && (
        <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={handleSnackbarClose} severity={notification.type} sx={{ width: '100%' }} variant="filled">{notification.message}</Alert>
        </Snackbar>
      )}
    </Stack>
  );
}

// GÜNCELLEME 2: Hata veren kopya ve yanlış yerdeki tanımlamalar buradan kaldırıldı.

export default AidatYonetimi;