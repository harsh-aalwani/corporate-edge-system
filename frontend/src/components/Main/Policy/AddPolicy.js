import React, { useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../assets/css/FormsCss/form.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const AddPolicy = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  // Initialize policyTag as an array
  const [formData, setFormData] = useState({
    policyTitle: "",
    policyDescription: "",
    policyTag: [], // Array for multiple tags
    policyScheduleTime: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, policyDescription: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------
  // Tag Handling Functions
  // --------------------------
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.policyTag.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          policyTag: [...prev.policyTag, newTag],
        }));
      }
      e.target.value = "";
    }
  };

  const handleTagBlur = (e) => {
    const newTag = e.target.value.trim();
    if (newTag && !formData.policyTag.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        policyTag: [...prev.policyTag, newTag],
      }));
    }
    e.target.value = "";
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      policyTag: prev.policyTag.filter((tag) => tag !== tagToRemove),
    }));
  };
  // --------------------------

  const handleClear = () => {
    setFormData({
      policyTitle: "",
      policyDescription: "",
      policyTag: [],
      policyScheduleTime: "",
    });
    setErrors({});
  };

  const handleGoBack = () => {
    navigate("/SetPolicy");
  };

  const validateForm = (formData) => {
    let errors = {};
    if (!formData.policyTitle.trim()) {
      errors.policyTitle = "Title is required";
    }
    if (!formData.policyDescription.trim()) {
      errors.policyDescription = "Description is required";
    }
    if (!formData.policyScheduleTime) {
      errors.policyScheduleTime = "Schedule time is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      enqueueSnackbar(`❌ ${Object.values(validationErrors).join("\n")}`, { variant: "error" });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/policies/create", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      enqueueSnackbar("✅ Policy added successfully!", { variant: "success" });
      handleClear();
      navigate("/SetPolicy");
    } catch (error) {
      console.error("Submission Error:", error);
      const errorMessage = error.response?.data?.error || "Failed to add policy. Please try again.";
      enqueueSnackbar(errorMessage, { variant: "error" });

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        enqueueSnackbar(`${Object.values(error.response.data.errors).join("\n")}`, { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Add Policy</h4>
        <form className="custom-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label className="form-label">Title:</label>
            <input type="text" name="policyTitle" className="form-control" value={formData.policyTitle} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description:</label>
            <ReactQuill theme="snow" value={formData.policyDescription} onChange={handleDescriptionChange} modules={modules} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Tags:</label>
            <div className="tag-input-container form-control d-flex align-items-center">
              {formData.policyTag.map((tag, index) => (
                <span key={index} className="tag-bubble">
                  {tag}
                  <button type="button" className="tag-close" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              <input
                type="text"
                onKeyDown={handleTagKeyDown}
                onBlur={handleTagBlur}
                placeholder="Type and press Enter or ','..."
                className="tag-input"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Schedule Time:</label>
            <input type="datetime-local" name="policyScheduleTime" className="form-control" value={formData.policyScheduleTime} onChange={handleChange} />
          </div>

          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={handleGoBack}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>Submit</button>
            <button type="button" className="btn btn-dark px-4" onClick={handleClear}>Clear Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPolicy;
