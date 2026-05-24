import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Send,
  CheckCircle,
  Error as ErrorIcon,
  Download,
  Close
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ApiService from '../services';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

function GenerateCertificates() {
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await ApiService.getPrograms();
      setPrograms(data.programs || []);
    } catch (err) {
      console.error('Failed to load programs:', err);
      enqueueSnackbar('Failed to load programs', { variant: 'error' });
    }
  };



  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          processParticipants(result.data);
          setUploading(false);
        },
        error: (err) => {
          setError(`CSV parsing error: ${err.message}`);
          setUploading(false);
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          processParticipants(jsonData);
        } catch (err) {
          setError(`Excel parsing error: ${err.message}`);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      setUploading(false);
    }

    // Clear file input
    event.target.value = '';
  };

  const processParticipants = (data) => {
    const validParticipants = data.filter(row => {
      return row.name && 
             row.email && 
             row.email.includes('@') && 
             row.name.trim() !== '';
    });

    if (validParticipants.length === 0) {
      setError('No valid participants found. Please ensure CSV/Excel has "name" and "email" columns.');
      return;
    }

    setParticipants(validParticipants);
    enqueueSnackbar(`${validParticipants.length} participants loaded successfully`, { 
      variant: 'success' 
    });
  };

  const handleRemoveParticipant = (index) => {
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated);
    enqueueSnackbar('Participant removed', { variant: 'info' });
  };

  const handleClearAll = () => {
    setParticipants([]);
    setSelectedProgram('');
    setResults(null);
    setError('');
  };

  const handleGenerate = async () => {
    // Validation
    if (!selectedProgram) {
      setError('Please select a program');
      return;
    }

    if (participants.length === 0) {
      setError('Please upload participants');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ApiService.generateCertificates({
        participants,
        programCode: selectedProgram
      });

      setResults(response.results);
      setShowResults(true);
      enqueueSnackbar(`Successfully generated ${response.results.successful} certificates!`, { 
        variant: 'success' 
      });

      // Clear form after success
      setParticipants([]);
      setSelectedProgram('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate certificates';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedProgramData = programs.find(p => p.code === selectedProgram);


  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Generate Certificates
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Create and send certificates to participants
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Program Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Step 1: Select Program
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Program *</InputLabel>
          <Select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            label="Program *"
          >
            <MenuItem value="">
              <em>Select a program</em>
            </MenuItem>
            {programs.map((program) => (
              <MenuItem key={program.code} value={program.code}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={program.code} 
                    size="small" 
                    color="primary"
                    sx={{ fontWeight: 'bold', minWidth: 70 }}
                  />
                  <Typography>{program.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProgramData && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Selected:</strong> {selectedProgramData.name} ({selectedProgramData.code})
            <br />
            <strong>Certificate Serial Format:</strong> SE-{selectedProgramData.code}-YYYYMM-XXXXXXXX
          </Alert>
        )}
      </Paper>



      {/* File Upload */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Step 2: Upload Participants
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload a CSV or Excel file with columns: <strong>name</strong> and <strong>email</strong>
        </Typography>

        <Button
          component="label"
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload CSV / Excel'}
          <input
            type="file"
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />
        </Button>

        {participants.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${participants.length} participants loaded`} 
              color="success" 
              icon={<CheckCircle />}
            />
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>CSV/Excel Format:</strong>
          <br />
          First row: name, email
          <br />
          Example: John Doe, john@example.com
        </Alert>
      </Paper>

      {/* Participants Table */}
      {participants.length > 0 && (
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Participants ({participants.length})
            </Typography>
            <Button
              startIcon={<Delete />}
              color="error"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>#</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Preview */}
      {selectedProgram && participants.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Certificate Preview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Program:</strong> {selectedProgramData?.name} ({selectedProgram})
              </Typography>

            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Participants:</strong> {participants.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Conducted by:</strong> Sepiri EduHub
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Generate Button */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleGenerate}
          disabled={loading || !selectedProgram || participants.length === 0}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{
            py: 1.5,
            px: 4,
          }}
        >
          {loading ? 'Generating...' : `Generate & Send ${participants.length} Certificates`}
        </Button>
      </Box>

      {loading && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generating certificates...
          </Typography>
          <LinearProgress sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            This may take a few minutes. Please don't close this page.
          </Typography>
        </Paper>
      )}

      {/* Results Dialog */}
      <Dialog
        open={showResults}
        onClose={() => setShowResults(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Generation Results
            </Typography>
            <IconButton onClick={() => setShowResults(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {results && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: 'primary.lighter', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold">{results.total}</Typography>
                    <Typography variant="body2">Total</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: 'success.lighter', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {results.successful}
                    </Typography>
                    <Typography variant="body2">Success</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: 'error.lighter', textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {results.failed}
                    </Typography>
                    <Typography variant="body2">Failed</Typography>
                  </Card>
                </Grid>
              </Grid>

              {results.details?.success?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Successfully Generated ({results.details.success.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.details.success.map((cert, index) => (
                          <TableRow key={index}>
                            <TableCell>{cert.name}</TableCell>
                            <TableCell>{cert.email}</TableCell>
                            <TableCell>
                              <Typography variant="caption" fontFamily="monospace">
                                {cert.serialNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => window.open(ApiService.getDownloadUrl(cert.serialNumber), '_blank')}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {results.details?.failed?.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }} color="error">
                    Failed ({results.details.failed.length})
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.details.failed.map((cert, index) => (
                          <TableRow key={index}>
                            <TableCell>{cert.name}</TableCell>
                            <TableCell>{cert.email}</TableCell>
                            <TableCell>
                              <Typography variant="caption" color="error">
                                {cert.error}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GenerateCertificates;