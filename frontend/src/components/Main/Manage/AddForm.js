import React, { useState } from "react";
import "../../../assets/css/FormsCss/form.css"; // Import custom CSS

const AddForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    gender: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.fullName) tempErrors.fullName = "Full Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    if (!formData.phone) tempErrors.phone = "Phone is required";
    if (!formData.department) tempErrors.department = "Select a department";
    if (!formData.gender) tempErrors.gender = "Select your gender";
    if (!formData.message) tempErrors.message = "Message is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form Submitted Successfully!", formData);
      alert("Form Submitted Successfully!");
    }
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Add Form</h4>
        <form onSubmit={handleSubmit} className="custom-form">

          {/* Full Name - Big Textbox */}
          <div className="form-group full-width">
            <label className="form-label">Full Name:</label>
            <input
              type="text"
              name="fullName"
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          {/* Two Textboxes in One Line - Email & Phone */}
          <div className="form-row">
            <div className="form-group half-width">
              <label className="form-label">Email:</label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group half-width">
              <label className="form-label">Phone:</label>
              <input
                type="text"
                name="phone"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>

          {/* Dropdown - Department */}
          <div className="form-group">
            <label className="form-label">Department:</label>
            <select
              name="department"
              className={`form-select ${errors.department ? "is-invalid" : ""}`}
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Engineering">Engineering</option>
            </select>
            {errors.department && <div className="invalid-feedback">{errors.department}</div>}
          </div>

          {/* Radio Buttons - Gender */}
          <div className="form-group">
            <label className="form-label">Gender:</label>
            <div className="radio-group">
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Male</label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                />
                <label className="form-check-label">Female</label>
              </div>
            </div>
            {errors.gender && <div className="text-danger">{errors.gender}</div>}
          </div>

          {/* Big Textarea - Message */}
          <div className="form-group full-width">
            <label className="form-label">Message:</label>
            <textarea
              name="message"
              className={`form-control ${errors.message ? "is-invalid" : ""}`}
              rows="4"
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            {errors.message && <div className="invalid-feedback">{errors.message}</div>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary mt-3">Submit</button>

        </form>
      </div>
    </div>
  );
};

export default AddForm;
