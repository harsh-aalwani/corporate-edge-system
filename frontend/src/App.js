// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { SnackbarProvider } from 'notistack';  // Import SnackbarProvider
import Home from './pages/Guest/Home';
import Login from './pages/Guest/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import ManageSystemAdmin from './pages/SuperAdmin/Manage/MngSystemAdmin';
import ManageHRManager from './pages/SuperAdmin/Manage/MngHRManager';
import ManageDepartmentHead from './pages/SuperAdmin/Manage/MngDepartmentManager';
import ManageEmployee from './pages/SuperAdmin/Manage/MngEmployee';
import ManageProjectManager from './pages/SuperAdmin/Manage/MngProjectManager';
import ProtectedRoute from './components/Main/ProtectedRoute';

function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route
            path="/SuperAdminDashboard"
            element={
              <ProtectedRoute>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageSystemAdmin"
            element={
              <ProtectedRoute>
                <ManageSystemAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageHRManager"
            element={
              <ProtectedRoute>
                <ManageHRManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageDepartmentHead"
            element={
              <ProtectedRoute>
                <ManageDepartmentHead />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageProjectManager"
            element={
              <ProtectedRoute>
                <ManageProjectManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ManageEmployee"
            element={
              <ProtectedRoute>
                <ManageEmployee />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
