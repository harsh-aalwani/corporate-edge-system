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

const SystemAdmin = () => {
  const [systemAdmins, setSystemAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [pendingToggle, setPendingToggle] = useState(null);

  useEffect(() => {
    const fetchSystemAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manage/system-admins");
        // यह मानते हुए कि response.data.systemAdmin में activateAccount प्रॉपर्टी भी है
        setSystemAdmins(response.data.systemAdmin);
        setFilteredAdmins(response.data.systemAdmin);
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
    setCheckedRows((prev) =>
      isChecked ? [...prev, rowId] : prev.filter(id => id !== rowId)
    );
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

  const toggleStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/manage/system-admins/status/${userId}`, {
        activateAccount: !currentStatus
      });
  
      const updatedAdmins = systemAdmins.map(admin =>
        admin.userId === userId ? { ...admin, activateAccount: !currentStatus } : admin
      );
      setSystemAdmins(updatedAdmins);
      setFilteredAdmins(updatedAdmins);
  
      enqueueSnackbar(`User ${!currentStatus ? "activated" : "deactivated"} successfully.`, { variant: "success" });
    } catch (error) {
      console.error("Error updating status:", error.message);
      enqueueSnackbar("Failed to update user status.", { variant: "error" });
    }
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
                enqueueSnackbar("Please select exactly one system admin to edit.", { variant: "default" });
              }
            }}
          >
            Edit
          </Link>
          <Link to="/AddUser" className="btn btn-primary btn-round me-2">Add</Link>
         
        </div>
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="Search ..."
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
                <th>Can Manage Admins</th>
                <th>Action</th>
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
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: admin.activateAccount ? (admin.userStatus ? "#2eb774" : "red"): "black",
                        }}
                      ></span>
                    </td>
                    <td>{admin.userId}</td>
                    <td>{admin.fullName}</td>
                    <td>{admin.userEmail}</td>
                    <td>{admin.userMobileNumber}</td>
                    <td>{admin.canManageAdmins ? "Yes" : "No"}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${admin.activateAccount ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => {
                          const msg = admin.activateAccount
                            ? "Are you sure you want to deactivate this user?"
                            : "Are you sure you want to activate this user?";
                          setModalMessage(msg);
                          setPendingToggle({ userId: admin.userId, currentStatus: admin.activateAccount });
                          setModalOpen(true);
                        }}
                      >
                        {admin.activateAccount ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isRowChecked(admin.userId)}
                        onChange={(e) => handleRowCheck(e, admin.userId)}
                      />
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

export default SystemAdmin;
