import { Box, Stack, Typography } from '@mui/material';
import { type SvgIconComponent } from '@mui/icons-material';

interface PlaceholderProps {
  Icon: SvgIconComponent;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export default function Placeholder({ Icon, title, subtitle, actions }: PlaceholderProps) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={1.5} alignItems="center">
        <Icon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h6" color="text.primary">
          {title}
        </Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
        {actions && <Box sx={{ pt: 1 }}>{actions}</Box>}
      </Stack>
    </Box>
  );
}
