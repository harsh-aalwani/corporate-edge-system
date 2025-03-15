import React, { useState, useEffect,useRef ,useCallback} from "react";
import { FaPlus , FaTimes, FaChevronDown, FaChevronUp , FaUserPlus, FaUndo ,FaCheck, FaCalendarAlt, FaCheckCircle, FaChartBar, FaTasks, FaHistory, FaCommentDots, FaFileAlt} from "react-icons/fa";
import styled from "styled-components";
import { useSnackbar } from "notistack";
import placeholderData from '../../data/data.json';
import { AddUserForm } from "./AddUserForm";

const OptionModal = ({ show, onClose, candidates = [], setCandidates }) => {
  const [activeTab, setActiveTab] = useState("Check List");
  const [localCandidates, setLocalCandidates] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  //Add as New User
  const [selectedNewCandidateId,setSelectedNewCandidateId] = useState('');
  const handleNewCandidateSelect = (event) => {
    setSelectedNewCandidateId(event.target.value);
  };


  // Candidate Performance
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [candidatePerformance, setCandidatePerformance] = useState({});
  const [collapsedEntries, setCollapsedEntries] = useState({});
  const [previousPerformanceData, setPreviousCandidatePerformance] = useState({});

  const submitPerformance = useCallback(async (perfId) => {
    if (!selectedCandidateId) {
        enqueueSnackbar("⚠️ No candidate selected.", { variant: "warning" });
        return;
    }

    // ✅ Find the performance entry by ID
    const updatedPerformance = candidatePerformance[selectedCandidateId]?.find(p => p.id === perfId);

    if (!updatedPerformance) {
        enqueueSnackbar("⚠️ Performance entry not found.", { variant: "error" });
        return;
    }

    // ✅ Ensure criteria is an array
    const criteriaArray = Array.isArray(updatedPerformance.criteria) ? updatedPerformance.criteria : [];

    // ✅ Prepare data to send
    const performanceData = {
        recordName: updatedPerformance.recordName,
        criteria: criteriaArray,
        remarks: updatedPerformance.remarks || "",
        candidateAssessment: updatedPerformance.assessment,
        candidateId: selectedCandidateId,
    };

    console.log("📤 Submitting Performance Data:", performanceData);

    try {
      const response = await fetch("http://localhost:5000/api/candPerformance/addRecord", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(performanceData),
            credentials: "include", // ✅ Ensures authentication
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to save performance data.");
        }

        console.log("✅ Performance saved successfully:", data);
        enqueueSnackbar("✅ Performance data submitted successfully!", { variant: "success" });
        fetchCandidatePerformanceData(selectedCandidateId);
        // ✅ Collapse the entry after submission
        setCollapsedEntries(prev => ({ ...prev, [perfId]: true }));

    } catch (error) {
        console.error("❌ Error saving performance:", error);
        enqueueSnackbar("❌ Failed to save performance data. Please try again.", { variant: "error" });
    }
}, [selectedCandidateId, candidatePerformance]); // ✅ Dependencies  

  const clearPerformanceData = (perfId) => {
    setCandidatePerformance(prevPerformance => ({
      ...prevPerformance,
      [selectedCandidateId]: prevPerformance[selectedCandidateId].map(perf =>
        perf.id === perfId ? { ...perf, criteria: [], assessment: "", remarks: "" } : perf
      )
    }));
  };
  


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

      enqueueSnackbar("✅ Candidate performance data loaded successfully!", { variant: "success" });
  } catch (error) {
      enqueueSnackbar("No Data Exist.", { variant: "error" });
  }
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
        criteria: [{ type: "", score: "", assessment: "", remarks: "" }], // ✅ Default criteria entry
      },
    ],
  }));
};


const addCriteria = (entryId) => {
  setCandidatePerformance((prev) => ({
    ...prev,
    [selectedCandidateId]: prev[selectedCandidateId].map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            criteria: [
              ...entry.criteria,
              { type: "", score: "", assessment: "", remarks: "" }, // ✅ Empty new criteria
            ],
          }
        : entry
    ),
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
  setCandidatePerformance((prev) => ({
    ...prev,
    [selectedCandidateId]: prev[selectedCandidateId].map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            criteria: entry.criteria.map((criterion, idx) =>
              idx === index ? { ...criterion, [field]: value } : criterion
            ),
          }
        : entry
    ),
  }));
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

// ✅ Toggle expand/collapse
const toggleCollapse = (entryId) => {
  setCollapsedEntries((prev) => ({
    ...prev,
    [entryId]: !prev[entryId],
  }));
};
  // Email
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [documents, setDocuments] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [filteredOptions, setFilteredOptions] = useState([]);
  const textareaRef = useRef(null);

  const allPlaceholders = [
    "[[CandidateName]]",
    "[[JobTitle]]",
    "[[CompanyName]]",
    "[[OfficeAddress]]",
    "[[YourName]]",
    "[[YourPosition]]",
    "[[CompanyEmail]]"
  ];
  const [placeholders, setPlaceholders] = useState([]);

  // Copy candidates to local state when modal opens
  useEffect(() => {
    if (show) {
      setLocalCandidates(candidates.filter((c) => c.selected)); // Load selected candidates
  
      // Define placeholder mappings from `placeholderData`
      const placeholderMappings = {
        "[[CompanyName]]": placeholderData?.Header?.Name?.trim() || "",
        "[[OfficeAddress]]": placeholderData?.Contact?.address?.trim() || "",
        "[[CompanyEmail]]": placeholderData?.Contact?.email?.trim() || "",
      };
  
      // Filter out placeholders with missing values
      const filteredPlaceholders = allPlaceholders.filter(
        (tag) => !(tag in placeholderMappings) || placeholderMappings[tag] !== ""
      );
  
      setPlaceholders(filteredPlaceholders);
    }
  }, [show, candidates, placeholderData]);

  

  const handleFileChange = (e) => {
    const allowedTypes = ["application/pdf", "application/msword", "image/png", "image/jpeg"];
    const files = Array.from(e.target.files);
  
    // Filter valid file types
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
  
    // Prevent duplicates
    const uniqueFiles = validFiles.filter(file => 
      !documents.some(doc => doc.file.name === file.name)
    );
  
    if (uniqueFiles.length === 0) {
      enqueueSnackbar("No valid new files selected.", { variant: "warning" });
      return;
    }
  
    const filesWithMeta = uniqueFiles.map(file => ({
      file,
      customName: file.name, // Default to original name
    }));
  
    setDocuments(prevDocs => [...prevDocs, ...filesWithMeta]);
  };
  
  const updateFileName = (index, newName) => {
    setDocuments(prevDocs => {
      const updatedDocs = [...prevDocs];
      updatedDocs[index] = { ...updatedDocs[index], customName: newName };
      return updatedDocs;
    });
  };
  

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };
  
  const removeFile = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
    enqueueSnackbar("File removed.", { variant: "info" });
  };

  const addFiles = (files) => {
    if (documents.length + files.length > 5) {
      enqueueSnackbar("You can upload a maximum of 5 files.", { variant: "error" });
      return;
    }
    setDocuments([...documents, ...files]);
  };


  // Function to remove a candidate from the modal's local list
  const handleRemoveCandidate = (candidateId) => {
    setLocalCandidates((prev) => prev.filter((c) => c.candidateId !== candidateId));
  };

  const handleTemplateSelect = (templateKey) => {
    setSubject(templates[templateKey].subject);
    setEmailBody(templates[templateKey].body);
  };

  const handleInputChange = (e, setState, field) => {
    const { value, selectionStart } = e.target;
    setState(value);
  
    // Only apply placeholder logic to emailBody
    if (field === "emailBody") {
      const textBeforeCursor = value.substring(0, selectionStart);
      if (textBeforeCursor.endsWith("[[")) {
        setFilteredOptions(placeholders);
        setShowDropdown(true);
  
        // Get caret position for dropdown
        const caretCoords = getCaretCoordinates(e.target, selectionStart);
        const rect = e.target.getBoundingClientRect();
  
        setDropdownPosition({
          top: rect.top + caretCoords.top - e.target.scrollTop + window.scrollY - 100,
          left: rect.left + caretCoords.left + window.scrollX,
        });
      } else {
        setShowDropdown(false);
      }
    }
  };
  
  const handleSelectPlaceholder = (placeholder) => {
    if (!textareaRef.current) return;
  
    const { selectionStart, selectionEnd } = textareaRef.current;
  
    // Only update emailBody, never subject
    setEmailBody(
      emailBody.substring(0, selectionStart - 2) +
      placeholder +
      emailBody.substring(selectionEnd)
    );
  
    setShowDropdown(false);
  
    // Move cursor to after the inserted placeholder
    setTimeout(() => {
      textareaRef.current.selectionStart = selectionStart + placeholder.length - 2;
      textareaRef.current.selectionEnd = selectionStart + placeholder.length - 2;
      textareaRef.current.focus();
    }, 0);
  };
  
  
  // Helper function to get caret position inside textarea
  const getCaretCoordinates = (textarea, position) => {
    const div = document.createElement("div");
    document.body.appendChild(div);
  
    const computed = window.getComputedStyle(textarea);
    div.style.cssText = `
      position: absolute;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      visibility: hidden;
      font: ${computed.font};
      width: ${textarea.clientWidth}px;
      padding: ${computed.padding};
      border: ${computed.border};
      line-height: ${computed.lineHeight};
    `;
  
    // Copy text content up to cursor position
    const text = textarea.value.substring(0, position);
    div.textContent = text;
  
    // Create a span at the end of the text to find cursor position
    const span = document.createElement("span");
    span.textContent = "​"; // Zero-width space to avoid extra width
    div.appendChild(span);
  
    const { offsetTop: top, offsetLeft: left } = span;
    document.body.removeChild(div);
  
    return { top, left };
  };
  
  const handleClear = () => {
    setSubject("");
    setEmailBody("");
    setDocuments([]); // Clear uploaded files
  };
  
  const replacePlaceholders = (text, placeholders) => {
    return text.replace(/\[\[(.*?)\]\]/g, (_, key) => placeholders[key] || `[${key} Missing]`);
  };
  
  const handleSendMail = async () => {
    setLoading(true);

    // ✅ Prepare recipients list
    const recipients = localCandidates.map(candidate => ({
        candidateId: candidate.candidateId,
        email: candidate.email
    }));

    // ✅ Prepare FormData for file upload
    const formData = new FormData();
    formData.append("subject", subject.trim()); // Ensure subject is not empty
    formData.append("emailBody", emailBody.trim()); // Ensure email body is not empty
    formData.append("recipients", JSON.stringify(recipients));

    // ✅ Send `placeholderData` (CompanyName, OfficeAddress, CompanyEmail) to backend
    formData.append("placeholderData", JSON.stringify({
        CompanyName: placeholderData?.Header?.Name?.trim() || "",
        OfficeAddress: placeholderData?.Contact?.address?.trim() || "",
        CompanyEmail: placeholderData?.Contact?.email?.trim() || ""
    }));

    // ✅ Append files correctly
    documents.forEach(({ file }) => {
        if (file && file.name) {
            formData.append("documents", file, file.name);
        } else {
            console.warn("Skipping undefined file:", file);
        }
    });

    try {
        const response = await fetch("http://localhost:5000/api/emails/send", {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to send email");
        }
            // ✅ Clear email fields after sending
          setSubject("");
          setEmailBody("");
          setDocuments([]);
        enqueueSnackbar("📧 Email sent successfully with attachments!", { variant: "success" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        enqueueSnackbar(`❌ Error: ${error.message}`, { variant: "error" });
    } finally {
        setLoading(false);
    }
  };

  
  if (!show) return null;
  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButtonTop onClick={onClose}>&times;</CloseButtonTop>
        <TabsContainer>
          {["Check List", "Send Email", "Candidate Performance", "Add as User"].map((tab) => (
            <Tab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </Tab>
          ))}
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
                    <span>Phone</span>
                    <span>Action</span>
                  </CandidateHeader>
                  {localCandidates.map((candidate) => (
                    <CandidateItem key={candidate.candidateId}>
                      <span>{candidate.candidateId || "N/A"}</span>
                      <span>{`${candidate.firstName || ""} ${candidate.surName || ""}`}</span>
                      <span>{candidate.email || "N/A"}</span>
                      <span>{candidate.phone || "N/A"}</span>
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
          {activeTab === "Send Email" && (
            <div style={{ position: "relative" }}>
              <Heading>SEND EMAIL</Heading>
              <hr id="title-line" className="mb-4" data-symbol="✈" />

              <div className="mt-2"> {/* Added top spacing */}
                {Object.keys(templates).map((key) => (
                  <label
                    key={key}
                    style={{
                      display: "block", // Ensures each template is on a new line
                      fontSize: "14px", // Adjust font size
                      fontWeight: "bold", // Make text bold
                      letterSpacing: "1px", // Add space between capital letters
                      padding: "8px 0", // Adds vertical spacing
                      cursor: "pointer",
                      marginLeft: "2rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="emailTemplate"
                      onChange={() => handleTemplateSelect(key)}
                      style={{ marginRight: "10px" }} // Adds space between radio and text
                    />
                    {key.replace(/([A-Z])/g, " $1").trim()} {/* Adds spacing between capital letters */}
                  </label>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => handleInputChange(e, setSubject, "subject")}
              />

              <div>
                <TextArea
                  ref={textareaRef}
                  value={emailBody}
                  onChange={(e) => handleInputChange(e, setEmailBody, "emailBody")}
                  placeholder="User [[..]] for special functions..."
                />
                {showDropdown && (
                  <ul
                    style={{
                      position: "absolute",
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      background: "white",
                      border: "1px solid #ccc",
                      listStyle: "none",
                      padding: "5px",
                      zIndex: 10,
                      width: "200px",
                    }}
                  >
                    {filteredOptions.map((option) => (
                      <li
                        key={option}
                        style={{ padding: "5px", cursor: "pointer" }}
                        onClick={() => handleSelectPlaceholder(option)}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <FileUploadContainer
                className={dragging ? "dragging" : ""}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  name="documents" // ✅ Add name attribute
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <p>{dragging ? "Drop files here" : "Click or Drag files here (Max 5)"}</p>
              </FileUploadContainer>

              <p
                style={{
                  fontWeight: "bold",
                  marginTop: "10px",
                  color: documents.length >= 5 ? "red" : "#333",
                }}
              >
                {documents.length} / 5 files uploaded
              </p>

              <FileList>
                {documents.map((file, index) => (
                  <FileItem key={index}>
                    <span>{file.customName || file.name}</span> {/* ✅ Show as text instead of input */}
                    <RemoveFileButton onClick={() => removeFile(index)}>Remove</RemoveFileButton>
                  </FileItem>
                ))}
              </FileList>

              {loading ? (
                <Loader />
              ) : (
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <ClearButton onClick={handleClear}>Clear</ClearButton>
                  <SendMailButton onClick={handleSendMail} disabled={!subject || !emailBody}>
                    Send
                  </SendMailButton>
                </div>
              )}
            </div>
          )}    
          {activeTab === "Candidate Performance" && (
            <div>
              <Heading>CANDIDATE PERFORMANCE</Heading>
              <hr id="title-line" className="mb-4" data-symbol="✈" />

              {/* ✅ Select Candidate */}
              <div className="form-group full-width">
                <label className="form-label">Select Candidate:</label>
                <select className="form-control" value={selectedCandidateId} onChange={handleCandidateSelect}>
                  <option value="">-- Select Candidate --</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.candidateId} value={candidate.candidateId}>
                      {candidate.candidateId + " \u00A0:\u00A0\u00A0 " + candidate.firstName + " " + candidate.surName}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Add Performance Entry Button */}
              <button type="button" className="btn btn-primary mb-3" onClick={addPerformanceEntry} disabled={!selectedCandidateId}>
                <FaPlus /> Add Performance Entry
              </button>

              {/* ✅ Show Performance Cards When Candidate is Selected */}
              {selectedCandidateId && candidatePerformance[selectedCandidateId] && (
                <>
                  {candidatePerformance[selectedCandidateId].map((perf) => (
                    <div key={perf.id} className="p-3 mb-3 rounded border border-secondary shadow-sm position-relative" style={{ backgroundColor: "#f8f9fa" }}>
                      {/* Expand/Collapse Button */}
                      <button type="button" className="btn btn-light btn-sm position-absolute top-0 start-0 m-1" onClick={() => toggleCollapse(perf.id)}>
                        {collapsedEntries[perf.id] ? <FaChevronDown /> : <FaChevronUp />}
                      </button>

                      {/* Remove Performance Entry Button */}
                      <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" onClick={() => removePerformanceEntry(perf.id)}>
                        <FaTimes />
                      </button>

                      {/* Collapsed View */}
                      {collapsedEntries[perf.id] && <p className="mt-3 fw-bold text-center">{perf.recordName || "Unnamed Record"}</p>}

                      {/* Expanded View */}
                      {!collapsedEntries[perf.id] && (
                        <>
                          <div className="row p-1">
                            {/* Record Name Input */}
                            <div className="col-md-12 mb-3 mt-4">
                              <label className="form-label">Performance Record Name:</label>
                              <input type="text" className="form-control" value={perf.recordName} required onChange={(e) => handlePerformanceChange(perf.id, "recordName", e.target.value)} />
                            </div>
                          </div>

                          {/* ✅ Add Criteria Button */}
                          <button type="button" className="btn btn-secondary btn-sm mb-2" onClick={() => addCriteria(perf.id)}>
                            <FaPlus /> Add Criteria
                          </button>

                          {/* ✅ Performance Criteria - Aligned Layout */}
                          {perf.criteria.map((criterion, index) => (
                            <div key={index} className="row align-items-center mb-2">
                              {/* Criteria Name (Wider Field) */}
                              <div className="col-md-6">
                                <input type="text" className="form-control text-center" placeholder="Enter Criteria" value={criterion.type} required onChange={(e) => handleCriteriaChange(perf.id, index, "type", e.target.value)} />
                              </div>

                              {/* Score Input */}
                              <div className="col-md-3">
                                <input type="number" className="form-control text-center" placeholder="Score (0-100)" value={criterion.score} min="0" max="100" required onChange={(e) => handleCriteriaChange(perf.id, index, "score", e.target.value)} />
                              </div>

                              {/* ✅ Remove Criteria Button */}
                              <div className="col-md-3">
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCriteria(perf.id, index)}>
                                  <FaTimes /> Remove
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* ✅ Assessment & Remarks - Separate Fields */}
                          <div className="row mt-4">
                            {/* Assessment Dropdown */}
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Overall Assessment:</label>
                              <select className="form-control" value={perf.assessment} required onChange={(e) => handlePerformanceChange(perf.id, "assessment", e.target.value)}>
                                <option value="">Select Assessment</option>
                                <option value="Good">Good</option>
                                <option value="Above Average">Above Average</option>
                                <option value="Average">Average</option>
                                <option value="Below Average">Below Average</option>
                                <option value="Bad">Bad</option>
                              </select>
                            </div>

                            {/* Remarks Input */}
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Remarks:</label>
                              <input type="text" className="form-control" value={perf.remarks} required onChange={(e) => handlePerformanceChange(perf.id, "remarks", e.target.value)} />
                            </div>
                          </div>

                          {/* ✅ Submit & Clear Data Buttons */}
                          <div className="d-flex justify-content-between mt-3">
                            <button type="button" className="btn btn-success" onClick={() => submitPerformance(perf.id)}>
                              <FaCheck /> Submit
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => clearPerformanceData(perf.id)}>
                              <FaUndo /> Clear Data
                            </button>
                          </div>
                        </>
                      )}``
                    </div>
                  ))}
                </>
              )}

              {/* ✅ Show Previous Performance Records (Read-Only, Sorted by Date) */}
              {previousPerformanceData[selectedCandidateId]?.length > 0 && (
                <div className="mt-4 p-4 border rounded bg-white record-container">
                  <h5 className="text-primary fw-bold mb-3">
                    <FaHistory className="me-2" size={20} /> Previous Performance Records
                  </h5>
                  {previousPerformanceData[selectedCandidateId]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 🔹 Sort by Date (Newest First)
                    .map((record, index) => (
                      <div key={index} className="card mb-3 border-0 shadow-lg record-card">
                        <div className="card-body p-4">
                          {/* 📌 Record Name & Date */}
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="card-title text-dark fw-semibold m-0">
                              <FaFileAlt className="me-2 text-secondary" size={16} /> {record.recordName}
                            </h6>
                            <span className="text-muted small">
                              <FaCalendarAlt className="me-1" size={14} /> {new Date(record.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <hr className="my-2" />

                          {/* 📊 Assessment & Remarks */}
                          <div className="mb-3">
                            <p className="mb-2 fs-6">
                              <strong className="text-success">
                                <FaChartBar className="me-1" size={16} /> Assessment:
                              </strong> <span className="fw-medium">{record.candidateAssessment}</span>
                            </p>
                            <p className="mb-2 fs-6">
                              <strong className="text-warning">
                                <FaCommentDots className="me-1" size={16} /> Remarks:
                              </strong> <span className="fw-medium">{record.remarks}</span>
                            </p>
                          </div>

                          {/* ✅ Performance Criteria (Styled List with Shadow) */}
                          <div className="mt-3">
                            <h6 className="text-info fw-bold">
                              <FaTasks className="me-2" size={16} /> Evaluation Criteria
                            </h6>
                            <ul className="list-group list-group-flush mt-2 criteria-list">
                              {record.criteria.map((crit, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 bg-light criteria-item">
                                  <span className="fs-6 fw-medium">
                                    <FaCheckCircle className="me-2 text-success" size={18} /> {crit.type}
                                  </span>
                                  <span className="badge bg-primary rounded-pill fs-6 px-3 py-2">{crit.score}/100</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

            </div>
          )}
          {activeTab === "Add as User" && (
            <div>
              <Heading>ADD AS USER</Heading>
              {/* ✅ Select Candidate */}
              <div className="form-group full-width">
                <label className="form-label">Choose New Candidate:</label>
                <select
                  className="form-control"
                  value={selectedNewCandidateId}
                  onChange={handleNewCandidateSelect}
                >
                  <option value="">-- Choose New Candidate --</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.candidateId} value={candidate.candidateId}>
                      {candidate.candidateId + " \u00A0:\u00A0\u00A0 " + candidate.firstName + " " + candidate.surName}
                    </option>
                  ))}
                </select>
              </div>
              {/* ✅ Pass Updated Selected Candidate to Form */}
              <AddUserForm 
                selectedNewCandidateId={selectedNewCandidateId} 
                handleAddUser={() => console.log("User added:", selectedNewCandidateId)} 
              />
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

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  resize: none;
`;

const FileUploadContainer = styled.div`
  margin-top: 15px;
  border: 2px dashed #007bff;
  padding: 50px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  background: #f9f9f9;
  transition: background 0.3s;
  
  &:hover {
    background: #eef6ff;
  }

  &.dragging {
    background: #d0e6ff;
    border-color: #0056b3;
  }
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  background: #f1f1f1;
  padding: 8px 12px;
  margin-top: 5px;
  border-radius: 5px;
`;

const RemoveFileButton = styled.button`
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #cc0000;
  }
`;
const ButtonBase = styled.button`
  flex: 1; /* Ensures equal width for both buttons */
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s;
  text-align: center;
`;

const ClearButton = styled(ButtonBase)`
  background: #dc3545;
  color: white;

  &:hover {
    background: #b02a37;
  }
`;

const SendMailButton = styled(ButtonBase)`
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
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

const templates = {
  InterviewInvitation: {
    subject: "Interview Invitation – [[CompanyName]]",
    body: `Hello [[CandidateName]],  

We are pleased to invite you for an interview for the [[JobTitle]] position at [[CompanyName]].  

**Interview Details:**  
Date: [InsertDate]  
Time: [InsertTime]  
Location: [[OfficeAddress]] / [VideoCallLink]
Additional Information: [AdditionalDetails]  

Please confirm your availability by responding to this email at your earliest convenience. If you have any questions, feel free to reach out.  

Best regards,  
[[YourName]]  
[[YourPosition]]  
[[CompanyName]]  
[[CompanyEmail]]`
  },

  JobOffer: {
    subject: "Employment Offer – [[CompanyName]]",
    body: `Hello [[CandidateName]],  

We are pleased to offer you the position of [[JobTitle]] at [[CompanyName]]. We were impressed with your qualifications and believe you will be a great addition to our team.  

**Offer Details:**  
Position: [[JobTitle]]  
Department: [[DepartmentName]]  
Start Date: [StartDate]  
Compensation: [SalaryDetails]  
Benefits: [BenefitsDetails]  

Please find the attached offer letter with further details. Kindly review and confirm your acceptance by [DeadlineDate]. If you have any questions, feel free to reach out.  

Best regards,  
[[YourName]]  
[[YourPosition]]  
[[CompanyName]]  
[[CompanyEmail]]`
  },

  RejectionLetter: {
    subject: "Application Status Update – [[CompanyName]]",
    body: `Hello [[CandidateName]],  

Thank you for your interest in the [[JobTitle]] position at [[CompanyName]]. We appreciate the time and effort you put into the application and interview process.  

After careful consideration, we have decided to proceed with another candidate. This decision was based on a highly competitive selection process.  

We encourage you to apply for future opportunities at [[CompanyName]], as we were impressed by your skills and experience. We appreciate your time and wish you success in your job search.  

Best regards,  
[[YourName]]  
[[YourPosition]]  
[[CompanyName]]  
[[CompanyEmail]]`
  },

  FollowUpAfterInterview: {
    subject: "Follow-up on Your Interview – [[CompanyName]]",
    body: `Hello [[CandidateName]],  

Thank you for meeting with us to discuss the [[JobTitle]] position at [[CompanyName]]. It was a pleasure learning about your experience and skills.  

We are currently evaluating all candidates and will provide an update soon. In the meantime, if you have any questions, feel free to reach out.  

We appreciate your interest in joining [[CompanyName]] and will be in touch shortly.  

Best regards,  
[[YourName]]  
[[YourPosition]]  
[[CompanyName]]  
[[CompanyEmail]]`
  },

  Others: {
    subject: "- [[CompanyName]]", // No predefined subject
    body: `Greetings [[CandidateName]],  

I hope this email finds you well.  

[Insert your message here.]  

Best regards,  
[[YourName]]  
[[YourPosition]]  
[[CompanyName]]  
[[CompanyEmail]]`
  }
};


export default OptionModal;
