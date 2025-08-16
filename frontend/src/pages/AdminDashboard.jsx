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
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Chip,
  AppBar,
  Toolbar,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard,
  People,
  PersonAdd,
  Payment,
  Download,
  Search,
  Delete,
  Edit,
  Bloodtype,
  ExitToApp,
  Visibility,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
// If you already set up a shared axios instance, replace the next two lines with:
// import api from '../lib/api';
import axios from 'axios';
const API_BASE_URL = (import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' | 'edit'
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [staff, setStaff] = useState([]);
  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalDonors: 0,
    pendingApprovals: 0,
    totalBloodUnits: 0,
    rejectedDonors: 0,
    bloodGroupDistribution: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectedDonors, setRejectedDonors] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [personType, setPersonType] = useState(''); // 'staff' or 'donor'
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    bloodGroup: undefined,
    age: '',
    sex: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    salary: '',
  });

  const { user, logout } = useAuth();

  const authHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      toast.error('No authentication token found. Please login again.');
      logout();
      return {};
    }
    console.log('Auth token found:', token.substring(0, 20) + '...');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      console.error('User is not admin:', user);
      toast.error('Access denied. Admin privileges required.');
      logout();
      return;
    }
    
    loadDashboardData();
  }, [user, logout]);

  const loadDashboardData = async () => {
    try {
      console.log('Loading admin dashboard data...');
      console.log('Auth token:', localStorage.getItem('token'));
      
      const [staffRes, donorsRes, statsRes, rejectedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/staff`, authHeader()),
        axios.get(`${API_BASE_URL}/api/admin/donors`, authHeader()),
        axios.get(`${API_BASE_URL}/api/admin/stats`, authHeader()),
        axios.get(`${API_BASE_URL}/api/admin/rejected-donors`, authHeader()),
      ]);

      console.log('Staff response:', staffRes.data);
      console.log('Donors response:', donorsRes.data);
      console.log('Stats response:', statsRes.data);
      console.log('Rejected donors response:', rejectedRes.data);

      setStaff(staffRes.data || []);
      // Filter to show only approved donors in donor management
      const approvedDonors = (donorsRes.data || []).filter(d => d.status === 'approved');
      setDonors(approvedDonors);
      setStats(statsRes.data || { totalStaff: 0, totalDonors: 0, pendingApprovals: 0, totalBloodUnits: 0, rejectedDonors: 0, bloodGroupDistribution: [] });
      setRejectedDonors(rejectedRes.data || []);
    } catch (error) {
      console.error('Admin dashboard error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. You may not have admin privileges.');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        // Redirect to login
        logout();
      } else {
        toast.error('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetStaffForm = () => {
    return {
      name: '',
      email: '',
      password: '',
      phone: '',
      whatsapp: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: ''
      },
      bloodGroup: undefined,
      age: '',
      sex: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      salary: ''
    };
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setEditingStaffId(null);
    setStaffForm(resetStaffForm());
    setOpenStaffDialog(true);
  };

  const openEditDialog = (row) => {
    setDialogMode('edit');
    setEditingStaffId(row._id);
    setStaffForm({
      name: row.name || '',
      email: row.email || '',
      password: '', // Don't show current password
      phone: row.phone || '',
      whatsapp: row.whatsapp || '',
      address: {
        street: row.address?.street || '',
        city: row.address?.city || '',
        state: row.address?.state || '',
        pincode: row.address?.pincode || '',
        country: row.address?.country || ''
      },
      bloodGroup: row.bloodGroup || undefined,
      age: row.age ?? '',
      sex: row.sex || '',
      accountNumber: row?.bankDetails?.accountNumber || '',
      ifscCode: row?.bankDetails?.ifscCode || '',
      bankName: row?.bankDetails?.bankName || '',
      salary: row.salary ?? '',
    });
    setOpenStaffDialog(true);
  };

  const handleStaffSubmit = async () => {
    try {
      // Clean up empty values before sending to backend
      const cleanedForm = { ...staffForm };
      
      // Remove empty strings and convert to undefined
      Object.keys(cleanedForm).forEach(key => {
        if (cleanedForm[key] === '') {
          cleanedForm[key] = undefined;
        }
        // Handle nested address object
        if (key === 'address' && cleanedForm[key]) {
          Object.keys(cleanedForm[key]).forEach(addrKey => {
            if (cleanedForm[key][addrKey] === '') {
              cleanedForm[key][addrKey] = undefined;
            }
          });
        }
        // Handle nested bankDetails object
        if (key === 'bankDetails' && cleanedForm[key]) {
          Object.keys(cleanedForm[key]).forEach(bankKey => {
            if (cleanedForm[key][bankKey] === '') {
              cleanedForm[key][bankKey] = undefined;
            }
          });
        }
      });

      if (dialogMode === 'add') {
        await axios.post(`${API_BASE_URL}/api/admin/staff`, cleanedForm, authHeader());
        toast.success('Staff member added successfully');
      } else {
        await axios.put(`${API_BASE_URL}/api/admin/staff/${editingStaffId}`, cleanedForm, authHeader());
        toast.success('Staff member updated successfully');
      }
      setOpenStaffDialog(false);
      await loadDashboardData();
    } catch (error) {
      console.error('Staff submit error:', error);
      if (error.response?.data?.errors) {
        // Show validation errors
        error.response.data.errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || `Failed to ${dialogMode === 'add' ? 'add' : 'update'} staff`);
      }
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/staff/${id}`, authHeader());
      toast.success('Staff member deleted successfully');
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete staff member');
    }
  };

  const handleDeleteRejectedDonor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rejected donor?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/rejected-donors/${id}`, authHeader());
      toast.success('Rejected donor deleted successfully');
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete rejected donor');
    }
  };

  const handlePersonSelect = (person, type) => {
    setSelectedPerson(person);
    setPersonType(type);
    setPersonDialogOpen(true);
  };

  const closePersonDialog = () => {
    setPersonDialogOpen(false);
    setSelectedPerson(null);
    setPersonType('');
  };

  const exportData = async (type) => {
    try {
      console.log(`Exporting ${type} data...`);
      const response = await axios.get(`${API_BASE_URL}/api/admin/export/${type}`, {
        ...authHeader(),
        responseType: 'blob',
      });
      
      console.log('Export response received:', response);
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data.size || 'unknown');
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_data.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} data exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        logout();
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(`Failed to export ${type} data: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const staffColumns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
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
    { field: 'salary', headerName: 'Salary', width: 110 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="info" onClick={(e) => { e.stopPropagation(); handlePersonSelect(params.row, 'staff'); }} title="View Details">
            <Visibility />
          </IconButton>
          <IconButton color="primary" onClick={(e) => { e.stopPropagation(); openEditDialog(params.row); }} title="Edit">
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDeleteStaff(params.row._id); }} title="Delete">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  const donorColumns = [
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
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';
        if (status === 'approved') color = 'success';
        else if (status === 'pending') color = 'warning';
        else if (status === 'rejected') color = 'error';
        
        return (
          <Chip
            label={status}
            color={color}
            size="small"
          />
        );
      },
    },
    {
      field: 'rejectionReason',
      headerName: 'Rejection Reason',
      width: 200,
      renderCell: (params) => {
        if (params.row.status === 'rejected' && params.value) {
          return (
            <Typography 
              variant="body2" 
              color="error.main"
              sx={{ 
                maxWidth: 180, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={params.value}
            >
              {params.value}
            </Typography>
          );
        }
        return '-';
      },
    },
    {
      field: 'submittedAt',
      headerName: 'Submitted Date',
      width: 130,
      renderCell: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return '-';
      },
    },
  ];

  const rejectedDonorColumns = [
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
      field: 'rejectionReason',
      headerName: 'Rejection Reason',
      width: 250,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          color="error.main"
          sx={{ 
            maxWidth: 230, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={params.value || 'No reason provided'}
        >
          {params.value || 'No reason provided'}
        </Typography>
      ),
    },
    {
      field: 'submittedAt',
      headerName: 'Submitted Date',
      width: 130,
      renderCell: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return '-';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="error" onClick={() => handleDeleteRejectedDonor(params.row._id)} title="Delete">
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Bloodtype sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard - {user?.name}
          </Typography>
          <Button color="inherit" onClick={logout} startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4">{stats.totalStaff}</Typography>
                <Typography color="text.secondary">Total Staff</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Dashboard sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4">{stats.approvedDonors || 0}</Typography>
                <Typography color="text.secondary">Approved Donors</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Bloodtype sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4">{stats.pendingApprovals}</Typography>
                <Typography color="text.secondary">Pending Approvals</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h4">{stats.rejectedDonors}</Typography>
                <Typography color="text.secondary">Rejected Donors</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Staff Management" />
            <Tab label="Donor Management" />
            <Tab label="Rejected Donors" />
            <Tab label="Reports" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Staff Members</Typography>
              <Button variant="contained" startIcon={<PersonAdd />} onClick={openAddDialog}>
                Add Staff
              </Button>
            </Box>
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={staff}
                columns={staffColumns}
                pageSize={10}
                getRowId={(row) => row._id}
                disableSelectionOnClick
                onRowClick={(params) => handlePersonSelect(params.row, 'staff')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Approved Donors</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search approved donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />
                <Button variant="outlined" startIcon={<Download />} onClick={() => exportData('donors')}>
                  Export CSV
                </Button>
              </Box>
            </Box>
            
            {/* Status Summary */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Approved Donors: ${donors.length}`} 
                color="success" 
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Only approved donors are shown in this section
              </Typography>
            </Box>
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={donors.filter(d => {
                  const matchesSearch = d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       d.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());
                  return matchesSearch;
                })}
                columns={donorColumns}
                pageSize={10}
                getRowId={(row) => row._id}
                disableSelectionOnClick
                onRowClick={(params) => handlePersonSelect(params.row, 'donor')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Rejected Donors</Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {rejectedDonors.length} rejected donors
              </Typography>
            </Box>
            <Box sx={{ height: 420, width: '100%' }}>
              <DataGrid
                rows={rejectedDonors}
                columns={rejectedDonorColumns}
                pageSize={10}
                getRowId={(row) => row._id}
                disableSelectionOnClick
                onRowClick={(params) => handlePersonSelect(params.row, 'donor')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Reports & Analytics</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Button variant="outlined" startIcon={<Download />} onClick={() => exportData('donors')} fullWidth sx={{ mb: 2 }}>
                  Export Donor Data
                </Button>
                <Button variant="outlined" startIcon={<Download />} onClick={() => exportData('staff')} fullWidth>
                  Export Staff Data
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Blood Group Distribution</Typography>
                    {stats.bloodGroupDistribution && stats.bloodGroupDistribution.length > 0 ? (
                      <Box>
                        {stats.bloodGroupDistribution.map((bg) => (
                          <Box key={bg.bloodGroup} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{bg.bloodGroup}:</Typography>
                            <Typography variant="body2" color="primary.main">
                              {bg.count} ({bg.percentage}%)
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No approved donors yet</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Add/Edit Staff Dialog */}
        <Dialog open={openStaffDialog} onClose={() => setOpenStaffDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{dialogMode === 'add' ? 'Add New Staff Member' : 'Edit Staff Member'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Password" 
                  type="password" 
                  value={staffForm.password} 
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  helperText={dialogMode === 'add' ? 'Leave empty for default password (staff123)' : 'Leave empty to keep current password'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="WhatsApp" value={staffForm.whatsapp} onChange={(e) => setStaffForm({ ...staffForm, whatsapp: e.target.value })} />
              </Grid>
              
              {/* Address Fields */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Address</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Street Address" value={staffForm.address.street} onChange={(e) => setStaffForm({ ...staffForm, address: { ...staffForm.address, street: e.target.value } })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="City" value={staffForm.address.city} onChange={(e) => setStaffForm({ ...staffForm, address: { ...staffForm.address, city: e.target.value } })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="State" value={staffForm.address.state} onChange={(e) => setStaffForm({ ...staffForm, address: { ...staffForm.address, state: e.target.value } })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Pincode" value={staffForm.address.pincode} onChange={(e) => setStaffForm({ ...staffForm, address: { ...staffForm.address, pincode: e.target.value } })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Country" value={staffForm.address.country} onChange={(e) => setStaffForm({ ...staffForm, address: { ...staffForm.address, country: e.target.value } })} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Blood Group" value={staffForm.bloodGroup} onChange={(e) => setStaffForm({ ...staffForm, bloodGroup: e.target.value })}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <MenuItem key={group} value={group}>{group}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="number" label="Age" value={staffForm.age} onChange={(e) => setStaffForm({ ...staffForm, age: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <FormLabel>Sex</FormLabel>
                  <RadioGroup row value={staffForm.sex} onChange={(e) => setStaffForm({ ...staffForm, sex: e.target.value })}>
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Account Number" value={staffForm.accountNumber} onChange={(e) => setStaffForm({ ...staffForm, accountNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="IFSC Code" value={staffForm.ifscCode} onChange={(e) => setStaffForm({ ...staffForm, ifscCode: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Bank Name" value={staffForm.bankName} onChange={(e) => setStaffForm({ ...staffForm, bankName: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth type="number" label="Monthly Salary" value={staffForm.salary} onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button onClick={() => setOpenStaffDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleStaffSubmit}>
                {dialogMode === 'add' ? 'Add Staff' : 'Save Changes'}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Person Details Dialog */}
        <Dialog open={personDialogOpen} onClose={closePersonDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {personType === 'staff' ? 'Staff Details' : 'Donor Details'} - {selectedPerson?.fullName || selectedPerson?.name}
          </DialogTitle>
          <DialogContent>
            {selectedPerson && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {personType === 'staff' ? (
                  // Staff Details
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedPerson.name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedPerson.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedPerson.phone}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">WhatsApp</Typography>
                      <Typography variant="body1">{selectedPerson.whatsapp || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                      <Typography variant="body1">{selectedPerson.bloodGroup || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                      <Typography variant="body1">{selectedPerson.age || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Sex</Typography>
                      <Typography variant="body1">{selectedPerson.sex || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Salary</Typography>
                      <Typography variant="body1">{selectedPerson.salary ? `₹${selectedPerson.salary}` : 'Not specified'}</Typography>
                    </Grid>
                    {selectedPerson.address && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            {selectedPerson.address.street && `${selectedPerson.address.street}, `}
                            {selectedPerson.address.city && `${selectedPerson.address.city}, `}
                            {selectedPerson.address.state && `${selectedPerson.address.state}, `}
                            {selectedPerson.address.pincode && `${selectedPerson.address.pincode}, `}
                            {selectedPerson.address.country || ''}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {selectedPerson.bankDetails && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Bank Details</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">Account: {selectedPerson.bankDetails.accountNumber || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">IFSC: {selectedPerson.bankDetails.ifscCode || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2">Bank: {selectedPerson.bankDetails.bankName || 'Not provided'}</Typography>
                        </Grid>
                      </>
                    )}
                  </>
                ) : (
                  // Donor Details
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1">{selectedPerson.fullName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedPerson.phone}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">WhatsApp</Typography>
                      <Typography variant="body1">{selectedPerson.whatsapp || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedPerson.gmail || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                      <Typography variant="body1">{selectedPerson.bloodGroup}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                      <Typography variant="body1">{selectedPerson.age}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Sex</Typography>
                      <Typography variant="body1">{selectedPerson.sex}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedPerson.status}
                        color={selectedPerson.status === 'approved' ? 'success' : selectedPerson.status === 'pending' ? 'warning' : 'error'}
                        size="small"
                      />
                    </Grid>
                    {selectedPerson.address && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">
                            {selectedPerson.address.street && `${selectedPerson.address.street}, `}
                            {selectedPerson.address.city && `${selectedPerson.address.city}, `}
                            {selectedPerson.address.state && `${selectedPerson.address.state}, `}
                            {selectedPerson.address.pincode && `${selectedPerson.address.pincode}, `}
                            {selectedPerson.address.country || ''}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {selectedPerson.status === 'rejected' && selectedPerson.rejectionReason && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="error.main">Rejection Reason</Typography>
                        <Typography variant="body1" color="error.main">{selectedPerson.rejectionReason}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                      <Typography variant="body1">
                        {selectedPerson.submittedAt ? new Date(selectedPerson.submittedAt).toLocaleDateString() : 'Not available'}
                      </Typography>
                    </Grid>
                    {selectedPerson.status === 'approved' && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Approved Date</Typography>
                        <Typography variant="body1">
                          {selectedPerson.approvedAt ? new Date(selectedPerson.approvedAt).toLocaleDateString() : 'Not available'}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            )}
          </DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Button onClick={closePersonDialog}>Close</Button>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
