// src/pages/DonorRegistration.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  CloudUpload, 
  CheckCircle, 
  Info, 
  PhotoCamera, 
  Description,
  LocationOn,
  Person,
  Phone,
  Email,
  Bloodtype,
  Cake,
  Wc
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

// No trailing slash to avoid //api
const API_BASE_URL = (import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const steps = ['Registration Form', 'Review Details', 'Confirmation'];

const DonorRegistration = () => {
  console.log('DonorRegistration component rendering...');
  
  // Simple test to ensure component renders
  const [testState, setTestState] = useState('Component is working!');
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    gmail: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    bloodGroup: '',
    age: '',
    sex: '',
  });

  const [files, setFiles] = useState({
    photo: null,
    governmentId: null,
  });

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [govIdPreviewUrl, setGovIdPreviewUrl] = useState(null);
  const [submittedDonorId, setSubmittedDonorId] = useState(null);

  const photoInputRef = useRef(null);
  const govIdInputRef = useRef(null);

  const navigate = useNavigate();

  console.log('Component state:', { activeStep, loading, formData, files });

  // Test render to ensure component is working
  console.log('About to render component...');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName);
      fd.append('phone', formData.phone);
      fd.append('whatsapp', formData.whatsapp || '');
      fd.append('gmail', formData.gmail || '');
      fd.append('bloodGroup', formData.bloodGroup);
      fd.append('age', formData.age);
      fd.append('sex', formData.sex);
      fd.append('address[street]', formData.address.street);
      fd.append('address[city]', formData.address.city);
      fd.append('address[state]', formData.address.state);
      fd.append('address[pincode]', formData.address.pincode);
      fd.append('address[country]', formData.address.country);
      if (files.photo) fd.append('photo', files.photo);
      if (files.governmentId) fd.append('governmentId', files.governmentId);

      console.log('Submitting form data:', {
        formData,
        files: {
          photo: files.photo?.name,
          governmentId: files.governmentId?.name
        }
      });

      const response = await axios.post(`${API_BASE_URL}/api/donors/register`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Registration response:', response.data);
      setSubmittedDonorId(response.data?.donorId || null);
      setActiveStep(2);
      toast.success('Registration submitted successfully!');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // if on review step, submit
    if (activeStep === 1) {
      handleSubmit();
      return;
    }
    // otherwise validate current step and continue
    if (Object.keys(getValidationErrors()).length === 0) {
      setErrors({});
      setActiveStep((prev) => prev + 1);
    } else {
      validateForm();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileSelect = (type) => (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setErrors((prev) => ({ ...prev, [type === 'photo' ? 'photo' : 'governmentId']: undefined }));
      const url = URL.createObjectURL(file);
      if (type === 'photo') setPhotoPreviewUrl(url);
      if (type === 'governmentId') setGovIdPreviewUrl(url);
    }
  };

  // Cleanup object URLs on unmount or file change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    if (govIdPreviewUrl) URL.revokeObjectURL(govIdPreviewUrl);
  }, [photoPreviewUrl, govIdPreviewUrl]);

  const getValidationErrors = () => {
    const newErrors = {};
    if (activeStep === 0) {
      const street = formData.address.street?.trim();
      const city = formData.address.city?.trim();
      const state = formData.address.state?.trim();
      const pincode = formData.address.pincode?.trim();
      const country = formData.address.country?.trim();

      if (!formData.fullName?.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.phone?.trim()) newErrors.phone = 'Phone Number is required';
      if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood Group is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!street) newErrors['address.street'] = 'Street is required';
      if (!city) newErrors['address.city'] = 'City is required';
      if (!state) newErrors['address.state'] = 'State is required';
      if (!pincode) newErrors['address.pincode'] = 'Pincode is required';
      if (!country) newErrors['address.country'] = 'Country is required';
      if (pincode && !/^\d{6}$/.test(pincode)) newErrors['address.pincode'] = 'Pincode must be 6 digits';
      if (!files.photo) newErrors.photo = 'Photo is required';
      if (!files.governmentId) newErrors.governmentId = 'Government ID is required';
    }
    return newErrors;
  };

  const validateForm = () => {
    const newErrors = getValidationErrors();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="WhatsApp Number"
                  fullWidth
                  value={formData.whatsapp}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gmail"
                  fullWidth
                  value={formData.gmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gmail: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  value={formData.address.street}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  fullWidth
                  value={formData.address.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  fullWidth
                  value={formData.address.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode"
                  fullWidth
                  value={formData.address.pincode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  fullWidth
                  value={formData.address.country}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: { ...prev.address, country: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" variant="standard">
                  <FormLabel component="legend">Blood Group</FormLabel>
                  <RadioGroup
                    row
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                  >
                    {bloodGroups.map((group) => (
                      <FormControlLabel
                        key={group}
                        value={group}
                        control={<Radio />}
                        label={group}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Age"
                  fullWidth
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  error={!!errors.age}
                  helperText={errors.age}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" variant="standard">
                  <FormLabel component="legend">Sex</FormLabel>
                  <RadioGroup
                    row
                    value={formData.sex}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sex: e.target.value }))}
                  >
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Upload Photo *
                  </Typography>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect('photo')}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant={files.photo ? 'contained' : 'outlined'}
                    startIcon={<CloudUpload />}
                    fullWidth
                    onClick={() => photoInputRef.current?.click()}
                    color={files.photo ? 'success' : 'primary'}
                    sx={{ mb: 1 }}
                  >
                    {files.photo ? files.photo.name : 'Choose Photo'}
                  </Button>
                  {errors.photo && (
                    <Typography variant="caption" color="error">
                      {errors.photo}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Upload Government ID *
                  </Typography>
                  <input
                    ref={govIdInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect('governmentId')}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant={files.governmentId ? 'contained' : 'outlined'}
                    startIcon={<CloudUpload />}
                    fullWidth
                    onClick={() => govIdInputRef.current?.click()}
                    color={files.governmentId ? 'success' : 'primary'}
                    sx={{ mb: 1 }}
                  >
                    {files.governmentId ? files.governmentId.name : 'Choose ID'}
                  </Button>
                  {errors.governmentId && (
                    <Typography variant="caption" color="error">
                      {errors.governmentId}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Review Your Details</Typography>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <Person /> Full Name: {formData.fullName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <Phone /> Phone: {formData.phone}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <Phone /> WhatsApp: {formData.whatsapp}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <Email /> Gmail: {formData.gmail}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <LocationOn /> Address: {formData.address.street}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <Bloodtype /> Blood Group: {formData.bloodGroup}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <Cake /> Age: {formData.age}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <Person /> Sex: {formData.sex}
                </Typography>
              </CardContent>
            </Card>
            {/* Documents */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CloudUpload sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">Documents Uploaded</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Photo</Typography>
                    {photoPreviewUrl ? (
                      <Box sx={{ mt: 1 }}>
                        <img src={photoPreviewUrl} alt="Photo preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                      </Box>
                    ) : (
                      <Chip label={files.photo?.name || 'No file'} variant="outlined" />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Government ID</Typography>
                    {govIdPreviewUrl && files.governmentId && files.governmentId.type.startsWith('image/') ? (
                      <Box sx={{ mt: 1 }}>
                        <img src={govIdPreviewUrl} alt="Government ID preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                      </Box>
                    ) : (
                      <Chip label={files.governmentId?.name || 'No file'} variant="outlined" />
                    )}
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Confirmation</Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your blood donor registration has been submitted successfully!
            </Alert>
            <Typography variant="body1">
              Thank you for joining our lifesaving mission. Your donation can save up to 3 lives.
            </Typography>
            <Card variant="outlined" sx={{ p: 3, mb: 3, maxWidth: 500, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom color="primary">
                📋 What happens next?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Our staff will review your application within 1-2 business days
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • You'll receive an SMS/email notification once approved
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • After approval, you can donate blood at our center
              </Typography>
              {submittedDonorId && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Uploaded Files</Typography>
                  <Typography variant="body2">
                    <a href={`${API_BASE_URL}/api/donors/photo/${submittedDonorId}`} target="_blank" rel="noreferrer">View Photo</a>
                  </Typography>
                  <Typography variant="body2">
                    <a href={`${API_BASE_URL}/api/donors/document/${submittedDonorId}`} target="_blank" rel="noreferrer">View Government ID</a>
                  </Typography>
                </Box>
              )}
            </Card>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Go to Home
            </Button>
          </Box>
        );
      default:
        return <Box sx={{ textAlign: 'center', py: 4 }}>Unknown step</Box>;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
            🩸 Blood Donor Registration
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Join our lifesaving mission! Your donation can save up to 3 lives. 
            Please fill out the form below with accurate information.
          </Typography>
        </Box>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {(() => {
            try {
              return renderStepContent(activeStep);
            } catch (error) {
              console.error('Error rendering step content:', error);
              return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="error" gutterBottom>
                    Error loading form
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please refresh the page and try again.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => window.location.reload()} 
                    sx={{ mt: 2 }}
                  >
                    Refresh Page
                  </Button>
                </Box>
              );
            }
          })()}
        </Box>
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
                startIcon={<CheckCircle />}
              >
                Go to Home
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={Object.keys(getValidationErrors()).length > 0}
                endIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {activeStep === steps.length - 2 ? 'Submit' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DonorRegistration;
