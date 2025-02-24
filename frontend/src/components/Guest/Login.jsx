import React, { useState } from "react";
import ".../../assets/css/guest/Login.css";

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Email Step, 2: OTP Step
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Open and Close Modal
  const openModal = () => {
    setStep(1);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Generate a Random 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Handle Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    const otpCode = generateOtp();
    setGeneratedOtp(otpCode);
    alert(`Your OTP is: ${otpCode}`); // Mock OTP send, replace with API call
    setStep(2);
  };

  // Handle Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      alert("Invalid OTP. Please try again.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password reset successfully!"); // Replace with API call
    setIsModalOpen(false);
  };

  return (
    <div
      className="container-fluid"
      style={{
        backgroundImage: "url('img/background_img/bg2.jpg')",
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
        <form className="login-form">
          <div className="logo-container">
            <img src="img/testimonials/logo.jpg" alt="User Logo" className="logo" />
          </div>
          <p className="heading">Login</p>
          <div className="input-group">
            <input required placeholder="Username" name="username" type="text" />
          </div>
          <div className="input-group">
            <input required placeholder="Password" name="password" type="password" />
          </div>
          <div className="button-container">
            <button type="submit">Login</button>
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
  );
};

export default Login;
