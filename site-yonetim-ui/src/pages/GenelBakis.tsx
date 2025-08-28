import { useEffect, useMemo } from 'react';
import { Typography, Stack, Grid, Box, Paper } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { useCrudApi } from '../hooks/useCrudApi';
import ContentCard from '../components/ui/ContentCard';

// Chart.js bileşenlerini kaydediyoruz
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Veri yapılarını tanımlıyoruz
interface Daire {
  id: string;
  durum: 'MULK_SAHIBI' | 'KIRACI' | 'BOS';
}

interface FinansalIslem {
  id: string;
  tip: 'GELIR' | 'GIDER';
  tutar: number;
  tarih: string;
}

function GenelBakis() {
  const { data: daireler, fetchData: fetchDaireler } = useCrudApi<Daire>('/daireler');
  const { data: bloklar, fetchData: fetchBloklar } = useCrudApi<any>('/bloklar');
  const { data: islemler, fetchData: fetchIslemler } = useCrudApi<FinansalIslem>('/kasa-hareketleri');

  useEffect(() => {
    fetchDaireler();
    fetchBloklar();
    fetchIslemler();
  }, []);

  // Özet verileri hesaplıyoruz
  const summaryData = useMemo(() => {
    const doluDaireSayisi = daireler.filter(d => d.durum !== 'BOS').length;
    const toplamGelir = islemler.filter(i => i.tip === 'GELIR').reduce((acc, i) => acc + i.tutar, 0);
    const toplamGider = islemler.filter(i => i.tip === 'GIDER').reduce((acc, i) => acc + i.tutar, 0);
    const kasaBakiyesi = toplamGelir - toplamGider;
    return { doluDaireSayisi, toplamGelir, toplamGider, kasaBakiyesi };
  }, [daireler, islemler]);

  // Grafik için verileri hazırlıyoruz (son 6 ay)
  const chartData = useMemo(() => {
    const labels: string[] = [];
    const gelirData: number[] = [];
    const giderData: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const label = `${year}-${month}`;
      labels.push(label);

      const aylikGelir = islemler
        .filter(islem => islem.tip === 'GELIR' && islem.tarih.startsWith(label))
        .reduce((acc, islem) => acc + islem.tutar, 0);
      gelirData.push(aylikGelir);

      const aylikGider = islemler
        .filter(islem => islem.tip === 'GIDER' && islem.tarih.startsWith(label))
        .reduce((acc, islem) => acc + islem.tutar, 0);
      giderData.push(aylikGider);
    }

    return {
      labels,
      datasets: [
        { label: 'Aylık Gelir', data: gelirData, backgroundColor: '#A0522D' },
        { label: 'Aylık Gider', data: giderData, backgroundColor: '#BDC3C7' },
      ],
    };
  }, [islemler]);

  return (
    <Stack spacing={4}>
      {/* Özet Kartları için Grid yerine Stack kullanıyoruz */}
      <Stack direction="row" spacing={3} sx={{ width: '100%' }}>
        <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">{bloklar.length}</Typography>
          <Typography variant="body2" color="text.secondary">Toplam Blok</Typography>
        </ContentCard>
        <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">{daireler.length}</Typography>
          <Typography variant="body2" color="text.secondary">Toplam Daire</Typography>
        </ContentCard>
        <ContentCard spacing={1} sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">{summaryData.doluDaireSayisi}</Typography>
          <Typography variant="body2" color="text.secondary">Dolu Daire Sayısı</Typography>
        </ContentCard>
        <ContentCard spacing={1} sx={{ textAlign: 'center', backgroundColor: '#A0522D', color: 'white', flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">{summaryData.kasaBakiyesi.toFixed(2)} ₺</Typography>
          <Typography variant="body2">Kasa Bakiyesi</Typography>
        </ContentCard>
      </Stack>

      <ContentCard title="Son 6 Aylık Gelir-Gider Grafiği">
        <Bar
          options={{
            responsive: true,
            plugins: { legend: { position: 'top' } },
          }}
          data={chartData}
        />
      </ContentCard>
    </Stack>
  );
}

export default GenelBakis;
