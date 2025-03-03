import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Button, Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import parse from "html-react-parser";
import JobVacancyForm from "./JobVacancy";
import "./GuestAnnouncements.css";

const GuestAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/announcements/public-list");
  
        // Get only announcements where schedule time has passed
        const pastAnnouncements = response.data.filter(
          (announcement) =>
            announcement.announcementPublic === true &&
            new Date(announcement.announcementScheduleTime) <= new Date()
        );

        setAnnouncements(pastAnnouncements);
      } catch (err) {
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAnnouncements();
  }, []);
  
  

  const formatSalary = (salaryRange) => {
    if (!salaryRange || !salaryRange.currency || !salaryRange.min || !salaryRange.max) {
      return "Not disclosed yet";
    }
    return `${salaryRange.currency} ${salaryRange.min} - ${salaryRange.max}`;
  };

  return (
    <>
      <div className="container mt-4">
        {!showJobForm ? (
          <>
            <motion.h2
              className="text-center mb-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ color: "#000", fontSize:"2.25rem" }}
            >
              Announcements
            </motion.h2>

            {error && <Alert variant="danger" className="text-center">❌ {error}</Alert>}

            <div className="row mb-5">
              {announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <motion.div 
                    key={announcement._id} 
                    className="col-lg-4 col-md-6 col-sm-12 d-flex align-items-stretch"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                    <div 
                      className="announcement-box shadow-lg p-4 mb-4 bg-white rounded d-flex flex-column justify-content-between w-100"
                      onClick={() => setSelectedAnnouncement(announcement)}
                      style={{ cursor: "pointer", minHeight: "300px", color: "#000", border: "1px solid #000" }}
                    >
                      <motion.h4 className="text-primary" style={{ color: "#000" }}>
                        {announcement.announcementTitle}
                      </motion.h4>
                      {/* Tags - Inline with Label */}
                      <p style={{ color: "#000", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                        <strong>🏷️ Tag:</strong>
                        {announcement.announcementTag?.split(",").map((tag, index) => (
                          <span 
                            key={index} 
                            style={{
                              backgroundColor: "#007bff",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "bold",
                              padding: "5px 10px",
                              borderRadius: "15px",
                              display: "inline-block",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </p>

                      {/* Description with consistent spacing */}
                      <p style={{ color: "#000", marginBottom: "15px" }}>
                        <strong>📜 Description:</strong> {parse(announcement.announcementDescription || "No Description Available")}
                      </p>

                      {/* Show Salary & Vacancy ONLY if jobPosition exists */}
                      {announcement.jobPosition && (
                        <>
                          <p style={{ color: "#000", marginBottom: "5px" }}>
                            <strong>🏢 Job Position:</strong> {announcement.jobPosition}
                          </p>
                          <p style={{ color: "#000", marginBottom: "5px" }}>
                            <strong>👥 Total Vacancies:</strong> {announcement.totalVacancy || "Not specified"}
                          </p>
                          <p style={{ color: "#000", marginBottom: "5px" }}>
                            <strong>💰 Salary Range:</strong> 
                            {announcement.salaryRange?.currency && announcement.salaryRange?.min && announcement.salaryRange?.max
                              ? `${announcement.salaryRange.currency} ${announcement.salaryRange.min} - ${announcement.salaryRange.max}`
                              : "Not Disclosed yet"}
                          </p>
                        </>
                      )}
                    {announcement?.announcementScheduleTime && (
                      <>
                        <p style={{ color: "#000" }}>
                          <strong>📅 Date:</strong> {new Date(announcement.announcementScheduleTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <p style={{ color: "#000" }}>
                          <strong>⏰ Time:</strong> {new Date(announcement.announcementScheduleTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </>
                    )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{
                  width: "100%",
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "1.2rem",
                  color: "#555",
                  border: "1px dashed #ccc",
                  borderRadius: "8px",
                  marginTop: "50px",
                  marginBottom:"400px"
                }}>
                  No Announcement Added
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="job-form-container">
            <JobVacancyForm />
          </div>
        )}
      </div>

      {/* Announcement Details Modal */}
      <Modal show={!!selectedAnnouncement && !showJobForm} onHide={() => setSelectedAnnouncement(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedAnnouncement?.announcementTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "left", color: "black" }}>
          {/* Tags - Inline Display */}
          <p style={{ color: "#000", display: "inline-flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <strong>🏷️ Tag:</strong>
            {selectedAnnouncement?.announcementTag?.split(",").map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  display: "inline-block",
                  whiteSpace: "nowrap"
                }}
              >
                {tag.trim()}
              </span>
            ))}
          </p>
          <div className="announcement-content-box">
            {parse(selectedAnnouncement?.announcementDescription || "No Description Available")}
          </div>

          <hr style={{ border: "1px solid black", width: "100%" }} />
          {/* Show Date & Time ALWAYS, but highlight if Schedule Time has Passed */}
          {selectedAnnouncement?.announcementScheduleTime && (() => {
            const scheduleTime = new Date(selectedAnnouncement.announcementScheduleTime);

            if (!isNaN(scheduleTime.getTime())) {
              return (
                <>
                  <p style={{ color: "#000", fontWeight: "normal" }}>
                    <strong>📅 Date:</strong> {scheduleTime.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  <p style={{ color: "#000", fontWeight: "normal" }}>
                    <strong>⏰ Time:</strong> {scheduleTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </>
              );
            }
            return null;
          })()}

          {/* Job Position (always displayed if available) */}
          {selectedAnnouncement?.jobPosition && (
            <p style={{ color: "#000" }}>
              <strong>🏢 Job Position:</strong> {selectedAnnouncement?.jobPosition}
            </p>
          )}

          {/* Job Details (only if available, except Salary) */}
          {(selectedAnnouncement?.jobType ||
            selectedAnnouncement?.requiredExperience ||
            selectedAnnouncement?.educationQualification ||
            selectedAnnouncement?.totalVacancy ||
            selectedAnnouncement?.applicationDeadline) && (
            <>
              {selectedAnnouncement?.jobType && (
                <p style={{ color: "#000" }}>
                  <strong>💼 Job Type:</strong> {selectedAnnouncement?.jobType}
                </p>
              )}
              {selectedAnnouncement?.requiredExperience && (
                <p style={{ color: "#000" }}>
                  <strong>📈 Experience Required:</strong> {selectedAnnouncement?.requiredExperience}
                </p>
              )}
              {selectedAnnouncement?.educationQualification && (
                <p style={{ color: "#000" }}>
                  <strong>🎓 Education Qualification:</strong> {selectedAnnouncement?.educationQualification}
                </p>
              )}
              {selectedAnnouncement?.totalVacancy && (
                <p style={{ color: "#000" }}>
                  <strong>👥 Total Vacancies:</strong> {selectedAnnouncement?.totalVacancy}
                </p>
              )}
              {selectedAnnouncement?.applicationDeadline && (
                <p style={{ color: "#000" }}>
                  <strong>📝 Application Deadline:</strong> {new Date(selectedAnnouncement.applicationDeadline).toLocaleDateString()}
                </p>
              )}
            </>
          )}

          {/* Salary Display Logic */}
          {selectedAnnouncement?.jobPosition && (
            <p style={{ color: "#000" }}>
              <strong>💰 Salary Range:</strong> {selectedAnnouncement?.salaryRange?.currency &&
              selectedAnnouncement?.salaryRange?.min &&
              selectedAnnouncement?.salaryRange?.max
                ? `${selectedAnnouncement.salaryRange.currency} ${selectedAnnouncement.salaryRange.min} - ${selectedAnnouncement.salaryRange.max}`
                : "Not Disclosed yet"}
            </p>
          )}

        </Modal.Body>
        <Modal.Footer>
          {selectedAnnouncement?.jobPosition && selectedAnnouncement?.jobType && selectedAnnouncement?.totalVacancy && (
            <Button 
              variant="primary" 
              onClick={() => {
                window.location.href = "/JobApplicationForm"; 
              }}
            >
              Apply Now
            </Button>
          )}
          <Button variant="danger" onClick={() => setSelectedAnnouncement(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GuestAnnouncements;
