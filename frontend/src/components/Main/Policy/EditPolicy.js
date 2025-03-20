// src/EditPolicy.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
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

const EditPolicy = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { policyIds } = useParams(); // Route param, e.g., /EditPolicy/:policyIds

  // Initialize state; policyTag is an array to hold multiple tags
  const [formData, setFormData] = useState({
    policyTitle: "",
    policyDescription: "",
    policyTag: [],
    policyScheduleTime: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch policy data when component mounts
  useEffect(() => {
    if (policyIds) {
      fetchPolicy(policyIds);
    }
  }, [policyIds]);

  const fetchPolicy = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/policies/${id}`);
      if (response.status === 200 && response.data) {
        setFormData({
          policyTitle: response.data.policyTitle || "",
          policyDescription: response.data.policyDescription || "",
          policyTag: response.data.policyTag || [], // Expected to be an array
          policyScheduleTime: response.data.policyScheduleTime
            ? new Date(response.data.policyScheduleTime).toISOString().slice(0, 16)
            : "",
        });
      } else {
        enqueueSnackbar("No policy found", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch policy details", { variant: "error" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, policyDescription: value }));
  };

  // ---------------
  // Tag Handling Functions
  // ---------------
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
  // ---------------

  const validateForm = () => {
    let validationErrors = {};
    if (!formData.policyTitle.trim()) validationErrors.policyTitle = "Title is required";
    if (!formData.policyDescription.trim()) validationErrors.policyDescription = "Description is required";
    if (!formData.policyScheduleTime) validationErrors.policyScheduleTime = "Schedule time is required";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.put(`http://localhost:5000/api/policies/update/${policyIds}`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      enqueueSnackbar("✅ Policy updated successfully!", { variant: "success" });
      navigate("/SetPolicy");
    } catch (error) {
      enqueueSnackbar("⚠️ Failed to update policy", { variant: "error" });
    }
  };

  const handleClear = () => {
    setFormData({
      policyTitle: "",
      policyDescription: "",
      policyTag: [],
      policyScheduleTime: "",
    });
    setErrors({});
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Edit Policy</h4>
        <form onSubmit={handleSubmit} className="custom-form">
          <div className="form-group full-width">
            <label className="form-label">Title:</label>
            <input type="text" name="policyTitle" className="form-control" value={formData.policyTitle} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description:</label>
            <ReactQuill theme="snow" value={formData.policyDescription} onChange={handleDescriptionChange} modules={modules} />
          </div>

          {/* Multi-tag input for Tags */}
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
            <button type="button" className="btn btn-danger" onClick={() => navigate("/SetPolicy")}>Go Back</button>
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn btn-dark" onClick={handleClear}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPolicy;
