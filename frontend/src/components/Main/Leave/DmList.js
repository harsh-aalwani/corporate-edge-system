import React, { useState, useEffect } from "react";
import { Modal, Button, Card, Alert, Form } from "react-bootstrap";
import axios from "axios";
import { useSnackbar } from "notistack";

const LeaveRequests = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leaves/requests", {
        withCredentials: true, // ✅ Ensures cookies (session) are sent with the request
      });
      setLeaveRequests(response.data);
    } catch (err) {
      enqueueSnackbar("Failed to fetch leave requests", { variant: "error" });
    }
  };
  
  

  // ✅ Approve Leave Requests
  const handleApprove = async () => {
    if (!selectedLeave?.leaveId) {
      enqueueSnackbar("Invalid leave selection!", { variant: "error" });
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/leaves/approve/${selectedLeave.leaveId}`, { remarks });
      enqueueSnackbar("Leave request approved & email sent", { variant: "success" });
      fetchLeaveRequests();
      setShowManagerModal(false);
      setShowDetails(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to approve leave.", { variant: "error" });
    }
  };

  // ✅ Reject Leave Requests
  const confirmReject = async () => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/reject/${selectedLeave.leaveId}`, { remarks });
      enqueueSnackbar("Leave request rejected & email sent", { variant: "success" });
      fetchLeaveRequests();
      setShowConfirmRejectModal(false);
      setShowDetails(false);
    } catch (err) {
      enqueueSnackbar("Failed to reject leave.", { variant: "error" });
    }
  };

  return (
    <div className="container mt-4">
      {leaveRequests.length === 0 ? (
        <Alert variant="warning">No leave requests found</Alert>
      ) : (
        leaveRequests.map((leave, index) => (
          <Card key={index} className="p-3 shadow mb-3 position-relative" onClick={() => {
            setSelectedLeave(leave);
            setShowDetails(true);
          }}>
            <Card.Body>
              <div className="position-absolute top-0 end-0 px-3 py-1 text-white"
                style={{
                  backgroundColor: 
                    leave.status === "Approved" ? "#28a745" 
                    : leave.status === "Rejected" ? "#dc3545" 
                   
                    : leave.status === "Withdrawn" ? "#6c757d"  
                    
                    : "#ffc107",
                  fontWeight: "bold",
                  fontSize: "14px",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  textTransform: "uppercase",
                  minWidth: "120px",
                  textAlign: "center",
                }}>
                {leave.status.toUpperCase()}
              </div>
              <h5>Leave ID: {leave.leaveId}</h5>
              <h6>Employee: {leave.employeeName}</h6>
              <h6>Leave Type: {leave.leaveName}</h6>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Leave Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <>
              <p style={{ color: "#000",textAlign: "left" }}><strong>Employee:</strong> {selectedLeave.employeeName}</p>
              <p style={{ color: "#000",textAlign: "left" }}><strong>Leave Type:</strong> {selectedLeave.leaveName}</p>
              <p style={{ color: "#000",textAlign: "left" }}><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toLocaleDateString("en-GB")}</p>
              <p style={{ color: "#000",textAlign: "left" }}><strong>End Date:</strong> {new Date(selectedLeave.endDate).toLocaleDateString("en-GB")}</p>
              <p style={{ color: "#000",textAlign: "left" }}><strong>Reason:</strong> {selectedLeave.reason}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedLeave?.status === "Pending" ? (
            <Button variant="primary" onClick={() => setShowManagerModal(true)}>Action</Button>
          ) : (
            <span className="text-muted">No Action Required</span>
          )}
          <Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Manager Decision Modal */}
      <Modal show={showManagerModal} onHide={() => setShowManagerModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manager Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Remarks:</Form.Label>
            <Form.Control as="textarea" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleApprove}>Approve Leave</Button>
          <Button variant="danger" onClick={() => setShowConfirmRejectModal(true)}>Reject</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Rejection Modal */}
      <Modal show={showConfirmRejectModal} onHide={() => setShowConfirmRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: "#000",}}>Are you sure you want to reject this leave request?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject}>Yes, Reject</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeaveRequests;
