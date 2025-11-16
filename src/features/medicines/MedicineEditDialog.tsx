
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DeleteOutline as DeleteOutlineIcon } from '@mui/icons-material';

import {
  updateMedicine,
  uploadMedicineImage,
  type MedicineUpdateRequest,
} from '../../services/medicines';
import type { Medicine } from '../../types/api';

type Props = {
  open: boolean;
  profileId: string;
  medicine: Medicine;
  onClose: () => void;
};

export default function MedicineEditDialog({ open, profileId, medicine, onClose }: Props) {
  const qc = useQueryClient();

  const [name, setName] = useState(medicine.name ?? '');
  const [dosage, setDosage] = useState(medicine.dosage ?? '');
  const [quantity, setQuantity] = useState<number | ''>(medicine.quantity ?? 1);
  const [expiryDate, setExpiryDate] = useState(medicine.expiryDate ?? '');
  const [category, setCategory] = useState(medicine.category ?? '');
  const [notes, setNotes] = useState(medicine.notes ?? '');
  const [form, setForm] = useState(medicine.form ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [compositionRows, setCompositionRows] = useState(
    (medicine.composition || []).map((c) => ({
      name: c.name ?? '',
      strengthValue: String(c.strengthValue ?? ''),
      strengthUnit: c.strengthUnit ?? '',
    }))
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addCompositionRow = () =>
    setCompositionRows((rows) => [...rows, { name: '', strengthValue: '', strengthUnit: '' }]);

  const updateCompositionRow = (
    index: number,
    key: 'name' | 'strengthValue' | 'strengthUnit',
    value: string
  ) => {
    setCompositionRows((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const removeCompositionRow = (index: number) => {
    setCompositionRows((rows) => rows.filter((_, i) => i !== index));
  };

  const updateMut = useMutation({
    mutationFn: (payload: MedicineUpdateRequest) =>
      updateMedicine(profileId, medicine.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines', profileId] });
      onClose();
    },
  });

  const handleClose = () => {
    if (!updateMut.isPending) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (!expiryDate) {
      setErrorMsg('Expiry date is required.');
      return;
    }
    const qty = typeof quantity === 'number' ? quantity : parseInt(String(quantity || '0'), 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      setErrorMsg('Quantity must be a positive number.');
      return;
    }

    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadMedicineImage(file);
      }

      const compositionPayload = compositionRows
        .map((r) => ({
          name: r.name.trim(),
          strengthValue: r.strengthValue.trim(),
          strengthUnit: r.strengthUnit.trim(),
        }))
        .filter((r) => r.name && r.strengthValue && r.strengthUnit)
        .map((r) => ({
          name: r.name,
          strengthValue: isNaN(Number(r.strengthValue))
            ? r.strengthValue
            : Number(r.strengthValue),
          strengthUnit: r.strengthUnit,
        }));

      const payload: MedicineUpdateRequest = {
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        quantity: qty,
        expiryDate, // YYYY-MM-DD
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        form: form.trim() || undefined,
        imageUrl,
        ...(compositionPayload.length ? { composition: compositionPayload } : {}),
      };

      await updateMut.mutateAsync(payload);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update medicine. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit medicine</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Dosage"
              placeholder="e.g., 500mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              fullWidth
            />
            <TextField
              label="Quantity"
              type="number"
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              required
              fullWidth
            />
            <TextField
              label="Expiry date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
            />
            <TextField
              label="Form"
              placeholder="e.g., Tablet, Syrup"
              value={form}
              onChange={(e) => setForm(e.target.value)}
              fullWidth
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <Typography variant="subtitle1" fontWeight={600}>
              Composition
            </Typography>
            <Stack spacing={1}>
              {compositionRows.map((row, idx) => (
                <Stack
                  key={idx}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <TextField
                    label="Component name"
                    value={row.name}
                    onChange={(e) => updateCompositionRow(idx, 'name', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Strength value"
                    value={row.strengthValue}
                    onChange={(e) => updateCompositionRow(idx, 'strengthValue', e.target.value)}
                    sx={{ minWidth: 140 }}
                  />
                  <TextField
                    label="Unit"
                    value={row.strengthUnit}
                    onChange={(e) => updateCompositionRow(idx, 'strengthUnit', e.target.value)}
                    sx={{ minWidth: 120 }}
                  />
                  <IconButton
                    aria-label="Remove"
                    color="error"
                    onClick={() => removeCompositionRow(idx)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button variant="outlined" onClick={addCompositionRow}>
                Add component
              </Button>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="outlined" component="label" disabled={updateMut.isPending}>
                Change image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                  }}
                />
              </Button>
              <span style={{ color: '#666' }}>{file ? file.name : 'No new file selected'}</span>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={updateMut.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={updateMut.isPending}>
            {updateMut.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
