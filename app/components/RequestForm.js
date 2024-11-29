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
  Tooltip
} from '@mui/material';
import { useWeb3 } from '../providers';

export default function RequestForm() {
  const { contract } = useWeb3();
  const [formData, setFormData] = useState({
    bloodType: '',
    units: '1',
    recipientName: '',
    age: '',
    contact: '',
    hospital: '',
    reason: ''
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
    if (!formData.units || formData.units < 1) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid number of units'
      });
      return false;
    }
    if (!formData.recipientName) {
      setStatus({
        type: 'error',
        message: 'Please enter recipient name'
      });
      return false;
    }
    if (!formData.age || formData.age < 0 || formData.age > 120) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid age'
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
    if (!formData.hospital) {
      setStatus({
        type: 'error',
        message: 'Please enter hospital name'
      });
      return false;
    }
    if (!formData.reason) {
      setStatus({
        type: 'error',
        message: 'Please enter reason for request'
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

      const totalAmount = parseInt(formData.units) * DONATION_AMOUNT;

      const tx = await contract.requestBlood(
        formData.bloodType,
        totalAmount,
        formData.recipientName,
        formData.age,
        formData.contact,
        formData.hospital,
        formData.reason
      );

      setStatus({
        type: 'info',
        message: 'Transaction submitted. Please wait for confirmation...'
      });

      await tx.wait();
      setStatus({
        type: 'success',
        message: 'Blood request submitted successfully!'
      });

      // Reset form
      setFormData({
        bloodType: '',
        units: '1',
        recipientName: '',
        age: '',
        contact: '',
        hospital: '',
        reason: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to submit request'
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Request Blood
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Each unit contains {DONATION_AMOUNT}ml of blood
        </Typography>

        {status.message && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Units"
                name="units"
                type="number"
                value={formData.units}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
                helperText={`Total amount: ${parseInt(formData.units || 0) * DONATION_AMOUNT}ml`}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipient Name"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                inputProps={{ min: 0, max: 120 }}
              />
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
              <TextField
                fullWidth
                label="Hospital Name"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Request"
                name="reason"
                multiline
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                required
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
                Submit Request
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
