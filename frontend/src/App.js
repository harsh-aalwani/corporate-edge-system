// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { SnackbarProvider } from 'notistack';  // Import SnackbarProvider
import Cookies from 'js-cookie';

import Home from './pages/Guest/Home';
import Login from './pages/Guest/Login';
// SuperAdmin Modules
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminManageSystemAdmin from './pages/SuperAdmin/Manage/MngSystemAdmin';
import SuperAdminManageHRManager from './pages/SuperAdmin/Manage/MngHRManager';
import SuperAdminManageDepartmentHead from './pages/SuperAdmin/Manage/MngDepartmentManager';
import SuperAdminManageEmployee from './pages/SuperAdmin/Manage/MngEmployee';
import SuperAdminManageProjectManager from './pages/SuperAdmin/Manage/MngProjectManager';

import ProtectedRoute from './components/Main/ProtectedRoute';
import Loader from './components/Main/Loader';  // Import Loader component

const App = () => {
  const [userRole, setUserRole] = useState(null);  // Store the user role
  const [isLoading, setIsLoading] = useState(true);  // Loading state

  useEffect(() => {
    // Fetch the user role from cookies
    const role = Cookies.get('userRoleid');
    setUserRole(role);  // Set user role
    setIsLoading(false);  // Stop loading once role is fetched
  }, []);

  if (isLoading) {
    return <Loader />;  // Show loader while the role is being fetched
  }

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <Router>
        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />

          {/* Protected Route for /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRoles={[userRole]}>
                {userRole === 'R1' && <SuperAdminDashboard />}
              </ProtectedRoute>
            }
          />

          {/* Additional Routes with role-based access */}
          <Route
            path="/ManageSystemAdmin"
            element={
              <ProtectedRoute requiredRoles={['R1', 'R2']}>
                {userRole === 'R1' && <SuperAdminManageSystemAdmin />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageHRManager"
            element={
              <ProtectedRoute requiredRoles={['R1']}>
                {userRole === 'R1' && <SuperAdminManageHRManager />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageDepartmentHead"
            element={
              <ProtectedRoute requiredRoles={['R1']}>
                {userRole === 'R1' && <SuperAdminManageDepartmentHead />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageEmployee"
            element={
              <ProtectedRoute requiredRoles={['R1', 'R2', 'R3']}>
                {userRole === 'R1' && <SuperAdminManageEmployee />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageProjectManager"
            element={
              <ProtectedRoute requiredRoles={['R1', 'R2']}>
                {userRole === 'R1' && <SuperAdminManageProjectManager />}
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
};

export default App;
