import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  School,
  Pages,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';

function StatCard({ title, value, icon, color, loading, subtitle }) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" gutterBottom variant="body2" fontWeight={500}>
              {title}
            </Typography>
            {loading ? (
              <Box sx={{ py: 1 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
                <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.light`,
              color: `${color}.dark`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DashboardHome() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({

    totalCertificates: 0,
    recentCertificates: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      

      
      // Load certificates
      const certificatesData = await ApiService.getCertificates();
      
      const certificates = certificatesData.certificates || [];
      const total = certificates.length;
      
      // Calculate recent certificates (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recent = certificates.filter(cert => {
        const issueDate = new Date(cert.issueDate);
        return issueDate >= weekAgo;
      }).length;

      // Calculate this month
      const now = new Date();
      const thisMonth = certificates.filter(cert => {
        const issueDate = new Date(cert.issueDate);
        return issueDate.getMonth() === now.getMonth() && 
               issueDate.getFullYear() === now.getFullYear();
      }).length;

      // Get recent activity
      const recent5 = certificates
        .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
        .slice(0, 5);

      setStats({

        totalCertificates: total,
        recentCertificates: recent,
        thisMonth: thisMonth
      });

      setRecentActivity(recent5);
    } catch (err) {
      setError('Failed to load statistics. Please try again.');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          bgcolor: 'primary.dark',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              The modern certificate platform for your institution.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 560, mb: 3 }}>
              Track, generate, and verify certificates with a clean, intuitive workspace built for fast admin workflows.
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button variant="contained" color="secondary" size="large" sx={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.16)' }}>
                Generate Certificate
              </Button>
              <Button variant="outlined" size="large" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}>
                View Certificates
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.94)', color: 'text.primary' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                Quick overview
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                Certificate activity
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: '#f2f6fd', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700}>{stats.totalCertificates}</Typography>
                  <Typography variant="caption" color="text.secondary">Total certificates</Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: '#f2f6fd', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700}>{stats.recentCertificates}</Typography>
                  <Typography variant="caption" color="text.secondary">Last 7 days</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f2f6fd', borderRadius: 2 }}>
                  <Typography variant="h4" fontWeight={700}>{stats.thisMonth}</Typography>
                  <Typography variant="caption" color="text.secondary">This month</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Certificates"
            value={stats.totalCertificates}
            subtitle="All time"
            icon={<Pages sx={{ fontSize: 32 }} />}
            color="secondary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={stats.recentCertificates}
            subtitle="Last 7 days"
            icon={<TrendingUp sx={{ fontSize: 32 }} />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={stats.thisMonth}
            subtitle={new Date().toLocaleString('default', { month: 'long' })}
            icon={<CheckCircle sx={{ fontSize: 32 }} />}
            color="info"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              {isAdmin ? (
                <>
                  <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: '#f8fbff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Pages color="primary" sx={{ fontSize: 28 }} />
                      <Typography variant="body1" fontWeight={700}>Generate Certificates</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Create and send certificates to participants in seconds.
                    </Typography>
                  </Box>

                  <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: '#f8fbff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <CheckCircle color="success" sx={{ fontSize: 28 }} />
                      <Typography variant="body1" fontWeight={700}>View Certificates</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Browse all issued certificates and verify participant records.
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: '#f8fbff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Pages color="primary" sx={{ fontSize: 28 }} />
                      <Typography variant="body1" fontWeight={700}>View Certificates</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Access your certificates and check completion status quickly.
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: '#f8fbff' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <CheckCircle color="secondary" sx={{ fontSize: 28 }} />
                      <Typography variant="body1" fontWeight={700}>Verify Certificate</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Confirm certificate authenticity with the built-in verification tool.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              System Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  User Role
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {user?.role === 'admin' ? 'Administrator' : 'User'}
                  </Typography>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: user?.role === 'admin' ? 'secondary.main' : 'primary.main',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {user?.role?.toUpperCase()}
                  </Box>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.email}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Account Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="body1" fontWeight={500} color="success.main">
                    Active
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                Recent Certificates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentActivity.map((cert, index) => (
                  <Box
                    key={cert.serialNumber || index}
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {cert.participantName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cert.programName}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="primary" fontFamily="monospace">
                        {cert.serialNumber}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default DashboardHome;