import React, { useState, useRef, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FaTrash } from "react-icons/fa";
import SignatureCanvas from "react-signature-canvas";
import "../../../assets/css/FormsCss/form.css";
import { FaPlus } from "react-icons/fa";

const EmployeeAppraisal = () => {
  const { enqueueSnackbar } = useSnackbar();
  const signaturePadRef = useRef(null);
  const [appraisalId, setAppraisalId] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({}); // ✅ Store validation errors
  const [formData, setFormData] = useState({
    appraisalDate: "",
    achievements: [],  // ✅ Ensure it's an empty array
    files: [{ name: "", file: null }],
    goalsAchieved: "",
    nextGoals: "",
    trainingNeeds: [],
    challengesFaced: "",
    feedbackSuggestions: "",
    employeeAcknowledgment: false,
});


  const ratingOptions = ["Excellent", "Very Good", "Good", "Average", "Needs Improvement"];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/appraisals/user/details", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setFormData((prevData) => ({
          ...prevData,
          name: userData.fullName,
          employeeId: userData.userId,
          department: userData.userDepartment,
          designation: userData.userDesignation,
          dateOfJoining: userData.dateOfJoining,
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear errors on change

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        trainingNeeds: checked
          ? [...prevData.trainingNeeds, value]
          : prevData.trainingNeeds.filter((item) => item !== value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // ✅ Validate form fields before submission
  const validateForm = () => {
    let tempErrors = {};
  
    if (step === 1) {
      if (!formData.appraisalDate) tempErrors.appraisalDate = "Appraisal Date is required";
     
      if (!formData.achievements) tempErrors.achievements = "Achievements are required";
  

    }
  
    if (step === 2) {
      if (!formData.goalsAchieved) tempErrors.goalsAchieved = "Previous goals are required";
      if (!formData.nextGoals) tempErrors.nextGoals = "Next goals are required";
      if (formData.trainingNeeds.length === 0) tempErrors.trainingNeeds = "At least one training need must be selected";
    }
  
    if (step === 3) {
      if (!formData.challengesFaced) tempErrors.challengesFaced = "Challenges faced is required";
      if (!formData.feedbackSuggestions) tempErrors.feedbackSuggestions = "Feedback is required";
      if (signaturePadRef.current?.isEmpty()) tempErrors.signature = "Signature is required";
      if (!formData.employeeAcknowledgment) tempErrors.employeeAcknowledgment = "Acknowledgment is required";
    }
  
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const defaultFormData = {
    appraisalDate:"",
    achievements: [],
    files: [],
  
    goalsAchieved: "",
    nextGoals: "",
    trainingNeeds: [],
    challengesFaced: "",
    feedbackSuggestions: "",
    employeeAcknowledgment: false,
    name: "",
    employeeId: "",
    department: "",
    designation: "",
    dateOfJoining: "",
  };
  
  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("📤 Submitting Appraisal for Employee ID:", formData.employeeId);
  
    if (!validateForm()) {
      enqueueSnackbar("Please fix the errors before submitting", { variant: "error" });
      return;
    }
  
    const formDataObj = new FormData();
  
    // ✅ Append Form Fields (Text Data)
    Object.keys(formData).forEach((key) => {
      if (key === "performanceRatings" || key === "trainingNeeds") {
        formDataObj.append(key, JSON.stringify(formData[key])); // Convert JSON fields
      } else if (key !== "files") {
        formDataObj.append(key, formData[key]);
      }
    });
  
    // ✅ Append File Uploads
    formData.files.forEach((fileEntry) => {
      if (fileEntry.file) {
        const fileExtension = fileEntry.file.name.split('.').pop(); // Extract file extension
        const fileName = fileEntry.name ? `${fileEntry.name}.${fileExtension}` : fileEntry.file.name;
        formDataObj.append("files", fileEntry.file, fileName); // ✅ Use custom file name
      }
    });
  
    // ✅ Append Signature (Base64)
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureDataUrl = signaturePadRef.current.toDataURL("image/png"); // Get Base64 string
      formDataObj.append("signature", signatureDataUrl);
    }
  
    try {
      console.log("📡 Sending request to backend...");
      
      const response = await fetch("http://localhost:5000/api/appraisals/", {
        method: "POST",
        body: formDataObj,
        credentials: "include", // ✅ Ensure session is maintained
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to submit appraisal");
  
      console.log("✅ Appraisal submitted successfully!", result);
  
      setAppraisalId(result.appraisalId);
      enqueueSnackbar("Form submitted successfully!", { variant: "success" });
  
      setFormData({ ...defaultFormData }); // Reset form
      setErrors({});
      setStep(1);
  
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
    } catch (error) {
      console.error("❌ Error submitting appraisal:", error.message);
      enqueueSnackbar(`Error: ${error.message}`, { variant: "error" });
    }
  };

  
  
  
  
  
  const nextStep = () => {
    if (!validateForm()) {
      enqueueSnackbar("Please fix the errors before proceeding", { variant: "error" });
      return;
    }
    setStep((prevStep) => prevStep + 1);
  };
  
const prevStep = () => setStep((prevStep) => prevStep - 1);
  
    
const handleDownload = async () => {
  if (!appraisalId) {
    enqueueSnackbar("Please submit the form first!", { variant: "warning" });
    return;
  }

  console.log("📡 Downloading Report for Appraisal ID:", appraisalId);

  try {
    const response = await fetch(`http://localhost:5000/api/appraisals/report/${appraisalId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Report Download Error:", errorData.message);
      enqueueSnackbar(`Error: ${errorData.message}`, { variant: "error" });
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${appraisalId}_Appraisal_Report.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Report downloaded successfully!");
    enqueueSnackbar("Report downloaded successfully!", { variant: "success" });

  } catch (error) {
    console.error("❌ Error downloading report:", error.message);
    enqueueSnackbar("Error downloading report", { variant: "error" });
  }
}




  //achivemnets
  const handleAchievementKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newAchievement = e.target.value.trim();
      if (newAchievement && !formData.achievements.includes(newAchievement)) {
        setFormData((prev) => ({
          ...prev,
          achievements: [...prev.achievements, newAchievement],
        }));
      }
      e.target.value = ""; // Clear input field
    }
  };
  
  const handleAchievementBlur = (e) => {
    const newAchievement = e.target.value.trim();
    if (newAchievement && !formData.achievements.includes(newAchievement)) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement],
      }));
    }
    e.target.value = ""; // Clear input field
  };
  
  const removeAchievement = (achievementToRemove) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((ach) => ach !== achievementToRemove),
    }));
  };
  

    return (
      <div className="container mt-5 px-5">
        <div className="card p-4 page-box">
          <h4 className="mb-3 text-center">Employee Appraisal Form</h4>
          <div className="d-flex justify-content-end mb-3">
  <button
    className="btn btn-sm btn-primary"
    onClick={handleDownload}
    disabled={!appraisalId} // ✅ Disable button if no Appraisal ID is available
  >
    📄 Download Report
  </button>
</div>
          <div className="progress mb-3">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${(step / 3) * 100}%` }}
              aria-valuenow={(step / 3) * 100}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              Step {step} of 3
            </div>
          </div>
          <form onSubmit={handleSubmit}>
          {step === 1 && (
  <div>
    {/* Appraisal Date */}

      
        <label className="form-label">Appraisal Date:</label>
        <input
          type="date"
          name="appraisalDate"
          className={`form-control ${errors.appraisalDate ? "is-invalid" : ""}`}
          value={formData.appraisalDate}
          onChange={handleChange}
        />
        {errors.appraisalDate && <div className="invalid-feedback">{errors.appraisalDate}</div>}
     
 

    {/* Key Achievements */}
  
  <label className="form-label">Key Achievements:</label>
  <div className="tag-input-container form-control d-flex align-items-center">
    {formData.achievements.map((achievement, index) => (
      <span key={index} className="tag-bubble">
        {achievement}
        <button type="button" className="tag-close" onClick={() => removeAchievement(achievement)}>×</button>
      </span>
    ))}
    <input
      type="text"
      onKeyDown={handleAchievementKeyDown}
      onBlur={handleAchievementBlur}
      placeholder="Type and press Enter or ','..."
      className="tag-input"
    />
  </div>



   {/* Document Upload Section */}
   <label className="form-label">Achievements Upload Documents:</label>
<br />
<br/>
{formData.files.map((fileEntry, index) => (
  <div key={index} className="d-flex align-items-center gap-2 mb-2">
    {/* Certificate Name Input - Editable */}
    <input
      type="text"
      placeholder="Enter Certificate Name"
      className="form-control"
      value={fileEntry.name || ""} // Editable field
      onChange={(e) => {
        const updatedFiles = [...formData.files];
        updatedFiles[index] = { ...updatedFiles[index], name: e.target.value };
        setFormData({ ...formData, files: updatedFiles });
      }}
      style={{ width: "40%" }}
    />

    {/* File Upload Input */}
    <input
      type="file"
      className={`form-control ${errors.files ? "is-invalid" : ""}`}
      onChange={(e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
          const updatedFiles = [...formData.files];
          updatedFiles[index] = { 
            ...updatedFiles[index], 
            file: selectedFile, 
            name: fileEntry.name || selectedFile.name // Keep existing name or use file name
          };
          setFormData({ ...formData, files: updatedFiles });
        }
      }}
      style={{ width: "60%" }}
    />

    {/* Delete Button */}
    <button
      type="button"
      onClick={() => {
        const updatedFiles = formData.files.filter((_, i) => i !== index);
        setFormData({ ...formData, files: updatedFiles });
      }}
      className="btn btn-danger btn-sm"
    >
      <FaTrash />
    </button>
  </div>
))}


      
      {/* Add More Button */}
      <button
        type="button"
        className="btn btn-primary btn-sm mt-2"
        onClick={() => setFormData({ ...formData, files: [...formData.files, { name: "", file: null }] })}
      >
        <FaPlus /> Add More
      </button>
    </div>








)}



{step === 2 && (
  <div>
    {/* Previous Goals Achieved */}
    <label style={{ fontWeight: "bold" }}>Previous Goals Achieved:</label>
    <textarea
      name="goalsAchieved"
      className={`form-control ${errors.goalsAchieved ? "is-invalid" : ""}`}
      value={formData.goalsAchieved}
      onChange={handleChange}
      style={{ marginBottom: "10px" }}
    ></textarea>
    {errors.goalsAchieved && <div className="invalid-feedback">{errors.goalsAchieved}</div>}

    {/* Goals for the Next Period */}
    <label style={{ fontWeight: "bold" }}>Goals for the Next Period:</label>
    <textarea
      name="nextGoals"
      className={`form-control ${errors.nextGoals ? "is-invalid" : ""}`}
      value={formData.nextGoals}
      onChange={handleChange}
      style={{ marginBottom: "10px" }}
    ></textarea>
    {errors.nextGoals && <div className="invalid-feedback">{errors.nextGoals}</div>}

    {/* Training & Development Needs */}
    <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
      Training & Development Needs:
    </label>
    <br />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "10px",
      }}
    >
      {["Leadership", "Technical Skills", "Communication", "Time Management", "Project Management"].map((need) => (
        <label
          key={need}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontWeight: "500",
            margin: "0px",
          }}
        >
          <input
            type="checkbox"
            value={need}
            checked={formData.trainingNeeds.includes(need)}
            onChange={handleChange}
          />
          {need}
        </label>
      ))}
    </div>
    {errors.trainingNeeds && <div className="invalid-feedback">{errors.trainingNeeds}</div>}
  </div>
)}


{step === 3 && (
  <div>
    {/* Challenges Faced */}
    <label style={{ fontWeight: "bold" }}>Challenges Faced:</label>
    <textarea
      name="challengesFaced"
      className={`form-control ${errors.challengesFaced ? "is-invalid" : ""}`}
      value={formData.challengesFaced || ""}
      onChange={handleChange}
      style={{ marginBottom: "10px" }}
    ></textarea>
    {errors.challengesFaced && <div className="invalid-feedback">{errors.challengesFaced}</div>}

    {/* Feedback & Suggestions */}
    <label style={{ fontWeight: "bold", marginTop: "10px" }}>Feedback & Suggestions:</label>
    <textarea
      name="feedbackSuggestions"
      className={`form-control ${errors.feedbackSuggestions ? "is-invalid" : ""}`}
      value={formData.feedbackSuggestions || ""}
      onChange={handleChange}
      style={{ marginBottom: "10px" }}
    ></textarea>
    {errors.feedbackSuggestions && <div className="invalid-feedback">{errors.feedbackSuggestions}</div>}

    {/* Employee Signature */}
    <label style={{ fontWeight: "bold", marginTop: "10px" }}>Employee Signature:</label>
    <div
      style={{
        border: `1px solid ${errors.signature ? "red" : "#ccc"}`,
        width: "100%",
        height: "150px",
        marginBottom: "10px",
      }}
    >
      <SignatureCanvas
        ref={(ref) => (signaturePadRef.current = ref)}
        penColor="black"
        canvasProps={{ width: 500, height: 150, className: "sigCanvas" }}
      />
    </div>
    {errors.signature && <div className="text-danger">Signature is required</div>}

    <button
      type="button"
      className="btn btn-warning mb-2"
      onClick={() => signaturePadRef.current.clear()}
    >
      Clear Signature
    </button>

    {/* Employee Acknowledgment */}
    <br/>
    <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px", marginTop: "10px" }}>
      Employee Acknowledgment:&nbsp;&nbsp;&nbsp;&nbsp;
    </label>
    
    <div style={{ display: "flex", alignItems: "left", gap: "10px", marginBottom: "10px" }}>
      
      <input
        type="checkbox"
        name="employeeAcknowledgment"
        checked={formData.employeeAcknowledgment || false}
        onChange={(e) =>
          setFormData({ ...formData, employeeAcknowledgment: e.target.checked })
        }
        style={{ transform: "scale(1.2)" }}
      />
      <span style={{ fontSize: "12px", fontWeight: "100", color: "#000" }}>
        I hereby acknowledge that I have reviewed the details provided in this appraisal form.  
        I confirm that all the information mentioned is accurate to the best of my knowledge.  
        I understand that my acknowledgment does not necessarily indicate agreement with the appraisal results,  
        but it confirms that I have participated in the appraisal process.
      </span>
    </div>
    {errors.employeeAcknowledgment && <div className="text-danger">{errors.employeeAcknowledgment}</div>}
  </div>
)}


  


<div className="d-flex justify-content-between mt-3">
  {step > 1 && (
    <button type="button" className="btn btn-secondary" onClick={prevStep}>
      Go Back
    </button>
  )}
  {step === 1 && (
    <button type="button" className="btn btn-primary" onClick={nextStep}>
      Next
    </button>
  )}
  {step === 2 && (
    <button type="button" className="btn btn-primary" onClick={nextStep}>
      Next
    </button>
  )}
  {step === 3 && (
    <button type="submit" className="btn btn-success">
      Submit
    </button>
  )}
</div>




          </form>
        </div>
      </div>
    );
  };

  export default EmployeeAppraisal;
