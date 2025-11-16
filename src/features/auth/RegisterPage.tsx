
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { register } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from './AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setEmail = useAuthStore((s) => s.setEmail);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);

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
    } catch (err) {
      const msg =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        'Registration failed. Please try a different email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start tracking your medications with PillPal
        </Typography>
      </Stack>

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
          label="Confirm password"
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          disableElevation
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
