import { Box, Container, Typography, Button } from '@mui/material';

export default function NotFound() {
  return (
    <Container
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'neutral.50',
      }}
    >
      <Box sx={{ textAlign: 'center', spacing: 4 }}>
        <Typography variant="h1" sx={{ fontSize: 96, fontWeight: 300, color: 'neutral.900' }}>
          404
        </Typography>
        <Typography variant="h6" sx={{ color: 'neutral.600' }}>
          Page not found
        </Typography>
        <Typography variant="body2" sx={{ color: 'neutral.500' }}>
          The page you're looking for doesn't exist.
        </Typography>
        <Button
          href="/"
          sx={{
            mt: 6,
            py: 1,
            px: 2,
            color: 'neutral.500',
            '&:hover': { color: 'neutral.900' },
          }}
        >
          Return home
        </Button>
      </Box>
    </Container>
  );
}