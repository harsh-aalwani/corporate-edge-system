import React, { useState, useEffect } from "react";
import {Link} from 'react-router-dom';
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import axios from 'axios';  // Import axios for making HTTP requests

const HRManager = () => {
  const [hrManagers, setHrManagers] = useState([]);  // Store HR Managers' data
  const [checkedRows, setCheckedRows] = useState([]);  // Track checked rows
  const [checkAll, setCheckAll] = useState(false);  // Handle check-all checkbox

  useEffect(() => {
    // Fetch HR Managers' data from the backend
    const fetchHRManagers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/manage/hr-managers');  // Full API URL
        setHrManagers(response.data.hrManagers);  // Store HR Managers data in state
      } catch (error) {
        console.error('Error fetching HR Managers:', error.message);
      }
    };    
  
    fetchHRManagers();  // Fetch HR Managers when component mounts
  }, []);

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);

    if (isChecked) {
      const allRows = Array.from(document.querySelectorAll("tbody tr")).map(
        (row) => row.dataset.id
      );
      setCheckedRows(allRows);
    } else {
      setCheckedRows([]);
    }
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
      <div className="d-flex align-items-center align-items-md-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage HR Members</h4> {/* Changed title */}
          <h6 className="op-7 mb-2">Add, Change and Delete HR Members</h6> {/* Updated description */}
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <Link to="/EditUser" className="btn btn-label-info w-100 btn-round mb-2">
            Edit
          </Link>
          <br />
          <Link to="/AddUser" className="btn btn-primary btn-round me-2">
            Add
          </Link>
          <a href="#" className="btn btn-primary btn-round">
            Remove
          </a>
        </div>
      </div>
      <div className="input-group">
        <input type="text" placeholder="Search ..." className="form-control" />
      </div>
      <hr id="title-line" data-symbol="✈" />
      <div className="content-area">
        <div className="table-responsive" style={{ border: "" }}>
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
                  <input
                    type="checkbox"
                    className="js-check-all"
                    checked={checkAll}
                    onChange={handleCheckAll}
                  />
                  <div className="control__indicator"></div>
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            {hrManagers.length > 0 ? (
              hrManagers.map((manager) => (
                <tr
                  key={manager.userId}
                  data-id={manager.userId}
                  className={isRowChecked(manager.userId) ? "active" : ""}
                >
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
                      <input
                        type="checkbox"
                        checked={isRowChecked(manager.userId)}
                        onChange={(e) => handleRowCheck(e, manager.userId)}
                      />
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
