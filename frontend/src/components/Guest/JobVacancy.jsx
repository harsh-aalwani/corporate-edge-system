  import { useEffect ,useState } from "react";
  import { FaPlus , FaTimes, FaChevronDown, FaChevronUp   } from "react-icons/fa";
  import { FaFileWaveform } from "react-icons/fa6";
  import axios from "axios";
  import { enqueueSnackbar } from "notistack"; 
  import { useNavigate } from "react-router-dom";


  const JobVacancyForm = () => {
    const [imagePreview, setImagePreview] = useState(""); 
    const [positions, setPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
      // Personal Information
      firstName: "",
      fatherName: "",
      surName: "",
      email: "",
      phone: "",
      dob: "",
      age: "",
      nativePlace: "",
      nationality: "",
      gender: "",
      maritalStatus: "",
      languagesKnown: "",
      candidateDocuments: null,
      candidatePicture: null,
      presentAddress: "",
      permanentAddress: "",
    
      // Education Qualifications (Array)
      educationQualification: [],
    
      // Job Position Details:
      announcementId: "", // ✅ Added announcementId
      position: "",
      department: "",
      skills: "",
      specialization: "",
      salary: "",
    
      // Other Information
      lastWorkPlace: "",
      yearsOfExperience: "",
      addressOfWorkPlace: "",
      responsibilities: "",
      referenceContact: "",
      totalYearsOfExperience: "",
    
      // Confirmation
      confirmInformation: false
    });
    
    const navigate = useNavigate();

    const [ErrorMessage, setError] = useState('');
    const [TotalYearError,setErrorForTY ] = useState('');
    const [collapsedEntries, setCollapsedEntries] = useState({});
    const toggleCollapse = (id) => {
      setCollapsedEntries((prev) => ({
        ...prev,
        [id]: !prev[id], // Toggle the collapse state for the specific entry
      }));
    };
    // Function to add a new education entry

    useEffect(() => {
      const fetchPositions = async () => {
        try {
          const response = await axios.get("http://localhost:5000/api/announcements/jobdata");
    
          if (Array.isArray(response.data) && response.data.length > 0) {
            setPositions(response.data); // Ensure it's an array before updating state
          } else {
            console.warn("⚠ No job positions found in response:", response.data);
            setPositions([]); // Set empty to prevent undefined errors
          }
        } catch (error) {
          console.error("❌ Error fetching job positions:", error);
          setPositions([]); // Prevent app crashes by setting empty state
        }
      };
    
      fetchPositions();
    }, []);
    

    const addEducationField = () => {
      setFormData((prev) => ({
        ...prev,
        educationQualification: [
          ...prev.educationQualification,
          {
            id: Date.now(),
            field: "",
            fieldOfStudy: "", // New field added
            nameOfBoard: "",
            schoolName: "",
            nameOfUniversity: "",
            collegeName: "",
            marksObtained: "",
            outOf: "",
            percentage: "",
            noOfAttempts: "",
            yearOfPassing: "",
          },
        ],
      }));

      // Show Snackbar message with count
      enqueueSnackbar(`New education entry added! Total entries: ${formData.educationQualification.length+1}`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    };

    //Remove Education Entry
    const removeEducationEntry = (id) => {
      setFormData((prev) => ({
        ...prev,
        educationQualification: prev.educationQualification.filter((edu) => edu.id !== id),
      }));
    
      // Show Snackbar message
      enqueueSnackbar(`Education entry removed successfully! Total entries: ${formData.educationQualification.length-1}`, { 
        variant: "error",
        autoHideDuration: 3000,
      });
    };

    // Function to handle input changes
    const handleEducationChange = (id, key, value) => {
      setFormData((prev) => {
        // Find the education entry being updated
        const updatedEducation = prev.educationQualification.map((edu) =>
          edu.id === id ? { ...edu, [key]: value } : edu
        );
    
        // Auto-calculate percentage if needed
        const edu = updatedEducation.find((edu) => edu.id === id);
        if (edu.marksObtained && edu.outOf && edu.outOf > 0) {
          edu.percentage = ((edu.marksObtained / edu.outOf) * 100).toFixed(2);
        }
    
        return { ...prev, educationQualification: updatedEducation };
      });
    };
      
    const handleImageChange = (e) => {
      const file = e.target.files[0];
  
      if (!file) return; // Exit if no file is selected
  
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB limit
  
      if (!allowedTypes.includes(file.type)) {
        enqueueSnackbar("Only JPG, JPEG, PNG, WEBP, and GIF images are allowed!", {
          variant: "error",
          autoHideDuration: 3000,
        });
        e.target.value = "";
        return;
      }
  
      if (file.size > maxSize) {
        enqueueSnackbar("File size must be less than 2MB!", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        e.target.value = "";
        return;
      }
  
      // ✅ Generate preview URL
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl); // Store preview URL
  
      // ✅ Store the actual file object in formData for upload
      setFormData((prev) => ({
        ...prev,
        candidatePicture: file, // File object
      }));
    };
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
    
      if (!file) return; // Exit if no file is selected
    
      const allowedTypes = [
        "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", // Images
        "application/pdf" // PDF files
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB limit
    
      if (!allowedTypes.includes(file.type)) {
        enqueueSnackbar("Only JPG, JPEG, PNG, WEBP, GIF, and PDF files are allowed!", {
          variant: "error",
          autoHideDuration: 3000,
        });
        e.target.value = "";
        return;
      }
    
      if (file.size > maxSize) {
        enqueueSnackbar("File size must be less than 5MB!", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        e.target.value = "";
        return;
      }
    
      // ✅ Store the actual file in formData instead of Base64
      setFormData((prev) => ({ ...prev, candidateDocuments: file }));
    };
    
    
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
    
      setFormData((prev) => {
        let updatedForm = { ...prev };
    
        // 🔹 Prevent numbers from being typed in name fields
        const nameFields = ["firstName", "fatherName", "surName"];
        if (nameFields.includes(name)) {
          return { ...prev, [name]: value.replace(/[0-9]/g, "") }; // Remove numbers
        }
    
        // 🔹 Handle Date of Birth & Age Calculation (Disallow under 18)
        if (name === "dob") {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
    
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
    
          if (age < 18 || isNaN(age)) {
            setError("❌ Age must be 18 or above");
            return { ...prev, [name]: value, age: "" };
          } else {
            setError("");
            return { ...prev, [name]: value, age };
          }
        }

        // 🔹 Prevent `yearsOfExperience` from exceeding `totalYearsOfExperience`
        if (name === "yearsOfExperience") {
          const enteredYears = parseInt(value, 10) || 0;
          const totalYears = parseInt(prev.totalYearsOfExperience, 10) || 0;

          if (enteredYears > totalYears) {
            setErrorForTY("Years of Experience cannot be greater than Total Years of Experience.");
          } else {
            setErrorForTY(""); // Clear error if valid
          }
        }

        // 🔹 Ensure `totalYearsOfExperience` is always >= `yearsOfExperience`
        if (name === "totalYearsOfExperience") {
          const totalYears = parseInt(value, 10) || 0;
          const enteredYears = parseInt(prev.yearsOfExperience, 10) || 0;

          if (totalYears < enteredYears) { // ✅ Fixed condition: It should be `<` not `<=`
            setErrorForTY("Total Years of Experience must be greater than or equal to Years of Experience.");
          } else {
            setErrorForTY(""); // Clear error if valid
          }
        }
        // 🔹 Auto-fill position & department when job selection changes
        if (name === "announcementId") {
          const selectedJob = positions.find((job) => job.announcementId === value);
    
          updatedForm = {
            ...updatedForm,
            announcementId: value, // ✅ Store announcementId
            position: selectedJob ? selectedJob.position : "", // ✅ Store position
            departmentId: selectedJob ? selectedJob.departmentId : "", // ✅ Store departmentId for backend
            department: selectedJob ? selectedJob.departmentName : "", // ✅ Show departmentName for UI
          };
        }
    
        // 🔹 Ensure other fields update correctly
        updatedForm = {
          ...updatedForm,
          [name]: type === "checkbox" ? checked : value,
        };
    
        return updatedForm;
      });
    };
    
    
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      // 🔹 Check for validation errors before submitting
      if (ErrorMessage || TotalYearError) {
        enqueueSnackbar(ErrorMessage || TotalYearError, { variant: "error" }); // ✅ Show error in snackbar
        return; // ✅ Stop form submission if there's an error
      }
    
      console.log("Form Data:", formData);
      setIsLoading(true);
      
      try {
        const formDataToServer = new FormData();
    
        // 🔹 Personal Information
        formDataToServer.append("firstName", formData.firstName);
        formDataToServer.append("fatherName", formData.fatherName);
        formDataToServer.append("surName", formData.surName);
        formDataToServer.append("email", formData.email);
        formDataToServer.append("phone", formData.phone);
        formDataToServer.append("dob", formData.dob);
        formDataToServer.append("age", formData.age);
        formDataToServer.append("nativePlace", formData.nativePlace);
        formDataToServer.append("nationality", formData.nationality);
        formDataToServer.append("gender", formData.gender);
        formDataToServer.append("maritalStatus", formData.maritalStatus);
        formDataToServer.append("languagesKnown", formData.languagesKnown);
        formDataToServer.append("presentAddress", formData.presentAddress);
        formDataToServer.append("permanentAddress", formData.permanentAddress);
    
        // 🔹 File uploads
        if (formData.candidateDocuments instanceof File) {
          formDataToServer.append("candidateDocuments", formData.candidateDocuments);
      }
      if (formData.candidatePicture instanceof File) {
          formDataToServer.append("candidatePicture", formData.candidatePicture);
      }
      
        // 🔹 Education Qualifications (as JSON)
        formDataToServer.append("educationQualification", JSON.stringify(formData.educationQualification));
    
        // 🔹 Job Position Details
        formDataToServer.append("announcementId", formData.announcementId);
        formDataToServer.append("position", formData.position);
        formDataToServer.append("skills", formData.skills);
        formDataToServer.append("specialization", formData.specialization);
        formDataToServer.append("salary", formData.salary);
        formDataToServer.append("departmentId", formData.departmentId);
        formDataToServer.append("department", formData.department);
    
        // 🔹 Work Experience
        formDataToServer.append("lastWorkPlace", formData.lastWorkPlace);
        formDataToServer.append("yearsOfExperience", formData.yearsOfExperience);
        formDataToServer.append("addressOfWorkPlace", formData.addressOfWorkPlace);
        formDataToServer.append("responsibilities", formData.responsibilities);
        formDataToServer.append("referenceContact", formData.referenceContact);
        formDataToServer.append("totalYearsOfExperience", formData.totalYearsOfExperience);
    
        // 🔹 Confirmation
        formDataToServer.append("confirmInformation", formData.confirmInformation);
    
        // 🔹 Send to server
        const response = await axios.post("http://localhost:5000/api/candidates/add", formDataToServer);
        console.log("✅ Candidate added:", response.data);
        setIsSuccess(true);
        enqueueSnackbar("✅ Candidate added successfully!", { variant: "success" });
    
      } catch (error) {
        console.error("❌ Error adding candidate:", error);
        enqueueSnackbar(error.response?.data?.message || "Error creating candidate. Please try again.", { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    

    return (
      <div className="container mt-5 px-5 " style={{paddingBottom:"100px" } }>
        <div className="card p-4 page-box">


          {/* Show Form if not Loading or Success */}
        {!isLoading && !isSuccess && (
          <>
          <h3 className="mb-3 text-center" style={{fontWeight:"bold"}}> <FaFileWaveform class="mb-2"/> Job Application Form</h3>
          <h4 className="mb-3 mt-4">Personal Information:</h4>
          <form className="custom-form" onSubmit={handleSubmit} method="POST" encType="multipart/form-data">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name:</label>
                <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Father Name:</label>
                <input type="text" name="fatherName" className="form-control" value={formData.fatherName} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Surname:</label>
                <input type="text" name="surName" className="form-control" value={formData.surName} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Gender:</label>
                <select name="gender" className="form-control" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email:</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone:</label>
                <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Date of Birth:</label>
                <input
                  type="date"
                  name="dob"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                    .toISOString()
                    .split("T")[0]} // ✅ Disables dates below 18 years
                />
                {ErrorMessage && <p className="text-danger">{ErrorMessage}</p>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Age:</label>
                <input type="number" name="age" disabled='true' className="form-control" min="1" value={formData.age} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Native Place:</label>
                <input type="text" name="nativePlace" className="form-control" value={formData.nativePlace} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Nationality:</label>
                <input type="text" name="nationality" className="form-control" value={formData.nationality} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Marital Status:</label>
                <select name="maritalStatus" className="form-control" value={formData.maritalStatus} onChange={handleChange} required>
                  <option value="">Select Status</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option> {/* Fixed Typo */}
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Languages Known:</label>
                <input type="text" name="languagesKnown" className="form-control" value={formData.languagesKnown} onChange={handleChange} required/>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Present Address:</label>
                <textarea name="presentAddress" className="form-control" value={formData.presentAddress} onChange={handleChange} required></textarea>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Permanent Address:</label>
                <textarea name="permanentAddress" className="form-control" value={formData.permanentAddress} onChange={handleChange} required></textarea>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Picture:</label>
                <input
                  type="file"
                  name="candidatePicture"
                  className="form-control"
                  accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                  onChange={handleImageChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Identity Proof: [Any Government Document]</label>
                <input
                  type="file"
                  name="candidateDocuments"
                  className="form-control"
                  accept="image/png, image/jpeg, image/jpg, application/pdf"
                  onChange={handleFileChange}  // Use a different handler if necessary
                  required
                />
              </div>
              {/* Show Image Preview */}
              {imagePreview && (
                <>
                  <div className="col-md-2 mt-5 text-center">
                    <label className="form-label">Preview:</label>
                  </div>
                  <div className="col-md-6 mt-2">
                    <img
                      src={imagePreview} // ✅ Uses preview URL, not file object
                      alt="Selected"
                      className="img-fluid rounded"
                      style={{ maxWidth: "150px", maxHeight: "150px", border: "1px solid #ccc" }}
                    />
                  </div>
                </>
              )}
              <h4 className="mb-3 mt-4">Education Qualifications: </h4>
              <hr id="title-line" className="mb-4" data-symbol="✈" />

              {/* Add Button */}
              <button type="button" className="btn btn-primary mb-3" onClick={addEducationField}>
                <FaPlus /> Add Education
              </button>

              {/* Education Fields */}
              {formData.educationQualification.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3 mb-3 rounded border border-secondary shadow-sm position-relative"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  {/* Expand/Collapse Button */}
                  <button
                    type="button"
                    className="btn btn-light btn-sm position-absolute top-0 start-0 m-1"
                    style={{
                      padding: "2px 6px",
                      fontSize: "12px",
                      backgroundColor: "#f8f9fa",
                      borderColor: "#f8f9fa",
                      color: "#000",
                    }}
                    onClick={() => toggleCollapse(edu.id)}
                  >
                    {collapsedEntries[edu.id] ? <FaChevronDown /> : <FaChevronUp />}
                  </button>

                  {/* Small "X" Button to Remove Entry */}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                    style={{ padding: "2px 6px", fontSize: "12px" }}
                    onClick={() => removeEducationEntry(edu.id)}
                  >
                    <FaTimes />
                  </button>

                  {/* Show Type of Education when collapsed */}
                  {collapsedEntries[edu.id] && (
                    <p className="mt-3 fw-bold text-center">Education: {edu.field || "Not Selected"}</p>
                  )}

                  {/* Show fields only if expanded */}
                  {!collapsedEntries[edu.id] && (
                    <>
                      <div className="row">
                        {/* Education Dropdown */}
                        <div className="col-md-12 mb-3 mt-4">
                          <label className="form-label">Type of Education:</label>
                          <select
                            className="form-control"
                            value={edu.field}
                            required
                            onChange={(e) => handleEducationChange(edu.id, "field", e.target.value)}
                          >
                            <option value="">Select Form</option>
                            <option value="SSC">SSC</option>
                            <option value="HSC">HSC</option>
                            <option value="Graduate">Graduate</option>
                            <option value="PostGraduate">Post Graduate</option>
                            <option value="PhD">Ph.D</option>
                          </select>
                        </div>
                      </div>
                        {/* New Field of Study Input */}
                        {edu.field === "Graduate" || edu.field === "PostGraduate" || edu.field === "PhD" ? (
                          <div className="col-md-12 mb-3">
                            <label className="form-label">Field of Study:</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Field of Study (e.g., Computer Science, Biology)"
                              value={edu.fieldOfStudy}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "fieldOfStudy", e.target.value)}
                            />
                          </div>
                        ) : null}
                      {/* Conditional Fields */}
                      {edu.field === "HSC" || edu.field === "SSC" ? (
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Name of Board:</label>
                            <input
                              type="text"
                              className="form-control"
                              value={edu.nameOfBoard}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "nameOfBoard", e.target.value)}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">School Name:</label>
                            <input
                              type="text"
                              className="form-control"
                              value={edu.schoolName}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "schoolName", e.target.value)}
                            />
                          </div>
                        </div>
                      ) : edu.field === "Graduate" || edu.field === "PostGraduate" ? (
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Name of University:</label>
                            <input
                              type="text"
                              className="form-control"
                              value={edu.nameOfUniversity}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "nameOfUniversity", e.target.value)}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">College Name:</label>
                            <input
                              type="text"
                              className="form-control"
                              value={edu.collegeName}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "collegeName", e.target.value)}
                            />
                          </div>
                        </div>
                      ) : edu.field === "PhD" ? (
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Name of University:</label>
                            <input
                              type="text"
                              className="form-control"
                              value={edu.nameOfUniversity}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "nameOfUniversity", e.target.value)}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Year of Passing:</label>
                            <input
                              type="number"
                              className="form-control"
                              value={edu.yearOfPassing}
                              required
                              onChange={(e) => handleEducationChange(edu.id, "yearOfPassing", e.target.value)}
                            />
                          </div>
                        </div>
                      ) : null}

                      {/* Common Fields */}
                      {(edu.field === "HSC" ||
                        edu.field === "SSC" ||
                        edu.field === "Graduate" ||
                        edu.field === "PostGraduate") && (
                        <>
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Marks Obtained:</label>
                              <input
                                type="number"
                                className="form-control"
                                value={edu.marksObtained}
                                required
                                onChange={(e) => handleEducationChange(edu.id, "marksObtained", e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Out of:</label>
                              <input
                                type="number"
                                className="form-control"
                                value={edu.outOf}
                                required
                                onChange={(e) => handleEducationChange(edu.id, "outOf", e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Percentage:</label>
                              <input type="text" className="form-control" value={edu.percentage} readOnly required />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">No. of Attempts:</label>
                              <input
                                type="number"
                                className="form-control"
                                value={edu.noOfAttempts}
                                required
                                onChange={(e) => handleEducationChange(edu.id, "noOfAttempts", e.target.value)}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Year of Passing:</label>
                              <input
                                type="number"
                                className="form-control"
                                value={edu.yearOfPassing}
                                required
                                onChange={(e) => handleEducationChange(edu.id, "yearOfPassing", e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div className="container">
                <div class="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Position Details:</label>
                    <select
                      name="announcementId"
                      className="form-control"
                      value={formData.announcementId}
                      onChange={(e) => {
                        const selectedAnnouncement = positions.find(job => job.announcementId === e.target.value);
                        setFormData({
                          ...formData,
                          announcementId: e.target.value,
                          position: selectedAnnouncement ? selectedAnnouncement.position : "",
                          departmentId: selectedAnnouncement ? selectedAnnouncement.departmentId : "", // ✅ Store departmentId for server
                          department: selectedAnnouncement ? selectedAnnouncement.departmentName : "" // ✅ Show departmentName to user
                        });
                      }}
                      required
                    >
                      <option value="">Select Position</option>
                      {positions.map((job) => (
                        <option key={job.announcementId} value={job.announcementId}>
                          {job.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department (Auto-filled) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Department:</label>
                    <input type="text" name="department" className="form-control" value={formData.department} disabled />
                  </div>
                    {/* Skills & Expertise (Textbox) */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Skills & Expertise:</label>
                      <input type="text" name="skills" className="form-control" value={formData.skills} onChange={handleChange} required />
                    </div>

                    {/* Specialization (Textbox) */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Specialization:</label>
                      <input type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} required />
                    </div>

                    {/* Availability & Expected Salary (Number Textbox) */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expected Salary:</label>
                      <input type="number" name="salary" className="form-control" value={formData.salary} onChange={handleChange} required />
                    </div>
                  </div>
              </div>

              <h4 className="mb-3 mt-4">Other Information: [Optional]</h4>
                {/* Last Place of Work */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Workplace:</label>
                <input
                  type="text"
                  name="lastWorkPlace"
                  className="form-control"
                  value={formData.lastWorkPlace}
                  onChange={handleChange}
                />
              </div>
              
              {/* Reference Contact */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Reference Contact:</label>
                <input
                  type="text"
                  name="referenceContact"
                  className="form-control"
                  value={formData.referenceContact}
                  onChange={handleChange}
                />
              </div>
              {/* Total Years of Experience */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Total Years of Experience:</label>
                <input
                  type="number"
                  name="totalYearsOfExperience"
                  className="form-control"
                  value={formData.totalYearsOfExperience}
                  min="0"
                  onChange={handleChange}
                />
              </div>
              {/* Years of Experience */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Years at Last Workplace:</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  className="form-control"
                  value={formData.yearsOfExperience}
                  min="0"
                  onChange={handleChange}
                />
              </div>

                {/* Display error message */}
                {TotalYearError && <p className="text-danger">{TotalYearError}</p>}

              {/* addressOfWorkPlace */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Address of Workplace:</label>
                <textarea
                  name="addressOfWorkPlace"
                  className="form-control"
                  rows="3"
                  value={formData.addressOfWorkPlace}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Responsibilities */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Responsibilities:</label>
                <textarea
                  name="responsibilities"
                  className="form-control"
                  rows="3"
                  value={formData.responsibilities}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            {/* Confirmation Checkbox */}
            <div className="form-check mb-4">
              <input type="checkbox" name="confirmInformation" className="form-check-input" checked={formData.confirmInformation} onChange={handleChange} required />
              <label className="form-check-label">
                I declare that the information I have provided is true and accurate to the best of my knowledge.
              </label>
            </div>
            <div className="d-flex justify-content-between w-100 mt-5">
              <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>
                Submit
              </button>
              <button
                type="button"
                className="btn btn-dark px-4"
                onClick={() => {
                  setFormData({
                    // Personal Information
                    firstName: "",
                    fatherName: "",
                    surName: "",
                    email: "",
                    phone: "",
                    dob: "",
                    age: "",
                    nativePlace: "",
                    nationality: "",
                    gender: "",
                    maritalStatus: "",
                    languagesKnown: "",
                    candidateDocuments: null,
                    candidatePicture: null,
                    presentAddress: "",
                    permanentAddress: "",

                    // Education Qualifications (Array)
                    educationQualification: [],

                  // Job Position Details :
                    announcementId:"",
                    position: "",
                    department: "", // Default value
                    skills: "",
                    specialization: "",
                    salary: "",

                    // Other Information
                    lastWorkPlace: "",
                    yearsOfExperience: "",
                    addressOfWorkPlace: "",
                    responsibilities: "",
                    referenceContact: "",
                    totalYearsOfExperience: "",

                    // Confirmation
                    confirmInformation: false,
                  });

                  // Show Snackbar Message
                  enqueueSnackbar("Form data cleared successfully!", { 
                    variant: "info", 
                    autoHideDuration: 3000 
                  });
                }}
              >
                Clear Data
              </button>
              <button 
                className="btn btn-danger px-4" 
                onClick={() => {
                  navigate('/PublicAnnouncement', { replace: true }); // Navigate to announcements
                  window.location.reload(); // Ensure full-page reload to close modal
                }}
              >
                Back to Announcements
              </button>
            </div>
          </form>
          </>
          )}
          {/* Show Loader */}
          {isLoading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Submitting your application...</p>
            </div>
          )}

          {/* Show Success Message */}
          {isSuccess && (
            <div className="text-center my-5">
              <h3 className="text-success fw-bold">Successfully Added as Candidate</h3>
              <p>Check your email for further information.</p>
              <button className="btn btn-primary" onClick={() => navigate('/PublicAnnouncement')}>
                Go to Announcements
              </button>
            </div>
          )}
        </div>
     </div>
    );
  };

  export default JobVacancyForm;
