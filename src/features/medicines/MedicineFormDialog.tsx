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
import type { Medicine } from '../../types/api';
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

      const payload: MedicineCreateRequest = {
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        quantity: qty,
        expiryDate, // YYYY-MM-DD
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        form: form.trim() || undefined,
        imageUrl,
      };

      await createMut.mutateAsync(payload);
      resetForm();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create medicine. Please try again.';
      setErrorMsg(msg);
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
