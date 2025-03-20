import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import axios from "axios";

const HRManager = () => {
  const [hrManagers, setHrManagers] = useState([]);  // Store original HR Managers
  const [filteredManagers, setFilteredManagers] = useState([]);  // Store filtered HR Managers
  const [checkedRows, setCheckedRows] = useState([]);  // Track checked rows
  const [checkAll, setCheckAll] = useState(false);  // Handle check-all checkbox
  const [searchQuery, setSearchQuery] = useState("");  // Track search input

  useEffect(() => {
    // Fetch HR Managers' data from the backend
    const fetchHRManagers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/hr-managers");
        setHrManagers(response.data.hrManagers);
        setFilteredManagers(response.data.hrManagers);  // Initially set filteredManagers to all HR Managers
      } catch (error) {
        console.error("Error fetching HR Managers:", error.message);
      }
    };

    fetchHRManagers();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter HR managers based on name, email, or mobile number
    const filtered = hrManagers.filter((manager) =>
      manager.fullName.toLowerCase().includes(query) ||
      manager.userEmail.toLowerCase().includes(query) ||
      manager.userMobileNumber.includes(query)
    );

    setFilteredManagers(filtered);
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredManagers.map((m) => m.userId) : []);
  };

  const handleRowCheck = (e, rowId) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) =>
      isChecked ? [...prev, rowId] : prev.filter((id) => id !== rowId)
    );
  };

  const isRowChecked = (rowId) => checkedRows.includes(rowId);

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage HR-Manager</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete HR Managers</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <Link
            to={checkedRows.length === 1 ? `/EditUser/${checkedRows[0]}` : "#"}
            className="btn btn-label-info btn-round me-2"
            onClick={(e) => {
              if (checkedRows.length !== 1) {
                e.preventDefault();
                alert("Please select exactly one system admin to edit.");
              }
            }}
          >
            Edit
          </Link>
          <Link to="/AddUser" className="btn btn-primary btn-round me-2">Add</Link>
          <button className="btn btn-dark btn-round">Remove</button>
        </div>
      </div>

      {/* Search Input */}
      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by Name, Email, or Mobile Number..."
          className="form-control"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <hr id="title-line" data-symbol="✈" />
      <div className="content-area">
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>
                  <input
                    type="checkbox"
                    checked={checkAll}
                    onChange={handleCheckAll}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map((manager) => (
                  <tr key={manager.userId} className={isRowChecked(manager.userId) ? "active" : ""}>
                    <td>
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: manager.userStatus ? "green" : "red",
                      }}></span>
                    </td>
                    <td>{manager.userId}</td>
                    <td>{manager.fullName}</td>
                    <td>{manager.userEmail}</td>
                    <td>{manager.userMobileNumber}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isRowChecked(manager.userId)}
                        onChange={(e) => handleRowCheck(e, manager.userId)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No HR Managers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRManager;
