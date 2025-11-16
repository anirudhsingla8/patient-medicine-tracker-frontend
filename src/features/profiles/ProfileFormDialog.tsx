
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';

export type ProfileFormValues = {
  name: string;
};

type Props = {
  open: boolean;
  title?: string;
  submitLabel?: string;
  initialValues?: Partial<ProfileFormValues>;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: ProfileFormValues) => void | Promise<void>;
};

export default function ProfileFormDialog({
  open,
  title = 'Profile',
  submitLabel = 'Save',
  initialValues,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ProfileFormValues>({
    name: initialValues?.name ?? '',
  });

  const canSubmit = values.name.trim().length >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({ name: values.name.trim() });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Name"
            autoFocus
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            inputProps={{ maxLength: 100 }}
            helperText="Enter a profile name (e.g., John, Mom, Kid)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit || submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
