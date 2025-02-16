import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack"; // Import Snackbar
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";

const List = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar(); // Snackbar instance
  const [departments, setDepartments] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/departments/list");
      setDepartments(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch departments", { variant: "error" });
    }
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? departments.map((dept) => dept._id) : []);
  };

  const handleRowCheck = (e, id) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) =>
      isChecked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  const isRowChecked = (id) => checkedRows.includes(id);

  const handleDelete = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select one department");
      return;
    }

    enqueueSnackbar(`⚠️ Delete ${checkedRows.length} department(s)?`, {
      autoHideDuration: 5000,
      action: (key) => (
        <button
          style={{
            border: "none",
            padding: "6px 12px",
            borderRadius: "4px",
          }}
          onClick={() => {
            deleteDepartments();
            closeSnackbar(key);
          }}
        >
          Confirm
        </button>
      ),
    });
  };

  const deleteDepartments = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/api/departments/deleteDepartment", {
        data: { ids: checkedRows },
      });

      if (response.status === 200) {
        enqueueSnackbar("Departments deleted successfully", { variant: "success" });
        fetchDepartments(); // Refresh list
        setCheckedRows([]);
        setCheckAll(false);
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete departments", { variant: "error" });
    }
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Departments</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Departments</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <Link to="/EditDepartment" className="btn btn-label-info btn-round me-2">Edit</Link>
          <Link to="/AddDepartment" className="btn btn-primary btn-round me-2">Add</Link>
          <button className="btn btn-dark btn-round" onClick={handleDelete}>Remove</button>
        </div>
      </div>
      <div className="input-group">
        <input type="text" placeholder="Search ..." className="form-control" />
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
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department._id} className={isRowChecked(department._id) ? "active" : ""}>
                    <td>{department.departmentid}</td>
                    <td>{department.departmentName}</td>
                    <td>{department.departmentDescription}</td>
                    <td>
                      <label className="control control--checkbox">
                        <input type="checkbox" checked={isRowChecked(department._id)} onChange={(e) => handleRowCheck(e, department._id)} />
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
    </div>
  );
};

export default List;
