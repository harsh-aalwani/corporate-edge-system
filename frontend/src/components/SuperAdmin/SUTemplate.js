import React, { useState ,useEffect } from 'react';
import {Link, useNavigate,useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack'; // Import useSnackbar

// CSS
import '../../assets/css/fonts.min.css';
import '../../assets/css/MainStyle.min.css';
import logo from '../../website-settings/img/custom_logo.png';
import supportIcon from '../../website-settings/img/ces_logo_nobg.png';
import "../../assets/css/Main/CommonTemplate.css";
// Required Hooks and Components
import useSidebarLogic from '../../assets/js/useSidebar.js';
import UserActivityHandler from '../../components/Main/UserActivityHandler.js'; // Import UserActivityHandler
import {getUserRoleCookie, removeUserRoleCookie } from '../../utils/cookieHelper';
import useSocket from '../../components/Main/useSocket.js';
const SUTemplate = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar(); // To show snackbar notifications
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  useSocket();
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          credentials: 'include', // Include session cookie
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.data) {
            setFullName(data.data.fullName);
            setUserEmail(data.data.userEmail);
          } else {
            removeUserRoleCookie();
            enqueueSnackbar('Profile data is missing.', { variant: 'error' });
          }
        } else {
          removeUserRoleCookie();
          const errorData = await response.json();
          enqueueSnackbar(errorData.message || 'Failed to fetch user profile', { variant: 'error' });
        }
      } catch (error) {
        removeUserRoleCookie();
        console.error('Error fetching profile:', error);
        enqueueSnackbar('An error occurred while fetching the profile', { variant: 'error' });
      }
    };

    fetchProfile();
  }, [enqueueSnackbar]);

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useSidebarLogic();

  // Helper function to check if the current route matches any of the given paths
  const isActive = (paths) => {
    if (Array.isArray(paths)) {
      // Check if the current location matches any of the paths or starts with any of the paths
      return paths.some((path) => location.pathname === path || location.pathname.startsWith(path));
    }
    // If not an array, just return false
    return false;
  };

  return (
    <div className={`wrapper`}>
      {/* Sidebar */}
      <div className="sidebar" data-background-color="dark">
        <div className="sidebar-logo">
        <div className="logo-header" data-background-color="dark">
          <a href="#" className="logo">
            <img src={logo} alt="navbar brand" className="navbar-brand" height="auto" width="100.25rem" />
          </a>
          <div className="nav-toggle">
            <button className="btn btn-toggle toggle-sidebar" id="toggle-sidebar">
              <i className="gg-menu-right"></i>
            </button>
          </div>
          <button className="topbar-toggler more">
            <i className="gg-more-vertical-alt"></i>
          </button>
        </div>
      </div>

      <div className="sidebar-wrapper scrollbar scrollbar-inner">
        <div className="sidebar-content">
          <ul className="nav nav-secondary">
            <li className="nav-section">
              <span className="sidebar-mini-icon">
                <i className="fa fa-ellipsis-h"></i>
              </span>
              <h4 className="text-section">Components</h4>
            </li>
            
            {/* Dashboard */}
            <li className={`nav-item ${isActive(['/dashboard']) ? 'active' : ''}`}>
              <Link to="/dashboard" className="collapsed">
                <i className="fas fa-home"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* Manage Users */}
            <li className={`nav-item ${isActive(['/ManageSystemAdmin', '/ManageHRManager', '/ManageDepartmentManager', '/ManageProjectManager', '/ManageEmployee']) ? 'active' : ''}`}>
              <Link to="#" data-bs-toggle="collapse">
                <i className="fas fa-users-cog"></i>
                <p>Manage Users</p>
                <span className="caret"></span>
              </Link>
              <div className="collapse" id="sidebarLayouts">
                <ul className="nav nav-collapse">
                  <li className={isActive(['/ManageSystemAdmin']) ? 'active' : ''}>
                    <Link to="/ManageSystemAdmin">
                      <span className="sub-item">System Admin</span>
                    </Link>
                  </li>
                  <li className={isActive(['/ManageHRManager']) ? 'active' : ''}>
                    <Link to="/ManageHRManager">
                      <span className="sub-item">HR Manager</span>
                    </Link>
                  </li>
                  <li className={isActive(['/ManageDepartmentManager']) ? 'active' : ''}>
                    <Link to="/ManageDepartmentManager">
                      <span className="sub-item">Department-Manager</span>
                    </Link>
                  </li>
                  {/* <li className={isActive(['/ManageProjectManager']) ? 'active' : ''}>
                    <Link to="/ManageProjectManager">
                      <span className="sub-item">Project-Manager</span>
                    </Link>
                  </li> */}
                  <li className={isActive(['/ManageEmployee']) ? 'active' : ''}>
                    <Link to="/ManageEmployee">
                      <span className="sub-item">Employee</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* Add Department */}
            <li className={`nav-item ${isActive(['/department']) ? 'active' : ''}`}>
              <Link to="/departments">
                <i className="fas fa-building"></i>
                <p>Departments</p>
              </Link>
            </li>

            {/* Leave Management */}
            <li className={`nav-item ${isActive(['/LeaveManagement', '/List']) ? 'active' : ''}`}>
              <Link to="#" data-bs-toggle="collapse">
                <i className="fas fa-id-card"></i>
                <p>Leave Management</p>
                <span className="caret"></span>
              </Link>
              <div className="collapse" id="tables">
                <ul className="nav nav-collapse">
                  <li className={isActive(['/LeaveManagement']) ? 'active' : ''}>
                    <Link to="/LeaveManagement">
                      <span className="sub-item">Leave Allocation</span>
                    </Link>
                  </li>
                  <li className={isActive(['/AnnouncementTable']) ? 'active' : ''}>
                    <Link to="/List">
                      <span className="sub-item">Leave Request</span>
                    </Link>
                  </li>
                 
                </ul>
              </div>
            </li>

            {/* Organization Chart */}
            <li className={`nav-item ${isActive(['/OrganizationChart']) ? 'active' : ''}`}>
              <Link to="/OrganizationChart">
                <i className="fas fa-sitemap"></i>
                <p>Organization Chart</p>
              </Link>
            </li>

            {/* Announcement */}
            <li className={`nav-item ${isActive(['/AddAnnouncement', '/AnnouncementList', '/ReceiveAnnouncement']) ? 'active' : ''}`}>
              <Link to="/Announcements" data-bs-toggle="collapse">
                <i className="fas fa-bullhorn"></i>
                <p>Announcement</p>
                <span className="caret"></span>
              </Link>
              <div className="collapse" id="tables">
                <ul className="nav nav-collapse">
                  <li className={isActive(['/AddAnnouncement']) ? 'active' : ''}>
                    <Link to="/AddAnnouncement">
                      <span className="sub-item">Add Announcement</span>
                    </Link>
                  </li>
                  <li className={isActive(['/AnnouncementTable']) ? 'active' : ''}>
                    <Link to="/AnnouncementList">
                      <span className="sub-item">Manage Announcement</span>
                    </Link>
                  </li>
                  <li className={isActive(['/ReceiveAnnouncement']) ? 'active' : ''}>
                    <Link to="/ReceiveAnnouncement">
                      <span className="sub-item">Receive Announcement</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            {/* My Profile */}
            <li className={`nav-item ${isActive(['/MyProfile']) ? 'active' : ''}`}>
              <Link to="/MyProfile">
                <i className="fas fa-user"></i>
                <p>My Profile</p>
              </Link>
            </li>

            {/* Logs */}
            <li className={`nav-item ${isActive(['/SystemAccessLog', '/UserLog', '/DepartmentLog']) ? 'active' : ''}`}>
              <Link to="/Logs" data-bs-toggle="collapse">
                <i className="fas fa-cogs"></i>
                <p>Logs</p>
                <span className="caret"></span>
              </Link>
              <div className="collapse" id="tables">
                <ul className="nav nav-collapse">
                  {/* <li className={isActive(['/SystemAccessLog']) ? 'active' : ''}>
                    <Link to="/SystemAccessLog">
                      <span className="sub-item">System Access log</span>
                    </Link>
                  </li> */}
                  <li className={isActive(['/UserLog']) ? 'active' : ''}>
                    <Link to="/UserLog">
                      <span className="sub-item">User Access log</span>
                    </Link>
                  </li>
                   <li className={isActive(['/DepartmentLog']) ? 'active' : ''}>
                    <Link to="/DepartmentLog">
                      <span className="sub-item">Department log</span>
                    </Link>
                  </li>
                  <li className={isActive(['/AnnouncementLog']) ? 'active' : ''}>
                    <Link to="/Announcementlog">
                      <span className="sub-item">Announcement log</span>
                    </Link>
                  </li>
                  {/*
                  <li className={isActive(['/VacancyLog']) ? 'active' : ''}>
                    <Link to="/VacancyLog">
                      <span className="sub-item">Vacancy log</span>
                    </Link>
                  </li>
                  <li className={isActive(['/CandidateLog']) ? 'active' : ''}>
                    <Link to="/CandidateLog">
                      <span className="sub-item">Candidate log</span>
                    </Link>
                  </li>
                  <li className={isActive(['/Websiteupdatelog']) ? 'active' : ''}>
                    <Link to="/Websiteupdatelog">
                      <span className="sub-item">Website update log</span>
                    </Link>
                  </li>
                  <li className={isActive(['/Leavelog']) ? 'active' : ''}>
                    <Link to="/Leavelog">
                      <span className="sub-item">Leave log</span>
                    </Link>
                  </li> */}
                  {/* <li className={isActive(['/ProjectLog']) ? 'active' : ''}>
                    <Link to="/ProjectLog">
                      <span className="sub-item">Project Log</span>
                    </Link>
                  </li> */}
                  {/* <li className={isActive(['/EmployeeConcernslog']) ? 'active' : ''}>
                    <Link to="/EmployeeConcernslog">
                      <span className="sub-item">Employee Concerns log</span>
                    </Link>
                  </li>
                  <li className={isActive(['/EmployeeAppraisallog']) ? 'active' : ''}>
                    <Link to="/EmployeeAppraisallog">
                      <span className="sub-item">Employee Appraisal log</span>
                    </Link>
                  </li> */}
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
      {/* End Sidebar */}

      <div className={`main-panel`}>
        <header className="main-header" style={{boxShadow: 'rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px' }}>
          <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
            <div className="container-fluid">
              <nav className="navbar navbar-header-left navbar-expand-lg navbar-form  p-0 d-none d-lg-flex">
                <div className="website-title">Corporate Edge System</div>
              </nav>
              <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">

                {/* <li className="nav-item topbar-icon dropdown hidden-caret">
                  <a className="nav-link" data-bs-toggle="dropdown" href="#" aria-expanded="false">
                    <i className="fas fa-layer-group"></i>
                  </a>
                  <div className="dropdown-menu quick-actions animated fadeIn">
                    <div className="quick-actions-header">
                      <span className="title mb-1">Quick Actions</span>
                      <span className="subtitle op-7">Shortcuts</span>
                    </div>
                    <div className="quick-actions-scroll scrollbar-outer">
                      <div className="quick-actions-items">
                        <div className="row m-0">
                          {['Calendar', 'Maps', 'Reports', 'Emails', 'Invoice', 'Payments'].map((action, index) => (
                            <a key={index} className="col-6 col-md-4 p-0" href="#">
                              <div className="quick-actions-item">
                                <div className={`avatar-item bg-${['danger', 'warning', 'info', 'success', 'primary', 'secondary'][index]} rounded-circle`}>
                                  <i className={`fas fa-${['calendar-alt', 'map', 'file-excel', 'envelope', 'file-invoice-dollar', 'credit-card'][index]}`}></i>
                                </div>
                                <span className="text">{action}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </li> */}


              <li className="nav-item topbar-user dropdown hidden-caret">
                <a
                  className="dropdown-toggle profile-pic"
                  data-bs-toggle="dropdown"
                  href="#"
                  aria-expanded="false"
                >

                  <span className="profile-username">
                    <span className="op-7">Hi, </span>
                    <span className="fw-bold">{fullName.split(' ')[0]}</span>
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-user animated fadeIn">
                    <div className="dropdown-user-scroll scrollbar-outer">
                      <li>
                        <div className="user-box">
                          {/* <div className="avatar-lg">
                          <img
                            alt="User"
                            className="avatar-img rounded"
                          />
                        </div> */}
                          <div className="u-text">
                            <h4 className="fw-bold">{fullName}</h4>
                            <p className="text-muted">{userEmail}</p>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-divider"></div>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/MyProfile">
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <div className="dropdown-divider"></div>
                      </li>
                      <li>
                        <UserActivityHandler />
                      </li>
                    </div>
                  </ul>
              </li>

              </ul>
            </div>
          </nav>
        </header>

        <main className="container" style={{ backgroundColor: '#f2f5f5' }}>
          {children}
        </main>

        <footer className="footer-area footer--light" style={{ background: '#1A2035' }}>
          <div className="footer-big" style={{ padding: '105px 0 65px 0' }}>
            <div className="container">
              <div className="row">
                {/* Contact Support Section */}
                <div className="col-md-3 col-sm-12">
                  <div className="footer-widget" style={{ marginBottom: '40px' }}>
                    <div className="widget-about">
                      <img src={supportIcon} alt="Get Support:" className="img-f  luid" style={{ display: 'block', marginBottom: '30px', marginLeft: '30px', height: '8rem', maxWidth: '100%'}} />
                      <p style={{ fontSize: '16px', lineHeight: '30px', color: '#898b96', fontWeight: 300 }}>Contact us for Support:</p>
                      <ul class Name="contact-details" style={{ margin: '30px 0 0 0', padding: 0, listStyle: 'none' }}>
                        <li style={{ marginBottom: '10px' }}>
                          <span className="icon-earphones" style={{ paddingRight: '12px' }}></span> Call Us:
                          <a href="tel:344-755-111" style={{ color: '#5867dd', textDecoration: 'none', transition: '.3s' }}>344-755-111</a>
                        </li>
                        <li style={{ marginBottom: 0 }}>
                          <span className="icon-envelope-open" style={{ paddingRight: '12px' }}></span>
                          <a href="mailto:support@aazztech.com" style={{ color: '#5867dd', textDecoration: 'none', transition: '.3s' }}>Projectces@gmail.com</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Popular Category Section */}
                <div className="col-md-3 col-sm-4">
                  <div className="footer-widget" style={{ marginBottom: '40px' }}>
                    <div className="footer-menu footer-menu--1" style={{ paddingLeft: '48px' }}>
                      <h4 className="footer-widget-title" style={{ lineHeight: '42px', marginBottom: '10px', fontSize: '18px', fontFamily: 'Rubik, sans-serif', color: 'white' }}>Popular Category</h4>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {['Dashboard', 'System Admin', 'HR manager', 'Department-Manager', 'Project-Manager','Employee','Manage Department','Employee Asistance','Announcement','Logs'].map((item) => (
                          <li key={item} style={{ lineHeight: '32px' }}>
                            <a href="#" style={{ fontSize: '15px', color: '#898b96', textDecoration: 'none', transition: '.3s' }}>{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Our Company Section */}
                <div className="col-md-3 col-sm-4">
                  <div className="footer-widget" style={{ marginBottom: '40px' }}>
                    <div className="footer-menu" style={{ paddingLeft: '48px' }}>
                      <h4 className="footer-widget-title" style={{ lineHeight: '42px', marginBottom: '10px', fontSize: '18px', fontFamily: 'Rubik, sans-serif', color: 'white' }}>Our Company</h4>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {['Home', 'Company Policy', 'Organization Chart', 'Public Announcement', 'About Us'].map((item) => (
                          <li key={item} style={{ lineHeight: '32px' }}>
                            <a href="#" style={{ fontSize: '15px', color: '#898b96', textDecoration: 'none', transition: '.3s' }}>{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Help Support Section */}
                <div className="col-md-3 col-sm-4">
                  <div className="footer-widget" style={{ marginBottom: '40px' }}>
                    <div className="footer-menu no-padding" style={{ padding: '0!important' }}>
                      <h4 className="footer-widget-title" style={{ lineHeight: '42px', marginBottom: '10px', fontSize: '18px', fontFamily: 'Rubik, sans-serif', color: 'white' }}>Logs</h4>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {['User log'].map((item) => (
                          <li key={item} style={{ lineHeight: '32px' }}>
                            <a href="#" style={{ fontSize: '15px', color: '#898b96', textDecoration: 'none', transition: '.3s' }}>{item}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    className="backToTop"
                    onClick={backToTop}
                    style={{
                      lineHeight: '40px',
                      cursor: 'pointer',
                      width: '40px',
                      background: '#5867dd',
                      color: '#fff',
                      position: 'fixed',
                      boxShadow: '0 4px 4px rgba(0,0,0,.1)',
                      borderRadius: '50%',
                      right: 'calc((100% - 1200px)/ 2)',
                      zIndex: 111,
                      bottom: '80px',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      className="icon-arrow-up"
                      style={{
                        display: 'inline-block',
                      }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SUTemplate;