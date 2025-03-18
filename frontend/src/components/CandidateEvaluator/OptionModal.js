import React, { useState, useEffect,useRef, useCallback} from "react";
import {FaCalendarAlt, FaCheckCircle, FaTrashAlt,FaChartBar,FaUndo, FaCheck,FaTimes, FaPlus, FaChevronUp, FaChevronDown, FaTasks, FaHistory, FaCommentDots, FaFileAlt, FaExclamationCircle, FaSpinner} from "react-icons/fa";
import styled from "styled-components";
import { useSnackbar } from "notistack";
import axios from "axios";


const OptionModal = ({ show, onClose, candidates = [], setCandidates }) => {

  const [candidatePerformance, setCandidatePerformance] = useState({});
  // Static Department Data
  const [departments, setDepartments] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  

  // Static User Data (Users Available for Assignment)
  const [availableUsers, setAvailableUsers] = useState([]);

  // Users Assigned to Departments
  const [assignedUsers, setAssignedUsers] = useState([]);

  const handleConfirmSubmit = (perfId) => {
    setDeleteTarget(perfId);
    setShowConfirmSubmit(true);
  };

  const confirmSubmitPerformance = () => {
    if (deleteTarget) {
      submitPerformance(deleteTarget);
    }
    setShowConfirmSubmit(false);
  };
  
  const handleConfirmDelete = (perfId) => {
    setDeleteTarget(perfId);
    setShowConfirmDelete(true);
  };
  
  const confirmDeleteRecord = () => {
    if (deleteTarget) {
      handleDeleteRecord(deleteTarget);
    }
    setShowConfirmDelete(false);
  };
  
  const handleConfirmDeleteAll = () => {
    setShowConfirmDeleteAll(true);
  };
  
  const confirmDeleteAllRecords = () => {
    handleDeleteAllRecords();
    setShowConfirmDeleteAll(false);
  };
  

  useEffect(() => {
    if (selectedCandidateId) {
      candidatePerformance[selectedCandidateId]?.forEach((entry) => {
        calculatePerformance(entry.id);
      });
    }
  }, [candidatePerformance]); // ✅ Runs whenever candidatePerformance changes

  const calculatePerformance = (entryId) => {
    setCandidatePerformance((prev) => {
      const updatedPerformance = prev[selectedCandidateId].map((entry) => {
        if (entry.id !== entryId) return entry;
  
        // ✅ Sum up scores
        const totalScore = entry.criteria.reduce((sum, crit) => sum + (parseFloat(crit.score) || 0), 0);
  
        // ✅ Compute the average percentage
        const maxScore = entry.criteria.length * 100;
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
        // ✅ Assign assessment based on percentage
        let assessment = "Bad";
        if (percentage >= 80) assessment = "Good";
        else if (percentage >= 60) assessment = "Above Average";
        else if (percentage >= 40) assessment = "Average";
        else if (percentage >= 20) assessment = "Below Average";
  
        return { ...entry, assessment, averageScore: percentage };
      });
  
      return {
        ...prev,
        [selectedCandidateId]: updatedPerformance,
      };
    });
  };
  const handleDeleteRecord = async (performanceId) => {
    if (!performanceId) {
      enqueueSnackbar("⚠️ No performance record selected.", { variant: "warning" });
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/candPerformance/deleteRecord", {
        method: "POST", // ✅ Matches backend
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ candidatePerformanceId: performanceId, candidateId: selectedCandidateId }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || "Failed to delete record");
  
      enqueueSnackbar("✅ Performance record deleted successfully!", { variant: "success" });
  
      // ✅ Update state: Remove deleted record from `previousPerformanceData`
      setPreviousCandidatePerformance((prev) => ({
        ...prev,
        [selectedCandidateId]: prev[selectedCandidateId]?.filter(record => record.candidatePerformanceId !== performanceId) || [],
      }));
  
    } catch (error) {
      enqueueSnackbar("❌ Failed to delete record. Please try again.", { variant: "error" });
    }
  };
  
  
  const handleDeleteAllRecords = async () => {
    if (!selectedCandidateId) {
      enqueueSnackbar("⚠️ No candidate selected.", { variant: "warning" });
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/candPerformance/deleteAllRecords", {
        method: "POST", // ✅ Matches backend
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ candidateId: selectedCandidateId }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || "Failed to delete all records");
  
      enqueueSnackbar("✅ All performance records deleted successfully!", { variant: "success" });
  
      // ✅ Update state: Remove all records for the candidate
      setPreviousCandidatePerformance((prev) => ({
        ...prev,
        [selectedCandidateId]: [],
      }));
  
    } catch (error) {
      enqueueSnackbar("❌ Failed to delete all records. Please try again.", { variant: "error" });
    }
  };
  
  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "success"; // Green
    if (percentage >= 60) return "primary"; // Blue
    if (percentage >= 40) return "warning"; // Orange
    if (percentage >= 20) return "danger"; // Red
    return "dark"; // Bad
  };
  
    const fetchAnnouncement = async () => {
      if (!candidates.length || !allUsers.length) return;
    
      const announcementIdFromCandidate = candidates[0]?.announcementId;
      if (!announcementIdFromCandidate) return;
    
      try {
        const response = await axios.post(
          "http://localhost:5000/api/announcements/getAnnouncementInfoById",
          { announcementId: announcementIdFromCandidate }
        );
    
        const assignedEvaluatorIds = response.data.assignedEvaluators || [];
    
        // ✅ Filter multiple users from `allUsers`
        const assignedUsersData = allUsers.filter(user => assignedEvaluatorIds.includes(user.userId));
    
        setAssignedUsers(assignedUsersData);
        console.log(assignedUsers);
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };    
    
  // Effect triggers fetching when candidates change
  useEffect(() => {
    fetchAnnouncement();
  }, [allUsers]);

  useEffect(() => {
    if (selectedDepartment) {
      setAvailableUsers(
        allUsers.filter((user) => user.userDepartment === selectedDepartment)
      );
    } else {
      setAvailableUsers([]);
    }
  }, [selectedDepartment, allUsers]);
  
  const [activeTab, setActiveTab] = useState("Check List");
  const [localCandidates, setLocalCandidates] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [announcementConcluded, setAnnouncementConcluded] = useState(false);

  //Add as New User
  const [selectedNewCandidateId,setSelectedNewCandidateId] = useState('');
  const handleNewCandidateSelect = (event) => {
    setSelectedNewCandidateId(event.target.value);
  };


  // Candidate Performance
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [previousPerformanceData, setPreviousCandidatePerformance] = useState({});
  const [collapsedEntries, setCollapsedEntries] = useState({});


  const submitPerformance = useCallback(async (perfId) => {
    if (!selectedCandidateId) {
      enqueueSnackbar("⚠️ No candidate selected.", { variant: "warning" });
      return;
    }
  
    const updatedPerformance = candidatePerformance[selectedCandidateId]?.find(p => p.id === perfId);
    if (!updatedPerformance) {
      enqueueSnackbar("⚠️ Performance entry not found.", { variant: "error" });
      return;
    }
  
    const criteriaArray = Array.isArray(updatedPerformance.criteria) ? updatedPerformance.criteria : [];
    const averageScore = criteriaArray.length 
      ? Math.round(criteriaArray.reduce((sum, crit) => sum + crit.score, 0) / criteriaArray.length) 
      : 0;
  
    const performanceData = {
      recordName: updatedPerformance.recordName,
      criteria: criteriaArray,
      remarks: updatedPerformance.remarks || "",
      candidateAssessment: updatedPerformance.assessment,
      candidateId: selectedCandidateId,
      averageScore, // ✅ Send calculated percentage
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/candPerformance/addRecord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(performanceData),
        credentials: "include",
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save performance data.");
  
      console.log("✅ Performance saved successfully:", data);
      enqueueSnackbar("✅ Performance data submitted successfully!", { variant: "success" });
  
      setCandidatePerformance((prev) => ({
        ...prev,
        [selectedCandidateId]: prev[selectedCandidateId]?.filter(p => p.id !== perfId) || []
      }));
  
      fetchCandidatePerformanceData(selectedCandidateId);
    } catch (error) {
      console.error("❌ Error saving performance:", error);
      enqueueSnackbar("❌ Failed to save performance data. Please try again.", { variant: "error" });
    }
  }, [selectedCandidateId, candidatePerformance]);
  

  const clearPerformanceData = (perfId) => {
    setCandidatePerformance(prevPerformance => ({
      ...prevPerformance,
      [selectedCandidateId]: prevPerformance[selectedCandidateId].map(perf =>
        perf.id === perfId ? { ...perf, criteria: [], assessment: "", remarks: "" } : perf
      )
    }));
  };
  


  // ✅ Remove Criteria
const removeCriteria = (entryId, index) => {
  setCandidatePerformance((prev) => ({
    ...prev,
    [selectedCandidateId]: prev[selectedCandidateId].map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            criteria: entry.criteria.filter((_, idx) => idx !== index)
          }
        : entry
    )
  }));
};

const handleCriteriaChange = (entryId, index, field, value) => {
  setCandidatePerformance((prev) => {
    const updatedPerformance = prev[selectedCandidateId].map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            criteria: entry.criteria.map((criterion, idx) =>
              idx === index ? { ...criterion, [field]: value } : criterion
            ),
          }
        : entry
    );

    return {
      ...prev,
      [selectedCandidateId]: updatedPerformance,
    };
  });

  calculatePerformance(entryId); // ✅ Recalculate immediately
};


// ✅ Remove performance entry
const removePerformanceEntry = (entryId) => {
  setCandidatePerformance((prev) => ({
    ...prev,
    [selectedCandidateId]: prev[selectedCandidateId].filter((entry) => entry.id !== entryId),
  }));
};

const handlePerformanceChange = (entryId, field, value) => {
  setCandidatePerformance((prev) => ({
    ...prev,
    [selectedCandidateId]: prev[selectedCandidateId].map((entry) =>
      entry.id === entryId ? { ...entry, [field]: value } : entry
    ),
  }));
};

// ✅ Add a new performance entry
const addPerformanceEntry = () => {
  if (!selectedCandidateId) return; // ✅ Ensure a candidate is selected

  setCandidatePerformance((prev) => ({
    ...prev,
    [selectedCandidateId]: [
      ...(prev[selectedCandidateId] || []),
      {
        id: Date.now().toString(), // ✅ Unique ID
        recordName: "",
        criteria: [{ type: "", score: ""}], 
      },
    ],
  }));
};


const addCriteria = (entryId) => {
  setCandidatePerformance((prev) => {
    const updatedPerformance = prev[selectedCandidateId].map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            criteria: [
              ...entry.criteria,
              { type: "", score: 0, assessment: "", remarks: "" }, // ✅ Empty new criterion
            ],
          }
        : entry
    );

    return {
      ...prev,
      [selectedCandidateId]: updatedPerformance,
    };
  });
};


// ✅ Toggle expand/collapse
const toggleCollapse = (entryId) => {
  setCollapsedEntries((prev) => ({
    ...prev,
    [entryId]: !prev[entryId],
  }));
};

  useEffect(() => {
    if (show) {
      setLocalCandidates(candidates.filter((c) => c.selected)); // Load selected candidates
    }
  }, [show, candidates]);
  


// ✅ Fetch candidate performance data when a candidate is selected
const handleCandidateSelect = async (event) => {
  const candidateId = event.target.value;
  setSelectedCandidateId(candidateId);
  if (candidateId) {
    fetchCandidatePerformanceData(candidateId); // 🔹 Fetch performance records when selected
  }
};

const fetchCandidatePerformanceData = async (candidateId) => {
  if (!candidateId) return;

  try {
      const response = await fetch("http://localhost:5000/api/candPerformance/getPerformanceData", {
          method: "POST", // 🔹 Use POST for security
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId }),
          credentials: "include", // Ensures authentication
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch performance data.");

      // ✅ Store fetched data in state
      setPreviousCandidatePerformance((prev) => ({
          ...prev,
          [candidateId]: data.performanceRecords, // Ensure backend returns `performanceRecords`
      }));

  } catch (error) {
    return;
  }
};

  // Copy candidates to local state when modal opens
  useEffect(() => {
    if (show) {
      setLocalCandidates(candidates.filter((c) => c.selected)); // Load selected candidates
    }
  }, [show, candidates]);  
  
  useEffect(() => {
    if (!candidates.length) return; // ✅ Ensure candidates exist
  
    const announcementIdFromCandidate = candidates[0]?.announcementId;
    if (!announcementIdFromCandidate) return; // ✅ Prevent fetching if ID is missing
  
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/announcements/getAnnouncementInfoById",
          { announcementId: announcementIdFromCandidate }
        );
    
        setAnnouncementConcluded(response.data.concluded);
        setSelectedDepartment(response.data.departmentd);
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };
    
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/departments/list");
        setDepartments(
          response.data.map((dept) => ({
            id: dept.departmentid,
            name: dept.departmentName,
          }))
        );
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
  
    const fetchUsers = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/users/getUserInfoAndExperience");
        setAllUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUsers();
    fetchAnnouncement();
    fetchDepartments();
  }, [candidates]);  // ✅ Runs when candidates or allUsers change
  
  const handleRemoveCandidate = (candidateId) => {
    setLocalCandidates((prev) => prev.filter((c) => c.candidateId !== candidateId));
  };
  
  if (!show) return null;
  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButtonTop onClick={onClose}>&times;</CloseButtonTop>
        <TabsContainer>
        {["Check List", "Candidate Performance"].map(
          (tab) => (
            <Tab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </Tab>
          )
        )}
        </TabsContainer>
        <ContentContainer>
          {activeTab === "Check List" && (
            <CandidateList>
              <Heading>CHECK LIST</Heading>
              <hr id="title-line" className="mb-4" data-symbol="✈" />
              {localCandidates.length > 0 ? (
                <>
                  <CandidateHeader>
                    <span>ID</span>
                    <span>Name</span>
                    <span>Email</span>
                    <span>HIRE</span>
                    <span>Action</span>
                  </CandidateHeader>
                  {localCandidates.map((candidate) => (
                    <CandidateItem key={candidate.candidateId}>
                      <span>{candidate.candidateId || "N/A"}</span>
                      <span>{`${candidate.firstName || ""} ${candidate.surName || ""}`}</span>
                      <span>{candidate.email || "N/A"}</span>
                      <span className="fw-semibold text-dark">
                        {candidate.result ? "Yes" : "No"}
                      </span>
                      <RemoveButton onClick={() => handleRemoveCandidate(candidate.candidateId)}>
                        Remove
                      </RemoveButton>
                    </CandidateItem>
                  ))}
                </>
              ) : (
                <p>No selected candidates found.</p>
              )}
            </CandidateList>
          )}
          {activeTab === "Candidate Performance" && (
            <div>
              <Heading>CANDIDATE PERFORMANCE</Heading>
              <hr id="title-line" className="mb-4" data-symbol="✈" />

              {/* Candidate Selection Dropdown */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="form-group flex-grow-1">
                  <label className="form-label">Select Candidate:</label>
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-control w-100"
                      value={selectedCandidateId}
                      onChange={handleCandidateSelect}
                      style={{ height: "42px" }}
                    >
                      <option value="">-- Select Candidate --</option>
                      {localCandidates
                        .filter(candidate => !candidate.result) // ✅ Exclude candidates with result: true
                        .map((candidate) => (
                          <option key={candidate.candidateId} value={candidate.candidateId}>
                            {candidate.candidateId + " \u00A0:\u00A0 " + candidate.firstName + " " + candidate.surName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Add Performance Entry Button */}
              <button
                type="button"
                className="btn btn-primary mb-3"
                onClick={addPerformanceEntry}
                disabled={!selectedCandidateId}
              >
                <FaPlus /> Add Performance Entry
              </button>

              {/* Performance Records Display */}
              {selectedCandidateId && candidatePerformance[selectedCandidateId] && (
                <>
                  {candidatePerformance[selectedCandidateId].map((perf) => (
                    <div
                      key={perf.id}
                      className="p-3 mb-3 rounded border border-secondary shadow-sm position-relative"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      {/* Expand/Collapse Button */}
                      <button
                        type="button"
                        className="btn btn-light btn-sm position-absolute top-0 start-0 m-1"
                        onClick={() => toggleCollapse(perf.id)}
                        disabled={loadingEntries[perf.id]} // Disable while submitting
                      >
                        {collapsedEntries[perf.id] ? <FaChevronDown /> : <FaChevronUp />}
                      </button>

                      {/* Remove Performance Entry Button */}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                        onClick={() => removePerformanceEntry(perf.id)}
                        disabled={loadingEntries[perf.id]} // Disable while submitting
                      >
                        <FaTimes />
                      </button>

                      {/* Collapsed View */}
                      {collapsedEntries[perf.id] && (
                        <p className="mt-3 fw-bold text-center">{perf.recordName || "Unnamed Record"}</p>
                      )}

                      {/* Expanded View */}
                      {!collapsedEntries[perf.id] && (
                        <>
                          <div className="row p-1">
                            <div className="col-md-12 mb-3 mt-4">
                              <label className="form-label">Performance Record Name:</label>
                              <input
                                type="text"
                                className="form-control"
                                value={perf.recordName}
                                required
                                onChange={(e) => handlePerformanceChange(perf.id, "recordName", e.target.value)}
                                disabled={loadingEntries[perf.id]} // Disable while submitting
                              />
                            </div>
                          </div>

                          {/* Add Criteria Button */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm mb-2"
                            onClick={() => addCriteria(perf.id)}
                            disabled={loadingEntries[perf.id]} // Disable while submitting
                          >
                            <FaPlus /> Add Criteria
                          </button>

                          {/* Performance Criteria */}
                          {perf.criteria.map((criterion, index) => (
                            <div key={index} className="row align-items-center mb-3">
                              {/* Criteria Name Input */}
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  className="form-control text-center"
                                  placeholder="Enter Criteria"
                                  value={criterion.type}
                                  required
                                  onChange={(e) => handleCriteriaChange(perf.id, index, "type", e.target.value)}
                                  disabled={loadingEntries[perf.id]} // Disable while submitting
                                />
                              </div>

                              {/* Score Input */}
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  placeholder="Score (0-100)"
                                  value={criterion.score}
                                  min="0"
                                  max="100"
                                  required
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value, 10);
                                    if (isNaN(value) || value < 0) value = 0; // Restrict to minimum 0
                                    if (value > 100) value = 100; // Restrict to maximum 100
                                    handleCriteriaChange(perf.id, index, "score", value);
                                  }}
                                  disabled={loadingEntries[perf.id]} // Disable while submitting
                                />
                              </div>

                              {/* Remove Criteria Button */}
                              <div className="col-md-3">
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeCriteria(perf.id, index)}
                                  disabled={loadingEntries[perf.id]} // Disable while submitting
                                >
                                  <FaTimes /> Remove
                                </button>
                              </div>
                            </div>
                          ))}

                          <div className="mt-4 text-center">
                            <label className="form-label fw-bold d-block text-center">Performance Strength:</label>
                            <div 
                              className="progress mt-1 mx-auto" 
                              style={{width: "60%", borderRadius: "4px", backgroundColor: "#e9ecef" }}
                            >
                              <div
                                className={`progress-bar bg-${getPerformanceColor(perf.averageScore)}`}
                                role="progressbar"
                                style={{
                                  width: `${perf.averageScore}%`,
                                  transition: "width 0.3s ease-in-out",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  lineHeight: "8px",
                                }}
                                aria-valuenow={perf.averageScore}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {perf.averageScore > 0 ? `${perf.averageScore}%` : ""}
                              </div>
                            </div>


                            {/* Show Assessment Message ONLY When Score is Set */}
                            {perf.averageScore > 0 && (
                              <p className="text-center mt-2 fw-semibold text-muted">
                                {perf.assessment ? `Assessment: ${perf.assessment}` : "Assessment Pending"}
                              </p>
                            )}
                          </div>

                            <div className="col-md-12 mb-3 mt-3" style={{padding:"3px"}}>
                              <label className="form-label">Remarks:</label>
                              <input
                                type="text"
                                className="form-control"
                                value={perf.remarks}
                                required
                                onChange={(e) => handlePerformanceChange(perf.id, "remarks", e.target.value)}
                                disabled={loadingEntries[perf.id]} // Disable while submitting
                              />
                            </div>

                          {/* Submit & Clear Data Buttons */}
                          <div className="d-flex justify-content-between mt-3">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => handleConfirmSubmit(perf.id)}
                              disabled={loadingEntries[perf.id]} // Disable while submitting
                            >
                              {loadingEntries[perf.id] ? (
                                <>
                                  <FaSpinner className="spinner-border spinner-border-sm me-2" /> Submitting...
                                </>
                              ) : (
                                <>
                                  <FaCheck /> Submit
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => clearPerformanceData(perf.id)}
                              disabled={loadingEntries[perf.id]} // Disable while submitting
                            >
                              <FaUndo /> Clear Data
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Previous Performance Records */}
              <div className="mt-1 p-3 border rounded bg-light shadow-sm record-container">
                {/* 🔹 Header with Delete All Button */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="text-dark fw-bold m-0 d-flex align-items-center">
                    <FaHistory className="me-2 text-secondary" size={20} /> Previous Performance Records
                  </h4>

                  {/* ✅ Show "Delete All" Button if Records Exist */}
                  {previousPerformanceData[selectedCandidateId]?.length > 0 && (
                    <button className="btn btn-danger btn-sm"  onClick={handleConfirmDeleteAll}>
                      <FaTrashAlt className="me-2" /> Delete All
                    </button>
                  )}
                </div>


                {previousPerformanceData[selectedCandidateId]?.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {previousPerformanceData[selectedCandidateId]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((record, index) => (
                        <div className="card p-3 shadow-sm border rounded bg-white position-relative" key={index}>
                          {/* 📌 Record Name, Date & Delete Button */}
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            {/* 📌 Record Title */}
                            <h5 className="card-title text-dark fw-bold m-0">
                              <FaFileAlt className="me-2 text-secondary" size={16} /> {record.recordName.toUpperCase()}
                            </h5>

                            {/* 📌 Date & Delete Button (with spacing) */}
                            <div className="d-flex align-items-center gap-3">
                              <span className="text-muted fs-6">
                                <FaCalendarAlt className="me-1 text-secondary" size={14} /> {new Date(record.createdAt).toLocaleString()}
                              </span>
                              
                              <button className="btn btn-danger btn-sm"   onClick={() => handleConfirmDelete(record.candidatePerformanceId)}>
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>

                          <hr className="my-2" />


                          {/* 📊 Assessment */}
                          <div className="mb-1">
                            <p className="mb-1 fs-5 d-flex align-items-center">
                              <strong className="text-primary d-flex align-items-center">
                                <FaChartBar className="me-2 text-primary" size={18} /> Assessment:
                              </strong> 
                              <span className="fw-semibold ms-2 text-dark">{record.candidateAssessment} [{record.averageScore}%]</span>
                            </p>
                          </div>

                          {/* 📜 Remarks */}
                          <div className="mb-2">
                            <p className="mb-1 fs-5 d-flex align-items-center">
                              <strong className="text-muted d-flex align-items-center">
                                <FaCommentDots className="me-2 text-muted" size={18} /> Remarks:
                              </strong> 
                              <span className="fw-semibold ms-2 text-dark">{record.remarks || "None"}</span>
                            </p>
                          </div>

                          {/* ✅ Performance Criteria */}
                          <div className="mt-2">
                            <h5 className="text-dark fw-bold d-flex align-items-center">
                              <FaTasks className="me-2 text-secondary" size={16} /> EVALUATION CRITERIA
                            </h5>
                            <ul className="list-group list-group-flush mt-1 criteria-list">
                              {record.criteria.map((crit, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 bg-light border rounded shadow-sm">
                                  <span className="fs-6 fw-semibold d-flex align-items-center text-dark">
                                    <FaCheckCircle className="me-2 text-success" size={18} /> {crit.type}
                                  </span>
                                  <span className="badge bg-secondary rounded-pill fs-6 px-3 py-1">{crit.score}/100</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted text-center fs-5 fw-bold mt-3">
                    <FaExclamationCircle className="me-2 text-danger" size={18} /> No data available for candidate
                  </p>
                )}
              </div>
              {showConfirmSubmit && (
                <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
                  <div className="bg-white p-4 rounded shadow-lg text-center" style={{ maxWidth: "400px" }}>
                    <p className="fw-bold">Are you sure you want to submit this performance?</p>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <button className="btn btn-secondary" onClick={() => setShowConfirmSubmit(false)}>Cancel</button>
                      <button className="btn btn-success" onClick={confirmSubmitPerformance}>Yes, Submit</button>
                    </div>
                  </div>
                </div>
              )}


              {showConfirmDelete && (
                <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
                  <div className="bg-white p-4 rounded shadow-lg text-center" style={{ maxWidth: "400px" }}>
                    <p className="fw-bold">Are you sure you want to delete this record?</p>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <button className="btn btn-secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                      <button className="btn btn-danger" onClick={confirmDeleteRecord}>Yes, Delete</button>
                    </div>
                  </div>
                </div>
              )}

              {showConfirmDeleteAll && (
                <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
                  <div className="bg-white p-4 rounded shadow-lg text-center" style={{ maxWidth: "400px" }}>
                    <p className="fw-bold">Are you sure you want to delete ALL records?</p>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <button className="btn btn-secondary" onClick={() => setShowConfirmDeleteAll(false)}>Cancel</button>
                      <button className="btn btn-danger" onClick={confirmDeleteAllRecords}>Yes, Delete All</button>
                    </div>
                  </div>
                </div>
              )}


            </div>
          )}
        </ContentContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1004;
`;

const ModalContent = styled.div`
  background: white;
  padding: 35px;
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  width: 92vw;
  max-width: 1100px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CloseButtonTop = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  transition: color 0.3s, transform 0.2s;

  &:hover {
    color: #ff4d4d;
    transform: scale(1.2);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 2px solid #ccc;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  text-align: center;
  background: ${({ active }) => (active ? "#007bff" : "#f1f1f1")};
  color: ${({ active }) => (active ? "white" : "#333")};
  font-size: 15px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;

  &:hover {
    background: ${({ active }) => (active ? "#0056b3" : "#ddd")};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
`;

const CandidateHeader = styled.div`
  display: grid;
  grid-template-columns: 10% 25% 25% 20% 10%;
  background: #007bff;
  color: white;
  padding: 10px;
  font-weight: 700; /* Bolder Header */
  border-radius: 6px;
  font-size: 14px;
  text-align: left;
  text-transform: uppercase;
`;

const CandidateItem = styled.div`
  display: grid;
  grid-template-columns: 10% 25% 25% 20% 10%;
  background: ${({ index }) => (index % 2 === 0 ? "#f9f9f9" : "#ffffff")};
  padding: 10px;
  border-radius: 6px;
  transition: background 0.3s;
  font-size: 14px;
  font-weight: 600; /* Bolder Text */
  align-items: center;
  border-bottom: 1px solid #ddd; /* Subtle separator */

  &:hover {
    background: #e6f7ff;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Heading = styled.h2`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 15px;
  color: #333;
`;


const RemoveButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700; /* Bolder Button */
  transition: background 0.3s;
  text-align: center;

  &:hover {
    background: #cc0000;
  }
`;

const CandidateList = styled.div`
  margin-top: 12px;
  border-radius: 6px;
  overflow: hidden;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 10px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


export default OptionModal;
