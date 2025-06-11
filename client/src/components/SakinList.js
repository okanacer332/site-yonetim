// client/src/components/SakinList.js
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Paper, Alert, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GET_SAKINLER } from '../graphql/queries/sakinQueries';
import { DELETE_SAKIN } from '../graphql/mutations/sakinMutations';
import StyledDataGrid from './common/StyledDataGrid';
import DataGridToolbar from './common/DataGridToolbar';
import EditSakinModal from './EditSakinModal';
import DeleteSakinDialog from './DeleteSakinDialog';

function SakinList({ showSnackbar }) {
  const { loading, error, data, refetch } = useQuery(GET_SAKINLER);
  const [searchText, setSearchText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSakinToEdit, setCurrentSakinToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentSakinToDelete, setCurrentSakinToDelete] = useState(null);

  const [deleteSakinMutation, { loading: deleteLoading }] = useMutation(DELETE_SAKIN, {
    refetchQueries: [{ query: GET_SAKINLER }],
    onCompleted: (data) => {
      showSnackbar(data.deleteSakin.success ? data.deleteSakin.message : 'Sakin silinemedi.', data.deleteSakin.success ? 'success' : 'error');
      handleCloseDeleteDialog();
    },
    onError: (err) => { showSnackbar(err.message, 'error'); handleCloseDeleteDialog(); },
  });

  const handleOpenEditModal = (sakin) => { setCurrentSakinToEdit(sakin); setEditModalOpen(true); };
  const handleCloseEditModal = () => { setEditModalOpen(false); setCurrentSakinToEdit(null); };
  const handleOpenDeleteDialog = (sakin) => { setCurrentSakinToDelete(sakin); setDeleteDialogOpen(true); };
  const handleCloseDeleteDialog = () => { setDeleteDialogOpen(false); setCurrentSakinToDelete(null); };
  const handleConfirmDelete = () => { if (currentSakinToDelete?.id) { deleteSakinMutation({ variables: { id: currentSakinToDelete.id } }); }};
  const handleEditSuccess = (message) => { showSnackbar(message, 'success'); };

  const filteredRows = useMemo(() => {
    if (!data || !data.getSakinler) return [];
    const rows = data.getSakinler.filter(sakin => sakin != null);
    if (!searchText) return rows;
    return rows.filter((row) => row.adSoyad.toLowerCase().includes(searchText.toLowerCase()) || row.telefon?.includes(searchText));
  }, [data, searchText]);

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>Sakinler yüklenirken hata oluştu: {error.message}</Alert>;

  const columns = [
    { field: 'adSoyad', headerName: 'Ad Soyad', flex: 1, minWidth: 200 },
    { field: 'telefon', headerName: 'Telefon', flex: 0.8, minWidth: 150, renderCell: (params) => params.value || '-' },
    { field: 'email', headerName: 'E-posta', flex: 1.5, minWidth: 220, renderCell: (params) => params.value || '-' },
    {
      field: 'actions', headerName: 'İşlemler', sortable: false, filterable: false, width: 130, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenEditModal(params.row)} color="primary" size="small"><EditIcon fontSize="inherit" /></IconButton>
          <IconButton onClick={() => handleOpenDeleteDialog(params.row)} color="error" size="small" disabled={deleteLoading && currentSakinToDelete?.id === params.row.id}><DeleteIcon fontSize="inherit" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3}>
      <DataGridToolbar searchText={searchText} onSearchChange={(e) => setSearchText(e.target.value)} placeholderText="Sakin Adı veya Telefonda Ara..."/>
      <Box sx={{ height: 600, width: '100%' }}>
        <StyledDataGrid rows={filteredRows} columns={columns} loading={loading} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} pageSizeOptions={[10, 25]} disableRowSelectionOnClick slots={{ noRowsOverlay: () => <Alert severity="info" sx={{ m: 2 }}>Kayıtlı sakin bulunmamaktadır.</Alert> }}/>
      </Box>
      {currentSakinToEdit && <EditSakinModal open={editModalOpen} handleClose={handleCloseEditModal} sakin={currentSakinToEdit} onSuccess={handleEditSuccess} />}
      {currentSakinToDelete && <DeleteSakinDialog open={deleteDialogOpen} handleClose={handleCloseDeleteDialog} handleConfirmDelete={handleConfirmDelete} sakinName={currentSakinToDelete?.adSoyad || ''} isLoading={deleteLoading} />}
    </Paper>
  );
}

export default SakinList;