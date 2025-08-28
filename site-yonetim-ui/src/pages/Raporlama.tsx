import { useState, useMemo, useEffect } from 'react';
import {
  Typography, Stack, TextField, Box, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useCrudApi } from '../hooks/useCrudApi';
import ContentCard from '../components/ui/ContentCard';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import SubmitButton from '../components/ui/SubmitButton';

// Veri yapıları
interface FinansalIslem {
  id: string;
  tip: 'GELIR' | 'GIDER';
  aciklama: string;
  tutar: number;
  tarih: string;
  daireId?: string;
  blokId?: string;
  kategori?: string;
}
interface Daire {
  id: string;
  blokId: string;
  kapiNo: number;
  mulkSahibiAdi: string;
  durum: 'MULK_SAHIBI' | 'KIRACI' | 'BOS';
  kiraciAdi?: string;
}
interface Blok {
  id: string;
  ad: string;
}

interface DateRange {
    start: string;
    end: string;
}

const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
const getLastDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

function Raporlama() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: getFirstDayOfMonth(new Date()),
    end: getLastDayOfMonth(new Date())
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState<FinansalIslem[]>([]);

  // Raporu zenginleştirmek için daire ve blok verilerini de çekiyoruz
  const { data: daireler, fetchData: fetchDaireler } = useCrudApi<Daire>('/daireler');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<Blok>('/bloklar');

  useEffect(() => {
    fetchDaireler();
    fetchBloklar();
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFetchReport = async () => {
    setIsSubmitting(true);
    try {
        const response = await fetch(`http://localhost:8080/api/kasa-hareketleri?baslangicTarihi=${dateRange.start}&bitisTarihi=${dateRange.end}`);
        if (!response.ok) throw new Error('Rapor verisi çekilemedi.');
        const data = await response.json();
        setReportData(data);
    } catch (err) {
        console.error(err);
        setReportData([]);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const daireMap = useMemo(() => new Map(daireler.map(d => [d.id, d])), [daireler]);
  const blokMap = useMemo(() => new Map(bloklar.map(b => [b.id, b.ad])), [bloklar]);

  // Rapor verisini zenginleştirerek yeni bir view modeli oluşturuyoruz
  const reportViewData = useMemo(() => {
    return reportData.map(islem => {
      let aciklama = islem.aciklama;
      // Eğer backend'den gelen açıklama yetersizse (eski kayıtlar için), biz zenginleştirelim
      if (islem.daireId && islem.kategori === 'Aidat' && !aciklama.includes('Daire')) {
        const daire = daireMap.get(islem.daireId);
        if (daire) {
          const blokAdi = blokMap.get(daire.blokId) || '';
          const oturanKisi = daire.durum === 'KIRACI' && daire.kiraciAdi ? daire.kiraciAdi : daire.mulkSahibiAdi;
          aciklama = `${blokAdi} - Daire ${daire.kapiNo} (${oturanKisi}) - ${aciklama}`;
        }
      }
      return { ...islem, aciklama };
    });
  }, [reportData, daireMap, blokMap]);

  const reportSummary = useMemo(() => {
    const toplamGelir = reportData.filter(i => i.tip === 'GELIR').reduce((acc, i) => acc + i.tutar, 0);
    const toplamGider = reportData.filter(i => i.tip === 'GIDER').reduce((acc, i) => acc + i.tutar, 0);
    const netBakiye = toplamGelir - toplamGider;
    return { toplamGelir, toplamGider, netBakiye };
  }, [reportData]);

  const columns: ColumnDef<FinansalIslem>[] = [
    { header: 'Tarih', accessorKey: 'tarih' },
    { header: 'Tip', accessorKey: 'tip' },
    { header: 'Açıklama', accessorKey: 'aciklama' },
    { header: 'Kategori', accessorKey: 'kategori' },
    { header: 'Tutar', accessorKey: 'tutar' },
  ];

  return (
    <Stack spacing={4}>
      <ContentCard title="Finansal Rapor">
        <Stack direction="row" spacing={2} alignItems="center">
            <TextField name="start" label="Başlangıç Tarihi" type="date" value={dateRange.start} onChange={handleDateChange} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField name="end" label="Bitiş Tarihi" type="date" value={dateRange.end} onChange={handleDateChange} InputLabelProps={{ shrink: true }} fullWidth />
            <SubmitButton isLoading={isSubmitting} onClick={handleFetchReport} startIcon={<SearchIcon />} sx={{ minWidth: 200, height: 56 }}>Raporu Getir</SubmitButton>
        </Stack>
      </ContentCard>

      <Stack direction="row" spacing={3}>
        <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1, backgroundColor: '#C8E6C9' }}>
            <Typography variant="h5" fontWeight="bold">{reportSummary.toplamGelir.toFixed(2)} ₺</Typography>
            <Typography variant="body2">Toplam Gelir</Typography>
        </ContentCard>
        <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1, backgroundColor: '#FFCDD2' }}>
            <Typography variant="h5" fontWeight="bold">{reportSummary.toplamGider.toFixed(2)} ₺</Typography>
            <Typography variant="body2">Toplam Gider</Typography>
        </ContentCard>
        <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1, backgroundColor: '#BBDEFB' }}>
            <Typography variant="h5" fontWeight="bold">{reportSummary.netBakiye.toFixed(2)} ₺</Typography>
            <Typography variant="body2">Net Bakiye</Typography>
        </ContentCard>
      </Stack>

      <ContentCard title="İşlem Detayları" spacing={0}>
        <GenericTable
          columns={columns}
          data={reportViewData} // Zenginleştirilmiş veriyi kullan
          isLoading={isSubmitting}
          error={null}
          exportFileName={`Finansal_Rapor_${dateRange.start}_-_${dateRange.end}`}
        />
      </ContentCard>
    </Stack>
  );
}

export default Raporlama;
