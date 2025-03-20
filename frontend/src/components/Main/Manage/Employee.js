import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import axios from "axios";

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/employees");
        setEmployees(response.data.employees);
        setFilteredEmployees(response.data.employees);
      } catch (error) {
        console.error("Error fetching employees:", error.message);
      }
    };
    fetchEmployees();
  }, []);

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredEmployees.map(emp => emp.userId) : []);
  };

  const handleRowCheck = (e, rowId) => {
    const isChecked = e.target.checked;
    setCheckedRows(prev =>
      isChecked ? [...prev, rowId] : prev.filter(id => id !== rowId)
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = employees.filter(emp =>
      emp.fullName.toLowerCase().includes(query) ||
      emp.userEmail.toLowerCase().includes(query) ||
      emp.userMobileNumber.includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const isRowChecked = (rowId) => checkedRows.includes(rowId);

  const handleRemove = () => {
    if (checkedRows.length === 0) {
      alert("Please select at least one employee to remove.");
      return;
    }
    console.log("Removing employees with IDs:", checkedRows);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Employees</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Employees</h6>
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
          <button className="btn btn-dark btn-round" onClick={handleRemove}>Remove</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by Name, Email, or Mobile..."
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
                  <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.userId} className={isRowChecked(emp.userId) ? "active" : ""}>
                    <td>
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: emp.userStatus ? "green" : "red",
                      }}></span>
                    </td>
                    <td>{emp.userId}</td>
                    <td>{emp.fullName}</td>
                    <td>{emp.userEmail}</td>
                    <td>{emp.userMobileNumber}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isRowChecked(emp.userId)}
                        onChange={(e) => handleRowCheck(e, emp.userId)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No Employees found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManager;
