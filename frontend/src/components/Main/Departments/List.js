import React, { useState, useEffect } from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";

const List = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/departments/list");
      setDepartments(response.data);
      setFilteredDepartments(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch departments", { variant: "error" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(dept => 
        dept.departmentid.toLowerCase().includes(query) ||
        dept.departmentName.toLowerCase().includes(query) ||
        dept.departmentDescription.toLowerCase().includes(query)
      );
      setFilteredDepartments(filtered);
    }
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredDepartments.map((dept) => dept.departmentid) : []);
  };

  const handleRowCheck = (e, departmentid) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) =>
      isChecked ? [...prev, departmentid] : prev.filter((id) => id !== departmentid)
    );
  };

  const handleEdit = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one department to edit");
      return;
    }
    const selectedIds = checkedRows.join(",");
    navigate(`/EditDepartment/${selectedIds}`);
  };

  const isRowChecked = (departmentid) => checkedRows.includes(departmentid);

  const handleDelete = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one department to delete");
      return;
    }
    setIsModalOpen(true);
  };

  const deleteDepartments = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/api/departments/deleteDepartment", {
        data: { ids: checkedRows },
      });
      if (response.status === 200) {
        enqueueSnackbar("Departments deleted successfully", { variant: "success" });
        fetchDepartments();
        setCheckedRows([]);
        setCheckAll(false);
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete departments", { variant: "error" });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Departments</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Departments</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <button className="btn btn-label-info btn-round me-2" onClick={handleEdit}>Edit</button>
          <Link to="/AddDepartment" className="btn btn-primary btn-round me-2">Add</Link>
          <button className="btn btn-dark btn-round" onClick={handleDelete}>Remove</button>
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
                <th scope="col">Department Name</th>
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
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((department) => (
                  <tr key={department.departmentid} className={isRowChecked(department.departmentid) ? "active" : ""}>
                    <td>{department.departmentid}</td>
                    <td>{department.departmentName}</td>
                    <td>{department.departmentDescription}</td>
                    <td>
                      <label className="control control--checkbox">
                        <input type="checkbox" checked={isRowChecked(department.departmentid)} onChange={(e) => handleRowCheck(e, department.departmentid)} />
                        <div className="control__indicator"></div>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No Departments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate">
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 className="modal-title">Confirm Deletion</h2>
            <p className="modal-desc">
              Are you sure you want to delete {checkedRows.length} department(s)? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn btn-danger" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={deleteDepartments}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
