import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    AppBar,
    Toolbar,
    Paper,
    Chip,
  } from '@mui/material';
  import {
    Bloodtype,
    People,
    LocalHospital,
    Phone,
    Email,
    LocationOn,
    Facebook,
    Twitter,
    Instagram,
  } from '@mui/icons-material';
  import { useNavigate } from 'react-router-dom';
  
  const HomePage = () => {
    const navigate = useNavigate();
  
    const bloodStock = [
      { type: 'A+', units: 45, status: 'available' },
      { type: 'A-', units: 12, status: 'low' },
      { type: 'B+', units: 38, status: 'available' },
      { type: 'B-', units: 8, status: 'critical' },
      { type: 'AB+', units: 22, status: 'available' },
      { type: 'AB-', units: 5, status: 'critical' },
      { type: 'O+', units: 67, status: 'available' },
      { type: 'O-', units: 15, status: 'low' },
    ];
  
    const getStockColor = (status) => {
      switch (status) {
        case 'available': return 'success';
        case 'low': return 'warning';
        case 'critical': return 'error';
        default: return 'default';
      }
    };
  
    return (
      <Box>
        {/* Header */}
        <AppBar position="static" color="primary">
          <Toolbar>
            <Bloodtype sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              LifeSave Blood Bank
            </Typography>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Donate Blood
            </Button>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Staff Login
            </Button>
          </Toolbar>
        </AppBar>
  
        {/* Hero Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 8,
            background: 'linear-gradient(135deg, #d32f2f 0%, #9a0007 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h1" gutterBottom>
                  Save Lives Through Blood Donation
                </Typography>
                <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
                  Your donation can save up to three lives. Join our community of heroes
                  and make a difference in someone's life today.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Register as Donor
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src="https://images.pexels.com/photos/6152077/pexels-photo-6152077.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Blood donation"
                  sx={{ width: '100%', borderRadius: 2 }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
  
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* About Section */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" gutterBottom align="center" color="primary">
              About LifeSave Blood Bank
            </Typography>
            <Typography variant="body1" paragraph align="center" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
              Established in 1995, LifeSave Blood Bank has been serving the community for over 25 years.
              We are committed to ensuring safe, adequate, and timely supply of blood and blood components
              to patients in need. Our state-of-the-art facility and dedicated team work around the clock
              to save lives.
            </Typography>
          </Box>
  
          {/* Achievements */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h3" gutterBottom align="center" color="primary">
              Our Achievements
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <People sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h3" color="primary">
                      50,000+
                    </Typography>
                    <Typography variant="h6">
                      Registered Donors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Bloodtype sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h3" color="primary">
                      2,50,000+
                    </Typography>
                    <Typography variant="h6">
                      Units Collected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h3" color="primary">
                      7,50,000+
                    </Typography>
                    <Typography variant="h6">
                      Lives Saved
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
  
          {/* Live Blood Availability */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h3" gutterBottom align="center" color="primary">
              Live Blood Availability
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {bloodStock.map((blood) => (
                  <Grid item xs={6} sm={3} key={blood.type}>
                    <Card sx={{ textAlign: 'center' }}>
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {blood.type}
                        </Typography>
                        <Typography variant="h6" sx={{ my: 1 }}>
                          {blood.units} Units
                        </Typography>
                        <Chip 
                          label={blood.status.toUpperCase()} 
                          color={getStockColor(blood.status)}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
  
          {/* Contact Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" gutterBottom align="center" color="primary">
              Contact Us
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h5" gutterBottom color="primary">
                    Get in Touch
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography>+91 98765 43210</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography>contact@lifesavebloodbank.org</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                    <LocationOn sx={{ mr: 2, color: 'primary.main', mt: 0.5 }} />
                    <Typography>
                      123 Healthcare Avenue,<br />
                      Medical District,<br />
                      Chennai - 600001,<br />
                      Tamil Nadu, India
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Follow Us
                  </Typography>
                  <Box>
                    <Button startIcon={<Facebook />} sx={{ mr: 1 }}>Facebook</Button>
                    <Button startIcon={<Twitter />} sx={{ mr: 1 }}>Twitter</Button>
                    <Button startIcon={<Instagram />}>Instagram</Button>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 0, height: '400px' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8674478944343!2d80.27407931482236!3d13.044501416322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267165ac6fd5b%3A0xb4e884e1b88865e4!2sApollo%20Hospital!5e0!3m2!1sen!2sin!4v1647845923456!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '12px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="LifeSave Blood Bank Location"
                  ></iframe>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
  
        {/* Footer */}
        <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 3 }}>
          <Container maxWidth="lg">
            <Typography align="center">
              © 2024 LifeSave Blood Bank. All rights reserved. | Emergency: +91 98765 43210
            </Typography>
          </Container>
        </Box>
      </Box>
    );
  };
  
  export default HomePage;