import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Card, Accordion, Form, Alert } from "react-bootstrap";
import { useSnackbar } from "notistack";

const DepartmentConcernList = () => {
  const [concerns, setConcerns] = useState([]);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [statement, setStatement] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchConcerns();
  }, []);

  // ✅ GET /api/concern/all → Fetch all concerns
  const fetchConcerns = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/concern/concerns"); // ✅ Corrected API endpoint
      setConcerns(response.data);
    } catch (error) {
      console.error("Error fetching concerns:", error);
      enqueueSnackbar("Failed to load concerns!", { variant: "error" });
    }
  };
  
  const handleStatementSubmit = async (concernId) => {
    if (!statement.trim()) {
      enqueueSnackbar("Statement cannot be empty!", { variant: "warning" });
      return;
    }
  
    try {
      await axios.put("http://localhost:5000/api/concern/concerns/statement", {
        concernId,
        managerStatement: statement,
      });
  
      enqueueSnackbar("Statement added successfully!", { variant: "success" });
      setConcerns(concerns.map((c) => (c.concernId === concernId ? { ...c, managerStatement: statement } : c)));
      setStatement("");
      setShowDetails(false);
    } catch (error) {
      console.error("Error submitting statement:", error);
      enqueueSnackbar("Failed to submit statement!", { variant: "error" });
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
              {/* ✅ Status Tag on Right Side */}
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
                  margin: "8px",
                }}
              >
                {concern.status.toUpperCase()}
              </div>

              <h5>Concern ID: {concern.concernId}</h5>
              <h6>Employee ID: {concern.userId}</h6>
              <h6>Employee Name: {concern.userName}</h6>
              <p style={{ color: "#000", textAlign: "left" }}>Concern Subject: {concern.subject}</p>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Alert variant="warning">No concerns found</Alert>
      )}

      <Modal show={showDetails} onHide={() => setShowDetails(false)} style={{ maxWidth: "100vw", margin: "auto" }}>
        <Modal.Header closeButton>
          <Modal.Title>Concern Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConcern && (
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Concern Message</Accordion.Header>
                <Accordion.Body>{selectedConcern.message || "No message provided"}</Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
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

              <Accordion.Item eventKey="2">
                <Accordion.Header>Manager Statement</Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Add Statement</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                      />
                    </Form.Group>
                    <Button variant="success" onClick={() => handleStatementSubmit(selectedConcern.concernId)}>
                      Submit Statement
                    </Button>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DepartmentConcernList;
