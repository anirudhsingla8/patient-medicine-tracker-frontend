import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MedicationIcon from '@mui/icons-material/Medication';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import MedicineFormDialog from '../MedicineFormDialog';
import MedicineEditDialog from '../MedicineEditDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';

import { getMedicinesForProfile, takeDose, deleteMedicine } from '../../../services/medicines';
import { getProfileById } from '../../../services/profiles';
import type { Medicine, Profile } from '../../../types/api';

function daysUntil(dateStr?: string) {
  if (!dateStr) return undefined;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function ExpiryChip({ expiryDate }: { expiryDate?: string }) {
  const d = daysUntil(expiryDate);
  if (d === undefined) return <Chip size="small" label="No expiry" color="default" />;
  if (d < 0) return <Chip size="small" label="Expired" color="error" />;
  if (d <= 7) return <Chip size="small" label={`Expiring in ${d}d`} color="warning" />;
  return <Chip size="small" label={`In ${d}d`} color="success" />;
}

export default function ProfileMedicinesListPage() {
  const { profileId } = useParams();
  const [query, setQuery] = useState('');
  const [takingId, setTakingId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<Medicine | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery<Profile>({
    queryKey: ['profile', profileId],
    queryFn: () => getProfileById(profileId as string),
    enabled: !!profileId,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Medicine[]>({
    queryKey: ['medicines', profileId],
    queryFn: () => getMedicinesForProfile(profileId as string),
    enabled: !!profileId,
  });

  const takeDoseMut = useMutation<Medicine, Error, string>({
    mutationKey: ['takeDose', profileId],
    mutationFn: (id: string) => takeDose(profileId as string, id),
    onMutate: (id: string) => {
      setTakingId(id);
    },
    onSettled: () => {
      setTakingId(null);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMut = useMutation<void, Error, string>({
    mutationKey: ['deleteMedicine', profileId],
    mutationFn: (id: string) => deleteMedicine(profileId as string, id),
    onSuccess: () => {
      refetch();
    },
    onSettled: () => {
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const onConfirmDelete = async () => {
    if (!selected) return;
    await deleteMut.mutateAsync(selected.id);
  };

  const filtered: Medicine[] = useMemo(() => {
    const list = data || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) => m.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Stack spacing={0.5}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.5 }}>
            <Link component={RouterLink} color="inherit" to="/app/dashboard">
              Dashboard
            </Link>
            <Link component={RouterLink} color="inherit" to="/app/profiles">
              Profiles
            </Link>
            <Typography color="text.primary">Medicines</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>
              {isProfileLoading
                ? 'Loading...'
                : isProfileError
                  ? 'Profile'
                  : `Medicines • ${profile?.name ?? 'Profile'}`}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            component={RouterLink}
            to="/app/profiles"
            variant="text"
            startIcon={<ArrowBackIcon />}
            sx={{ justifyContent: { xs: 'flex-start', sm: 'center' } }}
          >
            Back to Profiles
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAdd(true)}
            disabled={!profileId}
          >
            Add medicine
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
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
        <Alert severity="error">{(error as any)?.message || 'Failed to load medicines'}</Alert>
      ) : (
        <>
          {/* Desktop/Tablet Table View */}
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No medicines found for this profile.</Typography>
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
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<EditOutlinedIcon />}
                              onClick={() => {
                                setSelected(m);
                                setEditOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => {
                                setSelected(m);
                                setDeleteOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                            <Button
                              size="small"
                              component={RouterLink}
                              to={`/app/medicines/${m.id}/schedules`}
                              variant="outlined"
                              startIcon={<ScheduleIcon />}
                            >
                              Schedules
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<MedicationIcon />}
                              onClick={() => takeDoseMut.mutate(m.id)}
                              disabled={takingId === m.id}
                            >
                              {takingId === m.id ? '...' : 'Take'}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Card View */}
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filtered.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography color="text.secondary">No medicines found for this profile.</Typography>
              </Paper>
            ) : (
              filtered.map((m) => {
                const qtyLow = m.quantity <= 5;
                return (
                  <Paper key={m.id} sx={{ p: 2, borderRadius: 3 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography fontWeight={700} variant="h6">{m.name}</Typography>
                          {m.category && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {m.category}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          size="small"
                          label={m.status}
                          color={m.status === 'ACTIVE' ? 'success' : 'default'}
                          variant={m.status === 'ACTIVE' ? 'filled' : 'outlined'}
                        />
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary">Dosage</Typography>
                          <Typography variant="body2">{m.dosage || '-'}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary">Expiry</Typography>
                          <Typography variant="body2">{m.expiryDate || '-'}</Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: '1px solid #eee' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight={500}>Qty: {m.quantity}</Typography>
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
                        <ExpiryChip expiryDate={m.expiryDate} />
                      </Stack>

                      <Stack spacing={1}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<MedicationIcon />}
                          onClick={() => takeDoseMut.mutate(m.id)}
                          disabled={takingId === m.id}
                        >
                          {takingId === m.id ? 'Recording Dose...' : 'Take Dose'}
                        </Button>
                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<ScheduleIcon />}
                            component={RouterLink}
                            to={`/app/medicines/${m.id}/schedules`}
                          >
                            Schedule
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => {
                              setSelected(m);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ minWidth: 'auto' }}
                            onClick={() => {
                              setSelected(m);
                              setDeleteOpen(true);
                            }}
                          >
                            <DeleteOutlineIcon />
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        </>
      )}
      {profileId && (
        <MedicineFormDialog
          open={openAdd}
          profileId={profileId as string}
          onClose={() => setOpenAdd(false)}
        />
      )}

      {profileId && selected && (
        <MedicineEditDialog
          open={editOpen}
          profileId={profileId as string}
          medicine={selected}
          onClose={() => {
            setEditOpen(false);
            setSelected(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete medicine?"
        message={`This will permanently remove "${selected?.name ?? ''}". This action cannot be undone.`}
        confirmLabel={deleteMut.isPending ? 'Deleting...' : 'Delete'}
        loading={deleteMut.isPending}
        confirmColor="error"
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={onConfirmDelete}
      />
    </Box>
  );
}
