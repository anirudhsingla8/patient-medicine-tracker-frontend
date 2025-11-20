import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { extractErrorMessage } from '../../utils/errorUtils';
import {
  createMedicine,
  uploadMedicineImage,
  type MedicineCreateRequest,
} from '../../services/medicines';

type Props = {
  open: boolean;
  profileId: string;
  onClose: () => void;
};

export default function MedicineFormDialog({ open, profileId, onClose }: Props) {
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [form, setForm] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [compositionRows, setCompositionRows] = useState<{ name: string; strengthValue: string; strengthUnit: string }[]>([]);

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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: MedicineCreateRequest) => createMedicine(profileId, payload),
    onSuccess: () => {
      // Refresh the profile medicines list
      qc.invalidateQueries({ queryKey: ['medicines', profileId] });
    },
  });

  function resetForm() {
    setName('');
    setDosage('');
    setQuantity(1);
    setExpiryDate('');
    setCategory('');
    setNotes('');
    setForm('');
    setFile(null);
    setCompositionRows([]);
    setErrorMsg(null);
  }

  const handleClose = () => {
    if (!createMut.isPending) {
      resetForm();
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
        // Upload selected image first
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
          strengthValue: isNaN(Number(r.strengthValue)) ? r.strengthValue : Number(r.strengthValue),
          strengthUnit: r.strengthUnit,
        }));

      const payload: MedicineCreateRequest = {
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

      await createMut.mutateAsync(payload);
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add medicine</DialogTitle>
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
            <Typography variant="subtitle1" fontWeight={600}>Composition</Typography>
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
                  <IconButton aria-label="Remove" color="error" onClick={() => removeCompositionRow(idx)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button variant="outlined" onClick={addCompositionRow}>Add component</Button>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="outlined" component="label">
                Choose image
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
              <span style={{ color: '#666' }}>{file ? file.name : 'No file selected'}</span>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={createMut.isPending}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMut.isPending}
          >
            {createMut.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
