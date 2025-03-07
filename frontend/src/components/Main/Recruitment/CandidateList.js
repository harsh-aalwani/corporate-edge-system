import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { generatePDF } from "./resumeGenerator"; // ✅ Import the function
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";

const CandidateList = () => {
  const { announcementId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/candidates/List", {
          announcementId,
        });
        console.log("Candidates:",typeof response.data.candidatePicture);
        setCandidates(response.data);
      } catch (error) {
        console.error("Error fetching candidates:", error.message);
      }
    };

    fetchCandidates();
  }, [announcementId]);

  const handleCheckAll = (e) => {
    setCheckAll(e.target.checked);
    setCheckedRows(e.target.checked ? candidates.map((c) => c.candidateId) : []);
  };

  const handleRowCheck = (e, candidateId) => {
    setCheckedRows((prev) =>
      e.target.checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <h4 className="fw-bold mb-3">Candidate List</h4>
      </div>
      <div className="table-responsive">
        <table className="table custom-table">
          <thead>
            <tr>
              <th>Candidate ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Score (%)</th>
              <th>Resume</th>
              <th>
                <label className="control control--checkbox">
                  <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                  <div className="control__indicator"></div>
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0 ? (
              candidates.map((candidate) => (
                <tr key={candidate.candidateId} className={checkedRows.includes(candidate.candidateId) ? "active" : ""}>
                  <td>{candidate.candidateId}</td>
                  <td>{`${candidate.firstName} ${candidate.surName}`}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.candidateEvaluation ? `${candidate.candidateEvaluation}%` : "N/A"}</td>

                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => generatePDF(candidate)}>
                      Generate Resume
                    </button>
                  </td>
                  <td>
                    <label className="control control--checkbox">
                      <input type="checkbox" checked={checkedRows.includes(candidate.candidateId)} onChange={(e) => handleRowCheck(e, candidate.candidateId)} />
                      <div className="control__indicator"></div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No candidates found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateList;
