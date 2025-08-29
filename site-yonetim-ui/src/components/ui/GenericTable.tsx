import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, CircularProgress, Alert, Typography, TextField,
  TableSortLabel, TablePagination, Toolbar, Button, Stack
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  width?: string | number;
  cell?: (item: T) => React.ReactNode;
}

interface GenericTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading: boolean;
  error: string | null;
  renderActions?: (item: T) => React.ReactNode;
  exportFileName?: string;
  defaultRowsPerPage?: number;
  // GÜNCELLEME 1: Hata veren 'highlightedRowId' özelliği eklendi.
  // Artık bu bileşen, dışarıdan bir satır ID'si alarak o satırı vurgulayabileceğini biliyor.
  highlightedRowId?: string | null;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(order: Order, orderBy: Key): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// GÜNCELLEME 2: 'highlightedRowId' props'u fonksiyona parametre olarak eklendi.
function GenericTable<T extends { id: string }>({ columns, data, isLoading, error, renderActions, exportFileName = 'rapor', defaultRowsPerPage = 10, highlightedRowId }: GenericTableProps<T>) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]?.accessorKey || 'id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [filter, setFilter] = useState('');

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = useMemo(() => data.filter(item => 
    columns.some(column => 
      String(item[column.accessorKey]).toLowerCase().includes(filter.toLowerCase())
    )
  ), [data, filter, columns]);

  const visibleRows = useMemo(() => {
    return filteredData.sort(getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredData, order, orderBy, page, rowsPerPage]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor');
    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.autoTable({
        head: [columns.map(c => c.header)],
        body: filteredData.map(item => columns.map(c => String(item[c.accessorKey])))
    });
    doc.save(`${exportFileName}.pdf`);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, justifyContent: 'space-between' }}>
        <TextField
          variant="standard"
          label="Tabloda Ara..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ flex: '1 1 50%' }}
        />
        <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" startIcon={<GridOnIcon />} onClick={handleExportExcel}>Excel</Button>
            <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPdf}>PDF</Button>
        </Stack>
      </Toolbar>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={String(column.accessorKey)} sortDirection={orderBy === column.accessorKey ? order : false} width={column.width}>
                  <TableSortLabel active={orderBy === column.accessorKey} direction={orderBy === column.accessorKey ? order : 'asc'} onClick={() => handleRequestSort(column.accessorKey)}>
                    {column.header}
                    {orderBy === column.accessorKey ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
              {renderActions && <TableCell align="right">İşlemler</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length > 0 ? visibleRows.map((item) => (
              // GÜNCELLEME 3: Satırın ID'si 'highlightedRowId' ile eşleşiyorsa arkaplan rengini değiştir.
              <TableRow
                key={item.id}
                hover
                sx={{
                  ...(item.id === highlightedRowId && {
                    backgroundColor: '#FFFACD', // Vurgulama için açık sarı bir renk
                    transition: 'background-color 0.5s ease-in-out',
                  }),
                }}
              >
                {columns.map((column) => (
                  <TableCell key={String(column.accessorKey)}>
                    {column.cell ? column.cell(item) : String(item[column.accessorKey])}
                  </TableCell>
                ))}
                {renderActions && <TableCell align="right">{renderActions(item)}</TableCell>}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length + (renderActions ? 1 : 0)} align="center">
                  Arama kriterlerinize uygun veri bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına satır:"
      />
    </Paper>
  );
}

export default GenericTable;