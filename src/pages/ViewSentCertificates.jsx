import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  Visibility,
  FilterList,
  Assignment as CertificateIcon,
  Email,
  Phone,
  Person
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ApiService from '../services';

function ViewSentCertificates() {
  const { enqueueSnackbar } = useSnackbar();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    programName: '',
    emailSent: '',
    page: 1,
    limit: 25
  });
  const [total, setTotal] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, [filters]);

  const loadCertificates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '') {
          delete params[key];
        }
      });

      const response = await ApiService.getSentCertificates(params);
      setCertificates(response.certificates || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Error loading sent certificates:', err);
      setError('Failed to load sent certificates');
      enqueueSnackbar('Failed to load sent certificates', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = async (certificate) => {
    try {
      const response = await ApiService.getSentCertificateBySerial(certificate.serialNumber);
      setSelectedCertificate(response.certificate);
      setDetailsOpen(true);
    } catch (err) {
      enqueueSnackbar('Failed to load certificate details', { variant: 'error' });
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, q: searchTerm, page: 1 }));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await ApiService.seedSentCertificates();
      enqueueSnackbar('Sample data seeded successfully', { variant: 'success' });
      loadCertificates(); // Reload the data
    } catch (err) {
      console.error('Error seeding data:', err);
      enqueueSnackbar('Failed to seed sample data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CertificateIcon sx={{ mr: 1 }} />
        Sent Certificates
      </Typography>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, email, phone, serial..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Name"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Phone"
              value={filters.phone}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleSeedData}
              disabled={loading}
            >
              Seed Test Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Certificates Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Serial Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Program</TableCell>
                <TableCell>Seminar Date</TableCell>
                <TableCell>Email Sent</TableCell>
                <TableCell>Generated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No sent certificates found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => (
                  <TableRow key={cert._id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {cert.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{cert.participantName}</TableCell>
                    <TableCell>{cert.email || cert.Email}</TableCell>
                    <TableCell>{cert.mobileNo}</TableCell>
                    <TableCell>{cert.programName}</TableCell>
                    <TableCell>{formatDate(cert.seminarDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={cert.emailSent ? 'Yes' : 'No'}
                        color={cert.emailSent ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(cert.generatedAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewDetails(cert)}
                        color="primary"
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {total > filters.limit && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={Math.ceil(total / filters.limit)}
              page={filters.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Certificate Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Certificate Details</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  value={selectedCertificate.serialNumber}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Participant Name"
                  value={selectedCertificate.participantName}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={selectedCertificate.email || selectedCertificate.Email}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={selectedCertificate.mobileNo}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Program Name"
                  value={selectedCertificate.programName}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Seminar Date"
                  value={formatDate(selectedCertificate.seminarDate)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Sent"
                  value={selectedCertificate.emailSent ? 'Yes' : 'No'}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Generated At"
                  value={formatDate(selectedCertificate.generatedAt)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PDF File"
                  value={selectedCertificate.pdfFile}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewSentCertificates;