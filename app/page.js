'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useWeb3 } from './providers';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function Home() {
  const { contract, account } = useWeb3();
  const [stats, setStats] = useState({
    totalDonors: '0',
    totalDonations: '0',
    totalRequests: '0'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!contract || !account) {
        setLoading(false);
        return;
      }

      try {
        // Add delay between calls to avoid rate limiting
        const donors = await contract.getTotalDonors();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const donations = await contract.getTotalDonations();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const requests = await contract.getTotalRequests();

        // Convert BigNumbers to strings
        setStats({
          totalDonors: donors ? ethers.formatUnits(donors, 0) : '0',
          totalDonations: donations ? ethers.formatUnits(donations, 0) : '0',
          totalRequests: requests ? ethers.formatUnits(requests, 0) : '0'
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to fetch statistics. Please make sure your wallet is connected and you are on the correct network.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Set up event listeners for real-time updates
    if (contract) {
      try {
        const donorFilter = contract.filters.DonorRegistered();
        const donationFilter = contract.filters.BloodDonated();
        const requestFilter = contract.filters.BloodRequested();

        const handleEvent = () => {
          console.log('Event received, updating stats...');
          fetchStats();
        };

        contract.on(donorFilter, handleEvent);
        contract.on(donationFilter, handleEvent);
        contract.on(requestFilter, handleEvent);

        return () => {
          try {
            contract.off(donorFilter, handleEvent);
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

  const renderStat = (title, value) => (
    <Grid item xs={12} md={4}>
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={60}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Typography variant="h3">
              {value}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!account && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please connect your wallet to view blood bank statistics
        </Alert>
      )}

      <Grid container spacing={3}>
        {renderStat('Total Donors', stats.totalDonors)}
        {renderStat('Total Donations', stats.totalDonations)}
        {renderStat('Total Requests', stats.totalRequests)}
      </Grid>

      <Paper sx={{ mt: 4, p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Decentralized Blood Bank Management System
        </Typography>
        <Typography variant="body1" color="textSecondary">
          A transparent and secure platform for managing blood donations using blockchain technology.
          Each donation is standardized to 450ml according to Thai Red Cross standards.
          Connect your wallet to start donating or requesting blood.
        </Typography>
      </Paper>
    </Container>
  );
}
