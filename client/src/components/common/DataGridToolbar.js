// client/src/components/common/DataGridToolbar.js
import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function DataGridToolbar({ onSearchChange, searchText }) {
  return (
    <Box 
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <TextField
        label="Ara"
        variant="outlined"
        size="small"
        value={searchText}
        onChange={onSearchChange}
        placeholder="Listede ara..."
        sx={{ width: { xs: '100%', sm: 350 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

export default DataGridToolbar;