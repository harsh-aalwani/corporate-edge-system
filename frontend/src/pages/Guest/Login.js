import React, { useState , useEffect} from 'react';
import styled from "styled-components";

import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import { setUserRoleCookie , getUserRoleCookie } from '../../utils/cookieHelper';
import backgroundImage from "../../assets/img/Login/background_login.jpg";
import profileImage from "../../assets/img/Login/logo.jpg";

const Login = () => {
  const navigate = useNavigate(); // useNavigate should work because it's inside Router context
  const { enqueueSnackbar } = useSnackbar(); // For notifications

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Email Step, 2: OTP Step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check if user is already logged in (via userRoleid in Cookie)
  useEffect(() => {
    const userRoleid = getUserRoleCookie();
    if (userRoleid) {
      navigate('/dashboard'); 
    }
  }, [navigate]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    // Validate email and password
    if (!email || !password) {
      enqueueSnackbar('Please enter both email and password', { variant: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email, userPassword: password }),
        credentials: 'include', // Include credentials for session management
      });

      const data = await response.json();

      if (response.ok) {
        enqueueSnackbar('Login successful!', { variant: 'success' });
        const encryptedRole = data.encryptedRole;
        setUserRoleCookie(encryptedRole);
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        enqueueSnackbar(data.message || 'Login failed!', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('An error occurred during login', { variant: 'error' });
    }
  };

    // Open and Close Modal
    const openModal = () => {
      setStep(1);
      setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

  // Handle Send OTP (API call)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/authuser/sendotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        enqueueSnackbar(data.message, { variant: 'success' }); // Show success snackbar
        setStep(2);
      } else {
        enqueueSnackbar(data.message || "Error sending OTP. Please try again.", { variant: 'error' }); // Show error snackbar
      }
    } catch (error) {
      enqueueSnackbar("Error sending OTP. Please try again.", { variant: 'error' }); // Show error snackbar
    }
  };

  // Handle Reset Password (API call)
  const handleResetPassword = async (e) => {

    try {
      const response = await fetch("http://localhost:5000/api/authuser/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        enqueueSnackbar(data.message, { variant: 'success' }); // Show success snackbar
        setIsModalOpen(false); // Close modal
      } else {
        enqueueSnackbar(data.message || "Error resetting password. Please try again.", { variant: 'error' }); // Show error snackbar
      }
    } catch (error) {
      enqueueSnackbar("Error resetting password. Please try again.", { variant: 'error' }); // Show error snackbar
    }
  };

  return (
    <StyledWrapper>
      <div
        className="container-fluid"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="login-container">
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="logo-container">
              <img src={profileImage} alt="User Logo" className="logo" />
            </div>
            <p className="heading">Login</p>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <button className="button-container" type="submit">Login</button>
            </div>
            <div className="bottom-text">
              <p>
                <a href="#" onClick={openModal}>
                  Forgot password?
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Forgot Password Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content animate">
              <span className="close-btn" onClick={closeModal}>&times;</span>
              {step === 1 ? (
                <>
                  <h2 className="modal-title">Reset Password</h2>
                  <p className="modal-desc">Enter your email to receive an OTP.</p>
                  <form onSubmit={handleSendOtp}>
                    <input
                      type="email"
                      className="modal-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="modal-btn">Send OTP</button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="modal-title">Enter OTP & Reset Password</h2>
                  <form onSubmit={handleResetPassword}>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      className="modal-input"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      className="modal-input"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="modal-btn">Reset Password</button>
                  </form>
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;

  .login-container {
    background-color: rgb(227, 238, 243);
    border-radius: 8px;
    box-shadow: rgb(219, 207, 207) 0px -23px 25px 0px inset,
      rgb(108 108 108 / 23%) 0px -36px 30px 0px inset,
      rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px,
      rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px,
      rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    margin: 50px auto 0 auto;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .logo {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
  }

  .login-form {
    display: flex;
    flex-direction: column;
  }

  .heading {
    color: #110f0f;
    font-weight: 500;
    font-size: 2.6rem;
    margin-bottom: 5px;
  }

  .paragraph {
    color: #ffffff;
    font-weight: 400;
    font-size: 15px;
    margin-bottom: 15px;
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-group input {
    background: none;
    border: 1px solidrgb(89, 89, 89);
    padding: 15px 23px;
    font-size: 18px;
    border-radius: 8px;
    color:rgb(0, 0, 0);
    width: 100%;
    box-shadow: rgb(136 136 136 / 17%) 0px -23px 25px 0px inset,
      rgb(81 81 81 / 23%) 0px -36px 30px 0px inset,
      rgba(255, 255, 255, 0.74) 0px -79px 40px 0px inset;
  }

  .input-group input:focus {
    border-color: #0173ed;
    outline: none;
  }

  button {
    padding: 15px;
    border: none;
    border-radius: 8px;
    background-color: #0a0a0a;
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #2a3138;
  }

  .bottom-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 20px;
    color: #1a0505;
    font-size: 15px;
    font-weight: 400;
  }

  .bottom-text a {
    color: #364350;
    text-decoration: none;
    font-size: large;
    transition: color 0.3s ease;
  }

  .bottom-text a:hover {
    color: #3f4e5e;
  }

  .button-container {
    display: flex;
    width: 100%;
    justify-content: center;
    background-color: #0a0a0a;
    border-radius: 8px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-in-out;
  }

  .modal-content {
    background: #fff;
    padding: 25px;
    border-radius: 10px;
    width: 350px;
    text-align: center;
    position: relative;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-20px);
    animation: slideIn 0.3s ease-in-out forwards;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 20px;
    cursor: pointer;
    color: #333;
  }

  .close-btn:hover {
    color: red;
  }

  .modal-title {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  .modal-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }

  .modal-input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
    margin-bottom: 15px;
  }

  .modal-input:focus {
    border-color: #007bff;
  }

  .modal-btn {
    background: #424952;
    color: #fff;
    padding: 10px 15px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    width: 100%;
  }

  .modal-btn:hover {
    background: #101011;
  }
`;

export default Login;
