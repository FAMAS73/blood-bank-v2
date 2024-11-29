'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { useWeb3 } from '../providers';

export default function DonationForm() {
  const { contract } = useWeb3();
  const [formData, setFormData] = useState({
    bloodType: '',
    donorName: '',
    age: '',
    contact: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const DONATION_AMOUNT = 450; // Fixed donation amount in ml

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.bloodType) {
      setStatus({
        type: 'error',
        message: 'Please select a blood type'
      });
      return false;
    }
    if (!formData.donorName) {
      setStatus({
        type: 'error',
        message: 'Please enter your name'
      });
      return false;
    }
    if (!formData.age || formData.age < 17 || formData.age > 70) {
      setStatus({
        type: 'error',
        message: 'Donor must be between 17 and 70 years old'
      });
      return false;
    }
    if (!formData.contact || formData.contact.length < 10) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid contact number'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validateForm()) {
      return;
    }

    try {
      if (!contract) {
        throw new Error('Please connect your wallet first');
      }

      const tx = await contract.donate(
        formData.bloodType,
        DONATION_AMOUNT,
        formData.donorName,
        formData.age,
        formData.contact
      );

      setStatus({
        type: 'info',
        message: 'Transaction submitted. Please wait for confirmation...'
      });

      await tx.wait();
      setStatus({
        type: 'success',
        message: 'Donation registered successfully!'
      });

      // Reset form
      setFormData({
        bloodType: '',
        donorName: '',
        age: '',
        contact: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to register donation'
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Register Blood Donation
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Standard donation amount: {DONATION_AMOUNT}ml
        </Typography>

        {status.message && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  label="Blood Type"
                >
                  {bloodTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Donor Name"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Tooltip title="Donor must be between 17 and 70 years old">
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 17, max: 70 }}
                  helperText="Must be between 17-70 years"
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                helperText="Enter a valid phone number"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Register Donation
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
