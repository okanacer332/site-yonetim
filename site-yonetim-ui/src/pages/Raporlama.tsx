import { useState } from 'react';
import {
  Typography, Stack, TextField, Box, CircularProgress, Alert, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

import ContentCard from '../components/ui/ContentCard';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import SubmitButton from '../components/ui/SubmitButton';

// --- Veri Modeli ---
interface FinansalIslem {
  id: string; 
  tip: 'GELIR' | 'GIDER'; 
  aciklama: string; 
  tutar: any; 
  tarih: string; 
  kategori?: string;
}

// Ay seçici için varsayılan değeri (içinde bulunduğumuz ay) oluşturan fonksiyon
const getCurrentMonthValue = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}

function Raporlama() {
  // Sadece seçilen dönemi (örn: "2025-08") tutan state
  const [secilenDonem, setSecilenDonem] = useState(getCurrentMonthValue());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Sadece API'den gelen işlem listesini tutan state
  const [islemListesi, setIslemListesi] = useState<FinansalIslem[]>([]);

  const handleRaporHazirla = async () => {
    setIsLoading(true);
    setError(null);
    setIslemListesi([]);

    try {
      // Seçilen "2025-08" gibi bir değerden başlangıç ve bitiş tarihlerini hesapla
      const yil = parseInt(secilenDonem.substring(0, 4));
      const ay = parseInt(secilenDonem.substring(5, 7));
      const baslangicTarihi = new Date(yil, ay - 1, 1).toISOString().split('T')[0];
      const bitisTarihi = new Date(yil, ay, 0).toISOString().split('T')[0];
      
      const url = `http://localhost:8080/api/kasa-hareketleri?baslangicTarihi=${baslangicTarihi}&bitisTarihi=${bitisTarihi}`;
      const response = await axios.get(url);
      setIslemListesi(response.data);

    } catch (err) {
      console.error("Rapor verisi çekilirken hata oluştu:", err);
      setError("Rapor verileri çekilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
      setIslemListesi([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tablo sütun tanımları
  const columns: ColumnDef<FinansalIslem>[] = [
    { header: 'Tarih', accessorKey: 'tarih' },
    { header: 'Tip', accessorKey: 'tip' },
    { header: 'Açıklama', accessorKey: 'aciklama', width: '40%' },
    { header: 'Kategori', accessorKey: 'kategori' },
    { header: 'Tutar', accessorKey: 'tutar', cell: (item) => `${parseFloat(item.tutar).toFixed(2)} ₺` },
  ];

  return (
    <Stack spacing={3}>
      <ContentCard>
        <Typography variant="h6" gutterBottom>Aylık Finansal Döküm Raporu</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
            <TextField
                label="Rapor Ayı Seçiniz"
                type="month"
                value={secilenDonem}
                onChange={(e) => setSecilenDonem(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1 }}
            />
            <SubmitButton
                isLoading={isLoading}
                onClick={handleRaporHazirla}
                startIcon={<SearchIcon />}
                sx={{ minWidth: 200, height: 56 }}
            >
                Raporu Hazırla
            </SubmitButton>
        </Stack>
      </ContentCard>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
      )}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {/* Rapor hazırlandığında ve hata olmadığında tabloyu göster */}
      {!isLoading && !error && islemListesi.length > 0 && (
        <ContentCard spacing={0}>
          <GenericTable
            columns={columns}
            data={islemListesi}
            isLoading={false} // Yükleme bittiği için false
            error={null}
            exportFileName={`${secilenDonem}_Ayi_Dokumu`}
          />
        </ContentCard>
      )}

      {/* Rapor hazırlandığında ve sonuç boş geldiğinde mesaj göster */}
      {!isLoading && !error && islemListesi.length === 0 && (
         <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Başlamak için bir ay seçip "Raporu Hazırla" butonuna tıklayınız veya seçtiğiniz ay için kayıtlı bir işlem bulunmamaktadır.</Typography>
         </Paper>
      )}
    </Stack>
  );
}

export default Raporlama;