import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ApplyLeave = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
    status: "Pending",
    halfDay: false,
    fullDay: false,
    halfDayTime: "",
  });

  const [errors, setErrors] = useState({});

  const [leaveTypes, setLeaveTypes] = useState([]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/leaves/leave-types", {
        withCredentials: true, // Ensure cookies are sent if needed
      });
      setLeaveTypes(response.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);  // Debugging
      enqueueSnackbar(error.response?.data?.message || "Failed to fetch leave types", { variant: "error" });
    }
  };
  
  useEffect(() => {
    fetchLeaveTypes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
      halfDay: name === "halfDay" ? checked : false,
      fullDay: name === "fullDay" ? checked : false,
      halfDayTime: name === "halfDay" && checked ? "" : formData.halfDayTime,
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.type) tempErrors.type = "Leave type is required.";
    if (!formData.startDate) tempErrors.startDate = "Start date is required.";
    if (!formData.endDate) tempErrors.endDate = "End date is required.";
    if (!formData.reason) tempErrors.reason = "Reason is required.";
    // if (!formData.contactDuringLeave) tempErrors.contactDuringLeave = "Contact during leave is required.";
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      tempErrors.date = "Start date cannot be later than end date.";
    }
    if (!formData.halfDay && !formData.fullDay) {
      tempErrors.dayType = "Please select either Half-Day or Full-Day leave.";
    }
    if (formData.halfDay && !formData.halfDayTime) {
      tempErrors.halfDayTime = "Please select a time for the half-day leave.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/leaves/apply-leave", formData, { withCredentials: true });
      enqueueSnackbar("Leave application submitted successfully", { variant: "success" });
      setFormData({ type: "", startDate: "", endDate: "", reason: "", halfDay: false, fullDay: false, halfDayTime: "" });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Failed to submit leave", { variant: "error" });
    }
  };

  return (
    <div className="container mt-5 px-5">
    <div className="card p-4 page-box">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-3 text-center">Apply for Leave</h4>
        <div>
    <button className="btn btn-info me-2" onClick={() => navigate("/MyLeave")}>
        My Leave Balance
    </button>
    <button className="btn btn-primary" onClick={() => navigate("/WithdrawLeave")}>
        My Leave Status
    </button>
</div>

          </div>
        <form onSubmit={handleSubmit} className="custom-form">
        <div className="form-group full-width">
      <label className="form-label">Leave Type:</label>
      <select className={`form-control ${errors.type ? "is-invalid" : ""}`} name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
        <option value="">Select Leave Type</option>
        {leaveTypes.map((leave) => (
          <option key={leave.leaveName} value={leave.leaveName}>
            {leave.leaveName}
          </option>
        ))}
      </select>
      {errors.type && <div className="invalid-feedback">{errors.type}</div>}
    </div>

          <div className="form-group full-width">
            <label className="form-label">Start Date:</label>
            <input type="date" name="startDate" className={`form-control ${errors.startDate ? "is-invalid" : ""}`} value={formData.startDate} onChange={handleChange} />
            {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">End Date:</label>
            <input type="date" name="endDate" className={`form-control ${errors.endDate ? "is-invalid" : ""}`} value={formData.endDate} onChange={handleChange} />
            {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
          </div>

          <div className="form-group full-width">
            <label className="form-label">Reason:</label>
            <textarea name="reason" className={`form-control ${errors.reason ? "is-invalid" : ""}`} rows="4" value={formData.reason} onChange={handleChange}></textarea>
            {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
          </div>
          
          <div className="form-group full-width">
            <label className="form-label">Leave Duration:</label>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" name="halfDay" checked={formData.halfDay} onChange={handleCheckboxChange} />
              <label className="form-check-label">Apply for Half-Day Leave</label>
            </div>
            {errors.dayType && <div className="text-danger">{errors.dayType}</div>}
            {formData.halfDay && (
              <select name="halfDayTime" className={`form-control ${errors.halfDayTime ? "is-invalid" : ""}`} value={formData.halfDayTime} onChange={handleChange}>
                <option value="">Select Time Slot</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
              </select>
            )}
            {errors.halfDayTime && <div className="invalid-feedback">{errors.halfDayTime}</div>}
            <div className="form-check">
              <input type="checkbox" className="form-check-input" name="fullDay" checked={formData.fullDay} onChange={handleCheckboxChange} />
              <label className="form-check-label">Apply for Full-Day Leave</label>
            </div>
          </div>
          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={() => navigate(-1)}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4">Submit Application</button>
            <button type="button" className="btn btn-dark px-4" onClick={() => setFormData({ type: "", startDate: "", endDate: "", reason: "", status: "Pending", halfDay: false, fullDay: false, halfDayTime: "" })}>
              Clear Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
