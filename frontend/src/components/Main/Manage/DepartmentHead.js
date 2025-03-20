import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import axios from "axios";

const DepartmentManager = () => {
  const [departmentManagers, setDepartmentManagers] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state

  useEffect(() => {
    const fetchDepartmentManagers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/department-managers");
        setDepartmentManagers(response.data.deptManager);
      } catch (error) {
        console.error("Error fetching Department Managers:", error.message);
      }
    };
    fetchDepartmentManagers();
  }, []);

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? departmentManagers.map(dm => dm.userId) : []);
  };

  const handleRowCheck = (e, rowId) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) => isChecked ? [...prev, rowId] : prev.filter(id => id !== rowId));
  };

  const isRowChecked = (rowId) => checkedRows.includes(rowId);

  // Filter department managers based on search query
  const filteredManagers = departmentManagers.filter((dm) =>
    dm.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.userMobileNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Department Managers</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Department Managers</h6>
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
          placeholder="Search ..."
          className="form-control"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                  <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map((dm) => (
                  <tr key={dm.userId} className={isRowChecked(dm.userId) ? "active" : ""}>
                    <td>
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: dm.userStatus ? "green" : "red",
                      }}></span>
                    </td>
                    <td>{dm.userId}</td>
                    <td>{dm.fullName}</td>
                    <td>{dm.userEmail}</td>
                    <td>{dm.userMobileNumber}</td>
                    <td>
                      <input type="checkbox" checked={isRowChecked(dm.userId)} onChange={(e) => handleRowCheck(e, dm.userId)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No Department Managers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManager;
