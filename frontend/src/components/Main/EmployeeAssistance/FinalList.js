import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Card, Accordion, Alert } from "react-bootstrap";
import { useSnackbar } from "notistack";

const HRManager = () => {
  const [concerns, setConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchConcerns();
  }, []);

  // ✅ Fetch all concerns
  const fetchConcerns = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/concern/concerns");
      setConcerns(response.data);
    } catch (error) {
      console.error("Error fetching concerns:", error);
      enqueueSnackbar("Failed to load concerns!", { variant: "error" });
    }
  };

  // ✅ Approve Concern
  const handleApprove = async () => {
    try {
      const payload = { concernId: selectedConcern.concernId };
      await axios.put("http://localhost:5000/api/concern/concerns/approve", payload);

      enqueueSnackbar("Concern Approved & Email Sent!", { variant: "success" });
      fetchConcerns();
      setShowDetails(false);
      setShowActionModal(false);
    } catch (error) {
      console.error("Error approving concern:", error);
      enqueueSnackbar("Failed to approve concern!", { variant: "error" });
    }
  };

  // ✅ Open Confirm Reject Modal
  const handleReject = () => {
    setShowConfirmRejectModal(true);
    setShowActionModal(false);
  };

  // ✅ Confirm Rejection
  const confirmReject = async () => {
    try {
      const payload = { concernId: selectedConcern.concernId };
      await axios.put("http://localhost:5000/api/concern/concerns/reject", payload);

      enqueueSnackbar("Concern Rejected & Email Sent!", { variant: "success" });
      fetchConcerns();
      setShowDetails(false);
      setShowConfirmRejectModal(false);
    } catch (error) {
      console.error("Error rejecting concern:", error);
      enqueueSnackbar("Failed to reject concern!", { variant: "error" });
    }
  };

  return (
    <div className="container mt-4">
      {concerns.length > 0 ? (
        concerns.map((concern, index) => (
          <Card
            key={index}
            className="p-3 shadow mb-3 position-relative"
            onClick={() => {
              setSelectedConcern(concern);
              setShowDetails(true);
            }}
          >
            <Card.Body>
              <div
                className="position-absolute top-0 end-0 px-3 py-1 text-white"
                style={{
                  backgroundColor:
                    concern.status === "approved"
                      ? "green"
                      : concern.status === "Rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "bold",
                  fontSize: "14px",
                  borderRadius: "8px",
                  margin: "10px",
                }}
              >
                {concern.status.toUpperCase()}
              </div>

              <h5>Concern ID: {concern.concernId}</h5>
              <h6>Employee ID: {concern.userId}</h6>
              <h6>Department: {concern.userDepartment}</h6>
              <p style={{ color: "#000", textAlign: "left" }}>Subject: {concern.subject}</p>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Alert variant="warning">No concerns found</Alert>
      )}

      {/* Concern Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Concern Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConcern && (
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Employee Information</Accordion.Header>
                <Accordion.Body>
                  <p style={{ color: "#000", textAlign: "left" }}><strong>Name:</strong> {selectedConcern.userName}</p>
                  <p style={{ color: "#000", textAlign: "left" }}><strong>Designation:</strong> {selectedConcern.userDesignation}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>Concern Details</Accordion.Header>
                <Accordion.Body>
                  <p style={{ color: "#000", textAlign: "left" }}><strong>Subject:</strong> {selectedConcern.subject}</p>
                  <p style={{ color: "#000", textAlign: "left" }}><strong>Message:</strong> {selectedConcern.message}</p>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>Documents</Accordion.Header>
                <Accordion.Body>
                  {selectedConcern.supportingDocuments?.length > 0 ? (
                    selectedConcern.supportingDocuments.map((doc, index) => (
                      <p key={index}>
                        <a href={`http://localhost:5000/${doc}`} target="_blank" rel="noopener noreferrer">
                          Document {index + 1}
                        </a>
                      </p>
                    ))
                  ) : (
                    <p>No documents available</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>Manager Statement</Accordion.Header>
                <Accordion.Body>
                  {selectedConcern.managerStatement ? (
                    <p style={{ color: "#000", textAlign: "left" }}>
                      <strong>Statement:</strong> {selectedConcern.managerStatement}
                    </p>
                  ) : (
                    <p>No statement provided</p>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
          <Modal.Footer>

 
  {selectedConcern && selectedConcern?.status === "Pending" && (
              <Button variant="primary" onClick={() =>  setShowActionModal(true)} >Action</Button>
            )}
</Modal.Footer>

        </Modal.Footer>
      </Modal>

      {/* Manager Decision Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manager Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "#000" }}>Do you want to approve or reject this concern?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleApprove}>Approve</Button>
          <Button variant="danger" onClick={handleReject}>Reject</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Rejection Modal */}
      <Modal show={showConfirmRejectModal} onHide={() => setShowConfirmRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "#000", textAlign: "left" }}>Are you sure you want to reject this concern?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject}>Yes, Reject</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HRManager;
