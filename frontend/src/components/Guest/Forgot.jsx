import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/guest/Forgot.css";
import { useSnackbar } from "notistack";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleEmailSubmit = () => {
    // Handle email submission logic
    setStep(2);
  };

const handleResetPassword = () => {
  if (newPassword === confirmPassword) {
    enqueueSnackbar("Password reset successfully!", { variant: "success" });
    navigate("/login");
  } else {
    enqueueSnackbar("Passwords do not match!", { variant: "error" });
  }
};

  return (
    <div className="forgot-password-container">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // Go to the previous page
        className="forgot-password-back-button"
      >
        Back
      </button>

      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Forgot Password</h2>

        {step === 1 && (
          <div className="forgot-password-input-box">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span>Email Address</span>
            <button
              className="forgot-password-reset-button"
              onClick={handleEmailSubmit}
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="forgot-password-input-box">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <span>OTP</span>
            </div>
            <div className="forgot-password-input-box">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span>New Password</span>
            </div>
            <div className="forgot-password-input-box">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span>Confirm Password</span>
            </div>
            <button
              className="forgot-password-reset-button"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Forgot;