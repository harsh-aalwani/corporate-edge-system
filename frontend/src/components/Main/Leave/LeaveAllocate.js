import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/FormsCss/form.css";

const AddLeaveAllocation = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
 
  
  const [formData, setFormData] = useState({
    leaveName: "",
    leaveNumber: "",
    leaveDescription: "",
    leaveValidFrom: "",
    leaveValidTo: "",
    leaveYearlyRefresh: "false", // Default "No"
    isPaidLeave: false, // ✅ Is Paid Leave checkbox added again
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "leaveYearlyRefresh") {
      setFormData({
        ...formData,
        leaveYearlyRefresh: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.leaveName.trim()) tempErrors.leaveName = "Leave Name is required";
    if (!formData.leaveNumber.trim()) tempErrors.leaveNumber = "Leave Number is required";
    if (!formData.leaveDescription.trim()) tempErrors.leaveDescription = "Leave Description is required";

    // Validate only if leaveYearlyRefresh = "Yes"
    if (formData.leaveYearlyRefresh === "true") {
      if (!formData.leaveValidFrom) tempErrors.leaveValidFrom = "Leave Valid From is required";
      if (!formData.leaveValidTo) tempErrors.leaveValidTo = "Leave Valid To is required";
      if (formData.leaveValidFrom > formData.leaveValidTo) {
        tempErrors.leaveValidTo = "Leave Valid To must be after Leave Valid From";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
  
    console.log("Submitting Form Data:", formData); // ✅ Debugging line
  
    try {
      const response = await fetch("http://localhost:5000/api/leaveAllocation/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
      console.log("Server Response:", result); // ✅ Debugging line
  
      if (response.ok) {
        enqueueSnackbar(result.message, { variant: "success" });
        setFormData({
          leaveName: "",
          leaveNumber: "",
          leaveDescription: "",
          leaveValidFrom: "",
          leaveValidTo: "",
          leaveYearlyRefresh: "false",
          isPaidLeave: false,
        });
      } else {
        enqueueSnackbar(result.message, { variant: "error" });
      }
    } catch (error) {
      console.error("Error Submitting Form:", error); // ✅ Debugging line
      enqueueSnackbar("Server error. Please try again.", { variant: "error" });
    }
  };
  
  const handleClear = () => {
    setFormData({
      leaveName: "",
      leaveNumber: "",
      leaveDescription: "",
      leaveValidFrom: "",
      leaveValidTo: "",
      leaveYearlyRefresh: "false",
      isPaidLeave: false,
    });
    setErrors({});
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box shadow">
        <h4 className="mb-3 text-center">Add Leave Allocation</h4>
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="row">
            {/* Leave Name */}
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Leave Name:</label>
                <input type="text" name="leaveName" className={`form-control ${errors.leaveName ? "is-invalid" : ""}`} value={formData.leaveName} onChange={handleChange} />
                {errors.leaveName && <div className="invalid-feedback">{errors.leaveName}</div>}
              </div>
            </div>

            {/* Leave Number */}
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Leave Number:</label>
                <input type="number" name="leaveNumber" className={`form-control ${errors.leaveNumber ? "is-invalid" : ""}`} value={formData.leaveNumber} onChange={handleChange} />
                {errors.leaveNumber && <div className="invalid-feedback">{errors.leaveNumber}</div>}
              </div>
            </div>

            {/* Leave Description */}
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Leave Description:</label>
                <input type="text" name="leaveDescription" className={`form-control ${errors.leaveDescription ? "is-invalid" : ""}`} value={formData.leaveDescription} onChange={handleChange} />
                {errors.leaveDescription && <div className="invalid-feedback">{errors.leaveDescription}</div>}
              </div>
            </div>

            {/* Leave Yearly Refresh */}
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Leave Yearly Refresh:</label>
                <select name="leaveYearlyRefresh" className="form-control" value={formData.leaveYearlyRefresh} onChange={handleChange}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>

            {/* Leave Valid From & To (Show only if "Yes" is selected) */}
            {formData.leaveYearlyRefresh === "true" && (
              <>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Leave Valid From:</label>
                    <input type="date" name="leaveValidFrom" className={`form-control ${errors.leaveValidFrom ? "is-invalid" : ""}`} value={formData.leaveValidFrom} onChange={handleChange} />
                    {errors.leaveValidFrom && <div className="invalid-feedback">{errors.leaveValidFrom}</div>}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Leave Valid To:</label>
                    <input type="date" name="leaveValidTo" className={`form-control ${errors.leaveValidTo ? "is-invalid" : ""}`} value={formData.leaveValidTo} onChange={handleChange} />
                    {errors.leaveValidTo && <div className="invalid-feedback">{errors.leaveValidTo}</div>}
                  </div>
                </div>
              </>
            )}

            {/* Is Paid Leave - Checkbox ✅ */}
            <div className="col-md-6 d-flex align-items-center">
              <input type="checkbox" className="form-check-input me-2" name="isPaidLeave" checked={formData.isPaidLeave} onChange={handleChange} />
              <label className="form-label m-0">Is Paid Leave</label>
            </div>

          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={handleGoBack}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4">Submit</button>
            <button type="button" className="btn btn-dark px-4" onClick={handleClear}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveAllocation;
