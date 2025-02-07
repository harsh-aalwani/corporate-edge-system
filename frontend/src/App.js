import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Loader from './components/Main/Loader';
import ProtectedRoute from './components/Main/ProtectedRoute';

// Import decryption utility
import { decryptData } from './utils/decrypt';

// Guest Pages
import Home from './pages/Guest/Home';
import Login from './pages/Guest/Login';

// SuperAdmin Modules
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminManageSystemAdmin from './pages/SuperAdmin/Manage/MngSystemAdmin';
import SuperAdminManageHRManager from './pages/SuperAdmin/Manage/MngHRManager';
import SuperAdminManageDepartmentManager from './pages/SuperAdmin/Manage/MngDepartmentManager';
import SuperAdminManageProjectManager from './pages/SuperAdmin/Manage/MngProjectManager';
import SuperAdminManageEmployee from './pages/SuperAdmin/Manage/MngEmployee';
import SuperAdminAddUser from './pages/SuperAdmin/Manage/AddUser';
import SuperAdminEditUser from './pages/SuperAdmin/Manage/EditUser';
// SystemAdmin Modules
import SystemAdminDashboard from './pages/SystemAdmin/Dashboard';
// HRManager Modules
import HRManagerDashboard from './pages/HRManager/Dashboard';
// Department Modules
import DepartmentManagerDashboard from './pages/DepartmentManager/Dashboard';
// Employee Dashboard Modules
import EmployeeDashboard from './pages/Employee/Dashboard';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <Router>
        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Role-Based Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['R1', 'R2', 'R3', 'R4', 'R5']} Component={
            () => {
            const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminDashboard />;
                case 'R2': return <SystemAdminDashboard />;
                case 'R3': return <HRManagerDashboard />;
                case 'R4': return <DepartmentManagerDashboard />;
                case 'R5': return <EmployeeDashboard />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* Add Form */}
          <Route path="/AddUser" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminAddUser />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* Edit Form */}
          <Route path="/EditUser" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminEditUser />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageSystemAdmin */}
          <Route path="/ManageSystemAdmin" element={<ProtectedRoute requiredRoles={['R1']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminManageSystemAdmin />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageHRManager */}
          <Route path="/ManageHRManager" element={<ProtectedRoute requiredRoles={['R1','R2']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminManageHRManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageDepartmentManager */}
          <Route path="/ManageDepartmentManager" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminManageDepartmentManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageProjectManager */}
          <Route path="/ManageProjectManager" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminManageProjectManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageEmployee */}
          <Route path="/ManageEmployee" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (decryptData(userRole)) {
                case 'R1': return <SuperAdminManageEmployee />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

        </Routes>
      </Router>
    </SnackbarProvider>
  );
};

export default App;
