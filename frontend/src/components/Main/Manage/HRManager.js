import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import axios from "axios"; // Import axios for making HTTP requests

const HRManager = () => {
  const [hrManagers, setHrManagers] = useState([]); // Store HR Managers' data
  const [filteredHRManagers, setFilteredHRManagers] = useState([]); // Store filtered results
  const [checkedRows, setCheckedRows] = useState([]); // Track checked rows
  const [checkAll, setCheckAll] = useState(false); // Handle check-all checkbox
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch HR Managers' data from the backend
    const fetchHRManagers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/hr-managers");
        setHrManagers(response.data.hrManagers);
        setFilteredHRManagers(response.data.hrManagers); // Ensure filtered list is initialized
      } catch (error) {
        console.error("Error fetching HR Managers:", error.message);
      }
    };

    fetchHRManagers(); // Fetch HR Managers when component mounts
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredHRManagers(hrManagers);
    } else {
      const filtered = hrManagers.filter(
        (manager) =>
          manager.userId.toString().toLowerCase().includes(query) ||
          manager.fullName.toLowerCase().includes(query) ||
          manager.userEmail.toLowerCase().includes(query) ||
          manager.userMobileNumber.toLowerCase().includes(query)
      );
      setFilteredHRManagers(filtered);
    }
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);

    if (isChecked) {
      const allRowIds = filteredHRManagers.map((manager) => manager.userId);
      setCheckedRows(allRowIds);
    } else {
      setCheckedRows([]);
    }
  };

  const handleRowCheck = (e, rowId) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) => (isChecked ? [...prev, rowId] : prev.filter((id) => id !== rowId)));
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
          <Link to="/EditUser" className="btn btn-label-info btn-round me-2">
            Edit
          </Link>
          <Link to="/AddUser" className="btn btn-primary btn-round me-2">
            Add
          </Link>
          <button className="btn btn-dark btn-round">Remove</button>
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

      <hr id="title-line" data-symbol="✈" />

      <div className="content-area">
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Mobile Number</th>
                <th scope="col">
                  <label className="control control--checkbox">
                    <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                    <div className="control__indicator"></div>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHRManagers.length > 0 ? (
                filteredHRManagers.map((manager) => (
                  <tr key={manager.userId} data-id={manager.userId} className={isRowChecked(manager.userId) ? "active" : ""}>
                    <th scope="row">
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: manager.userStatus ? "green" : "red",
                        }}
                      ></span>
                    </th>
                    <td>{manager.userId}</td>
                    <td>{manager.fullName}</td>
                    <td>{manager.userEmail}</td>
                    <td>{manager.userMobileNumber}</td>
                    <th scope="row">
                      <label className="control control--checkbox">
                        <input type="checkbox" checked={isRowChecked(manager.userId)} onChange={(e) => handleRowCheck(e, manager.userId)} />
                        <div className="control__indicator"></div>
                      </label>
                    </th>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No HR Managers found
                  </td>
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
