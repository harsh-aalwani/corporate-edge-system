import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Card, Accordion, Alert } from "react-bootstrap";
import { useSnackbar } from "notistack";
import "../../../assets/css/Main/ModalCss.css";

const HRDepartmentPage = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [appraisals, setAppraisals] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [remarks, setRemarks] = useState("");
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


  const handleApprove = async () => {
    if (!selectedAppraisal || !selectedAppraisal.appraisalId) {
      enqueueSnackbar("Please select an appraisal first!", { variant: "warning" });
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/api/appraisals/approve/${selectedAppraisal.appraisalId}`, {
        remarks, // ✅ Send remarks
      });
  
      enqueueSnackbar("Appraisal Approved & Email Sent!", { variant: "success" });
      fetchAppraisals();
      setShowManagerModal(false);
      setShowDetails(false);
      setRemarks(""); // ✅ Reset remarks
    } catch (error) {
      console.error("❌ Error approving appraisal:", error.response?.data || error.message);
      enqueueSnackbar("Failed to approve appraisal!", { variant: "error" });
    }
  };
  
  const confirmReject = async () => {
    if (!selectedAppraisal || !selectedAppraisal.appraisalId) {
      enqueueSnackbar("Please select an appraisal first!", { variant: "warning" });
      return;
    }
  
    try {
      await axios.put(`http://localhost:5000/api/appraisals/reject/${selectedAppraisal.appraisalId}`, {
        remarks, // ✅ Send remarks
      });
  
      enqueueSnackbar("Appraisal Rejected & Email Sent!", { variant: "success" });
      fetchAppraisals();
      setShowDetails(false);
      setRemarks(""); // ✅ Reset remarks
    } catch (error) {
      console.error("❌ Error rejecting appraisal:", error.response?.data || error.message);
      enqueueSnackbar("Failed to reject appraisal!", { variant: "error" });
    }
  };
  

  

  const handleReject = () => {
    setShowConfirmRejectModal(true);
    setShowManagerModal(false);
  };

  
  

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
    {/* ✅ Status Box (Inside Card, Top-Right) */}
    <div
      className="position-absolute top-0 end-0 px-3 py-1 text-white rounded"
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
        margin: "8px", // ✅ Status ko andar thoda gap dene ke liye
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

      {/* Appraisal Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg">
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
             
             <Accordion.Item eventKey="3">
  <Accordion.Header>Manager Assessment</Accordion.Header>
  <Accordion.Body>
    <p style={{ color: "#000", textAlign: "left" }}>
      <strong>Final Assessment:</strong> {selectedAppraisal.finalAssessment || "Not provided"}
    </p>

    <div>
  <h6 style={{ color: "#000", textAlign: "left" }}>Performance Ratings:</h6>
  
  {/* ✅ Ensure performanceRatings exist */}
  {selectedAppraisal.performanceRatings ? (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }} border="1">
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>Criteria</th>
          <th style={{ padding: "8px", border: "1px solid #ddd" }}>Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>Job Knowledge</td>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedAppraisal.performanceRatings.JobKnowledge || "Not rated"}</td>
        </tr>
        <tr>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>Work Quality</td>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedAppraisal.performanceRatings.WorkQuality || "Not rated"}</td>
        </tr>
        <tr>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>Productivity</td>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedAppraisal.performanceRatings.Productivity || "Not rated"}</td>
        </tr>
        <tr>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>Teamwork</td>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedAppraisal.performanceRatings.Teamwork || "Not rated"}</td>
        </tr>
        <tr>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>Communication</td>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedAppraisal.performanceRatings.Communication || "Not rated"}</td>
        </tr>
        <tr>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>Punctuality</td>
          <td style={{ padding: "8px", border: "1px solid #ddd" }}>{selectedAppraisal.performanceRatings.Punctuality || "Not rated"}</td>
        </tr>
      </tbody>
    </table>
  ) : (
    <p style={{ color: "#000", textAlign: "left" }}>Ratings: Not Available</p>
  )}
</div>

    
  </Accordion.Body>
</Accordion.Item>

            </Accordion>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
     
{selectedAppraisal && selectedAppraisal?.status === "pending" && (
            <Button variant="primary" onClick={() => setShowManagerModal(true)}>Action</Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Manager Decision Modal */}
      <Modal show={showManagerModal} onHide={() => setShowManagerModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Manager Decision</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p style={{ color: "#000" }}> Do you want to approve or reject this appraisal?</p>
    <label>Remarks:</label>
    <textarea
      className="form-control"
      rows="3"
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
    ></textarea>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="success" onClick={handleApprove}>
      Approve
    </Button>
    <Button variant="danger" onClick={handleReject}>
      Reject
    </Button>
  </Modal.Footer>
</Modal>


      {/* Confirm Rejection Modal */}
      <Modal show={showConfirmRejectModal} onHide={() => setShowConfirmRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "#000" }}>Are you sure you want to reject this appraisal?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Yes, Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HRDepartmentPage;
