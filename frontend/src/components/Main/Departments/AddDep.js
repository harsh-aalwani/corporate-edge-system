import React, { useState } from "react";
import { useSnackbar } from "notistack"; // Import Snackbar Provider
import { useNavigate } from "react-router-dom"; // Import Navigate Hook
import "../../../assets/css/FormsCss/form.css"; // Import custom CSS

const AddDep = () => {
  const { enqueueSnackbar } = useSnackbar(); // Snackbar instance
  const navigate = useNavigate(); // Navigation Hook

  const [formData, setFormData] = useState({
    departmentName: "",
    departmentDescription: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.departmentName) tempErrors.departmentName = "Department Name is required";
    if (!formData.departmentDescription) tempErrors.departmentDescription = "Department Description is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch("http://localhost:5000/api/departments/addDepartment", {
        method: "POST",
        credentials:"include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        enqueueSnackbar(result.message, { variant: "success" }); // Show success alert
        setFormData({ departmentName: "", departmentDescription: "" }); // Reset form
      } else {
        enqueueSnackbar(result.message, { variant: "error" }); // Show error alert
      }
    } catch (error) {
      enqueueSnackbar("Server error. Please try again.", { variant: "error" });
    }
  };

  const handleClear = () => {
    setFormData({ departmentName: "", departmentDescription: "" });
    setErrors({});
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Add Department</h4>
        <form onSubmit={handleSubmit} className="custom-form">
          {/* Department Name - Textbox */}
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

          {/* Department Description - Textarea */}
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

          {/* Buttons */}
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

export default AddDep;
