import { Box, Typography } from '@mui/material';
import { type SxProps, type Theme } from '@mui/material/styles';

export default function Logo({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
        PillPal
      </Typography>
    </Box>
  );
}
