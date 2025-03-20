import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";

const ManageLeaveAllocation = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [leaveAllocations, setLeaveAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeaveAllocations();
  }, []);

  const fetchLeaveAllocations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leaveAllocation/list");
      setLeaveAllocations(response.data);
      setFilteredAllocations(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch leave allocations", { variant: "error" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredAllocations(leaveAllocations);
    } else {
      const filtered = leaveAllocations.filter((leave) =>
        leave.leaveId.toLowerCase().includes(query) ||
        leave.leaveName.toLowerCase().includes(query) ||
        leave.leaveDescription.toLowerCase().includes(query)
      );
      setFilteredAllocations(filtered);
    }
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredAllocations.map((leave) => leave.leaveId) : []);
  };

  const handleRowCheck = (e, leaveId) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) =>
      isChecked ? [...prev, leaveId] : prev.filter((id) => id !== leaveId)
    );
  };

  const handleEdit = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one leave allocation to edit");
      return;
    }
    const selectedIds = checkedRows.join(",");
    navigate(`/LeaveEdit/${selectedIds}`);
  };

  const handleDelete = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one leave allocation to delete");
      return;
    }
    setIsModalOpen(true);
  };

  const deleteLeaveAllocations = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/api/leaveAllocation/delete", {
        data: { ids: checkedRows },
      });
      if (response.status === 200) {
        enqueueSnackbar("Leave allocations deleted successfully", { variant: "success" });
        fetchLeaveAllocations();
        setCheckedRows([]);
        setCheckAll(false);
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete leave allocations", { variant: "error" });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Leave Allocations</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Leave Allocations</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <button className="btn btn-label-info btn-round me-2" onClick={handleEdit}>
            Edit
          </button>
          <Link to="/LeaveAllocation" className="btn btn-primary btn-round me-2">
            Add
          </Link>
          <button className="btn btn-dark btn-round" onClick={handleDelete}>
            Remove
          </button>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by Name or Description..."
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
                <th scope="col">ID</th>
                <th scope="col">Leave Name</th>
                <th scope="col">Description</th>
                <th scope="col">
                  <label className="control control--checkbox">
                    <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                    <div className="control__indicator"></div>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((leave) => (
                  <tr key={leave.leaveId} className={checkedRows.includes(leave.leaveId) ? "active" : ""}>
                    <td>{leave.leaveId}</td>
                    <td>{leave.leaveName}</td>
                    <td>{leave.leaveDescription}</td>
                    <td>
                      <label className="control control--checkbox">
                        <input
                          type="checkbox"
                          checked={checkedRows.includes(leave.leaveId)}
                          onChange={(e) => handleRowCheck(e, leave.leaveId)}
                        />
                        <div className="control__indicator"></div>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No Leave Allocations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate">
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2 className="modal-title">Confirm Deletion</h2>
            <p className="modal-desc">
              Are you sure you want to delete {checkedRows.length} leave allocation(s)? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn btn-danger" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={deleteLeaveAllocations}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLeaveAllocation;
