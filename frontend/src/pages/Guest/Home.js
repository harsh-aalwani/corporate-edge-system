import React from 'react';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate();
  const handleLoginButton = () => {
    navigate('/login');
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          color: "#007bff",
          margin: "20px 0",
        }}
      >
        Welcome to the Corporate Edge System
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#333",
          marginBottom: "30px",
        }}
      >
        Your one-stop solution for managing corporate workflows seamlessly.
      </p>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          color: "#fff",
          backgroundColor: "#007bff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = "#0056b3")
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = "#007bff")
        }
        onClick={handleLoginButton}
      >
        Login
      </button>
      <footer
        style={{
          marginTop: "50px",
          fontSize: "0.9rem",
          color: "#666",
        }}
      >
        © 2025 Corporate Edge System. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
