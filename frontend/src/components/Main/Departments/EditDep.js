import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";

const EditDep = () => {
  const { departmentIds } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [formData, setFormData] = useState({
    departmentName: "",
    departmentDescription: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (departmentIds) {
      fetchDepartments(departmentIds.split(","));
    }
  }, [departmentIds]);

  const fetchDepartments = async (ids, keepSelectedId = null) => {
    try {
      const response = await fetch("http://localhost:5000/api/departments/getDepartment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentIds: ids }), // Send array of department IDs
      });
  
      if (!response.ok) throw new Error("Failed to fetch departments");
  
      const data = await response.json();
      if (!data.length) {
        enqueueSnackbar("No departments found", { variant: "error" });
        return;
      }
  
      setDepartments(data);
  
      // Keep previously selected department if it exists, else select the first one
      const newSelectedId = keepSelectedId && data.some(dept => dept.departmentid === keepSelectedId)
        ? keepSelectedId
        : data[0].departmentid;
  
      setSelectedDepartmentId(newSelectedId);
  
      // Set form data for the selected department
      const selectedDepartment = data.find(dept => dept.departmentid === newSelectedId);
      if (selectedDepartment) {
        setFormData({
          departmentName: selectedDepartment.departmentName,
          departmentDescription: selectedDepartment.departmentDescription,
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch departments", { variant: "error" });
    }
  };
  
  
  
  const handleDepartmentSelect = (e) => {
    const selectedId = e.target.value;
    setSelectedDepartmentId(selectedId);
    const selectedDepartment = departments.find((dept) => dept.departmentid === selectedId);
    if (selectedDepartment) {
      setFormData({
        departmentName: selectedDepartment.departmentName,
        departmentDescription: selectedDepartment.departmentDescription,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let validationErrors = {};
    if (!formData.departmentName.trim()) validationErrors.departmentName = "Department name is required";
    if (!formData.departmentDescription.trim()) validationErrors.departmentDescription = "Description is required";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      const response = await fetch("http://localhost:5000/api/departments/updateDepartment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentid: selectedDepartmentId, // Sending departmentid in req.body
          ...formData,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to update department");
  
      enqueueSnackbar("Department updated successfully", { variant: "success" });
  
      // Refetch departments and ensure selected department remains the same
      fetchDepartments(departmentIds.split(","), selectedDepartmentId);
    } catch (error) {
      enqueueSnackbar("Failed to update department", { variant: "error" });
    }
  };
  
    // Clear form fields
    const handleClear = () => {
      setFormData({
        departmentName: "",
        departmentDescription: "",
      });
      setErrors({});
    };
  
    // Go back to the previous page
    const handleGoBack = () => {
      navigate(-1);
    };
  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Edit Department</h4>
        <form onSubmit={handleSubmit} className="custom-form">
          {departments.length > 1 && (
            <div className="form-group full-width">
              <label className="form-label">Select Department: [Save changes before you want to switch] </label>
              <select className="form-control" value={selectedDepartmentId} onChange={handleDepartmentSelect}>
                {departments.map((dept) => (
                  <option key={dept.departmentid} value={dept.departmentid}>
                    {dept.departmentid + " \u00A0:\u00A0\u00A0 " + dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group full-width">
            <label className="form-label">Department Name:</label>
            <input
              type="text"
              name="departmentName"
              className={`form-control ${errors.departmentName ? "is-invalid" : ""}`}
              value={formData.departmentName}
              onChange={handleChange}
            />
            {errors.departmentName && <div className="invalid-feedback">{errors.departmentName}</div>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Department Description:</label>
            <textarea
              name="departmentDescription"
              className={`form-control ${errors.departmentDescription ? "is-invalid" : ""}`}
              rows="4"
              value={formData.departmentDescription}
              onChange={handleChange}
            ></textarea>
            {errors.departmentDescription && <div className="invalid-feedback">{errors.departmentDescription}</div>}
          </div>

          {/* Button Group with Proper Spacing */}
          <div className="d-flex justify-content-between w-100 mt-4">          
            <button type="button" className="btn btn-danger px-4" onClick={handleGoBack}>
              Go Back
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Submit
            </button>
            <button type="button" className="btn btn-dark px-4" onClick={handleClear}>
              Clear Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDep;
