import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack'; // Import useSnackbar

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // To show snackbar notifications

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    // Check if the email and password are not empty
    if (!email || !password) {
      enqueueSnackbar('Please enter both email and password', { variant: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email, userPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        enqueueSnackbar('Login successful!', { variant: 'success' });
        navigate('/SuperAdminDashboard'); // Redirect to the Dashboard
      } else {
        enqueueSnackbar(data.message || 'Login failed!', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      enqueueSnackbar('An error occurred during login', { variant: 'error' });
    }
  };

  return (
    <StyledWrapper>
      <form className="login-form-control" onSubmit={handleLoginSubmit}>
        <p className="login-title">Login</p>
        <div className="login-input-field">
          <input
            required
            className="login-input"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Set email state
          />
          <label className="login-label">Enter Email</label>
        </div>
        <div className="login-input-field">
          <input
            required
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Set password state
          />
          <label className="login-label">Enter Password</label>
        </div>
        <a>Forgot your password?</a>
        <button className="login-submit-btn" type="submit">
          Sign In
        </button>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;

  .login-form-control {
    margin: 20px;
    background-color: #ffffff;
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
    width: 400px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    padding: 25px;
    border-radius: 8px;
  }
  .login-title {
    font-size: 28px;
    font-weight: 800;
  }
  .login-input-field {
    position: relative;
    width: 100%;
  }
  .login-input {
    margin-top: 15px;
    width: 100%;
    outline: none;
    border-radius: 8px;
    height: 45px;
    border: 1.5px solid #ecedec;
    background: transparent;
    padding-left: 10px;
  }
  .login-input:focus {
    border: 1.5px solid #2d79f3;
  }
  .login-input-field .login-label {
    position: absolute;
    top: 25px;
    left: 15px;
    color: #ccc;
    transition: all 0.3s ease;
    pointer-events: none;
    z-index: 2;
  }
  .login-input-field .login-input:focus ~ .login-label,
  .login-input-field .login-input:valid ~ .login-label {
    top: 5px;
    left: 5px;
    font-size: 12px;
    color: #2d79f3;
    background-color: #ffffff;
    padding-left: 5px;
    padding-right: 5px;
  }
  .login-submit-btn {
    margin-top: 30px;
    height: 55px;
    background: #f2f2f2;
    border-radius: 11px;
    border: 0;
    outline: none;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(180deg, #363636 0%, #1b1b1b 50%, #000000 100%);
    transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
    cursor: pointer;
  }
  .login-submit-btn:hover {
    box-shadow: 0px 0px 0px 2px #ffffff, 0px 0px 0px 4px #0000003a;
  }
`;

export default Login;
