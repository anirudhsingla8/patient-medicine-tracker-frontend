import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link as RouterLink } from "react-router-dom";
import { createProfile, deleteProfile, getProfiles, updateProfile } from "../../services/profiles";
import type { Profile } from "../../types/api";
import ProfileFormDialog from "./ProfileFormDialog";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ProfilesListPage() {
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: { name: string }) => createProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      setCreateOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateProfile(id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Profiles
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => refetch()}
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="contained"
            startIcon={<AddIcon />}
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
        <Alert severity="error">{(error as any)?.message || "Failed to load profiles"}</Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {(data || []).length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Stack spacing={1.5} alignItems="center">
                <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography color="text.secondary">No profiles found.</Typography>
                <Button
                  onClick={() => setCreateOpen(true)}
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Create your first profile
                </Button>
              </Stack>
            </Paper>
          ) : (
            (data || []).map((p) => (
              <Paper
                key={p.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": { boxShadow: 3, transform: "translateY(-2px)" },
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PersonIcon color="primary" />
                    <Stack spacing={0.5} flex={1}>
                      <Typography fontWeight={600}>{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(p.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      component={RouterLink}
                      to={`/app/profiles/${p.id}/medicines`}
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => {
                        setSelected(p);
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
                        setSelected(p);
                        setDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))
          )}
        </Box>
      )}

      {/* Create */}
      <ProfileFormDialog
        open={createOpen}
        title="Create Profile"
        submitLabel={createMut.isPending ? "Creating..." : "Create"}
        submitting={createMut.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      {/* Edit */}
      <ProfileFormDialog
        open={editOpen}
        title="Edit Profile"
        submitLabel={updateMut.isPending ? "Saving..." : "Save"}
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
        message={`This will permanently remove "${selected?.name ?? ""}". This action cannot be undone.`}
        confirmLabel={deleteMut.isPending ? "Deleting..." : "Delete"}
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
