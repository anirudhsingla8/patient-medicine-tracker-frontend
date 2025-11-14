import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { register } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setEmail = useAuthStore((s) => s.setEmail);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);

  const [email, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ email, password }, { remember: true });
      setEmail(res.email ?? email);
      refreshAuth();
      navigate('/app/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try a different email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: { xs: 4, md: 6 }, background: 'linear-gradient(180deg, #eef2ff 0%, #f5f7fb 100%)' }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', maxWidth: 480, borderRadius: 3 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5} sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>Medicine Tracker</Typography>
            <Typography variant="body2" color="text.secondary">Create your account</Typography>
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
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            fullWidth
            helperText="At least 6 characters"
          />
          <TextField
            required
            type="password"
            label="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <Button component={RouterLink} to="/login" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Already have an account? Sign in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
