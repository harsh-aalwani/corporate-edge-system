import React, { useState, useEffect } from "react";

const CandidateConfirmation = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [decision, setDecision] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDecisionSubmitted, setIsDecisionSubmitted] = useState(false);

  // Form validation state
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Validation logic onChange
  useEffect(() => {
    setIsFormValid(
      email.trim() !== "" && candidateId.trim() !== "" && searchId.trim() !== ""
    );
  }, [email, candidateId, searchId]);

  const handleSearch = async () => {
    if (!email.trim() || !candidateId.trim() || !searchId.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/candidates/searchCandidatesJob",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, candidateId, searchId }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch candidate details");

      setMessage("");
      setJobDetails({
        name: `${data.candidateName}`,
        position: data.position,
        departmentId: data.departmentId,
        salary: data.salary,
        confirmationDeadline: data.confirmationDeadline,
      });
    } catch (error) {
      setMessage(`Note: ${error.message}`);
      setJobDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (choice) => {
    setDecision(choice);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/candidates/confirmJobOffer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, candidateId, decision: choice }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to submit decision");

      setMessage(
        `✅ Successfully ${choice === "accepted" ? "accepted" : "declined"} the job offer.`
      );
      setIsDecisionSubmitted(true); // Show confirmation page after decision
      setJobDetails(null); // Clear job details after decision
    } catch (error) {
      setMessage(`Note: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #dfe9f3, #e2e2e2)",
      }}
    >
      <div
        className={`card p-4 shadow-lg border-0 rounded-4 text-dark ${
          isLoaded ? "fade-in" : ""
        }`}
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
        }}
      >
        {isDecisionSubmitted ? (
          <div className="text-center p-5">
            <h3 className="text-success fw-bold">🎉 Job Offer Decision</h3>
            <p className="text-muted">
              You have {decision === "accepted" ? "accepted" : "declined"} the job offer.
            </p>
          </div>
        ) :jobDetails ? (
          <>
            <h3 className="text-center text-success fw-bold">🎉 Job Offer</h3>
            <p className="text-center text-muted">
              Congratulations, {jobDetails.name}!
            </p>
            <div className="card-body">
              <p>
                <strong>Position:</strong> {jobDetails.position}
              </p>
              <p>
                <strong>Confirmation Deadline:</strong>{" "}
                {jobDetails.confirmationDeadline}
              </p>

              {/* Message to read the email first */}
              <div className="alert alert-info text-center mt-3">
                📩 Please read the email carefully before making a decision.
              </div>

              <div className="form-check d-flex align-items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id="finalConfirmation"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <label className="fw-semibold" htmlFor="finalConfirmation">
                  I confirm that I have read and understood the job offer.
                </label>
              </div>

              {/* Accept & Decline Buttons */}
              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-success flex-grow-1"
                  onClick={() => handleDecision("accepted")}
                  disabled={loading || !isConfirmed}
                >
                  ✅ Accept
                </button>
                <button
                  className="btn btn-danger flex-grow-1"
                  onClick={() => handleDecision("declined")}
                  disabled={loading || !isConfirmed}
                >
                  ❌ Decline
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-center text-primary fw-bold">
              🔍 Candidate Search
            </h3>
            <p className="text-center text-muted">Enter details to proceed</p>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control p-2 rounded-3 input-animate"
                  id="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="candidateId" className="form-label fw-semibold">
                  Candidate ID
                </label>
                <input
                  type="text"
                  className="form-control p-2 rounded-3 input-animate"
                  id="candidateId"
                  placeholder="Enter Candidate ID"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="searchId" className="form-label fw-semibold">
                  Search ID
                </label>
                <input
                  type="text"
                  className="form-control p-2 rounded-3 input-animate"
                  id="searchId"
                  placeholder="Enter Search ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
              <button
                className="btn w-100 fw-bold p-2 rounded-3 btn-primary mt-4"
                onClick={handleSearch}
                disabled={!isFormValid || loading}
              >
                {loading ? "Searching..." : "Search Candidate"}
              </button>
              {message && <p className="text-center mt-3">{message}</p>}
            </div>
          </>
        )}
      </div>

      {/* Animation & Styling */}
      <style>{`
  /* Fade-in Animation */
  .fade-in {
    animation: fadeIn 0.8s ease-in-out;
  }

  /* Input Fields */
  .input-animate {
    transition: all 0.3s ease;
  }

  .input-animate:focus {
    box-shadow: 0px 0px 10px rgba(0, 123, 255, 0.3);
    border-color: #007bff;
  }

  /* Job Offer Card */
  .job-details {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
    border-radius: 16px;
    padding: 24px;
    position: relative;
  }

  /* Job Offer Header */
  .job-details h3 {
    color: #28a745;
    font-weight: bold;
    text-align: center;
  }

  /* Info Message Box */
  .alert {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    border-left: 4px solid #007bff;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 12px;
  }

  /* Checkbox Alignment */
/* Fix checkbox alignment */
.form-check {
  display: flex;
  align-items: center;
  gap: 8px; /* Ensures proper spacing between checkbox and label */
}

.form-check-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #007bff; /* Ensures checkbox matches the theme */
}


  .form-check input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  /* Buttons Section */
  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  button {
    flex: 1;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-success {
    background-color: #28a745;
    color: white;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  button:hover {
    opacity: 0.85;
  }

  /* Disabled Button */
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Fade In Animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
    </div>
  );
};

export default CandidateConfirmation;
