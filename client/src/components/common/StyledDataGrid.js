// client/src/components/common/StyledDataGrid.js
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d',
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 'bold',
  },
  
  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    '&:focus, &:focus-within': {
      outline: 'none !important',
    },
  },
  
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  
  '& .MuiDataGrid-row:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default StyledDataGrid;