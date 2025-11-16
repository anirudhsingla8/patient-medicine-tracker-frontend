
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { login } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string }; message?: string } };
  const setEmail = useAuthStore((s) => s.setEmail);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);

  const [email, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (err) {
      const msg =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue to PillPal
        </Typography>
      </Stack>

      {location?.state?.message && <Alert severity="success">{location.state.message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
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
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          fullWidth
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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
            label="Remember me"
          />
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Stack>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          disableElevation
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link component={RouterLink} to="/register" fontWeight={600}>
          Sign up
        </Link>
      </Typography>
    </AuthLayout>
  );
}
