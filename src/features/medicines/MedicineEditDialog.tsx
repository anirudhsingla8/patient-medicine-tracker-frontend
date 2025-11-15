import { useEffect, useState } from 'react';
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
  updateMedicine,
  uploadMedicineImage,
  type MedicineUpdateRequest,
} from '../../services/medicines';

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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(medicine.name ?? '');
    setDosage(medicine.dosage ?? '');
    setQuantity(medicine.quantity ?? 1);
    setExpiryDate(medicine.expiryDate ?? '');
    setCategory(medicine.category ?? '');
    setNotes(medicine.notes ?? '');
    setForm(medicine.form ?? '');
    setFile(null);
    setErrorMsg(null);
  }, [open, medicine]);

  const updateMut = useMutation({
    mutationFn: (payload: MedicineUpdateRequest) => updateMedicine(profileId, medicine.id, payload),
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

      const payload: MedicineUpdateRequest = {
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        quantity: qty,
        expiryDate, // YYYY-MM-DD
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        form: form.trim() || undefined,
        imageUrl,
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
          <Button onClick={handleClose} disabled={updateMut.isPending}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMut.isPending}
          >
            {updateMut.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
