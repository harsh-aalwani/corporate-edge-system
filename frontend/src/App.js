import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Loader from './components/Main/Loader';
import ProtectedRoute from './components/Main/ProtectedRoute';
import JsonData from "./components/data/data.json";

// Guest Pages
import Login from './pages/Guest/Login';
import MainLayout from "./pages/Layout/MainLayout";
import AuthLayout from "./pages/Layout/AuthLayout";
import { Header } from "./components/Guest/header";
import { Features } from "./components/Guest/features";
import { About } from "./components/Guest/about";
import { Services } from "./components/Guest/services";
import { Team } from "./components/Guest/Team";
import { Contact } from "./components/Guest/contact";
import JobAnnouncement from "./components/Guest/JobAnnouncement";
import JobVacancy from "./components/Guest/JobVacancy";

// SuperAdmin Modules
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminManageSystemAdmin from './pages/SuperAdmin/Manage/MngSystemAdmin';
import SuperAdminManageHRManager from './pages/SuperAdmin/Manage/MngHRManager';
import SuperAdminManageDepartmentManager from './pages/SuperAdmin/Manage/MngDepartmentManager';
import SuperAdminManageProjectManager from './pages/SuperAdmin/Manage/MngProjectManager';
import SuperAdminManageEmployee from './pages/SuperAdmin/Manage/MngEmployee';
import SuperAdminAddUser from './pages/SuperAdmin/Manage/AddUser';
import SuperAdminEditUser from './pages/SuperAdmin/Manage/EditUser';
import SuperAdminDepartmentsList from './pages/SuperAdmin/Departments/DepartmentsList'
import SuperAdminAddDepartments from './pages/SuperAdmin/Departments/AddDepartments'
import SuperAdminEditDepartments from './pages/SuperAdmin/Departments/EditDepartments';
import SuperAdminAddAnnouncment from './pages/SuperAdmin/Announcements/AddAnnouncement';
import SuperAdminAnnouncementList from './pages/SuperAdmin/Announcements/AnnouncementList';
import SuperAdminEditAnnouncements from './pages/SuperAdmin/Announcements/EditAnnouncement';
import SuperAdminReceiveAnnouncement from './pages/SuperAdmin/Announcements/ReceiveAnnouncement';
import HRAdminPrivateAnnouncment from './pages/HRManager/Announcements/PrivateAnnouncements';
import DepartmentManagerPrivateAnnouncment from './pages/DepartmentManager/Announcements/PrivateAnnouncements';
import EmployeePrivateAnnouncment from './pages/Employee/Announcements/PrivateAnnouncements';
import SystemAdminAddAnnouncment from './pages/SystemAdmin/Announcements/SYAddAnnouncement';
import SystemAdminAnnouncementList from './pages/SystemAdmin/Announcements/SYAnnouncementList';
import SystemAdminEditAnnouncements from './pages/SystemAdmin/Announcements/SYEditAnnouncement';
import SystemAdminReceiveAnnouncement from './pages/SystemAdmin/Announcements/SYReceiveAnnouncement';
import EmployeeRaiseaConcern from './pages/Employee/EmployeeAssistance/RaiseaConcern';
import DepartmentManagerEmployeeConcerns from './pages/DepartmentManager/EmployeeConcerns/EmployeeConcerns';
import HREmployeeConcerns from './pages/HRManager/EmployeeConcerns/FinalEmployeeConcerns';
import EmployeeRaiseaAppraisal from './pages/Employee/EmployeeAssistance/RaiseaAppraisal';
import DepartmentManagerEmployeeAppraisal from './pages/DepartmentManager/EmployeeAppraisal/EmployeeAppraisal';
import HREmployeeAppraisal from './pages/HRManager/EmployeeAppraisal/FinalEmployeeAppraisal'; 
// SystemAdmin Modules
import SystemAdminDashboard from './pages/SystemAdmin/Dashboard';
// HRManager Modules
import HRManagerDashboard from './pages/HRManager/Dashboard';
import HRJobListing from './pages/HRManager/Recruitment/HRJobListing';
import HRCandidateList from './pages/HRManager/Recruitment/HRCandidateList';
// Department Modules
import DepartmentManagerDashboard from './pages/DepartmentManager/Dashboard';
// Employee Dashboard Modules
import EmployeeDashboard from './pages/Employee/Dashboard';
import {getUserRoleCookie, removeUserRoleCookie } from './utils/cookieHelper';


// Candidate Evaluator Modules
import CandidateEvaluatorLogin from './pages/CandidateEvaluator/Login';
import CandidateEvaluatorDashboard from './pages/CandidateEvaluator/dashboard';
import CandidateEvaluation from './pages/CandidateEvaluator/CandidateEvaluation';


const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setIsLoading(false);
    setLandingPageData(JsonData);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <Router>
        <Routes>
        {/* Guest Routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <>
                <Header data={landingPageData.Header} />
                <Features data={landingPageData.Features} />
                <About data={landingPageData.About} />
                <Services data={landingPageData.Services} />
                <Team data={landingPageData.Team} />
                <Contact data={landingPageData.Contact} />
              </>
            }
          />
          <Route path="/features" element={<Features data={landingPageData.Features} />} />
          <Route path="/about" element={<About data={landingPageData.About} />} />
          <Route path="/services" element={<Services data={landingPageData.Services} />} />
          <Route path="/team" element={<Team data={landingPageData.Team} />} />
          <Route path="/contact" element={<Contact data={landingPageData.Contact} />} />
          <Route path="/PublicAnnouncement" element={<JobAnnouncement />} />
          <Route path="/JobApplicationForm" element={<JobVacancy />} />
        </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/EvaluatorLogin" element={<CandidateEvaluatorLogin />} />

          {/* Role-Based Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['R1', 'R2', 'R3', 'R4', 'R5']} Component={
            () => {
            const userRole = getUserRoleCookie();
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

          {/* Add Form */}
          <Route path="/AddUser" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminAddUser />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* Edit Form */}
          <Route path="/EditUser" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminEditUser />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageSystemAdmin */}
          <Route path="/ManageSystemAdmin" element={<ProtectedRoute requiredRoles={['R1']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminManageSystemAdmin />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageHRManager */}
          <Route path="/ManageHRManager" element={<ProtectedRoute requiredRoles={['R1','R2']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminManageHRManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageDepartmentManager */}
          <Route path="/ManageDepartmentManager" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminManageDepartmentManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageProjectManager */}
          <Route path="/ManageProjectManager" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminManageProjectManager />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* ManageEmployee */}
          <Route path="/ManageEmployee" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminManageEmployee />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />
          {/* ManageEmployee */}
          <Route path="/ManageEmployee" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminManageEmployee />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* Departments List */}
          <Route path="/departments" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminDepartmentsList />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* Departments List */}
          <Route path="/AddDepartment" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminAddDepartments />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          {/* Departments List */}
          <Route path="/EditDepartment/:departmentIds" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminEditDepartments />;
                default: return <Navigate to="/login" />;
              }
            }
          } />} />

          <Route path="/AddAnnouncement" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
            () => {
              const userRole = getUserRoleCookie();
              switch (userRole) {
                case 'R1': return <SuperAdminAddAnnouncment />;
                default: return <Navigate to="/login" />;
              }
            }
            } />} />
            <Route path="/AnnouncementList" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R1': return <SuperAdminAnnouncementList />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/EditAnnouncement/:announcementIds" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R1': return <SuperAdminEditAnnouncements />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/PrivateAnnouncements" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R3': return <HRAdminPrivateAnnouncment />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/PrivateAnnouncements" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R4': return <DepartmentManagerPrivateAnnouncment />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/PrivateAnnouncements" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R5': return <EmployeePrivateAnnouncment />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/ReceiveAnnouncement" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R1': return <SuperAdminReceiveAnnouncement />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/RaiseaConcern" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R5': return <EmployeeRaiseaConcern />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/EmployeeConcerns" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R4': return <DepartmentManagerEmployeeConcerns />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
          
          <Route path="/FinalEmployeeConcerns" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R3': return <HREmployeeConcerns />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
                <Route path="/RaiseaAppraisal" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R5': return <EmployeeRaiseaAppraisal />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/EmployeeAppraisal" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R4': return <DepartmentManagerEmployeeAppraisal />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
          <Route path="/FinalEmployeeAppraisal" element={<ProtectedRoute requiredRoles={['R1','R2','R3','R4','R5']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R3': return <HREmployeeAppraisal />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />

            {/* super Admin */}
            <Route path="/SYAddAnnouncement" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R2': return <SystemAdminAddAnnouncment />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
                <Route path="/SYAnnouncementList" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R2': return <SystemAdminAnnouncementList />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/SYEditAnnouncement/:announcementIds" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R2': return <SystemAdminEditAnnouncements />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/SYReceiveAnnouncement" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R2': return <SystemAdminReceiveAnnouncement />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/Recruitment" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R3': return <HRJobListing />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />
            <Route path="/CandidateList/:announcementId" element={<ProtectedRoute requiredRoles={['R1','R2','R3']} Component={
              () => {
                const userRole = getUserRoleCookie();
                switch (userRole) {
                  case 'R3': return <HRCandidateList />;
                  default: return <Navigate to="/login" />;
                }
              }
            } />} />     
            <Route
              path="/EvaluatorDashboard"
              element={
                <ProtectedRoute
                  requiredRoles={['R1', 'R2', 'R3', 'R4', 'R5']}
                  Component={() => {
                    return ['R1', 'R2', 'R3', 'R4', 'R5'].includes(getUserRoleCookie()) 
                      ? <CandidateEvaluatorDashboard />
                      : <Navigate to="/EvaluatorLogin" />;
                  }}
                />
              }
            />
            <Route
              path="/CandidateEvaluation/:announcementId"
              element={
                <ProtectedRoute
                  requiredRoles={['R1', 'R2', 'R3', 'R4', 'R5']}
                  Component={() => {
                    return ['R1', 'R2', 'R3', 'R4', 'R5'].includes(getUserRoleCookie()) 
                      ? <CandidateEvaluation/>
                      : <Navigate to="/EvaluatorLogin" />;
                  }}
                />
              }
            />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
};

export default App;
