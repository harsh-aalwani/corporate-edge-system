import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; 
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack"; // ✅ Import Snackbar
import Checkbox from "./Checkbox";
import { generatePDF } from "./resumeGenerator";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import { useNavigate } from "react-router-dom"; 
import OptionModal from "./OptionModal";

const CandidateList = () => {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // ✅ Use Snackbar
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: "candidateId", direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [showSelected, setShowSelected] = useState(false)
  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default: Show 5 candidates per page
  const [lineVisible, setLineVisible] = useState(false);
  const [showOptionModal, setOptionModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/candidates/List", {
          announcementId,
        });
        setCandidates(response.data);
      } catch (error) {
        enqueueSnackbar("Failed to fetch candidates. Please try again.", { variant: "error" });
      }
    };
    fetchCandidates();
  }, [announcementId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOptionClick = () => {
    const selectedCandidates = candidates.filter(
      (candidate) => checkedRows.includes(candidate.candidateId) // ✅ Ensure only checked ones are included
    );
    
    console.log("Checked Rows:", checkedRows); // Debugging
    console.log("Selected Candidates:", selectedCandidates); // Debugging
  
    setSelectedCandidate(selectedCandidates);
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

  const handleDownloadSelected = () => {
    const selectedCandidates = candidates.filter((candidate) =>
      checkedRows.includes(candidate.candidateId)
    );
    selectedCandidates.forEach((candidate) => {
      generatePDF(candidate);
    });
  };

  const handleSelectCandidates = async () => {
    try {
      const newSelectedState = !showSelected; // Toggle selection state
  
      await axios.put("http://localhost:5000/api/candidates/select", {
        candidateIds: checkedRows,
        selected: newSelectedState, // Send the new state to backend
      });
  
      setCandidates((prevCandidates) =>
        prevCandidates.map((candidate) =>
          checkedRows.includes(candidate.candidateId)
            ? { ...candidate, selected: newSelectedState } // Toggle selected state
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
  

  // ✅ Sorting Function
  const handleSort = (key) => {
    let direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    const key = sortConfig.key;
    let valueA = a[key];
    let valueB = b[key];

    if (key === "candidateEvaluation") {
      valueA = valueA ? parseFloat(valueA) : 0;
      valueB = valueB ? parseFloat(valueB) : 0;
    }

    if (valueA == null) return 1;
    if (valueB == null) return -1;

    return typeof valueA === "number"
      ? sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA
      : sortConfig.direction === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  const filteredCandidates = sortedCandidates.filter((candidate) => {
    // Ensure filtering by selection state
    if (showSelected && !candidate.selected) return false;
    if (!showSelected && candidate.selected) return false;
  
    // Search query filtering
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
          <Checkbox
            checked={showSelected}
            onChange={() => {
              setShowSelected((prev) => !prev);
              setLineVisible((prev) => !prev);
              setCheckedRows([]); // ✅ Clear selected checkboxes when toggling selection filter
              setCheckAll(false); // ✅ Ensure "Select All" is also unchecked
            }}
          />
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
              <th onClick={() => handleSort("candidateId")}>Candidate ID {getSortIcon("candidateId")}</th>
              <th onClick={() => handleSort("firstName")}>Name {getSortIcon("firstName")}</th>
              <th onClick={() => handleSort("email")}>Email {getSortIcon("email")}</th>
              <th onClick={() => handleSort("phone")}>Phone {getSortIcon("phone")}</th>
              <th onClick={() => handleSort("candidateEvaluation")}>Score (%) {getSortIcon("candidateEvaluation")}</th>
              <th>Resume</th>
              <th><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((candidate) => (
              <tr key={candidate.candidateId} className={checkedRows.includes(candidate.candidateId) ? "active" : ""}>
                <td>{candidate.candidateId}</td>
                <td>{`${candidate.firstName} ${candidate.surName}`}</td>
                <td>{candidate.email}</td>
                <td>{candidate.phone}</td>
                <td>{candidate.candidateEvaluation ? `${candidate.candidateEvaluation}%` : "N/A"}</td>
                <td><button className="btn btn-success btn-sm" onClick={() => generatePDF(candidate)}>Download</button></td>
                <td><input type="checkbox" checked={checkedRows.includes(candidate.candidateId)} onChange={(e) => handleRowCheck(e, candidate.candidateId)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls - Centered */}
      <div className="d-flex flex-column align-items-center mt-3">
        <div className="d-flex justify-content-center">
          <button className="btn btn-outline-secondary me-2" onClick={prevPage} disabled={currentPage === 1}>
            ◀ Previous
          </button>
          <button className="btn btn-outline-secondary" onClick={nextPage} disabled={currentPage === totalPages}>
            Next ▶
          </button>
        </div>

        {/* Items per page dropdown */}
        <div className="mt-2">
          <span>Show: </span>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select> Candidates per page
        </div>
      </div>
      {/* Go Back Button */}
      <div className="d-flex justify-content-start mb-1">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>

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
          candidates={selectedCandidate || []} // ✅ Ensure it's always an array
          onClose={() => setOptionModal(false)}
        />
      )}
    </div>
  );
  
};

export default CandidateList;
