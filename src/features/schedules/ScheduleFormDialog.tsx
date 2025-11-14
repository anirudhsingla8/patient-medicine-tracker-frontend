import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

export type ScheduleFormValues = {
  timeOfDay: string; // HH:mm:ss
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM";
  isActive: boolean;
};

type Props = {
  open: boolean;
  title?: string;
  submitLabel?: string;
  initialValues?: Partial<ScheduleFormValues>;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => void | Promise<void>;
};

const TIME_REGEX =
  /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/; // 00:00:00 - 23:59:59

export default function ScheduleFormDialog({
  open,
  title = "Schedule",
  submitLabel = "Save",
  initialValues,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ScheduleFormValues>({
    timeOfDay: initialValues?.timeOfDay ?? "08:00:00",
    frequency: initialValues?.frequency ?? "DAILY",
    isActive: initialValues?.isActive ?? true,
  });

  useEffect(() => {
    setValues({
      timeOfDay: initialValues?.timeOfDay ?? "08:00:00",
      frequency: initialValues?.frequency ?? "DAILY",
      isActive: initialValues?.isActive ?? true,
    });
  }, [initialValues, open]);

  const timeError = useMemo(() => {
    const t = values.timeOfDay.trim();
    if (!t) return "Time is required";
    if (!TIME_REGEX.test(t)) return "Use HH:mm:ss (e.g., 08:00:00)";
    return undefined;
  }, [values.timeOfDay]);

  const canSubmit = !timeError && !!values.frequency;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      timeOfDay: values.timeOfDay.trim(),
      frequency: values.frequency,
      isActive: values.isActive,
    });
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Time of day"
            placeholder="08:00:00"
            value={values.timeOfDay}
            onChange={(e) => setValues((v) => ({ ...v, timeOfDay: e.target.value }))}
            error={!!timeError}
            helperText={timeError ?? "Enter time in 24h HH:mm:ss"}
            inputProps={{ inputMode: "numeric", maxLength: 8 }}
            required
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel id="frequency-label">Frequency</InputLabel>
            <Select
              labelId="frequency-label"
              label="Frequency"
              value={values.frequency}
              onChange={(e) =>
                setValues((v) => ({ ...v, frequency: e.target.value as ScheduleFormValues["frequency"] }))
              }
            >
              <MenuItem value="DAILY">Daily</MenuItem>
              <MenuItem value="WEEKLY">Weekly</MenuItem>
              <MenuItem value="BIWEEKLY">Every 2 weeks</MenuItem>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
              <MenuItem value="CUSTOM">Custom</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Choose how often this dose should repeat.
            </Typography>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={values.isActive}
                onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit || submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
