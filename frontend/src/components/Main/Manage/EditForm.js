import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const UserForm = () => {

  const { id } = useParams(); // Get user ID from URL
  const [departments, setDepartments] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchDepartment, setFetchDepartment] = useState();
  const [fetchUserRole, setFetchUserRole] = useState();
  const [systemAdminExtra, setSystemAdminExtra] = useState(false);
  const navigate = useNavigate();

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
    identityProof: "",
    picture: "",
    presentAddress: "",
    permanentAddress: "",

    // Education Qualifications (Array)
    educationQualification: [],

    // In-Organization Information
    userRoleid: "",
    department: "",
    // userDepartment: "",
    specialization: "",
    userDesignation: "",

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

  const [ErrorMessage, setError] = useState('');
  const addEducationField = () => {
    setFormData((prev) => ({
      ...prev,
      educationQualification: [
        {
          id: Date.now(),
          field: "",
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
        ...prev.educationQualification, // Add new entry at the top
      ],
    }));

    // Show Snackbar confirmation message
    enqueueSnackbar("New entry added successfully!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };

  // Function to handle input changes
  const handleEducationChange = (id, key, value) => {
    setFormData((prev) => ({
      ...prev,
      educationQualification: prev.educationQualification.map((edu) =>
        edu.id === id ? { ...edu, [key]: value } : edu
      ),
    }));

    // Auto-calculate percentage if marks are updated
    if (key === "marksObtained" || key === "outOf") {
      const updatedEdu = formData.educationQualification.find((edu) => edu.id === id);
      if (updatedEdu) {
        const marks = key === "marksObtained" ? value : updatedEdu.marksObtained;
        const total = key === "outOf" ? value : updatedEdu.outOf;
        calculatePercentage(id, marks, total);
      }
    }
  };

  // Function to auto-calculate percentage
  const calculatePercentage = (id, marks, total) => {
    if (marks && total && total > 0) {
      const percentage = ((marks / total) * 100).toFixed(2);
      handleEducationChange(id, "percentage", percentage);
    } else {
      handleEducationChange(id, "percentage", "");
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (name === "dob") {
        // Calculate Age Based on DOB
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18 || isNaN(age)) {
          setError("Age must be 18 or above");
          return { ...prev, [name]: value, age: "" };
        } else {
          setError("");
          return { ...prev, [name]: value, age };
        }
      }

      // Reset extraPermissions when changing role to anything other than "System-Admin"
      if (name === "userRoleid" && value !== "System-Admin") {
        return { ...prev, [name]: value, extraPermissions: false }; // Reset extraPermissions
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch User and UserDetails APIs in parallel
        const [userResponse, userDetailsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/getUserById/${id}`),
          axios.get(`http://localhost:5000/api/users/getUserDetailsById/${id}`)
        ]);
  
        const userData = userResponse.data;
        const userDetailsData = userDetailsResponse.data;
  
        // Define the mapping from role ID to descriptive value
        const roleMapping = {
          "R1": "Super Admin",
          "R2": "System Admin",
          "R3": "HR",
          "R4": "Department-Manager",
          "R5": "Employee"
        };
  
        // Map the fetched userRoleid to the descriptive role value
        const descriptiveRole = roleMapping[userData.userRoleid] || userData.userRoleid;
  
        // If the role is R1, R2, or R3, keep fetchDepartment empty; otherwise, set it from userData
        if (["R1", "R2", "R3"].includes(userData.userRoleid)) {
          setFetchDepartment("");
        } else {
          setFetchDepartment(userData.userDepartment);
        }
        setFetchUserRole(descriptiveRole);
  
        // Split fullName into firstName, fatherName, and surName
        const nameParts = userData.fullName.split(" ");
        const firstName = nameParts[0] || "";
        const fatherName = nameParts.length > 2 ? nameParts[1] : "";
        const surName = nameParts.length > 2 ? nameParts[2] : (nameParts[1] || "");
  
        // Format date of birth if available
        const formattedDOB = userDetailsData.dob
          ? new Date(userDetailsData.dob).toLocaleDateString("en-GB")
          : "";
  
        // Set form data. Notice that department is set directly from userData.
        setFormData({
          // Personal Information
          firstName,
          fatherName,
          surName,
          email: userData.userEmail || "",
          phone: userData.userMobileNumber || "",
          dob: formattedDOB,
          age: userDetailsData.age || "",
          nativePlace: userDetailsData.nativePlace || "",
          nationality: userDetailsData.nationality || "",
          gender: userDetailsData.gender || "",
          maritalStatus: userDetailsData.maritalStatus || "",
          languagesKnown: userDetailsData.languagesKnown.join(", ") || "",
          identityProof: userDetailsData.identityProof || "",
          picture: userDetailsData.picture || "",
          presentAddress: userDetailsData.presentAddress || "",
          permanentAddress: userDetailsData.permanentAddress || "",
  
          // Education Qualifications (Array)
          educationQualification: userDetailsData.educationQualification || [],
  
          // In-Organization Information
          userRoleid: userData.userRoleid || "", // remains as role ID
          department: userData.userDepartment || "", // department value directly from user data
          specialization: userDetailsData.specialization || "",
          userDesignation: userData.userDesignation || "",
  
          // Other Information
          lastWorkPlace: userDetailsData.lastWorkPlace || "",
          yearsOfExperience: userDetailsData.yearsOfExperience || "",
          addressOfWorkPlace: userDetailsData.addressOfWorkPlace || "",
          responsibilities: userDetailsData.responsibilities || "",
          referenceContact: userDetailsData.referenceContact || "",
          totalYearsOfExperience: userDetailsData.totalYearsOfExperience || "",
  
          // Confirmation
          confirmInformation: false
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        setLoading(false);
      }
    };
  
    if (id) fetchUserData();
  }, [id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    // Validate that the confirmation checkbox is checked
    if (!formData.confirmInformation) {
      enqueueSnackbar("Please confirm that the information provided is accurate.", { variant: "warning" });
      return;
    }
  
    // Merge the current formData with the id property.
    const updatedFormData = { ...formData, id };
    console.log(updatedFormData);
    try {
      const response = await fetch("http://localhost:5000/api/users/update", {
        method: "PUT", // Use PUT to match the route method
        credentials: "include", // Ensure cookies/session are sent
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        enqueueSnackbar("User updated successfully!", { variant: "success" });
        console.log("Response:", data);
        navigate(-1); // Navigate back one step in the history
      } else {
        console.error("Error during submission:", data);
        enqueueSnackbar(data.message || "Error updating user!", { variant: "error" });
      }
    } catch (error) {
      console.error("Error during submission:", error);
      enqueueSnackbar("Error updating user!", { variant: "error" });
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/departments/list");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchUserRoles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/rolesList", {
          withCredentials: true,
        });
        setUserRoles(response.data.roles);
        setSystemAdminExtra(response.data.systemAdminExtra);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };

    fetchDepartments();
    fetchUserRoles();
  }, []);

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h3 className="mb-3 text-center">Edit User Form</h3>
        <h4 className="mb-1 mt-4">Personal Information:</h4>
        <hr id="title-line" className="mb-4" data-symbol="✈" />
        <form className="custom-form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name:</label>
              <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Father Name:</label>
              <input type="text" name="fatherName" className="form-control" value={formData.fatherName} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Surname:</label>
              <input type="text" name="surName" className="form-control" value={formData.surName} onChange={handleChange} required />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Email:</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone:</label>
              <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Date of Birth:</label>
              <input
                type="date"
                name="dob"
                className="form-control"
                value={
                  formData.dob
                    ? new Date(formData.dob.split("/").reverse().join("-")).toISOString().split("T")[0]
                    : ""
                } // ✅ Convert "dd/MM/yyyy" back to "yyyy-MM-dd"
                onChange={handleChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]} // ✅ Prevents selection of dates below 18 years
              />

              {ErrorMessage && <p className="text-danger">{ErrorMessage}</p>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Age:</label>
              <input type="number" name="age" disabled='true' className="form-control" min="1" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Native Place:</label>
              <input type="text" name="nativePlace" className="form-control" value={formData.nativePlace} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Nationality:</label>
              <input type="text" name="nationality" className="form-control" value={formData.nationality} onChange={handleChange} required />
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
              <label className="form-label">Marital Status:</label>
              <select name="maritalStatus" className="form-control" value={formData.maritalStatus} onChange={handleChange} required>
                <option value="">Select Status</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
                <option value="Divorsed">Divorsed</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Languages Known:</label>
              <input type="text" name="languagesKnown" className="form-control" value={formData.languagesKnown} onChange={handleChange} required />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Present Address:</label>
              <textarea name="presentAddress" className="form-control" value={formData.presentAddress} onChange={handleChange} required></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Permanent Address:</label>
              <textarea name="permanentAddress" className="form-control" value={formData.permanentAddress} onChange={handleChange} required></textarea>
            </div>

            <h4 className="mb-1 mt-4">Education Qualifications: </h4>
            <hr id="title-line" className="mb-4" data-symbol="✈" />

            {/* Add Button */}
            <button type="button" className="btn btn-primary mb-3" onClick={addEducationField}>
              <FaPlus /> Add Education
            </button>
            {/* Education Fields */}
            {formData.educationQualification.map((edu) => (
              <div
                key={edu.id}
                className="p-3 mb-3 rounded border border-secondary shadow-sm"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                {/* Education Dropdown */}
                <label className="form-label">Type of Education:</label>
                <select
                  className="form-control"
                  value={edu.field}
                  required
                  onChange={(e) => handleEducationChange(edu.id, "field", e.target.value)}
                >
                  <option value="">Select Form</option>
                  <option value="PhD">Ph.D</option>
                  <option value="PostGraduate">Post Graduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="HSC">HSC</option>
                  <option value="SSC">SSC</option>
                </select>

                {/* Conditionally render fields based on selection */}
                {edu.field === "HSC" || edu.field === "SSC" ? (
                  <>
                    <label className="form-label mt-2">Name of Board:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.nameOfBoard}
                      required
                      onChange={(e) => handleEducationChange(edu.id, "nameOfBoard", e.target.value)}
                    />

                    <label className="form-label mt-2">School Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.schoolName}
                      required
                      onChange={(e) => handleEducationChange(edu.id, "schoolName", e.target.value)}
                    />
                  </>
                ) : edu.field === "Graduate" || edu.field === "PostGraduate" ? (
                  <>
                    <label className="form-label mt-2">Name of University:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.nameOfUniversity}
                      required
                      onChange={(e) => handleEducationChange(edu.id, "nameOfUniversity", e.target.value)}
                    />

                    <label className="form-label mt-2">College Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.collegeName}
                      required
                      onChange={(e) => handleEducationChange(edu.id, "collegeName", e.target.value)}
                    />
                  </>
                ) : edu.field === "PhD" ? (
                  <>
                    <label className="form-label mt-2">Name of University:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edu.nameOfUniversity}
                      required
                      onChange={(e) => handleEducationChange(edu.id, "nameOfUniversity", e.target.value)}
                    />
                  </>
                ) : null}

                {/* Common Fields */}
                {(edu.field === "HSC" ||
                  edu.field === "SSC" ||
                  edu.field === "Graduate" ||
                  edu.field === "PostGraduate") && (
                    <>
                      <label className="form-label mt-2">Marks Obtained:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={edu.marksObtained}
                        required
                        onChange={(e) => handleEducationChange(edu.id, "marksObtained", e.target.value)}
                      />

                      <label className="form-label mt-2">Out of:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={edu.outOf}
                        required
                        onChange={(e) => handleEducationChange(edu.id, "outOf", e.target.value)}
                      />

                      <label className="form-label mt-2">Percentage:</label>
                      <input type="text" className="form-control" value={edu.percentage} readOnly required />

                      <label className="form-label mt-2">No. of Attempts:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={edu.noOfAttempts}
                        required
                        onChange={(e) => handleEducationChange(edu.id, "noOfAttempts", e.target.value)}
                      />
                    </>
                  )}

                {/* Common Year of Passing Field */}
                {edu.field && (
                  <>
                    <label className="form-label mt-2">Year of Passing:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={edu.yearOfPassing}
                      required
                      onChange={(e) => handleEducationChange(edu.id, "yearOfPassing", e.target.value)}
                    />
                  </>
                )}
              </div>
            ))}
            <h4 className="mb-1 mt-4">In-organization Information:</h4>
            <hr id="title-line" className="mb-4" data-symbol="✈" />
            <div className="col-md-6 mb-3">
              <label className="form-label">User Role: {fetchUserRole} <span style={{ color: "red" }}>*</span></label>
              <select
                name="userRoleid"
                className="form-control"
                value={formData.userRoleid}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    userRoleid: selectedRole,
                    department: selectedRole === "Department-Manager" || selectedRole === "Employee"
                      ? prev.department // Keep the selected department if applicable
                      : selectedRole === "HR"
                      ? "HRManager"
                      : "SystemAdmin", 
                  }));
                }}
                required
              >
                <option value="">Select Role</option>
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditionally Show "Give Permission to Add System-Admin" Dropdown */}
            {systemAdminExtra && formData.userRoleid === "System-Admin" && (
              <div className="col-md-6 mb-3">
                <label className="form-label">Give Permission to Add System-Admin:</label>
                <select
                  className="form-control"
                  value={formData.extraPermissions}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, extraPermissions: e.target.value === "true" }))
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            )}

            {/* Conditionally show department dropdown only for Department-Manager & Employee */}
            {(formData.userRoleid === "Department-Manager" || formData.userRoleid === "Employee") && (
              <div className="col-md-6 mb-3">
                <label className="form-label">Department: {fetchDepartment}</label>
                <select
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.departmentName}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-6 mb-3">
              <label className="form-label">Specialization:</label>
              <input type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">User Designation:</label>
              <input type="text" name="userDesignation" className="form-control" value={formData.userDesignation} onChange={handleChange} required />
            </div>
            <h4 className="mb-1 mt-4">Other Information: [Optional]</h4>
            <hr id="title-line" className="mb-4" data-symbol="✈" />
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

            {/* Years of Experience */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Years of Experience:</label>
              <input
                type="number"
                name="yearsOfExperience"
                className="form-control"
                value={formData.yearsOfExperience}
                onChange={handleChange}
              />
            </div>

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
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="form-check mb-4">
            <input type="checkbox" name="confirmInformation" className="form-check-input" checked={formData.confirmInformation} onChange={handleChange} />
            <label className="form-check-label">
              I confirm that all the information provided is an accurate depiction of a real person and complies with our policies.
            </label>
          </div>
          <div className="d-flex justify-content-between w-100 mt-5">
            <button type="button" className="btn btn-danger px-8" onClick={() => window.history.back()}>
              Go Back
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-dark px-4"
              onClick={() =>
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
                  identityProof: "",
                  picture: "",
                  presentAddress: "",
                  permanentAddress: "",

                  // Education Qualifications (Array)
                  educationQualification: [],

                  // In-Organization Information
                  userRoleid: "",
                  department: "",
                  specialization: "",
                  userDesignation: "",

                  // Other Information
                  lastWorkPlace: "",
                  yearsOfExperience: "",
                  addressOfWorkPlace: "",
                  responsibilities: "",
                  referenceContact: "",
                  totalYearsOfExperience: "",

                  // Confirmation
                  confirmInformation: false,
                })
              }
            >
              Clear Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
