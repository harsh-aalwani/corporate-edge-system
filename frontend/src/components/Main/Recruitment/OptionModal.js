import Quill from "quill";
import React, { useState, useEffect, useRef, useMemo } from "react";
import BellCurveChart from "./BellCurveChart";
import ReactQuill from "react-quill";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChartBar,
  FaTasks,
  FaHistory,
  FaCommentDots,
  FaFileAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import styled from "styled-components";
import { useSnackbar } from "notistack";
import placeholderData from "../../data/data.json";
import { AddUserForm } from "./AddUserForm";
import axios from "axios";
import ApprovalModal from "./ApprovalModal";

const Delta = Quill.import("delta");

const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const OptionModal = ({
  show,
  onClose,
  candidates = [],
  setCandidates,
  defaultTab,
}) => {
  // Static Department Data
  const [departments, setDepartments] = useState([]);
  const [allCandidates, setAllCandidates] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [removedUsers, setRemovedUsers] = useState([]);
  const [graphView, setGraphView] = useState("all");

  // Static User Data (Users Available for Assignment)
  const [availableUsers, setAvailableUsers] = useState([]);

  // Users Assigned to Departments
  const [assignedUsers, setAssignedUsers] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;
  const [isFull, setIsFull] = useState(false);

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
      const assignedUsersData = allUsers.filter((user) =>
        assignedEvaluatorIds.includes(user.userId)
      );

      setAssignedUsers(assignedUsersData);
      console.log(assignedUsers);
    } catch (error) {
      console.error("Error fetching announcement:", error);
    }
  };

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

  // Manage Users & Departments
  const handleSaveEvaluators = async () => {
    if (!candidates.length) return; // ✅ Ensure candidates exist

    const announcementIdFromCandidate = candidates[0]?.announcementId;
    if (!announcementIdFromCandidate) return; // ✅ Prevent saving if ID is missing

    try {
      await axios.post(
        "http://localhost:5000/api/announcements/updateAssignedEvaluators",
        {
          announcementId: announcementIdFromCandidate,
          assignedEvaluators: assignedUsers.map((user) => user.userId), // ✅ Send only user IDs
        }
      );

      enqueueSnackbar("Assigned evaluators saved successfully!", {
        variant: "success",
      }); // ✅ Success Snackbar
    } catch (error) {
      console.error("Error saving assigned evaluators:", error);

      enqueueSnackbar("Failed to save evaluators. Please try again.", {
        variant: "error",
      }); // ✅ Error Snackbar
    }
  };

  // ✅ Search Filtering
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(userSearchTerm.toLowerCase()) // ✅ Allow searching by ID
  );

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  // ✅ Sort users by total experience before pagination
  const sortedUsers = [...filteredUsers].sort(
    (a, b) => b.totalExperience - a.totalExperience
  );

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const assignUserToDepartment = (user) => {
    setAssignedUsers((prevAssignedUsers) => {
      if (prevAssignedUsers.length >= 5) {
        enqueueSnackbar("Maximum 5 evaluators allowed.", {
          variant: "warning",
        });
        return prevAssignedUsers;
      }
      if (!prevAssignedUsers.some((u) => u.userId === user.userId)) {
        return [...prevAssignedUsers, user];
      }
      return prevAssignedUsers;
    });
  };

  const removeUserFromDepartment = (user) => {
    setAssignedUsers((prevAssignedUsers) =>
      prevAssignedUsers.filter((u) => u.userId !== user.userId)
    );
  };

  const [activeTab, setActiveTab] = useState(defaultTab || "Check List");
  const [localCandidates, setLocalCandidates] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [announcementConcluded, setAnnouncementConcluded] = useState(false);

  //Add as New User
  const [selectedNewCandidateId, setSelectedNewCandidateId] = useState("");
  const handleNewCandidateSelect = (event) => {
    setSelectedNewCandidateId(event.target.value);
  };

  // Candidate Performance
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [previousPerformanceData, setPreviousCandidatePerformance] = useState(
    {}
  );
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [approvalText, setApprovalText] = useState("");

  useEffect(() => {
    if (show) {
      setActiveTab(defaultTab || "Check List");
    }
  }, [show, defaultTab]);

  const handleApproval = async () => {
    if (!selectedCandidateId) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/candidates/toggleApproval",
        {
          candidateId: selectedCandidateId,
        }
      );

      if (response.status === 200) {
        enqueueSnackbar(
          `Candidate ${
            response.data.newStatus ? "Hire" : "Declined"
          } successfully!`,
          { variant: "success" }
        );

        // ✅ Update frontend UI
        setCandidates((prevCandidates) =>
          prevCandidates.map((candidate) =>
            candidate.candidateId === selectedCandidateId
              ? { ...candidate, result: response.data.newStatus }
              : candidate
          )
        );

        // ✅ Update frontend UI
        setLocalCandidates((prevCandidates) =>
          prevCandidates.map((candidate) =>
            candidate.candidateId === selectedCandidateId
              ? { ...candidate, result: response.data.newStatus }
              : candidate
          )
        );

        setIsApprovalModalOpen(false); // Close modal
      } else {
        enqueueSnackbar("Failed to update candidate status.", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error updating candidate status:", error);
      enqueueSnackbar("An error occurred while updating candidate status.", {
        variant: "error",
      });
    }
  };

  // ✅ Open Confirmation Modal
  const handleOpenApprovalModal = () => {
    const isApproved = candidates.find(
      (c) => c.candidateId === selectedCandidateId
    )?.result;
    setApprovalText(isApproved ? "declined approval for" : "hire");
    setApprovalAction(() => handleApproval);
    setIsApprovalModalOpen(true);
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
      const response = await fetch(
        "http://localhost:5000/api/candPerformance/getPerformanceData",
        {
          method: "POST", // 🔹 Use POST for security
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId }),
          credentials: "include", // Ensures authentication
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch performance data.");

      // ✅ Store fetched data in state
      setPreviousCandidatePerformance((prev) => ({
        ...prev,
        [candidateId]: data.performanceRecords, // Ensure backend returns `performanceRecords`
      }));
    } catch (error) {
      return;
    }
  };

  // Email
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [deadline, setDeadline] = useState("");
  const [documents, setDocuments] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [filteredOptions, setFilteredOptions] = useState([]);
  const quillRef = useRef(null);

  const allPlaceholders = [
    "[[CandidateName]]",
    "[[JobTitle]]",
    "[[CompanyName]]",
    "[[OfficeAddress]]",
    "[[YourName]]",
    "[[YourPosition]]",
    "[[CompanyEmail]]",
    "[[JobConfirmationLink]]",
    "[[DeadlineDate]]",
    "[[CandidatesSearchID]]",
  ];

  const [placeholders, setPlaceholders] = useState([]);

  // Copy candidates to local state when modal opens
  useEffect(() => {
    if (show) {
      const candidateArray = Array.isArray(candidates) ? candidates : [];
      // Only set localCandidates on modal open if it's not already set
      if (!localCandidates.length) {
        setLocalCandidates(candidateArray.filter((c) => c.selected));
      }

      // Define placeholder mappings from `placeholderData`
      const placeholderMappings = {
        "[[CompanyName]]": placeholderData?.Header?.Name?.trim() || "",
        "[[OfficeAddress]]": placeholderData?.Contact?.address?.trim() || "",
        "[[CompanyEmail]]": placeholderData?.Contact?.email?.trim() || "",
      };

      // Filter out placeholders with missing values
      const filteredPlaceholders = allPlaceholders.filter(
        (tag) =>
          !(tag in placeholderMappings) || placeholderMappings[tag] !== ""
      );
      setPlaceholders(filteredPlaceholders);
    }
  }, [show, placeholderData]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/users/getUserInfoAndExperience"
        );
        setAllUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []); // Runs once on mount

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        quillRef.current &&
        quillRef.current.getEditor &&
        quillRef.current.getEditor().container &&
        !quillRef.current.getEditor().container.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (candidates && candidates.length > 0) {
      const announcementIdFromCandidate = candidates[0]?.announcementId;
      if (!announcementIdFromCandidate) return;

      const fetchAnnouncementAndDepartments = async () => {
        try {
          const [announcementResponse, deptResponse] = await Promise.all([
            axios.post(
              "http://localhost:5000/api/announcements/getAnnouncementInfoById",
              { announcementId: announcementIdFromCandidate }
            ),
            axios.get("http://localhost:5000/api/departments/list"),
          ]);
          setAnnouncementConcluded(announcementResponse.data.concluded);
          setSelectedDepartment(announcementResponse.data.departmentd);
          setDepartments(
            deptResponse.data.map((dept) => ({
              id: dept.departmentid,
              name: dept.departmentName,
            }))
          );
        } catch (error) {
          console.error("Error fetching announcement or departments:", error);
        }
      };
      fetchAnnouncementAndDepartments();
    }

    const fetchAllCandidates = async () => {
      const announcementId = candidates[0]?.announcementId;
      if (!announcementId) return;
      try {
        const response = await axios.post(
          "http://localhost:5000/api/candidates/List",
          { announcementId }
        );
        // Filter the data to only include candidates with selected:true
        const selectedCandidates = response.data.filter(
          (candidate) => candidate.selected
        );
        setAllCandidates(selectedCandidates);
      } catch (error) {
        enqueueSnackbar("Failed to fetch data. Please try again.", {
          variant: "error",
        });
      }
    };

    fetchAllCandidates();
  }, [candidates]);

  const handleFileChange = (e) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "image/png",
      "image/jpeg",
    ];
    const files = Array.from(e.target.files);

    // Filter valid file types
    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    // Prevent duplicates
    const uniqueFiles = validFiles.filter(
      (file) => !documents.some((doc) => doc.file.name === file.name)
    );

    if (uniqueFiles.length === 0) {
      enqueueSnackbar("No valid new files selected.", { variant: "warning" });
      return;
    }

    const filesWithMeta = uniqueFiles.map((file) => ({
      file,
      customName: file.name, // Default to original name
    }));

    setDocuments((prevDocs) => [...prevDocs, ...filesWithMeta]);
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
      enqueueSnackbar("You can upload a maximum of 5 files.", {
        variant: "error",
      });
      return;
    }
    setDocuments([...documents, ...files]);
  };

  const [selectedTemplate, setSelectedTemplate] = useState(""); // ✅ No localStorage

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey); // ✅ Store in state only
    setSubject(templates[templateKey].subject);
    setEmailBody(templates[templateKey].body);
  };

  const handleInputChange = (eventOrContent, setState, field) => {
    // For regular inputs, eventOrContent is an event; for Quill, it’s a string
    const value =
      typeof eventOrContent === "string"
        ? eventOrContent
        : eventOrContent.target.value;
    setState(value);

    if (field === "emailBody" && quillRef.current) {
      const editor = quillRef.current.getEditor();
      const selection = editor.getSelection();
      if (!selection) return;

      const insertionIndex = selection.index;
      const textBeforeCursor = editor.getText(
        Math.max(0, insertionIndex - 2),
        2
      );

      if (textBeforeCursor === "[[") {
        setFilteredOptions(placeholders);
        setShowDropdown(true);

        // Get the local cursor bounds within the editor
        const bounds = editor.getBounds(insertionIndex);

        // Get the absolute position of the Quill container
        // quillRef.current.container is the .ql-container element.
        const containerRect =
          quillRef.current.container.getBoundingClientRect();

        // Calculate absolute page coordinates:
        // Add container's top and left to bounds, and add page scroll offsets.
        const absoluteTop = containerRect.top + bounds.top + window.scrollY;
        const absoluteLeft = containerRect.left + bounds.left + window.scrollX;

        // Optionally add a vertical offset (e.g. 30px) to show the dropdown below the cursor
        setDropdownPosition({
          top: absoluteTop + 30,
          left: absoluteLeft,
        });
      } else {
        setShowDropdown(false);
      }
    }
  };

  const handleSelectPlaceholder = (placeholder) => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (!range) return;

    let insertionIndex = range.index;

    // Check if the last two characters before cursor are "[["
    const textBeforeCursor = editor.getText(Math.max(0, insertionIndex - 2), 2);
    if (textBeforeCursor === "[[") {
      // Use Delta to remove "[[" and insert the placeholder
      const delta = new Delta()
        .retain(insertionIndex - 2) // Keep text before "[["
        .delete(2) // Remove "[["
        .insert(placeholder); // Insert the selected placeholder

      editor.updateContents(delta);
      editor.setSelection(insertionIndex - 2 + placeholder.length); // Move cursor after placeholder
    } else {
      // Just insert normally if "[[" is not detected
      editor.insertText(insertionIndex, placeholder);
      editor.setSelection(insertionIndex + placeholder.length);
    }

    setShowDropdown(false); // ✅ Ensure dropdown closes after selection

    setTimeout(() => {
      editor.focus(); // ✅ Refocus to avoid any loss of input
    }, 100);
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
    setSelectedTemplate("");
    setSubject("");
    setEmailBody("");
    setDocuments([]); // Clear uploaded files
  };

  const [showSendOptionsModal, setShowSendOptionsModal] = useState(false);
  const [sendOptionChosen, setSendOptionChosen] = useState(null); // "sendAll", "sendNew"
  
  const handleSendMail = async (sendOption = "sendAll") => {
    setLoading(true);
  
    // ✅ Function to format date as `DD-MM-YYYY`
    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
  
    // ✅ Get all recipients from localCandidates
    let recipients = localCandidates.map(candidate => ({
      candidateId: candidate.candidateId,
      email: candidate.email,
      result: candidate.result, // Added result field for JobOffer filtering
    }));
  
    // ✅ If selectedTemplate is "JobOffer", filter out candidates where result is false
    if (selectedTemplate === "JobOffer") {
      recipients = recipients.filter(recipient => recipient.result === true);
    }
    // ✅ Extract past recipients based on selectedTemplate
    const pastRecipients = localCandidates
    .filter(candidate => candidate.pastEmails?.includes(selectedTemplate))
    .map(candidate => candidate.email);
  
    // ✅ Filter out past recipients if "Send Only New" is selected
    if (sendOption === "sendNew") {
      recipients = recipients.filter(
        recipient => !pastRecipients.includes(recipient.email)
      );
    }
    // Remove extra fields (like `result`) before sending to the backend
    recipients = recipients.map(({ candidateId, email }) => ({ candidateId, email }));

    // ✅ Prevent sending if no new recipients left
    if (recipients.length === 0) {
      enqueueSnackbar("⚠️ No new recipients to send email to.");
      setLoading(false);
      return;
    }
  
    // ✅ Calculate and format deadline (Set default if not provided)
    const deadlineToSend =
      formatDate(deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  
    // ✅ Prepare FormData for file upload
    const formData = new FormData();
    formData.append("subject", subject.trim());
    formData.append("emailBody", emailBody.trim());
    formData.append("recipients", JSON.stringify(recipients));
    formData.append("deadline", deadlineToSend);
    formData.append("selectedTemplate", selectedTemplate.trim());
  
    // ✅ Send `placeholderData` to backend
    formData.append(
      "placeholderData",
      JSON.stringify({
        CompanyName: placeholderData?.Header?.Name?.trim() || "",
        OfficeAddress: placeholderData?.Contact?.address?.trim() || "",
        CompanyEmail: placeholderData?.Contact?.email?.trim() || "",
      })
    );
  
    // ✅ Append files correctly
    documents.forEach(({ file }) => {
      if (file && file.name) {
        formData.append("documents", file, file.name);
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
      setSelectedCandidateId("");
      setSubject("");
      setEmailBody("");
      setDocuments([]);
      setDeadline("");
      setSelectedTemplate("");
  
      enqueueSnackbar("📧 Email sent successfully with attachments!", {
        variant: "success",
      });
    } catch (error) {
      console.error("❌ Error sending email:", error);
      enqueueSnackbar(`❌ Error: ${error.message}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const triggerSendMail = () => {
    console.log("Triggered Send Click");
  
    const wasSentBefore = localCandidates.some(candidate =>
      candidate.pastEmails?.includes(selectedTemplate)
    );
  
    console.log("Was sent before?", wasSentBefore);
  
    if (wasSentBefore) {
      setShowSendOptionsModal(true); // ✅ Show modal if template already sent
    } else {
      handleSendMail("sendAll"); // ✅ Send directly
    }
  };
  
  
  const handleRemoveCandidate = (candidateId) => {
    setLocalCandidates((prev) =>
      prev.filter((c) => c.candidateId !== candidateId)
    );
  };

  if (!show) return null;
  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButtonTop onClick={onClose}>&times;</CloseButtonTop>
        <TabsContainer>
          {[
            "Check List",
            "Manage Evaluator",
            ...(announcementConcluded ? ["Candidate Performance"] : []),
            "Send Email",
            ...(announcementConcluded ? ["Add as User"] : []),
          ].map((tab) => (
            <Tab
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
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
                    <span>Hire</span>
                    <span>Action</span>
                  </CandidateHeader>
                  {localCandidates.map((candidate) => (
                    <CandidateItem key={candidate.candidateId}>
                      <span>{candidate.candidateId || "N/A"}</span>
                      <span>{`${candidate.firstName || ""} ${
                        candidate.surName || ""
                      }`}</span>
                      <span>{candidate.email || "N/A"}</span>
                      <span className="fw-semibold text-dark">
                        {candidate.result ? "Yes" : "No"}
                      </span>
                      <RemoveButton
                        onClick={() =>
                          handleRemoveCandidate(candidate.candidateId)
                        }
                      >
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

              <div className="mt-2">
                {Object.keys(templates)
                  .filter((key) => key !== "JobOffer" || announcementConcluded)
                  .map((key) => (
                    <label
                      key={key}
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "bold",
                        letterSpacing: "1px",
                        padding: "8px 0",
                        cursor: "pointer",
                        marginLeft: "2rem",
                      }}
                    >
                      <input
                        type="radio"
                        name="emailTemplate"
                        checked={selectedTemplate === key} // ✅ Keeps selection in the same session
                        onChange={() => handleTemplateSelect(key)}
                        style={{ marginRight: "10px" }}
                      />
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                  ))}
              </div>

              <Input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => handleInputChange(e, setSubject, "subject")} // ✅ Pass event correctly
              />

              <div className="mb-5 pb-4" style={{ position: "relative" }}>
                <ReactQuill
                  ref={quillRef}
                  value={emailBody}
                  placeholder="Use [[..]] for special functions..."
                  modules={modules}
                  style={{ height: "15rem" }}
                  onChange={(content) => {
                    // Update the state with the HTML content.
                    setEmailBody(content);
                    // Use the editor's plain text for placeholder detection.
                    if (quillRef.current) {
                      const editor = quillRef.current.getEditor();
                      const plainText = editor.getText(); // plain text version
                      const selection = editor.getSelection();
                      let selectionStart = plainText.length;
                      if (selection) {
                        selectionStart = selection.index;
                      }
                      const textBeforeCursor = plainText.substring(
                        0,
                        selectionStart
                      );
                      if (textBeforeCursor.endsWith("[[")) {
                        setFilteredOptions(placeholders);
                        setShowDropdown(true);
                        // Set a default dropdown position; adjust as needed.
                        setDropdownPosition({ top: 100, left: 50 });
                      } else {
                        setShowDropdown(false);
                      }
                    }
                  }}
                />
                {showDropdown && (
                  <ul
                    style={{
                      position: "absolute",
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      background: "white",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      padding: "8px",
                      zIndex: 9999, // Make sure it's on top
                    }}
                  >
                    {filteredOptions.map((option) => (
                      <li
                        key={option}
                        style={{ padding: "8px", cursor: "pointer" }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectPlaceholder(option);
                        }}
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
                  name="documents"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <p>
                  {dragging
                    ? "Drop files here"
                    : "Click or Drag files here (Max 5)"}
                </p>
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
                    <span>{file.customName || file.name}</span>
                    <RemoveFileButton onClick={() => removeFile(index)}>
                      Remove
                    </RemoveFileButton>
                  </FileItem>
                ))}
              </FileList>
              {/* 🟢 Show Deadline Date Input Only for JobOffer */}
              {selectedTemplate === "JobOffer" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Set Deadline:
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                    className="form-control"
                    style={{
                      flex: "1",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                </div>
              )}
              {loading ? (
                <Loader />
              ) : (
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "60px" }}
                >
                  <ClearButton onClick={handleClear}>Clear</ClearButton>
                  <SendMailButton
                    onClick={triggerSendMail}
                    disabled={!subject || !emailBody || (selectedTemplate === "JobOffer" && !deadline)}
                  >
                    Send
                  </SendMailButton>
                  {showSendOptionsModal && (
  <div style={{
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  }}>
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "28px",
      maxWidth: "450px",
      width: "90%",
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
      textAlign: "center"
    }}>
      <h2 style={{ marginBottom: "10px", fontSize: "22px", color: "#333"}}><b>Email Already Sent</b></h2>
      <p style={{ marginBottom: "20px", fontSize: "16px", color: "#555" }}>
        This template has already been sent. What would you like to do?
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <button
          onClick={() => setShowSendOptionsModal(false)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "#d32f2f", // Red
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={() => {
            setShowSendOptionsModal(false);
            handleSendMail("sendNew");
          }}
          style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "#1976d2", // Blue
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Send Only to New Recipients
        </button>
        
        <button
          onClick={() => {
            setShowSendOptionsModal(false);
            handleSendMail("sendAll");
          }}
          style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5", // White
            color: "#333",
            border: "1px solid #ccc",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Send to Everyone Again
        </button>
      </div>
    </div>
  </div>
)}

                </div>
              )}
            </div>
          )}
          {activeTab === "Manage Evaluator" && (
            <div>
              {/* Centered Title */}
              <div className="text-center mb-3">
                <Heading>MANAGE EVALUATOR</Heading>
                <hr id="title-line" className="mb-4" data-symbol="✈" />
              </div>

              <div className="row align-items-start">
                {/* Assigned Evaluators List */}
                <div className="col-md-5 pe-3 border-4">
                  <div className="pb-4 border-bottom">
                    <h5 className="fw-bold">Select Department:</h5>
                    <select
                      className="form-control"
                      style={{ width: "380px" }}
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <h5
                      className={`fw-bold m-0 mt-4 ${
                        assignedUsers.length >= 5 ? "text-danger" : ""
                      }`}
                    >
                      Assigned Evaluators [{assignedUsers.length}/5]
                    </h5>
                  </div>

                  <ul className="list-group mt-2" style={{ width: "380px" }}>
                    {assignedUsers.length > 0 ? (
                      assignedUsers.map((user) => (
                        <li
                          key={user.userId}
                          className="d-flex justify-content-between align-items-center list-group-item p-2"
                          style={{ fontWeight: "600", color: "#212529" }}
                        >
                          <span>
                            {user.userId}: {user.fullName}
                          </span>
                          {!announcementConcluded && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => removeUserFromDepartment(user)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-muted text-center list-group-item p-2">
                        No assigned users.
                      </li>
                    )}
                  </ul>

                  {!announcementConcluded && (
                    <button
                      className="btn btn-success px-4 mt-4"
                      onClick={handleSaveEvaluators}
                    >
                      Save
                    </button>
                  )}
                </div>

                {/* Available Users Table with Pagination */}
                <div className="col-md-7 ps-3 border-start border-4">
                  <h5 className="fw-bold">Available Users</h5>

                  {/* Search Bar */}
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* User Table */}
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead className="table-dark text-center">
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Experience</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.length > 0 ? (
                          paginatedUsers.map((user) => {
                            const isAssigned = assignedUsers.some(
                              (u) => u.userId === user.userId
                            );
                            return (
                              <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.fullName}</td>
                                <td>
                                  {Math.floor(user.totalExperience)} years
                                </td>
                                <td className="text-center">
                                  <button
                                    className={`btn btn-${
                                      isAssigned ? "secondary" : "success"
                                    } btn-sm`}
                                    onClick={() =>
                                      isAssigned
                                        ? removeUserFromDepartment(user)
                                        : assignUserToDepartment(user)
                                    }
                                  >
                                    <i
                                      className={`fas fa-${
                                        isAssigned ? "check" : "plus"
                                      }`}
                                    ></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted">
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Candidate Performance" && (
            <div>
              <Heading>CANDIDATE PERFORMANCE</Heading>
              <hr id="title-line" className="mb-4" data-symbol="✈" />
              <div className="d-flex align-items-center gap-3 mb-4">
                <label className="form-label">Select Candidate:</label>
                <select
                  className="form-control w-100"
                  value={selectedCandidateId}
                  onChange={handleCandidateSelect}
                  style={{ height: "42px" }}
                >
                  <option value="">-- Select Candidate --</option>
                  {localCandidates
                    .slice() // Create a copy to avoid mutating the state
                    .sort(
                      (a, b) =>
                        (b.candidatePerformance || 0) -
                        (a.candidatePerformance || 0)
                    ) // Sort descending
                    .map((candidate) => (
                      <option
                        key={candidate.candidateId}
                        value={candidate.candidateId}
                      >
                        {`${candidate.candidateId} : ${candidate.firstName} ${candidate.surName}`}
                        {candidate.result ? " ✅" : ""}
                        {candidate.candidatePerformance !== undefined
                          ? ` (${candidate.candidatePerformance}%)`
                          : ""}
                      </option>
                    ))}
                </select>
                <button
                  className={`btn ${
                    selectedCandidateId &&
                    localCandidates.find(
                      (c) => c.candidateId === selectedCandidateId
                    )?.result
                      ? "btn-danger"
                      : "btn-primary"
                  } px-4`}
                  style={{ height: "42px", minWidth: "120px" }}
                  onClick={handleOpenApprovalModal}
                  disabled={!selectedCandidateId}
                >
                  {selectedCandidateId &&
                  localCandidates.find(
                    (c) => c.candidateId === selectedCandidateId
                  )?.result
                    ? "Declined "
                    : "Hire"}
                </button>
              </div>

              {/* When no candidate is selected, show graph options */}
              {!selectedCandidateId && (
                <div>
                  <div
                    className="graph-toggle"
                    style={{ marginBottom: "20px" }}
                  >
                    <button
                      className={`btn ${
                        graphView === "all" ? "btn-primary" : "btn-secondary"
                      } me-2`}
                      onClick={() =>
                        setGraphView(graphView === "all" ? "checked" : "all")
                      }
                    >
                      {graphView === "all"
                        ? "Only Checked Candidates"
                        : "All Candidates"}
                    </button>
                  </div>
                  {graphView === "all" && (
                    <BellCurveChart
                      candidates={allCandidates}
                      title="All Candidates Performance Distribution"
                    />
                  )}
                  {graphView === "checked" && (
                    <BellCurveChart
                      candidates={localCandidates}
                      title="Checked Candidates Performance Distribution"
                    />
                  )}
                </div>
              )}
              {/* When a candidate is selected, you can show that candidate’s detailed performance records */}
              {selectedCandidateId && (
                <div>
                  <ApprovalModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    onConfirm={approvalAction}
                    actionText={approvalText}
                  />
                  <div className="mt-5 p-3 border rounded bg-light shadow-sm record-container">
                    <h4 className="text-dark fw-bold mb-3 d-flex align-items-center">
                      <FaHistory className="me-2 text-secondary" size={20} />{" "}
                      Previous Performance Records
                    </h4>
                    {previousPerformanceData[selectedCandidateId]?.length >
                    0 ? (
                      <div className="d-flex flex-column gap-2">
                        {previousPerformanceData[selectedCandidateId]
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          )
                          .map((record, index) => (
                            <div
                              className="card p-3 shadow-sm border rounded bg-white"
                              key={index}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="card-title text-dark fw-bold m-0">
                                  <FaFileAlt
                                    className="me-2 text-secondary"
                                    size={16}
                                  />{" "}
                                  {record.recordName.toUpperCase()}
                                </h5>
                                <span className="text-muted fs-6">
                                  <FaCalendarAlt
                                    className="me-1 text-secondary"
                                    size={14}
                                  />{" "}
                                  {new Date(record.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <hr className="my-2" />
                              <div className="mb-1">
                                <p className="mb-1 fs-5 d-flex align-items-center">
                                  <strong className="text-primary d-flex align-items-center">
                                    <FaChartBar
                                      className="me-2 text-primary"
                                      size={18}
                                    />{" "}
                                    Assessment:
                                  </strong>
                                  <span className="fw-semibold ms-2 text-dark">
                                    {record.candidateAssessment} [
                                    {record.averageScore}%]
                                  </span>
                                </p>
                              </div>
                              <div className="mb-2">
                                <p className="mb-1 fs-5 d-flex align-items-center">
                                  <strong className="text-muted d-flex align-items-center">
                                    <FaCommentDots
                                      className="me-2 text-muted"
                                      size={18}
                                    />{" "}
                                    Remarks:
                                  </strong>
                                  <span className="fw-semibold ms-2 text-dark">
                                    {record.remarks}
                                  </span>
                                </p>
                              </div>
                              <div className="mt-2">
                                <h5 className="text-dark fw-bold d-flex align-items-center">
                                  <FaTasks
                                    className="me-2 text-secondary"
                                    size={16}
                                  />{" "}
                                  EVALUATION CRITERIA
                                </h5>
                                <ul className="list-group list-group-flush mt-1 criteria-list">
                                  {record.criteria.map((crit, idx) => (
                                    <li
                                      key={idx}
                                      className="list-group-item d-flex justify-content-between align-items-center px-3 py-2 bg-light border rounded shadow-sm"
                                    >
                                      <span className="fs-6 fw-semibold d-flex align-items-center text-dark">
                                        <FaCheckCircle
                                          className="me-2 text-success"
                                          size={18}
                                        />{" "}
                                        {crit.type}
                                      </span>
                                      <span className="badge bg-secondary rounded-pill fs-6 px-3 py-1">
                                        {crit.score}/100
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center fs-5 fw-bold mt-3">
                        <FaExclamationCircle
                          className="me-2 text-danger"
                          size={18}
                        />{" "}
                        No data available for candidate
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "Add as User" && (
            <div>
              <Heading>ADD AS USER</Heading>
              <hr id="title-line" className="mb-4" data-symbol="✈" />
              {/* ✅ Select Candidate */}
              <div className="form-group full-width">
                <label className="form-label">Select Candidate:</label>
                <select
                  className="form-control"
                  value={selectedNewCandidateId}
                  onChange={handleNewCandidateSelect}
                >
                  <option value="">-- Choose New Candidate --</option>
                  {localCandidates
                    .filter((candidate) => candidate.result && candidate.confirmationStatus === "Accepted") // Add condition for confirmationStatus
                    .map((candidate) => (
                      <option
                        key={candidate.candidateId}
                        value={candidate.candidateId}
                      >
                        {candidate.candidateId +
                          " \u00A0:\u00A0\u00A0 " +
                          candidate.firstName +
                          " " +
                          candidate.surName}
                      </option>
                    ))}
                </select>

              </div>

              {/* ✅ Pass Updated Selected Candidate to Form */}
              <AddUserForm
                selectedNewCandidateId={selectedNewCandidateId}
                handleAddUser={() =>
                  console.log("User added:", selectedNewCandidateId)
                }
              />
            </div>
          )}
        </ContentContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

const modalBtnStyle = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: "#1976d2",
  color: "#fff",
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const templates = {
  JobOffer: {
    subject: "Job Offer for [[JobTitle]] - [[CompanyName]]",
    body: `
      <p>Hello [[CandidateName]],</p>
      <br>
      <p>We are pleased to offer you the position of <strong>[[JobTitle]]</strong> at <strong>[[CompanyName]]</strong>. After reviewing your experience and skills, we believe you would be an excellent fit for our team.</p>
      <br>
      <p><strong>Offer Details:</strong></p>
      <ul>
        <li><strong>Position:</strong> [[JobTitle]]</li>
        <li><strong>Department:</strong> [DepartmentName]</li>
        <li><strong>Start Date:</strong> [StartDate]</li>
        <li><strong>Compensation:</strong> [SalaryDetails]</li>
        <li><strong>Benefits:</strong> [BenefitsDetails]</li>
      </ul>
      <br>
      <p>Please find your official offer letter attached. Kindly review it and confirm your acceptance by <strong>[[DeadlineDate]]</strong>. To accept the offer, please click the link below: <strong>[[JobConfirmationLink]]</strong></p>
      <p>Search ID: <strong> [[CandidatesSearchID]] </strong></p>
      <br>
      <p>If you have any questions, feel free to reach out. We look forward to welcoming you to our team.</p>
      <br>
      <p>Best regards,</p>
      <p>[[YourName]]<br>
      [[YourPosition]]<br>
      [[CompanyEmail]]</p>
    `,
  },
  InterviewInvitation: {
    subject: "Interview Invitation - [[CompanyName]]",
    body: `
      <p>Hello [[CandidateName]],</p>
      <br>
      <p>We are pleased to invite you for an interview for the <strong>[[JobTitle]]</strong> position at <strong>[[CompanyName]]</strong>. We were impressed with your application and look forward to learning more about you.</p>
      <br>
      <p><strong>Interview Details:</strong></p>
      <ul>
        <li><strong>Date:</strong> [InsertDate]</li>
        <li><strong>Time:</strong> [InsertTime]</li>
        <li><strong>Location:</strong> [[OfficeAddress]] / [VideoCallLink]</li>
        <li><strong>Additional Information:</strong> [AdditionalDetails]</li>
      </ul>
      <br>
      <p>Please confirm your availability by replying to this email at your earliest convenience. We look forward to speaking with you.</p>
      <br>
      <p>Best regards,</p>
      <p>[[YourName]]<br>
      [[YourPosition]]<br>
      [[CompanyEmail]]</p>
    `,
  },
  RejectionLetter: {
    subject: "Application Update - [[CompanyName]]",
    body: `
      <p>Hello [[CandidateName]],</p>
      <br>
      <p>Thank you for your interest in the <strong>[[JobTitle]]</strong> position at <strong>[[CompanyName]]</strong>. We appreciate the time and effort you put into the application and interview process. After careful consideration, we have decided to move forward with another candidate. This decision was difficult, as we received applications from many talented professionals.</p>
      <br>
      <p>We sincerely appreciate your interest in [[CompanyName]] and encourage you to apply for future opportunities that align with your skills.</p>
      <br>
      <p>We wish you the best in your job search and career endeavors.</p>
      <br>
      <p>Best regards,</p>
      <p>[[YourName]]<br>
      [[YourPosition]]<br>
      [[CompanyEmail]]</p>
    `,
  },
  FollowUpAfterInterview: {
    subject: "Thank You for Interviewing with [[CompanyName]]",
    body: `
      <p>Hello [[CandidateName]],</p>
      <br>
      <p>Thank you for taking the time to interview for the <strong>[[JobTitle]]</strong> position at <strong>[[CompanyName]]</strong>. It was a pleasure learning more about your experience and skills.</p>
      <br>
      <p>We are currently reviewing all candidates and will provide an update as soon as possible. If you have any questions in the meantime, please do not hesitate to reach out.</p>
      <br>
      <p>We appreciate your interest in [[CompanyName]] and look forward to staying in touch.</p>
      <br>
      <p>Best regards,</p>
      <p>[[YourName]]<br>
      [[YourPosition]]<br>
      [[CompanyEmail]]</p>
    `,
  },
  Others: {
    subject: "Message from [[CompanyName]]",
    body: `
      <p>Hello [[CandidateName]],</p>
      <br>
      <p>I hope this email finds you well.</p>
      <br>
      <p>[Insert your message here.]</p>
      <br>
      <p>Best regards,</p>
      <p>[[YourName]]<br>
      [[YourPosition]]<br>
      [[CompanyEmail]]</p>
    `,
  },
};

export default OptionModal;
