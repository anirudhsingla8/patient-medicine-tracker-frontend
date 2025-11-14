import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";

import { getMedicineById } from "../../services/medicines";
import {
  createSchedule,
  deleteSchedule,
  getSchedulesForMedicine,
  updateSchedule,
} from "../../services/schedules";
import type { Medicine, Schedule } from "../../types/api";
import ScheduleFormDialog from "./ScheduleFormDialog";
import type { ScheduleFormValues } from "./ScheduleFormDialog";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function SchedulesListPage() {
  const { medicineId } = useParams();
  const qc = useQueryClient();

  const {
    data: medicine,
    isLoading: isMedicineLoading,
    isError: isMedicineError,
    error: medicineError,
  } = useQuery<Medicine>({
    queryKey: ["medicine", medicineId],
    queryFn: () => getMedicineById(medicineId as string),
    enabled: !!medicineId,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Schedule[]>({
    queryKey: ["schedules", medicineId],
    queryFn: () => getSchedulesForMedicine(medicineId as string),
    enabled: !!medicineId,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Schedule | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: ScheduleFormValues) => createSchedule(medicineId as string, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules", medicineId] });
      setCreateOpen(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ScheduleFormValues> }) =>
      updateSchedule(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules", medicineId] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules", medicineId] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const onCreate = async (values: ScheduleFormValues) => {
    await createMut.mutateAsync(values);
  };

  const onUpdate = async (values: ScheduleFormValues) => {
    if (!selected) return;
    await updateMut.mutateAsync({ id: selected.id, values });
  };

  const onConfirmDelete = async () => {
    if (!selected) return;
    await deleteMut.mutateAsync(selected.id);
  };

  const backToProfileMedicines =
    medicine && medicine.profileId ? `/app/profiles/${medicine.profileId}/medicines` : "/app/medicines";

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack spacing={0.5}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.5 }}>
            <Link component={RouterLink} color="inherit" to="/app/dashboard">
              Dashboard
            </Link>
            <Link component={RouterLink} color="inherit" to="/app/profiles">
              Profiles
            </Link>
            {medicine?.profileId && (
              <Link component={RouterLink} color="inherit" to={backToProfileMedicines}>
                Medicines
              </Link>
            )}
            <Typography color="text.primary">Schedules</Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight={700}>
            {isMedicineLoading
              ? "Loading..."
              : isMedicineError
              ? "Schedules"
              : `Schedules • ${medicine?.name ?? "Medicine"}`}
          </Typography>
          {isMedicineError && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {(medicineError as any)?.message || "Failed to load medicine details"}
            </Alert>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={backToProfileMedicines}
            variant="text"
            startIcon={<ArrowBackIcon />}
          >
            Back to Medicines
          </Button>
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
            disabled={!medicineId}
          >
            New Schedule
          </Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          <Typography>Loading schedules...</Typography>
        </Stack>
      ) : isError ? (
        <Alert severity="error">{(error as any)?.message || "Failed to load schedules"}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell>Time of day</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No schedules found for this medicine.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (data || []).map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{s.timeOfDay}</Typography>
                    </TableCell>
                    <TableCell>{s.frequency}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={s.isActive ? "ACTIVE" : "INACTIVE"}
                        color={s.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => {
                            setSelected(s);
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
                            setSelected(s);
                            setDeleteOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create */}
      <ScheduleFormDialog
        open={createOpen}
        title="Create Schedule"
        submitLabel={createMut.isPending ? "Creating..." : "Create"}
        submitting={createMut.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      {/* Edit */}
      <ScheduleFormDialog
        open={editOpen}
        title="Edit Schedule"
        submitLabel={updateMut.isPending ? "Saving..." : "Save"}
        submitting={updateMut.isPending}
        initialValues={{
          timeOfDay: selected?.timeOfDay,
          frequency: selected?.frequency,
          isActive: selected?.isActive,
        }}
        onClose={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        onSubmit={onUpdate}
      />

      {/* Delete */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete schedule?"
        message={`This will permanently remove schedule at "${selected?.timeOfDay ?? ""}". This action cannot be undone.`}
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
