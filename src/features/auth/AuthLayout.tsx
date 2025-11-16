
import { Box, Paper, Stack } from '@mui/material';
import Logo from '../../components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        sx={{
          p: { xs: 2.5, sm: 4 },
          width: '100%',
          maxWidth: 440,
        }}
      >
        <Stack spacing={3}>
          <Logo sx={{ justifyContent: 'center' }} />
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
