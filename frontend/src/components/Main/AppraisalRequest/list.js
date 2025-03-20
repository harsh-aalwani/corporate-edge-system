import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Card, Accordion, Form, Alert } from "react-bootstrap";
import { useSnackbar } from "notistack";

import "../../../assets/css/Main/ModalCss.css";

const DepartmentPage = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [finalAssessment, setFinalAssessment] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null); // ✅ Define state
  const [rating, setRating] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/appraisals/all");
      setAppraisals(response.data);
    } catch (error) {
      console.error("Error fetching appraisals:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedAppraisal || !selectedAppraisal.employeeId) {
      enqueueSnackbar("Please select an employee before scheduling review!", { variant: "warning" });
      return;
    }
  
    try {
      const payload = {
        userId: selectedAppraisal.employeeId, // ✅ Ensure Correct User ID
        date,
        time,
        link,
      };
  
      console.log("📤 Sending Review Data to Backend:", payload); // ✅ Debugging Log
  
      const response = await axios.post("http://localhost:5000/api/appraisals/add-review", payload);
  
      enqueueSnackbar("Review Scheduled & Email Sent Successfully!", { variant: "success" });
  
      setShowForm(false);
      setDate("");
      setTime("");
      setLink("");
    } catch (error) {
      console.error("❌ Error Sending Email:", error);
      enqueueSnackbar("Failed to schedule review!", { variant: "error" });
    }
  };
  

  const handleFinalAssessmentSubmit = async () => {
    if (!selectedAppraisal || !selectedAppraisal.employeeId) {
      enqueueSnackbar("Please select a user before submitting.", { variant: "warning" });
      return;
    }
  
    try {
      const payload = {
        userId: selectedAppraisal.employeeId, // ✅ Ensure Correct User ID
        finalAssessment,
        performanceRatings, // ✅ Send Performance Ratings
      };
  
      console.log("📤 Submitting Assessment:", payload);
  
      const response = await axios.post("http://localhost:5000/api/appraisals/submit-assessment", payload);
  
      enqueueSnackbar("Assessment Submitted Successfully!", { variant: "success" });
      setShowAssessment(false);
      setFinalAssessment("");
      setPerformanceRatings({
        JobKnowledge: "",
        WorkQuality: "",
        Productivity: "",
        Teamwork: "",
        Communication: "",
        Punctuality: "",
      });
  
      fetchAppraisals(); // ✅ Refresh Appraisal List
    } catch (error) {
      console.error("❌ Error submitting assessment:", error);
      enqueueSnackbar("Failed to submit assessment!", { variant: "error" });
    }
  };
  

  const confirmFinalAssessmentSubmit = async () => {
    setShowConfirmModal(false);
  
    try {
      const payload = {
        userId: selectedAppraisal.userId,
        finalAssessment,
        ranking: rating, // ✅ Send `ranking`, not `rating`
      };
  
      await axios.post("http://localhost:5000/api/appraisals/submit-assessment", payload);
      enqueueSnackbar("Assessment Submitted Successfully!", { variant: "success" });
  
      setFinalAssessment("");
      setRating(null);
      fetchAppraisals();
    } catch (error) {
      console.error("Error submitting assessment:", error);
      enqueueSnackbar("Failed to submit assessment!", { variant: "error" });
    }
  };
  
  // ✅ Add this at the beginning of the DepartmentPage component
const [performanceRatings, setPerformanceRatings] = useState({
  JobKnowledge: "",
  WorkQuality: "",
  Productivity: "",
  Teamwork: "",
  Communication: "",
  Punctuality: "",
});

const ratingOptions = ["Excellent", "Very Good", "Good", "Average", "Needs Improvement"];

  return (
    <div className="container mt-4">
      {appraisals.length > 0 ? (
        appraisals.map((appraisal, index) => (
          <Card
          key={index}
          className="p-3 shadow mb-3 position-relative"
          onClick={() => {
            setSelectedAppraisal(appraisal);
            setShowDetails(true);
          }}
        >
          <Card.Body>
            <div
              className="position-absolute top-0 end-0 px-3 py-1 text-white"
              style={{
                backgroundColor:
                  appraisal.status === "approved"
                    ? "green"
                    : appraisal.status === "rejected"
                    ? "red"
                    : "orange",
                fontWeight: "bold",
                fontSize: "14px",
                borderRadius: "8px",
                margin: "8px",
              }}
            >
              {appraisal.status.toUpperCase()}
            </div>
        
            <h5>Appraisal ID: {appraisal.appraisalId}</h5>
            <h6>Employee ID: {appraisal.employeeId}</h6>
            <h6>Employee Name: {appraisal.name}</h6>  {/* ✅ Show Employee Name */}
            
           
          </Card.Body>
        </Card>
        

        ))
      ) : (
        <Alert variant="warning">No appraisals found</Alert>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)}  style={{ maxWidth: "100vw", margin: "auto" }}>
        <Modal.Header closeButton>
          <Modal.Title>Appraisal Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppraisal && (
            <Accordion>
          
              

              
          <Accordion.Item eventKey="1">
  <Accordion.Header>Documents</Accordion.Header>
  <Accordion.Body>
    {selectedAppraisal?.files?.length > 0 ? (
      selectedAppraisal.files.map((doc, index) => {
        // ✅ Ensure correct file name is displayed
        const fileName = doc.split("/").pop(); // Extract only the file name

        return (
          <p key={index}>
            <a 
              href={`http://localhost:5000/uploads/appraisalDocuments/${fileName}`}  
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }} // ✅ Remove underline & keep normal text style
            >
              {fileName} {/* ✅ Only display file name */}
            </a>
          </p>
        );
      })
    ) : (
      <p>No documents available</p>
    )}
  </Accordion.Body>
</Accordion.Item>







              <Accordion.Item eventKey="2">
  <Accordion.Header>Report</Accordion.Header>
  <Accordion.Body>
    {selectedAppraisal.reportUrl ? ( // ✅ Correct field name
      <p>
        <a 
          href={`http://localhost:5000/${selectedAppraisal.reportUrl}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View Report
        </a>
      </p>
    ) : (
      <p>No report available</p>
    )}
  </Accordion.Body>
</Accordion.Item>


            </Accordion>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Review
          </Button>
          <Button variant="info" onClick={() => setShowAssessment(true)}>
            Assessment
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showForm} onHide={() => setShowForm(false)} style={{ maxWidth: "100vw", margin: "auto" }}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Link</Form.Label>
              <Form.Control type="text" placeholder="Enter link" value={link} onChange={(e) => setLink(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleSendEmail}>
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>
     {/* final Assessment */}
       {/* Final Assessment Modal */}
       <Modal 
  show={showAssessment} 
  onHide={() => setShowAssessment(false)} 
  style={{ 

    margin: "auto" 
  }}
>
  <Modal.Header closeButton>
    <Modal.Title>Final Assessment</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      {/* Final Assessment */}
      <Form.Group className="mb-3">
        <Form.Label>Final Assessment</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          value={finalAssessment}
          onChange={(e) => setFinalAssessment(e.target.value)}
        />
      </Form.Group>

      {/* Star Rating */}
     

      {/* Performance Ratings - Divided into Two Columns */}
      <Form.Group className="mb-3">
        <Form.Label>Performance Ratings</Form.Label>
        <br />
        <br />
        <div className="row">
          {Object.keys(performanceRatings).map((key, index) => (
            <div key={key} className="col-md-6 mb-2"> {/* 2 columns */}
              <Form.Label>{key.replace(/([A-Z])/g, " $1").trim()}</Form.Label>
              <Form.Select
                name={key}
                value={performanceRatings[key]}
                onChange={(e) =>
                  setPerformanceRatings({
                    ...performanceRatings,
                    [key]: e.target.value,
                  })
                }
              >
                <option value="">Select Rating</option>
                {ratingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </div>
          ))}
        </div>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="success" onClick={handleFinalAssessmentSubmit} disabled={!finalAssessment}>
      Submit Assessment
    </Button>
  </Modal.Footer>
</Modal>



     
    </div>
  );
};

export default DepartmentPage;
