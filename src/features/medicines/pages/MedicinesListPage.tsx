import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { getAllMedicines } from '../../../services/medicines';
import type { Medicine } from '../../../types/api';
import { daysUntil } from '../../../utils/dateUtils';

function ExpiryChip({ expiryDate }: { expiryDate?: string }) {
  const d = daysUntil(expiryDate);
  if (d === undefined) return <Chip size="small" label="No expiry" color="default" />;
  if (d < 0) return <Chip size="small" label="Expired" color="error" />;
  if (d <= 7) return <Chip size="small" label={`Expiring in ${d}d`} color="warning" />;
  return <Chip size="small" label={`In ${d}d`} color="success" />;
}

export default function MedicinesListPage() {
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['medicines'],
    queryFn: getAllMedicines,
  });


  const filtered: Medicine[] = useMemo(() => {
    const list = data || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) => m.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Medicines
        </Typography>
        <Button
          onClick={() => refetch()}
          variant="outlined"
          startIcon={<RefreshIcon />}
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Search medicines"
            placeholder="Type a name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
        </Stack>
      </Paper>

      {isLoading ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography>Loading medicines...</Typography>
        </Stack>
      ) : isError ? (
        <Alert severity="error">
          {(error as any)?.message || 'Failed to load medicines'}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">No medicines found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => {
                  const qtyLow = m.quantity <= 5;
                  return (
                    <TableRow key={m.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={600}>{m.name}</Typography>
                          {m.category && (
                            <Typography variant="body2" color="text.secondary">
                              {m.category}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {m.profileName ? (
                          <Link component={RouterLink} to={`/app/profiles/${m.profileId}/medicines`}>
                            {m.profileName}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{m.dosage || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{m.quantity}</Typography>
                          {qtyLow && <Chip size="small" label="Low" color="warning" />}
                        </Stack>
                      </TableCell>
                      <TableCell>{m.expiryDate || '-'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={m.status}
                            color={m.status === 'ACTIVE' ? 'success' : 'default'}
                          />
                          <ExpiryChip expiryDate={m.expiryDate} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
