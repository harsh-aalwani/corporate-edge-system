import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import ReactQuill from "react-quill";
import { FaDiscord, FaEnvelope } from "react-icons/fa";
import "react-quill/dist/quill.snow.css";
import currencyCodes from "currency-codes";
import "../../../assets/css/FormsCss/form.css";

const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const EditAnnouncement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { announcementIds } = useParams();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    announcementTitle: "",
    announcementDescription: "",
    announcementTag: "",
    announcementScheduleTime: "",
    announcementPublic: false,
    jobDetails: {
      jobPosition: "",
      jobType: "",
      jobDescription:"",
      departmentId: "",
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

  useEffect(() => {
    if (announcementIds) {
      fetchAnnouncementById(announcementIds);
    } else {
      enqueueSnackbar("⚠️ No announcement data found!", { variant: "error" });
    }
  }, [announcementIds, navigate, enqueueSnackbar]);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  };

  const fetchAnnouncementById = async (announcementIds) => {
    try {
      const res = await axios.post("http://localhost:5000/api/announcements/getAnnouncementInfoById", {
        announcementId: announcementIds
      });
  
      const data = res.data;
  
      const jobDetails = {
        jobPosition: data.jobPosition || "",
        jobType: data.jobType || "",
        departmentId: data.departmentId || "",
        salaryRange: {
          currency: data.salaryRange?.currency || "",
          min: data.salaryRange?.min?.toString() || "",
          max: data.salaryRange?.max?.toString() || ""
        },
        requiredExperience: data.requiredExperience || "",
        skillsRequired: Array.isArray(data.skillsRequired)
          ? data.skillsRequired.join(", ")
          : "",
        educationQualification: data.educationQualification || "",
        jobDescription: data.jobDescription || "",
        totalVacancy: data.totalVacancy?.toString() || "",
        applicationDeadline: formatDateForInput(data.applicationDeadline)
      };
  
      const { currency, min, max } = jobDetails.salaryRange;
  
      const disableSalary = !currency && !min && !max;
  
      setFormData({
        announcementTitle: data.announcementTitle || "",
        announcementDescription: data.announcementDescription || "",
        announcementTag: data.announcementTag || "",
        announcementScheduleTime: formatDateForInput(data.announcementScheduleTime),
        announcementPublic: !!data.announcementPublic,
        jobDetails: jobDetails,
        disableSalary: disableSalary,
        showJobDetails: !!data.jobPosition,
        jobAdded: !!data.jobPosition
      });
  
    } catch (err) {
      console.error("Error fetching announcement:", err);
      enqueueSnackbar("❌ Failed to load announcement", { variant: "error" });
    }
  };
  
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
  
  const updatedData = {
    ...formData,
    announcementPublic: formData.announcementPublic === "Yes"
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
            [name]: checked
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
                departmentId: "",
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
          currency:
            isValidCurrency || value === ""
              ? undefined
              : "Invalid currency code. Use standard 3-letter codes (e.g., USD, EUR, INR)."
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
            departmentId: value
          }
        };
      } else if (
        Object.keys(prevFormData.jobDetails).includes(name) ||
        name === "jobDescription"
      ) {
        updatedFormData = {
          ...updatedFormData,
          jobDetails: {
            ...updatedFormData.jobDetails,
            [name]: value
          }
        };
      } else {
        updatedFormData = {
          ...updatedFormData,
          [name]: value
        };
      }
  
      return updatedFormData;
    });
  };
  

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      announcementSend: { ...prev.announcementSend, [name]: checked },
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, announcementDescription: value }));
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
      announcementId: announcementIds,
      announcementTitle: formData.announcementTitle,
      announcementDescription: formData.announcementDescription,
      announcementTag: formData.announcementTag,
      announcementScheduleTime: formData.announcementScheduleTime
        ? new Date(formData.announcementScheduleTime).toISOString()
        : new Date().toISOString(), // ✅ Auto-set current time if empty
      announcementPublic: formData.announcementPublic,
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
      const response = await axios.put("http://localhost:5000/api/announcements/update", formDataToSend, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      enqueueSnackbar("Announcement updated successfully", { variant: "success" });
      navigate("/AnnouncementList");
    } catch (error) {
      console.error("API Error:", error.response ? error.response.data : error);
      enqueueSnackbar("Failed to update announcement", { variant: "error" });
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
  

    const toggleCollapse = () => {
      setFormData((prev) => ({
        ...prev,
        showJobDetails: !prev.showJobDetails
      }));
    };
  
    const handleDepartmentChange = (e) => {
      const selectedDeptId = e.target.value;
      setFormData((prev) => ({
        ...prev,
        jobDetails: { ...prev.jobDetails, departmentId: selectedDeptId }, // Store department ID correctly
      }));
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
  
    const handleGoBack = () => {
      navigate("/AnnouncementList");
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
          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={handleGoBack}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>Update</button>
            <button type="button" className="btn btn-dark px-4" onClick={handleClear}>Clear Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncement;
