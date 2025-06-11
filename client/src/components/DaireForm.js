// client/src/components/DaireForm.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { TextField, Button, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid, Autocomplete, ToggleButtonGroup, ToggleButton, Typography, IconButton, Collapse, Divider, Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { GET_BLOKS } from '../graphql/queries/blokQueries';
import { GET_SAKINLER } from '../graphql/queries/sakinQueries';

const initialFormState = { blok: '', daireNo: '', kat: '', evSahibi: null, durum: 'Boş', kiraci: null };

function DaireForm({ onSubmit, initialData, isLoading = false, submitButtonText = "Kaydet", onAddNewSakin, newlyAddedSakin }) {
  const [form, setForm] = useState(initialFormState);
  const { data: blokData, loading: blokLoading } = useQuery(GET_BLOKS);
  const { data: sakinData, loading: sakinLoading, refetch: refetchSakinler } = useQuery(GET_SAKINLER);

  useEffect(() => {
    if (initialData && sakinData?.getSakinler) {
      const ownerObject = sakinData.getSakinler.find(s => s.id === initialData.evSahibi?.id) || null;
      const tenantObject = sakinData.getSakinler.find(s => s.id === initialData.mevcutSakin?.id) || null;
      setForm({
        blok: initialData.blok?.id || '',
        daireNo: initialData.daireNo || '',
        kat: initialData.kat || '',
        evSahibi: ownerObject,
        durum: initialData.durum || 'Boş',
        kiraci: tenantObject,
      });
    }
  }, [initialData, sakinData]);

  useEffect(() => {
    if (newlyAddedSakin?.data) {
      refetchSakinler().then(() => {
        setForm(prev => ({ ...prev, [newlyAddedSakin.context]: newlyAddedSakin.data }));
      });
    }
  }, [newlyAddedSakin, refetchSakinler]);

  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handleAutocompleteChange = (fieldName, newValue) => setForm(prev => ({ ...prev, [fieldName]: newValue }));
  const handleDurumChange = (event, newDurum) => { if (newDurum !== null) setForm(prev => ({ ...prev, durum: newDurum, kiraci: newDurum === 'Kiracı Oturuyor' ? prev.kiraci : null })); };
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  const isEditMode = !!initialData?.id;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Divider><Chip label="Temel Daire Bilgileri" /></Divider>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Blok</InputLabel><Select name="blok" value={form.blok} label="Blok" onChange={handleChange} disabled={blokLoading}>{blokData?.getBloks.map(b => (<MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>))}</Select></FormControl></Grid>
        <Grid item xs={6} sm={3}><TextField label="Daire No" name="daireNo" value={form.daireNo} onChange={handleChange} required fullWidth /></Grid>
        <Grid item xs={6} sm={3}><TextField label="Kat" name="kat" type="number" value={form.kat} onChange={handleChange} required fullWidth /></Grid>
      </Grid>
      
      <Divider sx={{mt:1}}><Chip label="Mülkiyet Bilgisi" /></Divider>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Autocomplete fullWidth options={sakinData?.getSakinler || []} getOptionLabel={(o) => o.adSoyad || ''} isOptionEqualToValue={(o, v) => o.id === v.id} value={form.evSahibi} onChange={(_, v) => handleAutocompleteChange('evSahibi', v)} loading={sakinLoading} renderInput={(params) => (<TextField {...params} label="Ev Sahibi" required InputProps={{...params.InputProps, endAdornment: (<>{sakinLoading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>)}}/>)}/>
        <IconButton onClick={() => onAddNewSakin('evSahibi')} color="primary" title="Yeni Ev Sahibi Ekle"><AddCircleOutlineIcon /></IconButton>
      </Box>

      <Divider sx={{mt:1}}><Chip label="İkamet Durumu" /></Divider>
      <ToggleButtonGroup color="primary" value={form.durum} exclusive onChange={handleDurumChange} fullWidth>
        <ToggleButton value="Ev Sahibi Oturuyor"><PersonIcon sx={{mr: 1}}/>Ev Sahibi</ToggleButton>
        <ToggleButton value="Kiracı Oturuyor"><GroupIcon sx={{mr: 1}}/>Kiracı</ToggleButton>
        <ToggleButton value="Boş"><NotInterestedIcon sx={{mr: 1}}/>Boş</ToggleButton>
      </ToggleButtonGroup>

      <Collapse in={form.durum === 'Kiracı Oturuyor'} timeout="auto">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Autocomplete fullWidth options={sakinData?.getSakinler || []} getOptionLabel={(o) => o.adSoyad || ''} isOptionEqualToValue={(o, v) => o.id === v.id} value={form.kiraci} onChange={(_, v) => handleAutocompleteChange('kiraci', v)} loading={sakinLoading} renderInput={(params) => (<TextField {...params} label="Kiracı" required={form.durum === 'Kiracı Oturuyor'} InputProps={{...params.InputProps, endAdornment: (<>{sakinLoading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>)}}/>)}/>
          <IconButton onClick={() => onAddNewSakin('kiraci')} color="primary" title="Yeni Kiracı Ekle"><AddCircleOutlineIcon /></IconButton>
        </Box>
      </Collapse>
      
      <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ py: 1.25, mt: 2 }}>
        {isLoading ? <CircularProgress size={24} /> : submitButtonText}
      </Button>
    </Box>
  );
}

export default DaireForm;