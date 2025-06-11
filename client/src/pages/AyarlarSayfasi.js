// client/src/pages/AyarlarSayfasi.js
import React, { useState } from 'react';
import { Typography, Box, Grid, Paper, Button, Modal, Alert, Snackbar, Slide, Collapse, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useMutation, useQuery } from '@apollo/client';

// Gerekli tüm bileşen ve GraphQL operasyonları
import BlokList from '../components/BlokList';
import DaireList from '../components/DaireList';
import SakinList from '../components/SakinList';
import BlokForm from '../components/BlokForm';
import DaireForm from '../components/DaireForm';
import SakinForm from '../components/SakinForm';

import { CREATE_BLOK } from '../graphql/mutations/blokMutations';
import { CREATE_DAIRE } from '../graphql/mutations/daireMutations';
import { CREATE_SAKIN } from '../graphql/mutations/sakinMutations';
import { YERLESIM_EKLE } from '../graphql/mutations/ikametMutations';

import { GET_BLOKS } from '../graphql/queries/blokQueries';
import { GET_DAIRELER } from '../graphql/queries/daireQueries';
import { GET_SAKINLER } from '../graphql/queries/sakinQueries';

// Modal için stil
const modalStyle = {
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 550 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
};

// Snackbar için geçiş efekti
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

// Tekrar kullanılabilir Yönetim Kartı bileşeni
const AdminCard = ({ title, onCardClick, onAddNewClick, isActive }) => (
  <Paper 
    elevation={isActive ? 8 : 2}
    sx={{ 
      transition: 'box-shadow 0.3s ease-in-out',
      '&:hover': { boxShadow: 8, },
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}
  >
    <Box 
      onClick={onCardClick}
      sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <IconButton aria-label="genişlet/daralt">
        {isActive ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
    </Box>
    <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
      <Button 
        variant="contained" 
        color="primary"
        startIcon={<AddIcon />} 
        onClick={(e) => { e.stopPropagation(); onAddNewClick(); }}
        size="small"
        fullWidth
      >
        Yeni Kayıt Ekle
      </Button>
    </Box>
  </Paper>
);

function AyarlarSayfasi() {
  const [activePanel, setActivePanel] = useState(null);
  const [addBlokModalOpen, setAddBlokModalOpen] = useState(false);
  const [addDaireModalOpen, setAddDaireModalOpen] = useState(false);
  const [addSakinModalOpen, setAddSakinModalOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });
  
  // Hangi formun "Yeni Sakin" modalını açtığını takip etmek için (evSahibi mi, kiraci mı?)
  const [sakinModalContext, setSakinModalContext] = useState('general');
  // Yeni eklenen sakini DaireForm'a geri bildirmek için
  const [newlyAddedSakin, setNewlyAddedSakin] = useState(null);

  // Handler Fonksiyonları
  const handlePanelClick = (panel) => setActivePanel(activePanel === panel ? null : panel);
  const showSnackbar = (message, severity = 'success') => setSnackbarState({ open: true, message, severity });
  const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbarState(prev => ({ ...prev, open: false })); };
  
  const handleOpenAddBlokModal = () => setAddBlokModalOpen(true);
  const handleCloseAddBlokModal = () => setAddBlokModalOpen(false);
  
  const handleOpenAddDaireModal = () => { setNewlyAddedSakin(null); setAddDaireModalOpen(true); };
  const handleCloseAddDaireModal = () => setAddDaireModalOpen(false);

  const handleOpenAddSakinModal = (context = 'general') => { setSakinModalContext(context); setAddSakinModalOpen(true); };
  const handleCloseAddSakinModal = () => setAddSakinModalOpen(false);
  
  // GraphQL Mutasyonları
  const { refetch: refetchDaireler } = useQuery(GET_DAIRELER, { skip: true });

  const [createSakinMutation, { loading: sakinLoading, error: sakinMutationError }] = useMutation(CREATE_SAKIN, {
    refetchQueries: [{ query: GET_SAKINLER }],
    onCompleted: (data) => {
      showSnackbar(`"${data.createSakin.adSoyad}" kişisi başarıyla eklendi!`, 'success');
      setNewlyAddedSakin({ context: sakinModalContext, data: data.createSakin });
      handleCloseAddSakinModal();
    },
    onError: (err) => { showSnackbar(err.message, 'error'); }
  });

  const [createBlokMutation, { loading: blokLoading, error: blokMutationError }] = useMutation(CREATE_BLOK, {
    refetchQueries: [{ query: GET_BLOKS }],
    onCompleted: (data) => { showSnackbar(`"${data.createBlok.name}" bloğu eklendi!`, 'success'); handleCloseAddBlokModal(); },
    onError: (err) => { showSnackbar(err.message, 'error'); }
  });

  const [createDaireMutation, { loading: daireLoading, error: daireMutationError }] = useMutation(CREATE_DAIRE, {
    // refetchQueries artık o kadar kritik değil çünkü resolver'dan dönen veri de dolu geliyor
    // ama listelerin güncel kalması için yine de faydalı.
    onCompleted: (data) => {
      showSnackbar(`Daire No: ${data.createDaire.daireNo} başarıyla eklendi!`, 'success');
      handleCloseAddDaireModal();
      refetchDaireler(); // Daire listesini manuel olarak yenilemek en güvenlisi
    },
    onError: (err) => { showSnackbar(err.message, 'error'); }
  });

  // Submit Handler'ları
  const handleAddSakinSubmit = (formData) => {
    if (!formData.adSoyad) { showSnackbar('Ad Soyad boş bırakılamaz.', 'warning'); return; }
    createSakinMutation({ variables: { input: formData } });
  };
  const handleAddBlokSubmit = ({ name }) => {
    if (!name) { showSnackbar('Blok adı boş bırakılamaz.', 'warning'); return; }
    createBlokMutation({ variables: { name } });
  };
  
  const handleAddDaireSubmit = (formData) => {
    if (!formData.blok || !formData.daireNo?.trim() || !formData.kat.toString() || !formData.evSahibi) {
      showSnackbar('Lütfen Blok, Daire No, Kat ve Ev Sahibi alanlarını doldurun.', 'warning');
      return;
    }
    if (formData.durum === 'Kiracı Oturuyor' && !formData.kiraci) {
      showSnackbar('Lütfen ikamet edecek kiracıyı seçin.', 'warning');
      return;
    }

    const katAsInt = parseInt(formData.kat, 10);
    if (isNaN(katAsInt)) {
      showSnackbar('Lütfen geçerli bir kat numarası girin.', 'error');
      return;
    }

    // Backend'in beklediği yeni input objesini oluşturuyoruz
    const inputForMutation = {
      blok: formData.blok,
      daireNo: formData.daireNo.trim(),
      kat: katAsInt,
      evSahibi: formData.evSahibi.id,
      durum: formData.durum,
      kiraci: formData.kiraci?.id || null, // Kiracı varsa ID'sini, yoksa null gönder
    };
    
    createDaireMutation({ variables: { input: inputForMutation } });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Yönetim Paneli / Ayarlar
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Site ile ilgili temel kayıt ve yönetim işlemlerini buradan yapabilirsiniz. İlgili kartın üzerine tıklayarak listeyi açabilirsiniz.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}><AdminCard title="Sakin Yönetimi" onCardClick={() => handlePanelClick('sakin')} onAddNewClick={() => handleOpenAddSakinModal('general')} isActive={activePanel === 'sakin'} /></Grid>
        <Grid item xs={12} sm={6} md={4}><AdminCard title="Blok Yönetimi" onCardClick={() => handlePanelClick('blok')} onAddNewClick={handleOpenAddBlokModal} isActive={activePanel === 'blok'} /></Grid>
        <Grid item xs={12} sm={6} md={4}><AdminCard title="Daire Yönetimi" onCardClick={() => handlePanelClick('daire')} onAddNewClick={handleOpenAddDaireModal} isActive={activePanel === 'daire'} /></Grid>
      </Grid>
      
      <Box sx={{ mt: 3, width: '100%' }}>
        <Collapse in={activePanel === 'sakin'} timeout="auto" unmountOnExit><Box sx={{mb: 3}}><SakinList showSnackbar={showSnackbar} /></Box></Collapse>
        <Collapse in={activePanel === 'blok'} timeout="auto" unmountOnExit><Box sx={{mb: 3}}><BlokList showSnackbar={showSnackbar} /></Box></Collapse>
        <Collapse in={activePanel === 'daire'} timeout="auto" unmountOnExit><Box sx={{mb: 3}}><DaireList showSnackbar={showSnackbar} /></Box></Collapse>
      </Box>

      {/* Modallar */}
      <Modal open={addSakinModalOpen} onClose={handleCloseAddSakinModal} aria-labelledby="yeni-sakin-ekle-modal-basligi">
        <Box sx={modalStyle}>
          <Typography id="yeni-sakin-ekle-modal-basligi" variant="h6" component="h2" gutterBottom>Yeni Sakin Ekle</Typography>
          <SakinForm onSubmit={handleAddSakinSubmit} isLoading={sakinLoading} submitButtonText="Kişiyi Kaydet" onCancel={handleCloseAddSakinModal} />
        </Box>
      </Modal>

      <Modal open={addDaireModalOpen} onClose={handleCloseAddDaireModal} aria-labelledby="yeni-daire-ekle-modal-basligi">
        <Box sx={modalStyle}>
          <Typography id="yeni-daire-ekle-modal-basligi" variant="h6" component="h2" gutterBottom>Yeni Daire Ekle</Typography>
          <DaireForm onSubmit={handleAddDaireSubmit} isLoading={daireLoading} submitButtonText="Daireyi Kaydet" onAddNewSakin={handleOpenAddSakinModal} newlyAddedSakin={newlyAddedSakin} />
          {daireMutationError && <Alert severity="error" sx={{mt: 2}}>{daireMutationError.message}</Alert>}
        </Box>
      </Modal>

      <Modal open={addBlokModalOpen} onClose={handleCloseAddBlokModal} aria-labelledby="yeni-blok-ekle-modal-basligi">
        <Box sx={modalStyle}>
          <Typography id="yeni-blok-ekle-modal-basligi" variant="h6" component="h2" gutterBottom>Yeni Blok Ekle</Typography>
          <BlokForm onSubmit={handleAddBlokSubmit} isLoading={blokLoading} submitButtonText="Ekle"/>
          {blokMutationError && <Alert severity="error" sx={{mt: 2}}>{blokMutationError.message}</Alert>}
        </Box>
      </Modal>

      {/* Merkezi Snackbar */}
      <Snackbar open={snackbarState.open} autoHideDuration={4000} onClose={handleSnackbarClose} TransitionComponent={SlideTransition} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarState.severity} sx={{ width: '100%' }} variant="filled">
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AyarlarSayfasi;