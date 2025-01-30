import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Loader from './components/Main/Loader';
import ProtectedRoute from './components/Main/ProtectedRoute';

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

//SystemAdmin Modules
import SystemAdminDashboard from './pages/SystemAdmin/Dashboard';

//HRManager Modules
import HRManagerDashboard from './pages/HRManager/Dashboard';

//Department Modules
import DepartmentManagerDashboard from './pages/DepartmentManager/Dashboard';

//EmployeeDashboard Modules
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
              switch (userRole) {
                case 'R1': return <SuperAdminDashboard />;
                case 'R2': return <SystemAdminDashboard />;
                case 'R3': return <HRManagerDashboard />;
                case 'R4': return <DepartmentManagerDashboard />;
                case 'R5': return <EmployeeDashboard />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageSystemAdmin */}
          <Route path="/ManageSystemAdmin" element={<ProtectedRoute requiredRoles={['R1']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (userRole) {
                case 'R1': return <SuperAdminManageSystemAdmin />;
                // case 'R2': return <SystemAdminPlusManageSystemAdmin />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />
          
          {/* ManageHRManager */}
          <Route path="/ManageHRManager" element={<ProtectedRoute requiredRoles={['R1','R2']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (userRole) {
                case 'R1': return <SuperAdminManageHRManager />;
                // case 'R2': return <SystemAdminManageHRManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageDepartmentManager */}
          <Route path="/ManageDepartmentManager" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (userRole) {
                case 'R1': return <SuperAdminManageDepartmentManager />;
                // case 'R2': return <SystemAdminManageDepartmentManager />;
                // case 'R3': return <HRManagerManageDepartmentManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageProjectManager */}
          <Route path="/ManageProjectManager" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (userRole) {
                case 'R1': return <SuperAdminManageDepartmentManager />;
                // case 'R2': return <SystemAdminManageProjectManager />;
                // case 'R3': return <HRManagerManageProjectManager />;
                // case 'R4': return <DepartmentManagerManageProjectManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageEmployee */}
          <Route path="/ManageEmployee" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = localStorage.getItem('userRoleid');
              switch (userRole) {
                case 'R1': return <SuperAdminManageEmployee />;
                // case 'R2': return <SystemAdminManageEmployee />;
                // case 'R3': return <HRManagerManageEmployee />;
                // case 'R4': return <DepartmentManagerManageEmployee />;
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
