import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";
import axios from "axios";
import { useSnackbar } from "notistack";

const ConfirmationModal = ({ isOpen, message, onConfirm, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <div className="modal-title">Confirmation</div>
        <div className="modal-desc">{message}</div>
        <div className="modal-actions">
          <button className="modal-btn btn-danger" onClick={onClose}>Cancel</button>
          <button className="modal-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const DepartmentManager = () => {
  const [departmentManagers, setDepartmentManagers] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingToggle, setPendingToggle] = useState(null);

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
    setCheckedRows(prev => isChecked ? [...prev, rowId] : prev.filter(id => id !== rowId));
  };

  const isRowChecked = (rowId) => checkedRows.includes(rowId);

  // Filter managers based on search query
  const filteredManagers = departmentManagers.filter(dm =>
    dm.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dm.userMobileNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle activation status function
  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/manage/department-managers/status/${userId}`, {
        activateAccount: !currentStatus
      });

      // Update local state
      const updatedManagers = departmentManagers.map(dm =>
        dm.userId === userId ? { ...dm, activateAccount: !currentStatus } : dm
      );
      setDepartmentManagers(updatedManagers);
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

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
                  enqueueSnackbar("Please select exactly one department manager to edit.", 
                );
              }
            }}
          >
            Edit
          </Link>
          <Link to="/AddUser" className="btn btn-primary btn-round me-2">Add</Link>
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
                <th>Action</th>
                <th>
                  <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map(dm => (
                  <tr key={dm.userId} className={isRowChecked(dm.userId) ? "active" : ""}>
                    <td>
                      <span style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: dm.activateAccount ? (dm.userStatus ? "#2eb774" : "red"): "black",
                      }}></span>
                    </td>
                    <td>{dm.userId}</td>
                    <td>{dm.fullName}</td>
                    <td>{dm.userEmail}</td>
                    <td>{dm.userMobileNumber}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${dm.activateAccount ? "btn-danger" : "btn-success"}`}
                        onClick={() => {
                          const msg = dm.activateAccount
                            ? "Are you sure you want to deactivate this department manager?"
                            : "Are you sure you want to activate this department manager?";
                          setModalMessage(msg);
                          setPendingToggle({ userId: dm.userId, currentStatus: dm.activateAccount });
                          setModalOpen(true);
                        }}
                      >
                        {dm.activateAccount ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isRowChecked(dm.userId)}
                        onChange={(e) => handleRowCheck(e, dm.userId)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No Department Managers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (pendingToggle) {
            toggleStatus(pendingToggle.userId, pendingToggle.currentStatus);
            setModalOpen(false);
          }
        }}
      />
    </div>
  );
};

export default DepartmentManager;
