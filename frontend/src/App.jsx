// import { Routes, Route } from 'react-router-dom';
// import { Box } from '@mui/material';
// import HomePage from './pages/HomePage';
// import DonorRegistration from './pages/DonorRegistration';
// import Login from './pages/Login';

// import AdminDashboard from './pages/AdminDashboard';

// import StaffDashboard from './pages/StaffDashboard';
// import ProtectedRoute from './components/ProtectedRoute';
// import { AuthProvider } from './context/AuthContext';

// function App() {
//   return (
//     <AuthProvider>
//       <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/register" element={<DonorRegistration />} />
//           <Route path="/login" element={<Login />} />
//           <Route 
//             path="/admin" 
//             element={
//               <ProtectedRoute requiredRole="admin">
//                 <AdminDashboard />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="/staff" 
//             element={
//               <ProtectedRoute requiredRole="staff">
//                 <StaffDashboard />
//               </ProtectedRoute>
//             } 
//           />
//         </Routes>
//       </Box>
//     </AuthProvider>
//   );
// }

// export default App;


import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomePage from './pages/HomePage'
import DonorRegistration from './pages/DonorRegistration'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import StaffDashboard from './pages/StaffDashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allow={['staff','admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  )
}
