import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/FormsCss/form.css"; // ✅ Match CSS
const EditLeaveAllocation = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { leaveIds } = useParams(); // ✅ Get selected leave ID

  const [selectedLeaveId, setSelectedLeaveId] = useState("");
  const [formData, setFormData] = useState({
    leaveName: "",
    leaveNumber: "",
    leaveDescription: "",
    leaveValidFrom: "",
    leaveValidTo: "",
    leaveYearlyRefresh: "false",
    isPaidLeave: false,
  });
  const [errors, setErrors] = useState({});

  // ✅ Load Leave Data when page opens
  useEffect(() => {
    if (leaveIds) {
      fetchLeaveAllocations(leaveIds);
    }
  }, [leaveIds]);

  // ✅ Fetch Leave Data from API
  const fetchLeaveAllocations = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/leaveAllocation/getLeave/${id}`);
      console.log("✅ API Response:", response.data);

      if (response.status === 200 && response.data) {
        setSelectedLeaveId(id);
        setFormData((prevState) => ({
          ...prevState,
          leaveName: response.data.leaveName || "",
          leaveNumber: response.data.leaveNumber || "",
          leaveDescription: response.data.leaveDescription || "",
          leaveValidFrom: response.data.leaveValidFrom ? response.data.leaveValidFrom.split("T")[0] : "",
          leaveValidTo: response.data.leaveValidTo ? response.data.leaveValidTo.split("T")[0] : "",
          leaveYearlyRefresh: response.data.leaveYearlyRefresh ? "true" : "false",
          isPaidLeave: response.data.isPaidLeave || false,
        }));
      } else {
        enqueueSnackbar("No leave allocations found", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch leave allocations", { variant: "error" });
    }
  };

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Validate Form
  const validateForm = () => {
    let validationErrors = {};
    if (!formData.leaveName.trim()) validationErrors.leaveName = "Leave name is required";
    if (!formData.leaveNumber) validationErrors.leaveNumber = "Leave number is required";
    if (!formData.leaveDescription.trim()) validationErrors.leaveDescription = "Description is required";
    if (formData.leaveYearlyRefresh === "true" && (!formData.leaveValidFrom || !formData.leaveValidTo)) {
      validationErrors.leaveValidFrom = "Valid From date is required";
      validationErrors.leaveValidTo = "Valid To date is required";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      await axios.put("http://localhost:5000/api/leaveAllocation/update", {
        leaveId: selectedLeaveId,
        leaveName: formData.leaveName,
        leaveNumber: formData.leaveNumber,
        leaveDescription: formData.leaveDescription,
        leaveValidFrom: formData.leaveValidFrom,
        leaveValidTo: formData.leaveValidTo,
        leaveYearlyRefresh: formData.leaveYearlyRefresh,
        isPaidLeave: formData.isPaidLeave,
      });
  
      enqueueSnackbar("Leave allocation updated successfully", { variant: "success" });
      fetchLeaveAllocations(selectedLeaveId);
    } catch (error) {
      enqueueSnackbar("Failed to update leave allocation", { variant: "error" });
    }
  };
  

  // ✅ Handle Clear Form
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

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box shadow">
        <h4 className="mb-3 text-center">Edit Leave Allocation</h4>
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

            {/* Valid From & Valid To */}
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

            {/* Is Paid Leave */}
            <div className="col-md-6 d-flex align-items-center">
              <input type="checkbox" className="form-check-input me-2" name="isPaidLeave" checked={formData.isPaidLeave} onChange={handleChange} />
              <label className="form-label m-0">Is Paid Leave</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger" onClick={() => navigate(-1)}>Go Back</button>
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn btn-dark" onClick={handleClear}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveAllocation;
