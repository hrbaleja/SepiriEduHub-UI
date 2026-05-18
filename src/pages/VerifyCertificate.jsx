import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Error as ErrorIcon,
  Download,
  Verified
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ApiService from '../services/api';

function VerifyCertificate() {
  const { enqueueSnackbar } = useSnackbar();
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!serialNumber.trim()) {
      enqueueSnackbar('Please enter a serial number', { variant: 'warning' });
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCertificate(null);
      
      const data = await ApiService.verifyCertificate(serialNumber.trim());
      setCertificate(data.certificate);
      enqueueSnackbar('Certificate verified successfully', { variant: 'success' });
    } catch (err) {
      setError(err.response?.data?.error || 'Certificate not found');
      setCertificate(null);
      enqueueSnackbar('Certificate not found', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (certificate) {
      window.open(ApiService.getDownloadUrl(certificate.serialNumber), '_blank');
      enqueueSnackbar('Download started', { variant: 'success' });
    }
  };

  const handleReset = () => {
    setSerialNumber('');
    setCertificate(null);
    setError('');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Verified sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Verify Certificate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the certificate serial number to verify its authenticity
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: 4, mb: 4, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleVerify}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                placeholder="SE-MCX-202402-ABC12345"
                required
                autoFocus
                disabled={loading}
                InputProps={{
                  style: { fontFamily: 'monospace', fontSize: '1.1rem' }
                }}
                helperText="Format: SE-XXX-YYYYMM-XXXXXXXX"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                sx={{
                  py: 1.5,
                }}
              >
                {loading ? 'Verifying...' : 'Verify Certificate'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleReset}
                sx={{ py: 1.5 }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
          icon={<ErrorIcon />}
          onClose={() => setError('')}
        >
          <Typography variant="h6" gutterBottom>
            Certificate Not Found
          </Typography>
          <Typography variant="body2">
            {error}. Please check the serial number and try again.
          </Typography>
        </Alert>
      )}

      {/* Verification Result */}
      {certificate && (
        <Card 
          sx={{ 
            maxWidth: 800, 
            mx: 'auto',
            border: '2px solid',
            borderColor: 'success.main',
            boxShadow: 3
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'success.main', 
              color: 'white', 
              p: 3, 
              textAlign: 'center' 
            }}
          >
            <CheckCircle sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              ✓ Certificate Verified
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              This certificate is valid and authentic
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Serial Number */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    bgcolor: 'warning.lighter', 
                    p: 2, 
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'warning.main'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Certificate Number
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {certificate.serialNumber}
                  </Typography>
                </Box>
              </Grid>

              {/* Participant Info */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Participant Name
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {certificate.participantName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Email Address
                </Typography>
                <Typography variant="body1">
                  {certificate.participantEmail}
                </Typography>
              </Grid>

              {/* Program Info */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Program
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={certificate.programCode} 
                    color="primary" 
                    sx={{ mr: 1, fontWeight: 'bold' }}
                  />
                  <Typography variant="body1" display="inline">
                    {certificate.programName}
                  </Typography>
                </Box>
              </Grid>

              {/* Institute Info */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Conducted At
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {certificate.collegeName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Issue Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>

              {/* Collaboration */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>In collaboration with:</strong> Sepiri EduHub
                  </Typography>
                </Alert>
              </Grid>

              {/* Download Button */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Download />}
                  onClick={handleDownload}
                  sx={{ mt: 2 }}
                >
                  Download Certificate
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!certificate && !error && (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            How to Verify
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Enter the certificate serial number in the format: SE-XXX-YYYYMM-XXXXXXXX
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Click "Verify Certificate" button
              </Typography>
            </li>
            <li>
              <Typography variant="body2" sx={{ mb: 1 }}>
                View the certificate details if valid
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Download the certificate if needed
              </Typography>
            </li>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default VerifyCertificate;