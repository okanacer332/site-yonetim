// client/src/components/BlokList.js
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Paper, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET_BLOKS } from '../graphql/queries/blokQueries';
import { GET_DAIRELER } from '../graphql/queries/daireQueries';
import { DELETE_BLOK } from '../graphql/mutations/blokMutations';
import StyledDataGrid from './common/StyledDataGrid';
import DataGridToolbar from './common/DataGridToolbar';
import EditBlokModal from './EditBlokModal';
import DeleteBlokDialog from './DeleteBlokDialog';

function BlokList({ showSnackbar }) {
  const { loading, error, data, refetch } = useQuery(GET_BLOKS); // refetch fonksiyonunu alıyoruz
  const [searchText, setSearchText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBlokToEdit, setCurrentBlokToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentBlokToDelete, setCurrentBlokToDelete] = useState(null);

  const [deleteBlokMutation, { loading: deleteLoading }] = useMutation(DELETE_BLOK, {
    refetchQueries: [{ query: GET_DAIRELER }], // Daireler listesini de yenilemeye devam et
    onCompleted: (mutationData) => {
      showSnackbar(mutationData.deleteBlok.success ? mutationData.deleteBlok.message : 'Blok silinemedi.', mutationData.deleteBlok.success ? 'success' : 'error');
      refetch(); // <<< DÜZELTME: Blok listesini de manuel olarak yenile
      handleCloseDeleteDialog();
    },
    onError: (err) => { showSnackbar(err.message, 'error'); handleCloseDeleteDialog(); },
  });

  const handleOpenEditModal = (blok) => { setCurrentBlokToEdit(blok); setEditModalOpen(true); };
  const handleCloseEditModal = () => { setEditModalOpen(false); setCurrentBlokToEdit(null); };
  const handleOpenDeleteDialog = (blok) => { setCurrentBlokToDelete(blok); setDeleteDialogOpen(true); };
  const handleCloseDeleteDialog = () => { setDeleteDialogOpen(false); setCurrentBlokToDelete(null); };
  const handleConfirmDelete = () => { if (currentBlokToDelete?.id) { deleteBlokMutation({ variables: { id: currentBlokToDelete.id } }); }};
  
  const handleEditSuccess = (message) => { 
    showSnackbar(message, 'success'); 
    refetch(); // <<< DÜZELTME: Düzenleme sonrası listeyi manuel olarak yenile
  };

  const filteredRows = useMemo(() => {
    if (!data || !data.getBloks) return [];
    return data.getBloks.filter(row => row && row.name.toLowerCase().includes(searchText.toLowerCase()));
  }, [data, searchText]);

  if (error) return <Alert severity="error">Bloklar yüklenirken hata oluştu: {error.message}</Alert>;

  const columns = [
    { field: 'name', headerName: 'Blok Adı', flex: 1, minWidth: 200 },
    { field: 'createdAt', headerName: 'Oluşturulma Tarihi', flex: 1, minWidth: 180, renderCell: (params) => new Date(parseInt(params.value, 10)).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) },
    {
      field: 'actions', headerName: 'İşlemler', sortable: false, filterable: false, width: 130, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenEditModal(params.row)} color="primary" size="small"><EditIcon fontSize="inherit" /></IconButton>
          <IconButton onClick={() => handleOpenDeleteDialog(params.row)} color="error" size="small" disabled={deleteLoading && currentBlokToDelete?.id === params.row.id}><DeleteIcon fontSize="inherit" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3}>
      <DataGridToolbar searchText={searchText} onSearchChange={(e) => setSearchText(e.target.value)} placeholderText="Blok adında ara..."/>
      <Box sx={{ height: 500, width: '100%' }}>
        <StyledDataGrid rows={filteredRows} columns={columns} loading={loading} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[5, 10, 25]} disableRowSelectionOnClick slots={{ noRowsOverlay: () => <Alert severity="info" sx={{m: 2}}>Kayıtlı blok bulunmamaktadır.</Alert> }}/>
      </Box>
      {currentBlokToEdit && <EditBlokModal open={editModalOpen} handleClose={handleCloseEditModal} blok={currentBlokToEdit} onSuccess={handleEditSuccess}/>}
      {currentBlokToDelete && <DeleteBlokDialog open={deleteDialogOpen} handleClose={handleCloseDeleteDialog} handleConfirmDelete={handleConfirmDelete} blokName={currentBlokToDelete?.name || ''} isLoading={deleteLoading}/>}
    </Paper>
  );
}

export default BlokList;