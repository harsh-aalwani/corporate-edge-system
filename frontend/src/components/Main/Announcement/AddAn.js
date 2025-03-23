import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { FaDiscord, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import "../../../assets/css/FormsCss/form.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import currencyCodes from "currency-codes";

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

const AddAnnouncement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Fetch Departments from API
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/departments/list");
        setDepartments(response.data); // Store department data
      } catch (error) {
        console.error("Error fetching departments:", error);
        enqueueSnackbar("Failed to fetch departments", { variant: "error" });
      }
    };
    fetchDepartments();
  }, []);

  const handleDepartmentChange = (e) => {
    const selectedDeptId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      jobDetails: { ...prev.jobDetails, departmentId: selectedDeptId }, // Store department ID correctly
    }));
  };
  
  
  const [formData, setFormData] = useState({
    announcementTitle: "",
    announcementDescription: "",
    announcementTag: "",
    announcementScheduleTime: "",
    announcementPublic: false,
    announcementSend: { sendDiscord: false, sendEmail: false },
    jobDetails: {
      jobPosition: "",
      jobType: "",
      departmentId: "",
      salaryRange: { currency: "INR", min: "", max: "" },
      requiredExperience: "",
      skillsRequired: "",
      educationQualification: "",
      totalVacancy: "",
      applicationDeadline: ""
    },
    disableSalary: false,
    showJobDetails: false,
    jobAdded: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleCollapse = () => {
    setFormData((prev) => ({
      ...prev,
      showJobDetails: !prev.showJobDetails
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    setFormData((prevFormData) => {
      let updatedFormData = { ...prevFormData };
  
      if (type === "checkbox") {
        if (name === "disableSalary") {
          updatedFormData = {
            ...updatedFormData,
            disableSalary: checked,
            jobDetails: {
              ...updatedFormData.jobDetails,
              salaryRange: checked
                ? { currency: "", min: "", max: "" }
                : { ...prevFormData.jobDetails.salaryRange }
            }
          };
        } else {
          updatedFormData = {
            ...updatedFormData,
            announcementSend: { ...updatedFormData.announcementSend, [name]: checked }
          };
        }
      } else if (name === "announcementPublic") {
        const isPublic = value === "Yes";
  
        updatedFormData = {
          ...updatedFormData,
          announcementPublic: isPublic,
          jobDetails: isPublic
            ? { ...prevFormData.jobDetails }
            : {
                jobPosition: "",
                jobType: "",
                departmentId: "", // Reset department when not public
                salaryRange: { currency: "", min: "", max: "" },
                requiredExperience: "",
                skillsRequired: "",
                educationQualification: "",
                totalVacancy: "",
                applicationDeadline: ""
              }
        };
      } else if (name === "announcementScheduleTime") {
        updatedFormData = {
          ...updatedFormData,
          announcementScheduleTime: value
        };
      } else if (name === "salaryRange.currency") {
        const currencyCode = value.toUpperCase();
        const isValidCurrency = currencyCodes.code(currencyCode) !== undefined;
  
        updatedFormData = {
          ...updatedFormData,
          jobDetails: {
            ...updatedFormData.jobDetails,
            salaryRange: {
              ...updatedFormData.jobDetails.salaryRange,
              currency: currencyCode
            }
          }
        };
  
        setErrors((prevErrors) => ({
          ...prevErrors,
          currency: isValidCurrency || value === "" ? undefined : "Invalid currency code. Use standard 3-letter codes (e.g., USD, EUR, INR)."
        }));
      } else if (name.startsWith("salaryRange.")) {
        const field = name.split(".")[1];
        updatedFormData = {
          ...updatedFormData,
          jobDetails: {
            ...updatedFormData.jobDetails,
            salaryRange: {
              ...updatedFormData.jobDetails.salaryRange,
              [field]: value
            }
          }
        };
      } else if (name === "departmentId") {
        updatedFormData = {
          ...updatedFormData,
          jobDetails: {
            ...updatedFormData.jobDetails,
            departmentId: value // Store department ID correctly
          }
        };
      } else if (Object.keys(prevFormData.jobDetails).includes(name) || name === "jobDescription") {
        updatedFormData = {
          ...updatedFormData,
          jobDetails: { ...updatedFormData.jobDetails, [name]: value }
        };
      }
       else {
        updatedFormData = {
          ...updatedFormData,
          [name]: value
        };
      }
  
      return updatedFormData;
    });
  };
  

  // When the tag input loses focus, add any remaining text as a tag
  const handleTagBlur = (e) => {
    const newTag = e.target.value.trim();
    if (newTag && !formData.announcementTag.split(",").includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        announcementTag: prev.announcementTag 
          ? `${prev.announcementTag},${newTag}` 
          : newTag,
      }));
    }
    e.target.value = "";
  };

  const handleJobDone = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      showJobDetails: false,
      jobAdded: true,
    }));
    enqueueSnackbar("✅ Job details finalized!", { variant: "success" });
  };

  const handleJobDelete = () => {
    setFormData((prev) => ({
      ...prev,
      jobDetails: {
        jobPosition: "",
        jobType: "",
        departmentId: "",
        salaryRange: { currency: "", min: "", max: "" },
        requiredExperience: "",
        skillsRequired: "",
        educationQualification: "",
        totalVacancy: "",
        applicationDeadline: ""
      },
      jobAdded: false
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      announcementSend: { ...formData.announcementSend, [name]: checked },
    });
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, announcementDescription: value }));
  };

  const handleClear = () => {
    setFormData({
      announcementTitle: "",
      announcementDescription: "",
      announcementTag: "",
      announcementScheduleTime: "",
      announcementPublic: false,
      announcementSend: { sendDiscord: false, sendEmail: false },
      jobDetails: {
        jobPosition: "",
        jobType: "",
        departmentId: "",  // ✅ Reset departmentId
        salaryRange: { currency: "", min: "", max: "" },
        requiredExperience: "",
        skillsRequired: "",
        educationQualification: "",
        totalVacancy: "",
        applicationDeadline: ""
      },
      disableSalary: false,
      showJobDetails: false,
      jobAdded: false
    });
    setErrors({});
  };
  

  const handleGoBack = () => {
    navigate("/AnnouncementList");
  };

  const validateForm = (formData) => {
    let errors = {};
  
    if (!formData.announcementTitle.trim()) {
      errors.announcementTitle = "Title is required";
    }
    if (!formData.announcementDescription.trim()) {
      errors.announcementDescription = "Description is required";
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
  
    const formDataToSend = {
      announcementTitle: formData.announcementTitle,
      announcementDescription: formData.announcementDescription,
      announcementTag: formData.announcementTag,
      announcementScheduleTime: formData.announcementScheduleTime
        ? new Date(formData.announcementScheduleTime).toISOString()
        : new Date().toISOString(), // ✅ Auto-set current time if empty
      announcementPublic: formData.announcementPublic,
      announcementSend: { ...formData.announcementSend },
      ...(formData.announcementPublic
        ? {
            jobPosition: formData.jobDetails.jobPosition,
            jobType: formData.jobDetails.jobType,
            jobDescription: formData.jobDetails.jobDescription,
            salaryRange: formData.jobDetails.salaryRange,
            requiredExperience: formData.jobDetails.requiredExperience,
            skillsRequired: formData.jobDetails.skillsRequired,
            educationQualification: formData.jobDetails.educationQualification,
            totalVacancy: formData.jobDetails.totalVacancy,
            applicationDeadline: formData.jobDetails.applicationDeadline,
            departmentId: formData.jobDetails.departmentId
          }
        : {})
    };
  
    try {
      await axios.post("http://localhost:5000/api/announcements/create", formDataToSend, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });
  
      enqueueSnackbar("✅ Announcement added successfully!", { variant: "success" });
      handleClear();
      navigate("/AnnouncementList");
    } catch (error) {
      console.error("Submission Error:", error);
      const errorMessage = error.response?.data?.error || "Failed to add announcement. Please try again.";
      enqueueSnackbar(errorMessage, { variant: "error" });
  
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        enqueueSnackbar(`${Object.values(error.response.data.errors).join("\n")}`, { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.announcementTag.split(",").includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          announcementTag: prev.announcementTag 
            ? `${prev.announcementTag},${newTag}` 
            : newTag,
        }));
      }
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      announcementTag: prev.announcementTag
        .split(",")
        .filter((tag) => tag !== tagToRemove)
        .join(","),
    }));
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Add Announcement</h4>
        <form className="custom-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label className="form-label">Title:</label>
            <input type="text" name="announcementTitle" className="form-control" value={formData.announcementTitle} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description:</label>
            <ReactQuill 
              theme="snow" 
              value={formData.announcementDescription} 
              onChange={handleDescriptionChange} 
              modules={modules} 
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Tags:</label>
            <div className="tag-input-container form-control d-flex align-items-center">
              {formData.announcementTag &&
                formData.announcementTag.split(",").map((tag, index) => (
                  <span key={index} className="tag-bubble">
                    {tag}
                    <button type="button" className="tag-close" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))
              }
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
            <label className="form-label">Public Announcement:</label>
              <select
                name="announcementPublic"
                className="form-control"
                value={formData.announcementPublic ? "Yes" : "No"}
                onChange={handleChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
          </div>

          {formData.announcementPublic && (
            <div className={`p-3 mb-3 rounded border border-secondary shadow-sm ${formData.showJobDetails ? 'w-100' : ''}`} style={{ backgroundColor: "#f8f9fa" }}>
              <button
                type="button"
                className="btn btn-light border-dark btn-sm mb-2"
                onClick={toggleCollapse}
              >
                {formData.jobAdded ? "Vacancy Added" : formData.showJobDetails ? "Adding Vacancy" : "No Vacancy Added"}
              </button>
              {formData.showJobDetails && (
                <>
                  <div className="form-group w-100">
                    <label className="form-label">Job Position:</label>
                    <input type="text" name="jobPosition" placeholder="Available Job Position" className="form-control" value={formData.jobDetails.jobPosition} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Job Type:</label>
                    <select name="jobType" className="form-control" value={formData.jobDetails.jobType} onChange={handleChange}>
                      <option value="">-- Select Job Type --</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Job Description:</label>
                    <textarea
                      name="jobDescription"
                      className="form-control"
                      placeholder="Enter Job Description"
                      value={formData.jobDetails.jobDescription}
                      onChange={handleChange}
                      rows="4" 
                    ></textarea>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Skills Required:</label>
                    <input type="text" name="skillsRequired" className="form-control" placeholder="Enter Skills" value={formData.jobDetails.skillsRequired} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Required Experience:</label>
                    <input type="text" name="requiredExperience" className="form-control" placeholder="Experience required" value={formData.jobDetails.requiredExperience} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Education Qualification:</label>
                    <input type="text" name="educationQualification" className="form-control" placeholder="Enter Qualification" value={formData.jobDetails.educationQualification} onChange={handleChange} />
                  </div>


                  <div className="form-group full-width">
                    <label className="form-label">Salary Range Per Annum:</label>
                    <div className="d-flex gap-2">
                      <input 
                        type="text" 
                        name="salaryRange.currency" 
                        className="form-control w-25" 
                        placeholder="Currency (e.g., USD, EUR)" 
                        value={formData.jobDetails.salaryRange.currency || ''} 
                        onChange={handleChange} 
                        disabled={formData.disableSalary}
                      />
                      <input 
                        type="number" 
                        name="salaryRange.min" 
                        className="form-control" 
                        placeholder="Min Salary" 
                        value={formData.jobDetails.salaryRange.min} 
                        onChange={handleChange} 
                        disabled={formData.disableSalary} 
                      />
                      <input 
                        type="number" 
                        name="salaryRange.max" 
                        className="form-control" 
                        placeholder="Max Salary" 
                        value={formData.jobDetails.salaryRange.max} 
                        onChange={handleChange} 
                        disabled={formData.disableSalary} 
                      />
                    </div>
                    {errors.currency && <small className="text-danger">{errors.currency}</small>}
                    
                    <label className="form-label mt-1">
                      <input 
                        type="checkbox" 
                        name="disableSalary" 
                        checked={formData.disableSalary} 
                        onChange={handleChange} 
                      /> Prefer not to disclose
                    </label>
                  </div>

                  <div className="form-group w-100">
                    <label className="form-label">Department:</label>
                    <select 
                      name="departmentId" 
                      className="form-control" 
                      value={formData.jobDetails.departmentId} 
                      onChange={handleDepartmentChange}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentid} value={dept.departmentid}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Total Vacancy:</label>
                    <input type="number" name="totalVacancy" className="form-control" placeholder="Total Vacancy" value={formData.jobDetails.totalVacancy} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Application Deadline:</label>
                    <input type="datetime-local" name="applicationDeadline" className="form-control" value={formData.jobDetails.applicationDeadline} onChange={handleChange} />
                  </div>
                  <div className="d-flex justify-content-between w-100 mt-4">
                    <button type="button" className="btn btn-primary px-4" onClick={handleJobDone}>Finalize Job</button>
                    <button type="button" className="btn btn-dark px-4" onClick={handleJobDelete}>Clear Job</button>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="form-group full-width">
            <label className="form-label">Schedule Time:</label>
            <input 
              type="datetime-local" 
              name="announcementScheduleTime" 
              className="form-control" 
              value={formData.announcementScheduleTime} 
              onChange={handleChange} 
            />
          </div>

          {/* <div className="form-group">
            <label className="form-label">Send Announcement:</label>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" name="sendDiscord" checked={formData.announcementSend.sendDiscord} onChange={handleCheckboxChange} />
              <label className="form-check-label"><FaDiscord /> Send to Discord</label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" name="sendEmail" checked={formData.announcementSend.sendEmail} onChange={handleCheckboxChange} />
              <label className="form-check-label"><FaEnvelope /> Send to Email</label>
            </div>
          </div> */}
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

export default AddAnnouncement;
