import { useState, useMemo, useEffect } from 'react';
import {
  Typography, Stack, TextField, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// GÜNCELLEME 1: Grafik kütüphanelerine artık ihtiyaç duymadığımız için importları kaldırıyoruz.

import ContentCard from '../components/ui/ContentCard';
import GenericTable, { ColumnDef } from '../components/ui/GenericTable';
import SubmitButton from '../components/ui/SubmitButton';
import axios from 'axios';

// --- VERİ MODELLERİ ---
interface KategoriOzetDto {
  kategori: string;
  toplamTutar: number;
}
interface FinansalRaporDto {
  toplamGelir: number;
  toplamGider: number;
  netBakiye: number;
  gelirlerByKategori: KategoriOzetDto[];
  giderlerByKategori: KategoriOzetDto[];
}
interface FinansalIslem {
  id: string; tip: 'GELIR' | 'GIDER'; aciklama: string; tutar: number; tarih: string; daireId?: string; blokId?: string; kategori?: string;
}
interface DateRange { start: string; end: string; }

const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
const getLastDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

function Raporlama() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: getFirstDayOfMonth(new Date()),
    end: getLastDayOfMonth(new Date())
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [raporOzet, setRaporOzet] = useState<FinansalRaporDto | null>(null);
  const [islemListesi, setIslemListesi] = useState<FinansalIslem[]>([]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFetchReport = async () => {
    setIsSubmitting(true);
    setRaporOzet(null);
    setIslemListesi([]);
    try {
        const ozetUrl = `http://localhost:8080/api/raporlar/finansal/ozet?baslangicTarihi=${dateRange.start}&bitisTarihi=${dateRange.end}`;
        const detayUrl = `http://localhost:8080/api/kasa-hareketleri?baslangicTarihi=${dateRange.start}&bitisTarihi=${dateRange.end}`;
        const [ozetResponse, detayResponse] = await Promise.all([axios.get(ozetUrl), axios.get(detayUrl)]);
        setRaporOzet(ozetResponse.data);
        setIslemListesi(detayResponse.data);
    } catch (err) {
        console.error(err);
        setRaporOzet(null);
        setIslemListesi([]);
    } finally {
        setIsSubmitting(false);
    }
  };

  useEffect(() => {
    handleFetchReport();
  }, []);
  
  // GÜNCELLEME 2: Pasta grafik verisine artık ihtiyaç yok, bu bölümü siliyoruz.

  const columns: ColumnDef<FinansalIslem>[] = [
    { header: 'Tarih', accessorKey: 'tarih' },
    { header: 'Tip', accessorKey: 'tip' },
    { header: 'Açıklama', accessorKey: 'aciklama' },
    { header: 'Kategori', accessorKey: 'kategori' },
    { header: 'Tutar', accessorKey: 'tutar', cell: (item) => `${item.tutar.toFixed(2)} ₺` },
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

      {isSubmitting ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
      ) : raporOzet && (
        <>
          {/* GÜNCELLEME 3: YENİ, BÜYÜK VE SADE ÖZET PANELİ */}
          <Paper sx={{ p: 3, backgroundColor: '#FAF8F0', border: '1px solid #D7C7A8' }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              justifyContent="space-around"
              textAlign="center"
            >
              <Box>
                <Typography variant="overline" color="text.secondary">Toplam Gelir</Typography>
                <Typography variant="h4" fontWeight="bold" color="green">{raporOzet.toplamGelir.toFixed(2)} ₺</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">Toplam Gider</Typography>
                <Typography variant="h4" fontWeight="bold" color="red">{raporOzet.toplamGider.toFixed(2)} ₺</Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">Net Bakiye</Typography>
                <Typography variant="h4" fontWeight="bold" color={raporOzet.netBakiye >= 0 ? 'primary' : 'error'}>{raporOzet.netBakiye.toFixed(2)} ₺</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* GÜNCELLEME 4: YAN YANA KATEGORİ DÖKÜM TABLOLARI */}
          <ContentCard title="Gelir ve Gider Kalemleri Dökümü">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ width: '100%', md: { width: '50%' } }}>
                  <Typography variant="h6" gutterBottom align="center">Gelirler</Typography>
                  <Paper variant="outlined">
                      <Table size="small">
                          <TableHead><TableRow><TableCell>Kategori</TableCell><TableCell align="right">Tutar</TableCell></TableRow></TableHead>
                          <TableBody>
                              {raporOzet.gelirlerByKategori.map(gelir => (
                                  <TableRow key={gelir.kategori}><TableCell>{gelir.kategori || 'Diğer'}</TableCell><TableCell align="right">{gelir.toplamTutar.toFixed(2)} ₺</TableCell></TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </Paper>
              </Box>
              <Box sx={{ width: '100%', md: { width: '50%' } }}>
                  <Typography variant="h6" gutterBottom align="center">Giderler</Typography>
                   <Paper variant="outlined">
                      <Table size="small">
                          <TableHead><TableRow><TableCell>Kategori</TableCell><TableCell align="right">Tutar</TableCell></TableRow></TableHead>
                          <TableBody>
                              {raporOzet.giderlerByKategori.map(gider => (
                                  <TableRow key={gider.kategori}><TableCell>{gider.kategori || 'Diğer'}</TableCell><TableCell align="right">{gider.toplamTutar.toFixed(2)} ₺</TableCell></TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </Paper>
              </Box>
            </Stack>
          </ContentCard>
          
          <ContentCard title="Tüm İşlem Detayları (Ham Veri)" spacing={0}>
            <GenericTable columns={columns} data={islemListesi} isLoading={isSubmitting} error={null} exportFileName={`Finansal_Rapor_${dateRange.start}_-_${dateRange.end}`} />
          </ContentCard>
        </>
      )}
    </Stack>
  );
}

export default Raporlama;