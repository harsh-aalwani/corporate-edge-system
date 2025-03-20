import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";

const PolicyList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/policies/list");
      setPolicies(response.data);
      setFilteredPolicies(response.data);
    } catch (error) {
      enqueueSnackbar("⚠️ Failed to fetch policies", { variant: "error" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredPolicies(
      query.trim() === ""
        ? policies
        : policies.filter((policy) =>
            policy.policyTitle.toLowerCase().includes(query) ||
            policy.policyDescription.toLowerCase().includes(query)
          )
    );
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredPolicies.map((policy) => policy.policyId) : []);
  };

  const handleRowCheck = (e, policyId) => {
    setCheckedRows((prev) =>
      e.target.checked ? [...prev, policyId] : prev.filter((id) => id !== policyId)
    );
  };

  const handleEdit = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one policy to edit");
      return;
    }
    const selectedPolicy = policies.find((policy) => policy.policyId === checkedRows[0]);
    navigate(`/EditPolicy/${checkedRows[0]}`, { state: { policyData: selectedPolicy } });
  };

  const handleDelete = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one policy to delete", { variant: "warning" });
      return;
    }
    setIsModalOpen(true);
  };

  const deletePolicies = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/api/policies/delete", {
        data: { ids: checkedRows },
      });
      if (response.status === 200) {
        enqueueSnackbar("Policies deleted successfully", { variant: "success" });
        fetchPolicies();
        setCheckedRows([]);
        setCheckAll(false);
      }
    } catch (error) {
      enqueueSnackbar("⚠️ Failed to delete policies", { variant: "error" });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Policies</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Policies</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <button className="btn btn-label-info btn-round me-2" onClick={handleEdit}>Edit</button>
          <Link to="/CreatePolicy" className="btn btn-primary btn-round me-2">Add</Link>
          <button className="btn btn-dark btn-round" onClick={handleDelete}>Remove</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by Title or Description..."
          className="form-control"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <hr id="title-line" data-symbol="📜" />
      <div className="content-area">
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Tag</th>
                <th>Schedule Time</th>
                <th scope="col">
                  <label className="control control--checkbox">
                    <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                    <div className="control__indicator"></div>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <tr key={policy.policyId}>
                    <td>{policy.policyId}</td>
                    <td>{policy.policyTitle}</td>
                    <td>{policy.policyTag}</td>
                    <td>{new Date(policy.policyScheduleTime).toLocaleString()}</td>
                    <td>
                      <label className="control control--checkbox">
                        <input
                          type="checkbox"
                          checked={checkedRows.includes(policy.policyId)}
                          onChange={(e) => handleRowCheck(e, policy.policyId)}
                        />
                        <div className="control__indicator"></div>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No Policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate">
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 className="modal-title">Confirm Deletion</h2>
            <p className="modal-desc">
              Are you sure you want to delete {checkedRows.length} policy(ies)? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn btn-danger" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={deletePolicies}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyList;
