import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Business,
  Close
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import ApiService from '../services/api';

function ManageInstitutes() {
  const { enqueueSnackbar } = useSnackbar();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentInstitute, setCurrentInstitute] = useState(null);
  const [formData, setFormData] = useState({ collegeName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadInstitutes();
  }, []);

  const loadInstitutes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getInstitutes();
      setInstitutes(data.institutes || []);
    } catch (err) {
      setError('Failed to load institutes');
      enqueueSnackbar('Failed to load institutes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (institute = null) => {
    if (institute) {
      setEditMode(true);
      setCurrentInstitute(institute);
      setFormData({ collegeName: institute.collegeName });
    } else {
      setEditMode(false);
      setCurrentInstitute(null);
      setFormData({ collegeName: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentInstitute(null);
    setFormData({ collegeName: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.collegeName.trim()) {
      enqueueSnackbar('Please enter college name', { variant: 'warning' });
      return;
    }

    try {
      if (editMode) {
        await ApiService.updateInstitute(currentInstitute._id, formData.collegeName);
        enqueueSnackbar('Institute updated successfully', { variant: 'success' });
      } else {
        await ApiService.createInstitute(formData.collegeName);
        enqueueSnackbar('Institute created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      loadInstitutes();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await ApiService.deleteInstitute(id);
      enqueueSnackbar('Institute deleted successfully', { variant: 'success' });
      setDeleteConfirm(null);
      loadInstitutes();
    } catch (err) {
      enqueueSnackbar('Failed to delete institute', { variant: 'error' });
    }
  };

  const filteredInstitutes = institutes.filter(institute =>
    institute.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Manage Institutes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add, edit, or remove colleges and institutes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Add Institute
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search institutes..."
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
      </Paper>

      {/* Institutes Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight={600}>
            All Institutes ({filteredInstitutes.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredInstitutes.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <Business sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No institutes found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Try a different search term' : 'Add your first institute to get started'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Institute
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>College/Institute Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInstitutes.map((institute, index) => (
                  <TableRow key={institute._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business color="primary" />
                        <Typography variant="body1" fontWeight={500}>
                          {institute.collegeName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(institute.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(institute)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteConfirm(institute)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {editMode ? 'Edit Institute' : 'Add New Institute'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="College/Institute Name *"
              value={formData.collegeName}
              onChange={(e) => setFormData({ collegeName: e.target.value })}
              placeholder="e.g., ABC College of Commerce"
              required
              autoFocus
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.collegeName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(deleteConfirm._id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManageInstitutes;