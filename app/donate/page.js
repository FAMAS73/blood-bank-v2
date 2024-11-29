'use client';

import {
  Box,
  Container,
  Grid,
  useTheme
} from '@mui/material';
import DonationForm from '../components/DonationForm';
import InventoryDisplay from '../components/InventoryDisplay';

export default function DonatePage() {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DonationForm />
        </Grid>
        <Grid item xs={12} md={6}>
          <InventoryDisplay />
        </Grid>
      </Grid>
    </Container>
  );
}
