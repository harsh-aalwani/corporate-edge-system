import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import parse from "html-react-parser";
import "./GuestAnnouncements.css";

const cardContainer = {
  width: "300px", // Smaller card width
  minHeight: "100px", // Minimum height to prevent shrinking
  borderRadius: "15px", // Border radius adjusted for a more compact look
  overflow: "hidden",
  boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  background: "#ffffff",
  margin: "10px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  display: "flex", // Enable flexbox on the card container
  flexDirection: "column", // Stack elements vertically
};

const heading2Style = {
  position: "relative",
  fontFamily: '"Raleway", sans-serif',
  fontSize: "2.4rem",
  textAlign: "center", // 👈 Add this line to center the heading
};

const contentStyle = {
  padding: "20px",
  background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
  borderBottomLeftRadius: "20px",
  borderBottomRightRadius: "20px",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start", // Keep elements aligned to the top
  gap: "10px", // Reduce the space between elements
};

const buttonContainerStyle = {
  textAlign: "left",
  marginTop: "10px", // Reduce margin between tags and button
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
  padding: "6px 14px", 
  color: "#fff",
  borderRadius: "20px",
  fontSize: "1rem",
};



const buttonStyle = {
  padding: "10px 18px", 
  backgroundColor: "#4a90e2",
  color: "#fff",
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
};


const JobAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/announcements/public-list");
        const pastAnnouncements = response.data.filter(
          (announcement) =>
            announcement.announcementPublic === true &&
            new Date(announcement.announcementScheduleTime) <= new Date()
        );
        setAnnouncements(pastAnnouncements);
      } catch (err) {
        console.error("Failed to load announcements");
      }
    };
    fetchAnnouncements();
  }, []);

  const handleLearnMore = (announcement) => {
    navigate(`/AnnouncementDetail/${announcement.announcementId}`, { state: announcement });
  };
  

  return (
    <div style={{ padding: "30px 40px" }}>
      <h2 style={heading2Style}>Announcements</h2> {/* 👈 Added Heading */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => (
            <motion.div
              key={announcement._id}
              style={cardContainer}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div style={contentStyle}>
                <h2 style={titleStyle}>{announcement.announcementTitle}</h2>
                <div style={tagContainerStyle}>
                  {announcement.announcementTag?.split(",").map((tag, index) => (
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
                <div style={buttonContainerStyle}>
                  <button style={buttonStyle} onClick={() => handleLearnMore(announcement)}>
                    Learn More →
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#555" }}>
            No Announcements Available
          </p>
        )}
      </div>
    </div>
  );
  
};

export default JobAnnouncement;