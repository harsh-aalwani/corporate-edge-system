// src/DetailPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Page Styles
const pageStyle = {
  width: "100vw",
  margin: "0",
  padding: "0",
  background: "linear-gradient(to bottom right, #f5f7fa, #c3cfe2)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const bannerStyle = {
  width: "100%",
  height: "260px",
  background: "linear-gradient(to bottom, #ffd479, #ff7eb3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
};

const bannerTextContainer = {
  position: "absolute",
  bottom: "-50px",
  background: "#fff",
  padding: "15px 30px",
  borderRadius: "10px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
  textAlign: "center",
};

const bannerTitleStyle = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  color: "#333",
};

// Updated container style with gradient background instead of plain white
const containerStyle = {
  width: "100vw",
  maxWidth: "1700px",
  marginTop: "1px", // Adjusted to account for the banner overlap
  padding: "25px",
  borderRadius: "12px",
  background: "linear-gradient(to right, #f0f8ff, #c3cfe2)", // Updated background color
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

const titleStyle = {
  fontSize: "1rem",
  fontWeight: "700",
  marginBottom: "20px",
  color: "#333",
};

const descriptionStyle = {
  fontSize: "1.2rem",
  color: "#555",
  lineHeight: "1.8",
  marginBottom: "20px",
};

const tagContainerStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "20px",
};

const tagStyle = {
  padding: "5px 12px",
  backgroundColor: "#4a90e2",
  color: "#fff",
  borderRadius: "20px",
  fontSize: "0.9rem",
};

const buttonStyle = {
  padding: "12px 24px",
  backgroundColor: "#4a90e2",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "600",
  textTransform: "uppercase",
};

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic data from state
  const { title, description, image, tags } = location.state || {
    title: "No Title Available",
    description: "No description provided. Please check back later.",
    image: "/img/demo.jpg",
    tags: [],
  };

  // Handle Go Back
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={pageStyle}>
      {/* Top Banner Section */}
      <div style={bannerStyle}>
        <img
          src={image || "/img/demo.jpg"}
          alt="Banner"
          style={{ width: "400px", height: "auto" }}
        />
        <div style={bannerTextContainer}>
          <h1 style={bannerTitleStyle}>{title}</h1>
        </div>
      </div>

      {/* Main Content Container with updated background */}
      <div style={containerStyle}>
        <div style={tagContainerStyle}>
          {tags.map((tag, index) => (
            <span key={index} style={tagStyle}>
              {tag}
            </span>
          ))}
        </div>
        <p
          style={descriptionStyle}
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>

        {/* Button to Go Back */}
        <button onClick={handleGoBack} style={buttonStyle}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default DetailPage;
