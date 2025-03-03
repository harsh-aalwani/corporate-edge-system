import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaDiscord, FaEnvelope } from "react-icons/fa";


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

const EditAnnouncement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    announcementTitle: "",
    announcementDescription: "",
    announcementTag: "",
    announcementScheduleTime: "",
    announcementPublic: "No",
    announcementSend: { sendDiscord: false, sendEmail: false },
    createdBy: "",
    jobType: "",
    salaryRange: { min: "", max: "" },
    requiredExperience: "",
    skillsRequired: [],
    educationQualification: "",
    totalVacancy: "",
    applicationDeadline: "",
  });

  useEffect(() => {
    if (location.state?.announcementData) {
      setFormData((prev) => ({
        ...prev,
        ...location.state.announcementData,
        announcementDescription: location.state.announcementData.announcementDescription || "",
        announcementPublic: location.state.announcementData.announcementPublic ? "Yes" : "No",
      }));
    } else if (id) {
      fetchAnnouncementById(id);
    } else {
      enqueueSnackbar("⚠️ No announcement data found!", { variant: "error" });
      navigate("/AnnouncementList");
    }
  }, [location.state, id, navigate, enqueueSnackbar]);

  const fetchAnnouncementById = async (announcementId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/announcements/get/${announcementId}`);
      if (response.data) {
        setFormData((prev) => ({
          ...prev,
          ...response.data,
          announcementDescription: response.data.announcementDescription || "",
          announcementScheduleTime: response.data.announcementScheduleTime
            ? new Date(response.data.announcementScheduleTime).toISOString().slice(0, 16)
            : "",
          announcementPublic: response.data.announcementPublic ? "Yes" : "No",
        }));
      } else {
        enqueueSnackbar("⚠️ No announcement found with this ID!", { variant: "error" });
        navigate("/AnnouncementList");
      }
    } catch (error) {
      enqueueSnackbar("⚠️ Failed to fetch announcement data", { variant: "error" });
      navigate("/AnnouncementList");
    }
  };
  const updatedData = {
    ...formData,
    announcementPublic: formData.announcementPublic === "Yes"
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields like salaryRange.min and salaryRange.max
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        announcementId: formData.announcementId,
        announcementPublic: formData.announcementPublic === "Yes",
        skillsRequired: Array.isArray(formData.skillsRequired)
          ? formData.skillsRequired
          : formData.skillsRequired.split(",").map((skill) => skill.trim()), // Ensure skills are stored as an array
      };

      const response = await axios.put("http://localhost:5000/api/announcements/update", updatedData, {
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

  
  
  
  
  
  
  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Edit Announcement</h4>
        <form className="custom-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label className="form-label">Title:</label>
            <input type="text" name="announcementTitle" className="form-control" value={formData.announcementTitle} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Description:</label>
            <ReactQuill theme="snow" value={formData.announcementDescription} onChange={handleDescriptionChange} modules={modules} />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Tags:</label>
            <input type="text" name="announcementTag" className="form-control" value={formData.announcementTag} onChange={handleChange} />
          </div>

          <div className="form-group full-width">
  <label className="form-label">Schedule Time:</label>
  <input 
    type="datetime-local" 
    name="announcementScheduleTime" 
    className="form-control" 
    value={formData.announcementScheduleTime || ""}  // ✅ Ensure value exists
    onChange={handleChange} 
  />
</div>
          
          <div className="form-group full-width">
            <label className="form-label">Public Announcement:</label>
            <select
  name="announcementPublic"
  className="form-control"
  value={formData.announcementPublic}
  onChange={handleChange}
>

  <option value="Yes">Yes</option>
  <option value="No">No</option>
</select>

          </div>
          {formData.announcementPublic === "Yes" && (
  <>
    <div className="form-group full-width">
      <label className="form-label">Job Type:</label>
      <select name="jobType" className="form-control" value={formData.jobType} onChange={handleChange}>
        <option value="">-- Select Job Type --</option>
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
        <option value="Internship">Internship</option>
        <option value="Remote">Remote</option>
      </select>
    </div>

    <div className="form-group full-width">
      <label className="form-label">Salary Range:</label>
      <input type="number" name="salaryRange.min" className="form-control" placeholder="Min Salary" value={formData.salaryRange.min} onChange={handleChange} />
      <input type="number" name="salaryRange.max" className="form-control" placeholder="Max Salary" value={formData.salaryRange.max} onChange={handleChange} />
    </div>

    <div className="form-group full-width">
      <label className="form-label">Education Qualification:</label>
      <input type="text" name="educationQualification" className="form-control" placeholder="Enter Qualification" value={formData.educationQualification || ""} onChange={handleChange} />
    </div>  

    <div className="form-group full-width">
      <label className="form-label">Skills Required:</label>
      <input type="text" name="skillsRequired" className="form-control" placeholder="Enter Skills" value={Array.isArray(formData.skillsRequired) ? formData.skillsRequired.join(", ") : formData.skillsRequired || ""} onChange={handleChange} />
    </div>

    <div className="form-group full-width">
      <label className="form-label">Experience Required:</label>
      <input type="text" name="requiredExperience" className="form-control" placeholder="Enter Experience" value={formData.requiredExperience || ""} onChange={handleChange} />
    </div>

    <div className="form-group full-width">
      <label className="form-label">Total Vacancy:</label>
      <input type="text" name="totalVacancy" className="form-control" placeholder="Enter Total Vacancy" value={formData.totalVacancy || ""} onChange={handleChange} />
    </div>

    <div className="form-group full-width">
      <label className="form-label">Application Deadline:</label>
      <input type="datetime-local" name="applicationDeadline" className="form-control" value={formData.applicationDeadline || ""} onChange={handleChange} />
    </div>
  </>
)}


          


          <div className="form-group">
            <label className="form-label">Send Announcement:</label>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" name="sendDiscord" checked={formData.announcementSend.sendDiscord} onChange={handleCheckboxChange} />
              <label className="form-check-label"><FaDiscord /> Send to Discord</label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" name="sendEmail" checked={formData.announcementSend.sendEmail} onChange={handleCheckboxChange} />
              <label className="form-check-label"><FaEnvelope /> Send to Email</label>
            </div>
          </div>

          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={() => navigate("/AnnouncementList")}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4">Submit</button>
            <button type="button" className="btn btn-dark px-4" onClick={() => setFormData({
  announcementTitle: "",
  announcementDescription: "",
  announcementTag: "",
  announcementScheduleTime: "",
  announcementPublic: "No",
  announcementSend: { sendDiscord: false, sendEmail: false },
  createdBy: "",
  jobType: "",
  salaryRange: { min: "", max: "" },
  requiredExperience: "",
  skillsRequired: [],
  educationQualification: "",
  totalVacancy: "",
  applicationDeadline: "",
})}>
  Clear Data
</button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncement;
