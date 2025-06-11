// client/src/components/DaireList.js
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Paper, Alert, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Gerekli tüm dosyalar
import { GET_DAIRELER } from '../graphql/queries/daireQueries';
import { DELETE_DAIRE } from '../graphql/mutations/daireMutations';
import StyledDataGrid from './common/StyledDataGrid';
import DataGridToolbar from './common/DataGridToolbar';
import EditDaireModal from './EditDaireModal';
import DeleteDaireDialog from './DeleteDaireDialog';

// Telefon numarasını formatlayan yardımcı fonksiyon
const formatPhoneNumber = (phoneStr) => {
  if (!phoneStr || typeof phoneStr !== 'string') return '';
  const cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.length === 10) {
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) return `(${match[1]}) ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phoneStr;
};

function DaireList({ showSnackbar }) {
  // State'ler
  const [searchText, setSearchText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentDaireToEdit, setCurrentDaireToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentDaireToDelete, setCurrentDaireToDelete] = useState(null);

  // GraphQL Sorgusu ve Mutasyonları
  const { loading, error, data, refetch } = useQuery(GET_DAIRELER);
  const [deleteDaireMutation, { loading: deleteLoading }] = useMutation(DELETE_DAIRE, {
    onCompleted: (data) => {
      showSnackbar(data.deleteDaire.success ? data.deleteDaire.message : 'Daire silinemedi.', data.deleteDaire.success ? 'success' : 'error');
      handleCloseDeleteDialog();
      refetch();
    },
    onError: (err) => { showSnackbar(err.message, 'error'); handleCloseDeleteDialog(); },
  });

  // Handler Fonksiyonları
  const handleOpenEditModal = (daire) => { setCurrentDaireToEdit(daire); setEditModalOpen(true); };
  const handleCloseEditModal = () => { setEditModalOpen(false); setCurrentDaireToEdit(null); };
  const handleOpenDeleteDialog = (daire) => { setCurrentDaireToDelete(daire); setDeleteDialogOpen(true); };
  const handleCloseDeleteDialog = () => { setDeleteDialogOpen(false); setCurrentDaireToDelete(null); };
  const handleConfirmDelete = () => { if (currentDaireToDelete?.id) { deleteDaireMutation({ variables: { id: currentDaireToDelete.id } }); }};
  const handleEditSuccess = (message) => { showSnackbar(message, 'success'); refetch(); };

  // NİHAİ ÇÖZÜM: Veriyi DataGrid için düzleştirme ve filtreleme
  const flattenedAndFilteredRows = useMemo(() => {
    if (!data || !data.getDaireler) return [];
    
    // 1. Veriyi düzleştiriyoruz
    const flattenedData = data.getDaireler.filter(daire => daire != null).map(daire => ({
      id: daire.id,
      blokName: daire.blok?.name || '-',
      daireNo: daire.daireNo,
      kat: daire.kat,
      durum: daire.durum,
      mevcutSakinAdi: daire.mevcutSakin?.adSoyad || '-',
      evSahibiAdi: daire.evSahibi?.adSoyad || '-',
      // Düzenleme modalına göndermek için orijinal objeyi de saklayalım
      original: daire 
    }));

    // 2. Düzleştirilmiş veri üzerinde arama yapıyoruz
    if (!searchText) {
      return flattenedData;
    }
    return flattenedData.filter((row) =>
      row.daireNo?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.blokName?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.mevcutSakinAdi?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.evSahibiAdi?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>Daireler yüklenirken hata oluştu: {error.message}</Alert>;

  // Sütunlar artık düzleştirilmiş alan adlarını kullanıyor
  const columns = [
    { field: 'blokName', headerName: 'Blok', flex: 0.8, minWidth: 120 },
    { field: 'daireNo', headerName: 'Daire No', width: 100 },
    { field: 'kat', headerName: 'Kat', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'durum', headerName: 'İkamet Durumu', flex: 1, minWidth: 160 },
    { field: 'mevcutSakinAdi', headerName: 'Mevcut Sakin', flex: 1.5, minWidth: 200 },
    { field: 'evSahibiAdi', headerName: 'Ev Sahibi', flex: 1.5, minWidth: 200 },
    {
      field: 'actions', headerName: 'İşlemler', sortable: false, filterable: false, width: 130, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenEditModal(params.row.original)} color="primary" size="small"><EditIcon fontSize="inherit" /></IconButton>
          <IconButton onClick={() => handleOpenDeleteDialog(params.row.original)} color="error" size="small" disabled={deleteLoading && currentDaireToDelete?.id === params.row.id}><DeleteIcon fontSize="inherit" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3}>
      <DataGridToolbar
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        placeholderText="Blok, Daire No, Sakin veya Ev Sahibi Adında Ara..."
      />
      <Box sx={{ height: 600, width: '100%' }}>
        <StyledDataGrid
          rows={flattenedAndFilteredRows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => <Alert severity="info" sx={{ m: 2 }}>Sonuç bulunamadı veya kayıtlı daire yok.</Alert>,
            loadingOverlay: () => <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CircularProgress /></Box>
          }}
        />
      </Box>
      {currentDaireToEdit && <EditDaireModal open={editModalOpen} handleClose={handleCloseEditModal} daire={currentDaireToEdit} onSuccess={handleEditSuccess} />}
      {currentDaireToDelete && <DeleteDaireDialog open={deleteDialogOpen} handleClose={handleCloseDeleteDialog} handleConfirmDelete={handleConfirmDelete} blokName={currentDaireToDelete?.blok?.name} daireNo={currentDaireToDelete?.daireNo} isLoading={deleteLoading} />}
    </Paper>
  );
}

export default DaireList;