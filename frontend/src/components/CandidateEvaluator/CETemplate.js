import React, { useState ,useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useSnackbar } from 'notistack'; // Import useSnackbar

// CSS
import '../../assets/css/fonts.min.css';
import '../../assets/css/MainStyle.min.css';
import supportIcon from '../../website-settings/img/ces_logo_nobg.png';
import "../../assets/css/Main/CommonTemplate.css";
// Required Hooks and Components
import UserActivityHandler from './UserActivityHandler.js'; // Import UserActivityHandler

const SUTemplate = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar(); // To show snackbar notifications
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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
            enqueueSnackbar('Profile data is missing.', { variant: 'error' });
          }
        } else {
          const errorData = await response.json();
          enqueueSnackbar(errorData.message || 'Failed to fetch user profile', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        enqueueSnackbar('An error occurred while fetching the profile', { variant: 'error' });
      }
    };

    fetchProfile();
  }, [enqueueSnackbar]); 

  return (
    <div className={`wrapper sidebar_minimize`}>
      <div className={`main-panel`} style={{width:"100%"}}>
        <header className="main-header" style={{boxShadow: 'rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px', width:"100%" }}>
          <nav className="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
            <div className="container-fluid">
              <nav className="navbar navbar-header-left navbar-expand-lg navbar-form  p-0 d-none d-lg-flex">
                <div className="website-title">Corporate Edge System</div>
              </nav>
              <ul className="navbar-nav topbar-nav ms-md-auto align-items-center">
                {/* Quick Actions */}
                <li className="nav-item topbar-icon dropdown hidden-caret">
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
                </li>

              {/* User Profile */}
              <li className="nav-item topbar-user dropdown hidden-caret">
                <a
                  className="dropdown-toggle profile-pic"
                  data-bs-toggle="dropdown"
                  href="#"
                  aria-expanded="false"
                >
                  {/* <div className="avatar-sm">
                    <img
                      alt="Profile"
                      className="avatar-img rounded-circle"
                    />
                  </div> */}
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
                          <h4 className="fw-bold">{fullName }</h4>
                          <p className="text-muted">{userEmail}</p>
                        </div>
                      </div>
                    </li>
                    <li><div className="dropdown-divider"></div></li>
                    <li>
                      <a className="dropdown-item" href="#">My Profile</a>
                    </li>
                    <li><div className="dropdown-divider"></div></li>
                    <li>
                      <Link className="dropdown-item" to="/dashboard">Go to Main Site</Link>
                    </li>
                    <li><div className="dropdown-divider"></div></li>
                    <li>
                      <UserActivityHandler/>
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
                        {['Dashboard', 'System Admin', 'HR manager', 'Department-Manager', 'Project-Manager','Employee','Manage Department','job Vacancy','Recruitment','Set Policy','Organization Chart','Leave Management','Employee Performance','Employee Asistance','Announcement','Logs'].map((item) => (
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
                        {['Announcement log','Candidate log','Leave log','Vacancy log','Project log'].map((item) => (
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