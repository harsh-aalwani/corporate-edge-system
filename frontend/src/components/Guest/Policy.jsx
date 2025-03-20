// src/Policy.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Card Styles with more rounded corners
const cardContainer = {
  width: "320px",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  background: "#ffffff",
  margin: "20px auto",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const imageStyle = {
  width: "100%",
  height: "200px",
  objectFit: "cover",
  borderTopLeftRadius: "20px",
  borderTopRightRadius: "20px",
};

const contentStyle = {
  padding: "16px",
  background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  borderBottomLeftRadius: "20px",
  borderBottomRightRadius: "20px",
};

const titleStyle = {
  fontSize: "1.5rem",
  fontWeight: "600",
  margin: "0 0 10px",
  color: "#333",
};

const tagContainerStyle = {
  marginTop: "10px",
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
};

const tagColors = ["#4a90e2", "#e94e77", "#50e3c2", "#f5a623", "#bd10e0"];

const tagStyle = {
  padding: "5px 12px",
  color: "#fff",
  borderRadius: "20px",
  fontSize: "0.9rem",
};

// Updated button style to align it to the left
const buttonContainerStyle = {
  textAlign: "left",
  marginTop: "10px",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#4a90e2",
  color: "#fff",
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
};

const PolicyCard = ({ policy }) => {
  const navigate = useNavigate();

  // Navigate to DetailPage with dynamic data
  const handleLearnMore = () => {
    navigate("/DetailPage", {
      state: {
        title: policy.policyTitle,
        description: policy.policyDescription,
        image: "/img/demo2.jpeg",
        tags: policy.policyTag,
      },
    });
  };

  return (
    <div style={cardContainer}>
      <img style={imageStyle} src="/img/policies1.png" alt={policy.policyTitle} />
      <div style={contentStyle}>
        <h2 style={titleStyle}>{policy.policyTitle}</h2>
        <div style={tagContainerStyle}>
          {policy.policyTag.map((tag, index) => (
            <span
              key={index}
              style={{
                ...tagStyle,
                backgroundColor: tagColors[index % tagColors.length],
              }}
            >
              {tag.trim()}
            </span>
          ))}
        </div>
        {/* Left-aligned button */}
        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={handleLearnMore}>
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
};

const Policy = () => {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/policies/list");
        setPolicies(res.data);
      } catch (error) {
        console.error("Error fetching policies:", error);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {policies.map((policy, index) => (
        <PolicyCard key={index} policy={policy} />
      ))}
    </div>
  );
};

export default Policy;
