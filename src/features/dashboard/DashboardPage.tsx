import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../../services/auth';

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Backend Health</Typography>
          <Button
            onClick={() => refetch()}
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>

        {isLoading ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={20} />
            <Typography>Loading server status...</Typography>
          </Stack>
        ) : isError ? (
          <Alert severity="error">
            {(error as any)?.message || 'Failed to load health status'}
          </Alert>
        ) : (
          <Stack spacing={1}>
            <Typography>
              Status: <strong>{data?.status ?? 'UNKNOWN'}</strong>
            </Typography>
            {data?.service && (
              <Typography>
                Service: <strong>{data.service}</strong>
              </Typography>
            )}
            {data?.version && (
              <Typography>
                Version: <strong>{data.version}</strong>
              </Typography>
            )}
            {data?.timestamp && (
              <Typography>
                Timestamp: <strong>{String(data.timestamp)}</strong>
              </Typography>
            )}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
