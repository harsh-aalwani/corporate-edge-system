import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const ConcernForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    supportingDocuments: [], // Array for multiple files
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input (Multiple files, max 3)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.supportingDocuments.length > 3) {
      enqueueSnackbar("You can upload a maximum of 3 documents.", { variant: "error" });
      return;
    }
    setFormData({ ...formData, supportingDocuments: [...formData.supportingDocuments, ...files] });
  };

  // Remove file from list
  const removeFile = (index) => {
    const updatedFiles = formData.supportingDocuments.filter((_, i) => i !== index);
    setFormData({ ...formData, supportingDocuments: updatedFiles });
  };

  // Validation function
  const validate = () => {
    let tempErrors = {};
    if (!formData.subject) tempErrors.subject = "Subject is required.";
    if (!formData.message) tempErrors.message = "Message is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formDataObj = new FormData();
    formDataObj.append("subject", formData.subject);
    formDataObj.append("message", formData.message);

    // Append multiple files with correct field name
    formData.supportingDocuments.forEach((file) => {
      formDataObj.append("supportingDocuments", file);
    });

    try {
      const response = await fetch("http://localhost:5000/api/concern/add", {
        method: "POST",
        credentials: "include", // ✅ Ensure session is sent with request
        body: formDataObj,
      });

      const result = await response.json();
      enqueueSnackbar(result.message, { variant: response.ok ? "success" : "error" });

      if (response.ok) {
        setFormData({ subject: "", message: "", supportingDocuments: [] });
      }
    } catch (error) {
      enqueueSnackbar("Server error. Please try again.", { variant: "error" });
    }
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Submit a Concern</h4>
        <form onSubmit={handleSubmit} className="custom-form">
          {/* Subject Input */}
          <div className="form-group full-width">
            <label className="form-label">Subject:</label>
            <input
              type="text"
              name="subject"
              className={`form-control ${errors.subject ? "is-invalid" : ""}`}
              value={formData.subject}
              onChange={handleChange}
            />
            {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
          </div>

          {/* Message Textarea */}
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

          {/* Supporting Documents Upload (Multiple) */}
          <div className="form-group full-width">
            <label className="form-label">Attach Supporting Documents (Max 3):</label>
            <input type="file" className="form-control" multiple onChange={handleFileChange} />
            
            {/* Display uploaded files with cancel icon */}
            {formData.supportingDocuments.length > 0 && (
              <div className="mt-2">
                <strong>Uploaded Files:</strong>
                <ul className="list-group">
                  {formData.supportingDocuments.map((file, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {file.name}
                      <span style={{ cursor: "pointer", color: "red" }} onClick={() => removeFile(index)}>❌</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={() => navigate(-1)}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4">Submit Concern</button>
            <button type="button" className="btn btn-dark px-4" onClick={() => setFormData({ subject: "", message: "", supportingDocuments: [] })}>
              Clear Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConcernForm;
