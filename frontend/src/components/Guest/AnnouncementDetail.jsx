import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, Alert, Row, Col, Container, Card } from "react-bootstrap";
import parse from "html-react-parser";
import { motion } from "framer-motion";

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!announcement) {
      const fetchAnnouncement = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/announcements/${id}`);
          setAnnouncement({
            ...response.data,
            companyName: response.data.companyName || "Not Provided",
            jobLocation: response.data.jobLocation || "Not Specified",
            jobType: response.data.jobType || "Not Mentioned",
            applicationDeadline: response.data.applicationDeadline
              ? new Date(response.data.applicationDeadline).toLocaleDateString()
              : "No Deadline",
            requiredExperience: response.data.requiredExperience || "Not Mentioned",
            educationQualification: response.data.educationQualification || "Not Specified",
          });
        } catch (err) {
          setError("Failed to load announcement details.");
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncement();
    }
  }, [id, announcement]);

  if (loading) return <div className="d-flex vh-100 justify-content-center align-items-center bg-dark text-white"><Spinner animation="border" variant="light" /></div>;
  if (error) return <Container className="mt-5"><Alert variant="danger" className="text-center">{error}</Alert></Container>;
  if (!announcement) return <Container className="mt-5"><Alert variant="warning" className="text-center">No announcement found!</Alert></Container>;
 
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1E3C72)" }}>
      <motion.div className="w-75" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Card className="p-5 shadow-lg rounded-4 text-white" style={{ backgroundColor: "#112D4E" }}>
          <Card.Body>
            <h1 className="text-uppercase fw-bold text-center mb-4 text-info">{announcement.announcementTitle || "No Title"}</h1>
            <p><strong>Description:</strong> {parse(announcement.announcementDescription || "No Description Available")}</p>
            <hr style={{ border: "1px solid #fff", opacity: 0.5, width: "100%" }} />
            <p><strong>📅 Date:</strong> {announcement.announcementScheduleTime ? new Date(announcement.announcementScheduleTime).toLocaleDateString() : "N/A"}</p>
            <Row>
              <Col md={6}><p><strong>🏢 Company Name:</strong> Corporate Edge System</p></Col>
              <Col md={6}><p><strong>📍 Location:</strong> Prefered not to be disclosed</p></Col>
              <Col md={6}><p><strong>💼 Job Type:</strong> {announcement.jobType}</p></Col>
              <Col md={6}><p><strong>📝 Application Deadline:</strong> {announcement.applicationDeadline}</p></Col>
              <Col md={6}><p><strong>📈 Experience Required:</strong> {announcement.requiredExperience}</p></Col>
              <Col md={6}><p><strong>🎓 Education Qualification:</strong> {announcement.educationQualification}</p></Col>
            </Row>
            {announcement.jobPosition && (
              <>
                <Row className="mt-3">
                  <Col md={6}><p><strong>🏢 Job Position:</strong> {announcement.jobPosition}</p></Col>
                  <Col md={6}><p><strong>👥 Total Vacancies:</strong> {announcement.totalVacancy || "Not specified"}</p></Col>
                  <Col md={6}><p><strong>💰 Salary:</strong> {announcement.salaryRange?.currency && announcement.salaryRange?.min && announcement.salaryRange?.max ? `${announcement.salaryRange.currency} ${announcement.salaryRange.min} - ${announcement.salaryRange.max}` : "Not Disclosed"}</p></Col>
                </Row>
                <div className="text-center mt-4">
  <motion.button className="btn btn-success mx-2 px-4 py-2 fw-bold rounded-pill" 
    whileHover={{ scale: 1.1, boxShadow: "0px 0px 10px #00FF7F" }} 
    onClick={() => navigate("/JobApplicationForm")}>
    Apply Now
  </motion.button>
  <motion.button className="btn btn-light mx-2 px-4 py-2 fw-bold rounded-pill" 
    whileHover={{ scale: 1.1, boxShadow: "0px 0px 10px #FFFFFF" }} 
    onClick={() => navigate(-1)}>
    Go Back
  </motion.button>
</div>

              </>
            )}
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default DetailPage;
