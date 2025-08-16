import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  People,
  CheckCircle,
  Cancel,
  Search,
  Download,
  Bloodtype,
  ExitToApp,
  Visibility,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api, { ABS } from '../lib/api'; // <-- uses shared axios + absolute URL helper

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const StaffDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [approvedDonors, setApprovedDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);

  const [openDonorDialog, setOpenDonorDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    totalDonors: 0,
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      const [pendingRes, approvedRes, statsRes] = await Promise.all([
        api.get('/api/staff/pending-donors'),
        api.get('/api/staff/approved-donors'),
        api.get('/api/staff/stats'),
      ]);

      setPendingDonors(pendingRes.data || []);
      setApprovedDonors(approvedRes.data || []);
      setStats(statsRes.data || { pendingReviews: 0, approvedToday: 0, totalDonors: 0 });
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleViewDonor = (donor) => {
    setSelectedDonor(donor);
    setOpenDonorDialog(true);
  };

  const handleApproveDonor = async (donorId) => {
    try {
      await api.post(`/api/staff/approve-donor/${donorId}`, {});
      toast.success('Donor approved successfully');
      setOpenDonorDialog(false);
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve donor');
    }
  };

  const openRejectFlow = (donor) => {
    // If you want to force viewing details first, call handleViewDonor(donor) instead.
    setSelectedDonor(donor);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleRejectDonor = async (donorId) => {
    try {
      await api.post(`/api/staff/reject-donor/${donorId}`, { reason: rejectionReason });
      toast.success('Donor rejected');
      setOpenRejectDialog(false);
      setOpenDonorDialog(false);
      setSelectedDonor(null);
      setRejectionReason('');
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject donor');
    }
  };

  const exportDonors = async () => {
    try {
      // Change to /api/admin/export/donors if that's your exporter
      const response = await api.get('/api/staff/export-donors', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donors_data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export data');
    }
  };

  const pendingColumns = [
    { field: 'fullName', headerName: 'Name', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 200,
      renderCell: (params) => {
        const addr = params.value;
        if (addr && addr.city) {
          return `${addr.city}, ${addr.state || ''}`;
        }
        return '-';
      }
    },
    { field: 'bloodGroup', headerName: 'Blood Group', width: 120 },
    { field: 'age', headerName: 'Age', width: 80 },
    { field: 'sex', headerName: 'Sex', width: 80 },
    {
      field: 'submittedAt',
      headerName: 'Submitted',
      width: 140,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => handleViewDonor(params.row)}
            size="small"
            title="View details"
          >
            <Visibility />
          </IconButton>
          <IconButton
            color="success"
            onClick={() => handleApproveDonor(params.row._id)}
            size="small"
            title="Approve"
          >
            <CheckCircle />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => openRejectFlow(params.row)}
            size="small"
            title="Reject"
          >
            <Cancel />
          </IconButton>
        </Box>
      ),
    },
  ];

  const approvedColumns = [
    { field: 'fullName', headerName: 'Name', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 200,
      renderCell: (params) => {
        const addr = params.value;
        if (addr && addr.city) {
          return `${addr.city}, ${addr.state || ''}`;
        }
        return '-';
      }
    },
    { field: 'bloodGroup', headerName: 'Blood Group', width: 120 },
    { field: 'age', headerName: 'Age', width: 80 },
    { field: 'sex', headerName: 'Sex', width: 80 },
    {
      field: 'approvedAt',
      headerName: 'Approved',
      width: 140,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <Chip label={params.value} color="success" size="small" />,
    },
  ];

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Bloodtype sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Staff Dashboard{user?.name ? ` - ${user.name}` : ''}
          </Typography>
          <Button color="inherit" onClick={logout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Dashboard sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4">{stats.pendingReviews}</Typography>
                <Typography color="text.secondary">Pending Reviews</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4">{stats.approvedToday}</Typography>
                <Typography color="text.secondary">Approved Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4">{stats.totalDonors}</Typography>
                <Typography color="text.secondary">Total Donors</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`Pending Approvals (${pendingDonors.length})`} />
            <Tab label="Approved Donors" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Donor Applications Pending Review
            </Typography>
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={pendingDonors}
                columns={pendingColumns}
                pageSize={10}
                getRowId={(row) => row._id}
                disableSelectionOnClick
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Approved Donors</Typography>
              <Box>
                <TextField
                  size="small"
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mr: 2 }}
                />
                <Button variant="outlined" startIcon={<Download />} onClick={exportDonors}>
                  Export CSV
                </Button>
              </Box>
            </Box>
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={approvedDonors.filter(
                  (d) =>
                    d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    d.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={approvedColumns}
                pageSize={10}
                getRowId={(row) => row._id}
                disableSelectionOnClick
              />
            </Box>
          </TabPanel>
        </Card>

        {/* Donor Details Dialog */}
        <Dialog
          open={openDonorDialog}
          onClose={() => setOpenDonorDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Donor Application Details</DialogTitle>
          <DialogContent>
            {selectedDonor && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDonor.fullName}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>{selectedDonor.phone}</Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    WhatsApp
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDonor.whatsapp || 'Not provided'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDonor.gmail || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Blood Group
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDonor.bloodGroup}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Age
                  </Typography>
                  <Typography variant="body1" gutterBottom>{selectedDonor.age}</Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Sex
                  </Typography>
                  <Typography variant="body1" gutterBottom>{selectedDonor.sex}</Typography>

                  <Typography variant="subtitle2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDonor.submittedAt
                      ? new Date(selectedDonor.submittedAt).toLocaleString()
                      : ''}
                  </Typography>
                </Grid>

                {/* Address Information */}
                {selectedDonor.address && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedDonor.address.street && `${selectedDonor.address.street}, `}
                      {selectedDonor.address.city && `${selectedDonor.address.city}, `}
                      {selectedDonor.address.state && `${selectedDonor.address.state}, `}
                      {selectedDonor.address.pincode && `${selectedDonor.address.pincode}, `}
                      {selectedDonor.address.country || ''}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Uploaded Documents
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedDonor.photoUrl && (
                      <Grid item xs={12} sm={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="body2" gutterBottom>
                              Profile Photo
                            </Typography>
                            <Avatar
                              src={ABS(selectedDonor.photoUrl)} // <-- absolute URL
                              sx={{ width: 100, height: 100, mx: 'auto' }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {selectedDonor.governmentIdUrl && (
                      <Grid item xs={12} sm={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="body2" gutterBottom>
                              Government ID
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => window.open(ABS(selectedDonor.governmentIdUrl), '_blank')}
                            >
                              View Document
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button onClick={() => setOpenDonorDialog(false)}>Close</Button>
              {selectedDonor?.status === 'pending' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setOpenRejectDialog(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveDonor(selectedDonor._id)}
                  >
                    Approve
                  </Button>
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Rejection Reason Dialog */}
        <Dialog
          open={openRejectDialog}
          onClose={() => setOpenRejectDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Donor Application</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason (Optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => selectedDonor && handleRejectDonor(selectedDonor._id)}
              >
                Reject Application
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StaffDashboard;
