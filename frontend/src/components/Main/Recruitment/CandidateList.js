import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; 
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack"; // ✅ Import Snackbar
import Checkbox from "./Checkbox";
import { generatePDF } from "./resumeGenerator";
import { generateReport } from "./generateReport";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import { useNavigate } from "react-router-dom"; 
import OptionModal from "./OptionModal";
import ConcludeModal from "./ConcludeModal";
const CandidateList = () => {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // ✅ Use Snackbar
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "candidateId", direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [showSelected, setShowSelected] = useState(false)
  // ✅ Pagination State
  const [pinnedCandidates, setPinnedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default: Show 5 candidates per page
  const [lineVisible, setLineVisible] = useState(false);
  const [showOptionModal, setOptionModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionText, setActionText] = useState("");
  const [modalDefaultTab, setModalDefaultTab] = useState("Check List");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesResponse, announcementResponse] = await Promise.all([
          axios.post("http://localhost:5000/api/candidates/List", { announcementId }),
          axios.post("http://localhost:5000/api/announcements/getAnnouncementInfoById", { announcementId })
        ]);
        setCandidates(candidatesResponse.data);
        setAnnouncement(announcementResponse.data);
      } catch (error) {
        enqueueSnackbar("Failed to fetch data. Please try again.", { variant: "error" });
      }
    };
    fetchData();
  }, [announcementId]);


  useEffect(() => {
    if (announcement?.concluded) {
      setShowSelected(true); // ✅ Ensure "Show Selected" is enabled when concluded
    }
  }, [announcement?.concluded]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await confirmAction();  // ✅ Execute the stored function
    }
    setIsConfirmModalOpen(false); // ✅ Close modal after execution
  };
  
  
  const handleConclude = () => {
    setActionText("conclude this announcement");
    setConfirmAction(() => async () => {  // ✅ Wrap in function so it executes later
      try {
        await axios.put(`http://localhost:5000/api/announcements/conclude/${announcement.announcementId}`);
        setAnnouncement((prev) => ({ ...prev, concluded: true }));
        enqueueSnackbar("Announcement concluded successfully!", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("Failed to conclude announcement.", { variant: "error" });
      }
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleReopen = () => {
    setActionText("reopen this announcement");
    setConfirmAction(() => async () => {  // ✅ Wrap in function so it executes later
      try {
        await axios.put(`http://localhost:5000/api/announcements/reopen/${announcement.announcementId}`);
        setAnnouncement((prev) => ({ ...prev, concluded: false }));
        enqueueSnackbar("Announcement reopened successfully!", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("Failed to reopen announcement.", { variant: "error" });
      }
    });
    setIsConfirmModalOpen(true);
  };
  
  const handleOptionClick = () => {
    const selectedCandidates = candidates.filter(
      (candidate) => checkedRows.includes(candidate.candidateId) // ✅ Ensure only checked ones are included
    );
  
    setSelectedCandidate(selectedCandidates);
    setModalDefaultTab("Check List");
    setOptionModal(true);
  };
  
  
  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
  
    const visibleCandidateIds = currentCandidates.map((c) => c.candidateId);
  
    setCheckedRows((prev) =>
      isChecked
        ? [...prev, ...visibleCandidateIds.filter((id) => !prev.includes(id))] // Add only visible candidates
        : prev.filter((id) => !visibleCandidateIds.includes(id)) // Remove only visible candidates
    );
  };
  
  const handleRowCheck = (e, candidateId) => {
    setCheckedRows((prev) =>
      e.target.checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleDownloadSelected = async () => {
    const selectedCandidates = candidates.filter((candidate) =>
      checkedRows.includes(candidate.candidateId)
    );

    for (const candidate of selectedCandidates) {
        await generatePDF(candidate);  // Ensures each PDF is generated before moving to the next
    }
  };

  const handleDownloadReport = () => {
    if (!announcement) {
      console.error("❌ Error: Announcement data is missing.");
      return;
    }
  
    const recruitedCandidates = candidates.filter(candidate => candidate.recruited === true);
    
    if (recruitedCandidates.length === 0) {
      console.warn("⚠ No recruited candidates found.");
      return;
    }
  
    generateReport(announcement, recruitedCandidates); // ✅ Pass only recruited candidates
  };
  
  const handleSelectCandidates = async () => {
    try {
      const newSelectedState = !showSelected; // ✅ Toggle selection state
  
      // ✅ Prepare the candidate update payload
      const updatePayload = {
        candidateIds: checkedRows,
        selected: newSelectedState,
      };
  
      // ✅ If deselecting, explicitly set result to false
      if (!newSelectedState) {
        updatePayload.removeResult = true; // Backend should handle setting `result: false`
      }
  
      // ✅ Send update to backend
      await axios.put("http://localhost:5000/api/candidates/select", updatePayload);
  
      // ✅ Update candidates in frontend
      setCandidates((prevCandidates) =>
        prevCandidates.map((candidate) =>
          checkedRows.includes(candidate.candidateId)
            ? {
                ...candidate,
                selected: newSelectedState,
                result: newSelectedState ? candidate.result : false, // ✅ Set result to false when deselecting
              }
            : candidate
        )
      );
  
      setCheckedRows([]); // ✅ Clear selection
      setCheckAll(false); // ✅ Uncheck "Select All"
      setShowModal(false);
  
      enqueueSnackbar(
        newSelectedState ? "Candidates selected successfully!" : "Candidates deselected successfully!",
        { variant: "success" }
      );
    } catch (error) {
      console.error("Error updating candidates:", error.message);
    }
  };

  const handlePinToggle = (candidateId) => {
    console.log("Clicked on candidate:", candidateId); // ✅ Debugging log
  
    setPinnedCandidates((prevPinned) =>
      prevPinned.includes(candidateId)
        ? prevPinned.filter((id) => id !== candidateId)
        : [...prevPinned, candidateId]
    );
  };
  
  // ✅ Sorting Function
  const handleSort = (key) => {
    let direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const isPinnedA = pinnedCandidates.includes(a.candidateId);
    const isPinnedB = pinnedCandidates.includes(b.candidateId);

    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;

    const key = sortConfig.key;
    let valueA = a[key];
    let valueB = b[key];

    if (key === "result") {
      return sortConfig.direction === "asc"
        ? Number(valueA) - Number(valueB)
        : Number(valueB) - Number(valueA);
    }

    if (key === "candidateEvaluation") {
      valueA = valueA ? parseFloat(valueA) : 0;
      valueB = valueB ? parseFloat(valueB) : 0;
    }

    if (valueA == null) return 1;
    if (valueB == null) return -1;

    return typeof valueA === "number"
      ? sortConfig.direction === "asc"
        ? valueA - valueB
        : valueB - valueA
      : sortConfig.direction === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  const filteredCandidates = sortedCandidates.filter((candidate) => {
    // ✅ Show only selected candidates when showSelected is true
    // ✅ Show only unselected candidates when showSelected is false
    if (showSelected && !candidate.selected) return false;
    if (!showSelected && candidate.selected) return false;
  
    // ✅ Apply search query filtering
    const query = searchQuery.toLowerCase();
    return (
      candidate.candidateId.toLowerCase().includes(query) ||
      candidate.firstName.toLowerCase().includes(query) ||
      candidate.surName.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.phone.toLowerCase().includes(query)
    );
  });
  

  // ✅ Pagination Logic
  const indexOfLastCandidate = currentPage * itemsPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  // ✅ Sorting Icon Function
  const getSortIcon = (key) => sortConfig.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center justify-content-between pt-2 pb-4">
        <div className="d-flex align-items-center">
          <h4 className="fw-bold mb-0 me-3">Candidate List</h4>
          {announcement?.concluded ? (
            <Checkbox checked={true} disabled /> // ✅ Always checked & disabled when concluded
          ) : (
            <Checkbox
              checked={announcement?.concluded || showSelected} // ✅ Always checked when concluded
              onChange={() => {
                if (!announcement?.concluded) { // ✅ Only allow toggling when not concluded
                  setShowSelected((prev) => !prev);
                  setLineVisible((prev) => !prev);
                  setCheckedRows([]);
                  setCheckAll(false);
                }
              }}
              disabled={announcement?.concluded} // ✅ Disable when concluded
            />

          )}

        </div>
        <div className="ms-md-auto py-2 py-md-0">
        {showSelected && (
            <button 
              className="btn btn-label-info btn-round me-2"
              disabled={checkedRows.length === 0}
              onClick={() => handleOptionClick(candidates.find(candidate => checkedRows.includes(candidate.candidateId)))}
            >
              Options
            </button>
          )}
          <button className="btn btn-primary btn-round me-2" onClick={() => setShowModal(true)} disabled={checkedRows.length === 0}>
            {showSelected ? "Deselect Candidates" : "Select Candidates"}
          </button>
          <button className="btn btn-dark btn-round" onClick={handleDownloadSelected} disabled={checkedRows.length === 0}>
            Download Resumes
          </button>
        </div>
      </div>
        {/* 🔍 Search Bar */}
        <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by ID, Name, Email, or Mobile..."
          className="form-control"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Animated Line */}
      <motion.div className="animated-line" initial={{ width: 0 }} animate={{ width: lineVisible ? "100%" : 0 }} exit={{ width: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }} />

      {/* Table */}
      <div className="table-responsive">
        <table className="table custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("candidateId")}>ID {getSortIcon("candidateId")}</th>
              <th onClick={() => handleSort("firstName")}>Name {getSortIcon("firstName")}</th>
              <th onClick={() => handleSort("email")}>Email {getSortIcon("email")}</th>
              <th onClick={() => handleSort("phone")}>Phone {getSortIcon("phone")}</th>
              <th onClick={() => handleSort("candidateEvaluation")}>Score{getSortIcon("candidateEvaluation")}</th>
              {(showSelected && announcement.concluded) && <th onClick={() => handleSort("candidatePerformance")}>Performance {getSortIcon("candidatePerformance")}</th>} 
              {(showSelected && announcement.concluded)&& <th onClick={() => handleSort("result")}>
                Hire {getSortIcon("result")}
              </th>} {/* ✅ Hide column when showSelected is false */}
              <th>Resume</th>
              <th><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>
            </tr>
          </thead>

          <tbody>
            {currentCandidates.length > 0 ? (
              currentCandidates.map((candidate) => (
                <tr key={candidate.candidateId} className={checkedRows.includes(candidate.candidateId) ? "active" : ""}>
                  <td
                    className={`pinned-candidate ${pinnedCandidates.includes(candidate.candidateId) ? "pinned" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents parent interference
                      handlePinToggle(candidate.candidateId);
                    }}
                  >
                    {candidate.candidateId} {pinnedCandidates.includes(candidate.candidateId) && <span className="pin-icon">📌</span>}
                  </td>

                  <td>{`${candidate.firstName} ${candidate.surName}`}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.candidateEvaluation ? `${candidate.candidateEvaluation}%` : "N/A"}</td>
                  {/* ✅ Show Performance Score Only When `showSelected` is Enabled */}
                  {(showSelected && announcement.concluded) && (
                    <td 
                      className="text-primary cursor-pointer fw-bold"
                      onClick={(e) => {
                        // Optionally, if you need to set the candidate details, do so:
                        setSelectedCandidate(candidate); 
                        // Set the default tab to "Candidate Performance" when this cell is clicked:
                        setModalDefaultTab("Candidate Performance");
                        // Open the OptionModal
                        setOptionModal(true);
                      }}
                    >
                      {candidate.candidatePerformance ? `${candidate.candidatePerformance}%` : "N/A"}
                    </td>
                  )}
                  {(showSelected && announcement.concluded) && (
                    <td className={candidate.result ? "text-success fw-bold" : "text-danger fw-bold"}>
                      {candidate.result ? "Yes" : "No"}
                    </td>
                  )} {/* ✅ Hide row content when showSelected is false */}
                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => generatePDF(candidate)}>Download</button>
                  </td>
                  <td>
                    <input type="checkbox" checked={checkedRows.includes(candidate.candidateId)} onChange={(e) => handleRowCheck(e, candidate.candidateId)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Centered */}
      <div className="d-flex flex-column align-items-center mt-3">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-secondary me-2 px-3 py-2 rounded-pill" 
            onClick={prevPage} 
            disabled={currentPage === 1}
          >
            &larr; Previous
          </button>

          <span className="fw-bold mx-3">Page {currentPage} of {totalPages}</span>

          <button 
            className="btn btn-secondary px-3 py-2 rounded-pill" 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
          >
            Next &rarr;
          </button>
        </div>

        {/* Items per page dropdown */}
        <div className="mt-2">
          <span>Show: </span>
          <select value={itemsPerPage} className="rounded" onChange={(e) => setItemsPerPage(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select> Candidates per page
        </div>
      </div>
    {/* Go Back & Conclude/Reopen Button */}
    <div className="d-flex justify-content-between align-items-center mt-4">
      <button className="btn btn-primary" onClick={() => navigate(-1)}>← Go Back</button>

      {announcement && announcement.concluded ? (
        <div className="d-flex gap-2"> 
          {/* <button 
            className="btn btn-success px-4" 
            onClick={handleDownloadReport} // ✅ No need to pass parameters manually
          >
            📄 Download Report
          </button> */}
          <button className="btn btn-dark px-4" onClick={handleReopen}>
            Reopen
          </button>
        </div>
      ) : (
        <button className="btn btn-danger px-4" onClick={handleConclude}>
          Conclude
        </button>
      )}
    </div>


    <ConcludeModal
      isOpen={isConfirmModalOpen}
      onClose={() => setIsConfirmModalOpen(false)}
      onConfirm={handleConfirmAction} // ✅ Executes and closes modal
      actionText={actionText}
    />

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Confirm Selection</h5>
            <p>Are you sure you want to {showSelected ? "deselect" : "select"} the chosen candidates?</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleSelectCandidates}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showOptionModal && (
        <OptionModal
          show={showOptionModal}
          // Ensure it's always an array. If selectedCandidate is an object, wrap it in an array.
          candidates={Array.isArray(selectedCandidate) ? selectedCandidate : selectedCandidate ? [selectedCandidate] : []}
          setCandidates={setCandidates}
          onClose={() => setOptionModal(false)}
          defaultTab={modalDefaultTab}
        />

      )}
    </div>
  );
  
};

export default CandidateList;
