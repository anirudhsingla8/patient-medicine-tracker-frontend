
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

import {
  createProfile,
  deleteProfile,
  getProfiles,
  updateProfile,
} from '../../services/profiles';
import type { Profile } from '../../types/api';
import ProfileFormDialog from './ProfileFormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import Placeholder from '../../components/Placeholder';

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Placeholder
      Icon={PeopleIcon}
      title="No profiles found"
      subtitle="Get started by creating a new profile for yourself or a family member."
      actions={
        <Button onClick={onCreate} variant="contained" startIcon={<AddIcon />}>
          Create Profile
        </Button>
      }
    />
  );
}

export default function ProfilesListPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: getProfiles,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: { name: string }) => createProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      setCreateOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateProfile(id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles'] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const onCreate = async (values: { name: string }) => {
    await createMut.mutateAsync(values);
  };

  const onUpdate = async (values: { name: string }) => {
    if (!selected) return;
    await updateMut.mutateAsync({ id: selected.id, name: values.name });
  };

  const onConfirmDelete = async () => {
    if (!selected) return;
    await deleteMut.mutateAsync(selected.id);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight={700}>
          Profiles
        </Typography>
        <Stack direction="row" spacing={1} alignSelf={{ xs: 'flex-end', sm: 'auto' }}>
          <Button
            onClick={() => refetch()}
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
          >
            New Profile
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography>Loading profiles...</Typography>
        </Stack>
      ) : isError ? (
        <Alert severity="error">{(error as any)?.message || 'Failed to load profiles'}</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {(data || []).length === 0 ? (
            <EmptyState onCreate={() => setCreateOpen(true)} />
          ) : (
            (data || []).map((p) => (
              <Card key={p.id}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                    <PeopleIcon color="primary" />
                    <Stack spacing={0.5} flex={1}>
                      <Typography fontWeight={600}>{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(p.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                  <Button
                    component={RouterLink}
                    to={`/app/profiles/${p.id}/medicines`}
                    size="small"
                    startIcon={<VisibilityIcon />}
                  >
                    View Medicines
                  </Button>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelected(p);
                        setEditOpen(true);
                      }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelected(p);
                        setDeleteOpen(true);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Create */}
      <ProfileFormDialog
        open={createOpen}
        title="Create Profile"
        submitLabel={createMut.isPending ? 'Creating...' : 'Create'}
        submitting={createMut.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      {/* Edit */}
      <ProfileFormDialog
        key={selected?.id}
        open={editOpen}
        title="Edit Profile"
        submitLabel={updateMut.isPending ? 'Saving...' : 'Save'}
        submitting={updateMut.isPending}
        initialValues={{ name: selected?.name }}
        onClose={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        onSubmit={onUpdate}
      />

      {/* Delete */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete profile?"
        message={`This will permanently remove "${
          selected?.name ?? ''
        }". This action cannot be undone.`}
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
