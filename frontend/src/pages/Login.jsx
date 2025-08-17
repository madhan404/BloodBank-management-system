import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress,
} from '@mui/material';
import { Bloodtype } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(formData.email, formData.password);
    setSubmitting(false);

    if (res.ok) {
      const role = res.user?.role;
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'staff') navigate('/staff', { replace: true });
      else navigate('/', { replace: true });
    } else {
      setError(res.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Bloodtype sx={{ mr: 1, color: 'primary.main' }} />
            <Typography component="h1" variant="h5" color="primary">
              Staff Login
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal" required fullWidth id="email" name="email" label="Email Address"
              type="email" value={formData.email} onChange={handleChange} autoFocus
            />
            <TextField
              margin="normal" required fullWidth id="password" name="password" label="Password"
              type="password" value={formData.password} onChange={handleChange}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Demo Credentials:</Typography>
            <Typography variant="caption" display="block">Admin: admin@lifesave.org / admin123</Typography>
            <Typography variant="caption" display="block">Staff: staff@lifesave.org / staff123</Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
