import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { extractErrorMessage } from '../../services/axiosClient';
import { forgotPassword } from '../../services/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email, newPassword: password }, { remember: true });
      navigate('/login', { replace: true, state: { message: 'Password changed successfully. Please sign in.' } });
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: { xs: 4, md: 6 }, background: 'linear-gradient(180deg, #eef2ff 0%, #f5f7fb 100%)' }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', maxWidth: 480, borderRadius: 3 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5} sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>Reset your password</Typography>
            <Typography variant="body2" color="text.secondary">Enter your email and a new password</Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            required
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            autoComplete="email"
            fullWidth
          />
          <TextField
            required
            type={showPassword ? 'text' : 'password'}
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            fullWidth
            helperText="At least 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            required
            type={showConfirm ? 'text' : 'password'}
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </Button>

          <Button component={RouterLink} to="/login" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Back to sign in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
