'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useWeb3 } from '../providers';
import { ethers } from 'ethers';

export default function InventoryDisplay() {
  const theme = useTheme();
  const { contract, account } = useWeb3();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const DONATION_AMOUNT = 450; // Fixed donation amount in ml

  useEffect(() => {
    const fetchInventory = async () => {
      if (!contract || !account) {
        setLoading(false);
        return;
      }

      try {
        const inventoryData = [];
        for (const type of bloodTypes) {
          try {
            // Add delay between calls to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const quantity = await contract.getBloodTypeQuantity(type);
            const quantityNum = quantity ? parseInt(ethers.formatUnits(quantity, 0)) : 0;
            
            inventoryData.push({
              type,
              quantity: quantityNum.toString(),
              units: Math.floor(quantityNum / DONATION_AMOUNT)
            });
          } catch (error) {
            console.error(`Error fetching quantity for ${type}:`, error);
            inventoryData.push({
              type,
              quantity: '0',
              units: 0
            });
          }
        }
        setInventory(inventoryData);
        setError(null);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to fetch inventory data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    // Set up event listeners for real-time updates
    if (contract) {
      try {
        const donationFilter = contract.filters.BloodDonated();
        const requestFilter = contract.filters.BloodRequested();

        const handleEvent = () => {
          console.log('Event received, updating inventory...');
          fetchInventory();
        };

        contract.on(donationFilter, handleEvent);
        contract.on(requestFilter, handleEvent);

        return () => {
          try {
            contract.off(donationFilter, handleEvent);
            contract.off(requestFilter, handleEvent);
          } catch (error) {
            console.error('Error removing event listeners:', error);
          }
        };
      } catch (error) {
        console.error('Error setting up event listeners:', error);
      }
    }
  }, [contract, account]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          Please connect your wallet to view blood inventory
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: { xs: 2, md: 0 } }}>
      <Typography variant="h5" gutterBottom>
        Blood Inventory
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        1 unit = {DONATION_AMOUNT}ml
      </Typography>
      <Grid container spacing={2}>
        {inventory.map(({ type, quantity, units }) => (
          <Grid item xs={6} sm={4} key={type}>
            <Tooltip title={`Total: ${quantity}ml`}>
              <Card 
                sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    color="primary"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {type}
                  </Typography>
                  <Typography variant="h4">
                    {units}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    units available
                  </Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
