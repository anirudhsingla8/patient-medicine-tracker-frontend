import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const setEmail = useAuthStore((s) => s.setEmail);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);

  const [email, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email, password }, { remember });
      setEmail(res.email ?? email);
      refreshAuth();
      const to = location?.state?.from?.pathname ?? '/app/dashboard';
      navigate(to, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: { xs: 4, md: 6 }, background: 'linear-gradient(180deg, #eef2ff 0%, #f5f7fb 100%)' }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', maxWidth: 440, borderRadius: 3 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Stack spacing={0.5} sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>Medicine Tracker</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to continue</Typography>
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
            autoComplete="current-password"
            fullWidth
          />
          <FormControlLabel
            control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
            label="Remember me"
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent={{ sm: 'space-between' }} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button component={RouterLink} to="/register" sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Create account
            </Button>
            <Button component={RouterLink} to="/forgot-password" sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Forgot password
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
