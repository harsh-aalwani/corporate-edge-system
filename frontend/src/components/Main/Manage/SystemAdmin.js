import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";

const SystemAdmin = () => {
  const [systemAdmins, setSystemAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSystemAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/system-admins");
        setSystemAdmins(response.data.systemAdmin);
        setFilteredAdmins(response.data.systemAdmin);
        // console.log("User ID from URL:", id);
      } catch (error) {
        console.error("Error fetching System Admins:", error.message);
      }
    };
    fetchSystemAdmins();
  }, []);

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredAdmins.map(admin => admin.userId) : []);
  };

  const handleRowCheck = (e, rowId) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) => isChecked ? [...prev, rowId] : prev.filter(id => id !== rowId));
  };

  const isRowChecked = (rowId) => checkedRows.includes(rowId);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = systemAdmins.filter(admin =>
      admin.fullName.toLowerCase().includes(query) ||
      admin.userEmail.toLowerCase().includes(query) ||
      admin.userMobileNumber.includes(query)
    );
    setFilteredAdmins(filtered);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage System Admins</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete System Admins</h6>
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
      <div className="input-group">
        <input type="text" placeholder="Search ..." className="form-control" value={searchQuery} onChange={handleSearch} />
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
                <th>Can Manage Admins</th>
                <th>
                  <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.userId} className={isRowChecked(admin.userId) ? "active" : ""}>
                    <td>
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: admin.userStatus ? "green" : "red",
                      }}></span>
                    </td>
                    <td>{admin.userId}</td>
                    <td>{admin.fullName}</td>
                    <td>{admin.userEmail}</td>
                    <td>{admin.userMobileNumber}</td>
                    <td>{admin.canManageAdmins ? "Yes" : "No"}</td>
                    <td>
                      <input type="checkbox" checked={isRowChecked(admin.userId)} onChange={(e) => handleRowCheck(e, admin.userId)} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No System Admins found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
