import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../assets/css/TableCss/TableManage.css";

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leaves");
      setLeaves(response.data);
      setFilteredLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredLeaves(leaves);
    } else {
      const filtered = leaves.filter((leave) =>
        leave.employeeDepartment.toLowerCase().includes(query)
      );
      setFilteredLeaves(filtered);
    }
  };

  const handleRowClick = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4"></div>
  
      <h4 className="fw-bold mb-3">Leave Record</h4> 
      <h6 className="op-7 mb-2">All Departments Leave List</h6>
      <hr id="title-line"  />
      <div>
      {/* 🔍 Search Box */}
      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by Department..."
          className="form-control"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="table-responsive">
        <table className="table custom-table">
          <thead>
            <tr>
              <th>Leave ID</th>
              <th>Department</th>
              <th>Employee Name</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
  {filteredLeaves.length > 0 ? (
    filteredLeaves.map((leave) => (
      <tr key={leave.leaveId} style={{ cursor: "pointer" }}>
        <td>{leave.leaveId}</td>
        <td>{leave.employeeDepartment}</td>
        <td>{leave.employeeName}</td>
        <td>{leave.type}</td>
        <td>{formatDate(leave.startDate)}</td>
        <td>{formatDate(leave.endDate)}</td>
        <td 
  style={{
    color: 
    leave.status === "Approved" ? "#28a745" // ✅ Green
    : leave.status === "Rejected" ? "#dc3545" // ✅ Red
    : leave.status === "Withdrawn" ? "#17a2b8"  

    : "#ffc107", // ✅ Default: yellow
  }}
>
  {leave.status}
</td>
        <td>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault(); 
              handleRowClick(leave);
            }} 
            className="text-primary"
          >
            Reason
          </a>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="text-center">No Leave Requests</td>
    </tr>
  )}
</tbody>

        </table>
      </div>
      </div>
     
      {isModalOpen && selectedLeave && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2>Leave Details</h2>

            <p  style={{ color: "#000",textAlign: "left" }}><strong>Reason:</strong> <span style={{ color: "#000" }}>{selectedLeave.reason}</span></p>

            <p style={{ color: "#000",textAlign: "left" }}><strong>Leave Duration</strong> 
              {selectedLeave.HalfDay ? " Half Day" : " Full Day"}
            </p>

            {selectedLeave.HalfDay && (
              <p style={{ color: "#000",textAlign: "left" }}><strong>Half Day Time:</strong> {selectedLeave.halfDayTime || "N/A"}</p>
            )}

            <p style={{ color: "#000",textAlign: "left" }}><strong>Remarks:</strong> {selectedLeave.remarks || "No Remarks"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveList;
