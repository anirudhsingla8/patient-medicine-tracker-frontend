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
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { getAllMedicines } from '../../../services/medicines';
import type { Medicine } from '../../../types/api';
import { daysUntil } from '../../../utils/dateUtils';
import { alpha, useTheme } from '@mui/material/styles';

function ExpiryChip({ expiryDate }: { expiryDate?: string }) {
  const d = daysUntil(expiryDate);
  if (d === undefined) return <Chip size="small" label="No expiry" variant="outlined" />;
  if (d < 0) return <Chip size="small" label="Expired" color="error" variant="filled" />;
  if (d <= 7) return <Chip size="small" label={`Expiring in ${d}d`} color="warning" variant="filled" />;
  return <Chip size="small" label={`In ${d}d`} color="success" variant="outlined" />;
}

export default function MedicinesListPage() {
  const theme = useTheme();
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
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Medicines
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your medicine inventory and schedules.
          </Typography>
        </Box>
        <Button
          onClick={() => refetch()}
          variant="outlined"
          startIcon={<RefreshIcon />}
          disabled={isFetching}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
          }}
        >
          {isFetching ? 'Refreshing...' : 'Refresh List'}
        </Button>
      </Stack>

      <Paper sx={{ mb: 4, p: 2, borderRadius: 3 }}>
        <TextField
          placeholder="Search medicines by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
            }
          }}
        />
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          {(error as any)?.message || 'Failed to load medicines'}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto', borderRadius: 3, border: 'none', boxShadow: theme.shadows[2] }}>
          <Table size="medium" sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Profile</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Dosage</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No medicines found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m) => {
                  const qtyLow = m.quantity <= 5;
                  return (
                    <TableRow key={m.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={600} color="text.primary">{m.name}</Typography>
                          {m.category && (
                            <Chip
                              label={m.category}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                width: 'fit-content',
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: 'secondary.main',
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {m.profileName ? (
                          <Link
                            component={RouterLink}
                            to={`/app/profiles/${m.profileId}/medicines`}
                            sx={{
                              fontWeight: 500,
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {m.profileName}
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{m.dosage || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={500}>{m.quantity}</Typography>
                          {qtyLow && (
                            <Chip
                              size="small"
                              label="Low"
                              color="warning"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {m.expiryDate || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={m.status}
                            color={m.status === 'ACTIVE' ? 'success' : 'default'}
                            variant={m.status === 'ACTIVE' ? 'filled' : 'outlined'}
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
