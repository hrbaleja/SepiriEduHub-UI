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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Button
} from '@mui/material';
import {
  Search,
  Download,
  Visibility,
  FilterList,
  Pages as CertificateIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ApiService from '../services';

function ViewCertificates() {
  const { enqueueSnackbar } = useSnackbar();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load certificates
      const certsData = await ApiService.getCertificates();
      console.log('Certificates data:', certsData); // Debug log
      
      // Handle different response formats
      const certificatesArray = Array.isArray(certsData) 
        ? certsData 
        : (certsData.certificates || certsData.data || []);
      
      setCertificates(certificatesArray);
      
      // Load programs
      try {
        const progsData = await ApiService.getPrograms();
        const programsArray = Array.isArray(progsData)
          ? progsData
          : (progsData.programs || progsData.data || []);
        setPrograms(programsArray);
      } catch (err) {
        console.log('Programs not available:', err);
        setPrograms([]);
      }
      
      
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load certificates');
      enqueueSnackbar('Failed to load data', { variant: 'error' });
      // Set empty arrays to prevent filter errors
      setCertificates([]);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (serialNumber) => {
    window.open(ApiService.getDownloadUrl(serialNumber), '_blank');
    enqueueSnackbar('Certificate download started', { variant: 'success' });
  };

  const filteredCertificates = Array.isArray(certificates) ? certificates.filter(cert => {
    const matchesSearch = 
      cert.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.participantEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = !filterProgram || cert.programCode === filterProgram;
    
    return matchesSearch && matchesProgram;
  }) : [];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterProgram('');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          View Certificates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse and download all issued certificates
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
          <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Program</InputLabel>
              <Select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                label="Program"
              >
                <MenuItem value="">All Programs</MenuItem>
                {programs.map((prog) => (
                  <MenuItem key={prog.code} value={prog.code}>
                    {prog.code} - {prog.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.lighter' }}>
            <Typography variant="h4" fontWeight="bold">
              {filteredCertificates.length??0}
            </Typography>
            <Typography variant="body2">Matching Certificates</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
            <Typography variant="h4" fontWeight="bold">
              {certificates.length??0}
            </Typography>
            <Typography variant="body2">Total Certificates</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.lighter' }}>
            <Typography variant="h4" fontWeight="bold">
              {programs.length??0}
            </Typography>
            <Typography variant="body2">Programs</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Certificates Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600}>
            Certificates ({filteredCertificates.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredCertificates.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <CertificateIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No certificates found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {certificates.length === 0 
                ? 'Generate certificates to see them here'
                : 'Try adjusting your filters'}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Participant</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Program</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Conducted At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertificates.map((cert, index) => (
                  <TableRow key={cert.serialNumber} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {cert.participantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cert.participantEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={cert.programCode} 
                        size="small" 
                        color="primary"
                        sx={{ mr: 0.5, fontWeight: 'bold' }}
                      />
                      <Typography variant="caption" display="block">
                        {cert.programName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cert.collegeName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="caption" 
                        fontFamily="monospace"
                        sx={{ 
                          bgcolor: 'warning.lighter',
                          p: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        {cert.serialNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownload(cert.serialNumber)}
                        title="Download Certificate"
                      >
                        <Download />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default ViewCertificates;