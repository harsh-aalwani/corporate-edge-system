import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content animate">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="modal-title">Confirm Action</h2>
        <p className="modal-desc">{message}</p>
        <div className="modal-actions">
          <button className="modal-btn btn-danger" onClick={onClose}>Cancel</button>
          <button className="modal-btn confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};


const HRManager = () => {
  const [hrManagers, setHrManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingToggle, setPendingToggle] = useState(null);

  useEffect(() => {
    // Fetch HR Managers' data from the backend
    const fetchHRManagers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/hr-managers");
        setHrManagers(response.data.hrManagers);
        setFilteredManagers(response.data.hrManagers);
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

  // Toggle activation status using activateAccount property
  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/manage/hr-managers/status/${userId}`, {
        activateAccount: !currentStatus
      });

      const updatedManagers = hrManagers.map(manager =>
        manager.userId === userId ? { ...manager, activateAccount: !currentStatus } : manager
      );
      setHrManagers(updatedManagers);
      setFilteredManagers(updatedManagers);

      enqueueSnackbar(`HR Manager ${!currentStatus ? "activated" : "deactivated"} successfully.`, { variant: "success" });
    } catch (error) {
      console.error("Error updating status:", error.message);
      enqueueSnackbar("Failed to update HR Manager status.", { variant: "error" });
    }
  };

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
                enqueueSnackbar("Please select exactly one HR manager to edit.", {
                  variant: "default",
                });
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
                <th>Action</th>
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
                        backgroundColor: manager.activateAccount ? (manager.userStatus ? "#2eb774" : "red"): "black",
                      }}></span>
                    </td>
                    <td>{manager.userId}</td>
                    <td>{manager.fullName}</td>
                    <td>{manager.userEmail}</td>
                    <td>{manager.userMobileNumber}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${manager.activateAccount ? "btn-danger" : "btn-success"}`}
                        onClick={() => {
                          const msg = manager.activateAccount
                            ? "Are you sure you want to deactivate this HR manager?"
                            : "Are you sure you want to activate this HR manager?";
                          setModalMessage(msg);
                          setPendingToggle({ userId: manager.userId, currentStatus: manager.activateAccount });
                          setModalOpen(true);
                        }}
                      >
                        {manager.activateAccount ? "Deactivate" : "Activate"}
                      </button>
                    </td>
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
                  <td colSpan="7" className="text-center">No HR Managers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={() => {
            if (pendingToggle) {
              toggleStatus(pendingToggle.userId, pendingToggle.currentStatus);
              setModalOpen(false);
            }
          }}
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default HRManager;
