import { useEffect, useState } from "react";
import { FaPlus, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
  const [departments, setDepartments] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [systemAdminExtra, setSystemAdminExtra] = useState(false);
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
    identityProof: null,
    picture: null,
    presentAddress: "",
    permanentAddress: "",

    // Education Qualifications (Array)
    educationQualification: [],

    // In-Organization Information
    userRoleid: "",
    extraPermissions: false,
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
  });
  const navigate = useNavigate();

  const [ErrorMessage, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState({
    firstName: "",
    fatherName: "",
    surName: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [languagesError, setLanguagesError] = useState("");
  const [specializationError, setSpecializationError] = useState("");
  const [designationError, setDesignationError] = useState("");
  const [collapsedEntries, setCollapsedEntries] = useState({});
  const hasErrors =
    !!ErrorMessage ||
    !!emailError ||
    !!phoneError ||
    !!languagesError ||
    !!specializationError ||
    !!designationError ||
    !!nameError.firstName ||
    !!nameError.fatherName ||
    !!nameError.surName;

  const toggleCollapse = (id) => {
    setCollapsedEntries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Function to add a new education entry
  const addEducationField = () => {
    setFormData((prev) => ({
      ...prev,
      educationQualification: [
        ...prev.educationQualification,
        {
          id: Date.now(),
          field: "",
          fieldOfStudy: "",
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

    enqueueSnackbar(
      `New education entry added! Total entries: ${
        formData.educationQualification.length + 1
      }`,
      {
        variant: "success",
        autoHideDuration: 3000,
      }
    );
  };

  // Remove Education Entry
  const removeEducationEntry = (id) => {
    setFormData((prev) => ({
      ...prev,
      educationQualification: prev.educationQualification.filter(
        (edu) => edu.id !== id
      ),
    }));

    enqueueSnackbar(
      `Education entry removed successfully! Total entries: ${
        formData.educationQualification.length - 1
      }`,
      {
        variant: "error",
        autoHideDuration: 3000,
      }
    );
  };

  // Function to handle education input changes
  const handleEducationChange = (id, key, value) => {
    setFormData((prev) => {
      const updatedEducation = prev.educationQualification.map((edu) =>
        edu.id === id ? { ...edu, [key]: value } : edu
      );

      const edu = updatedEducation.find((edu) => edu.id === id);
      if (edu.marksObtained && edu.outOf && edu.outOf > 0) {
        edu.percentage = ((edu.marksObtained / edu.outOf) * 100).toFixed(2);
      }

      return { ...prev, educationQualification: updatedEducation };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar(
        "Only JPG, JPEG, PNG, WEBP, and GIF images are allowed!",
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
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

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    setFormData((prev) => ({
      ...prev,
      picture: file,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar(
        "Only JPG, JPEG, PNG, WEBP, GIF, and PDF files are allowed!",
        {
          variant: "error",
          autoHideDuration: 3000,
        }
      );
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

    setFormData((prev) => ({ ...prev, identityProof: file }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(value)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
    if (name === "firstName" || name === "fatherName" || name === "surName") {
      const nameRegex = /^[A-Za-z\s]*$/;
      if (!nameRegex.test(value)) {
        setNameError((prev) => ({
          ...prev,
          [name]: "Only alphabetic characters and spaces are allowed.",
        }));
        return;
      } else {
        setNameError((prev) => ({ ...prev, [name]: "" }));
      }
    }
    if (name === "phone") {
      const phoneRegex = /^\d*$/;
      if (!phoneRegex.test(value)) {
        setPhoneError("Phone number must contain digits only.");
        return;
      } else {
        setPhoneError("");
      }
    }
    if (name === "languagesKnown") {
      const languagesRegex = /^[A-Za-z\s,().\/-]*$/;
      if (!languagesRegex.test(value)) {
        setLanguagesError("Only letters, spaces, and , . / - ( ) allowed.");
        return;
      } else {
        setLanguagesError("");
      }
    }

    if (name === "specialization") {
      const specRegex = /^[A-Za-z\s,().\/-]*$/;
      if (!specRegex.test(value)) {
        setSpecializationError(
          "Only letters, spaces, and , . / - ( ) allowed."
        );
        return;
      } else {
        setSpecializationError("");
      }
    }

    if (name === "userDesignation") {
      const desigRegex = /^[A-Za-z\s,().\/-]*$/;
      if (!desigRegex.test(value)) {
        setDesignationError("Only letters, spaces, and , . / - ( ) allowed.");
        return;
      } else {
        setDesignationError("");
      }
    }

    setFormData((prev) => {
      if (name === "dob") {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
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

      if (name === "userRoleid" && value !== "System-Admin") {
        return { ...prev, [name]: value, extraPermissions: false };
      }

      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      enqueueSnackbar("Please correct errors in the form before submitting.", {
        variant: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    try {
      const formDataToServer = new FormData();
      formDataToServer.append("userEmail", formData.email);
      formDataToServer.append(
        "fullName",
        `${formData.firstName} ${formData.fatherName} ${formData.surName}`.trim()
      );
      formDataToServer.append("userMobileNumber", formData.phone);
      formDataToServer.append("userStatus", false);
      formDataToServer.append("userRoleid", formData.userRoleid);
      formDataToServer.append("userDepartment", formData.department);
      formDataToServer.append(
        "userPermissions[SystemAdminExtra]",
        formData.extraPermissions || false
      );
      formDataToServer.append("createdAt", new Date().toISOString());

      formDataToServer.append("dob", formData.dob);
      formDataToServer.append("age", formData.age);
      formDataToServer.append("nativePlace", formData.nativePlace);
      formDataToServer.append("nationality", formData.nationality);
      formDataToServer.append("gender", formData.gender);
      formDataToServer.append("maritalStatus", formData.maritalStatus);
      formDataToServer.append("languagesKnown", formData.languagesKnown);
      formDataToServer.append("identityProof", formData.identityProof);
      formDataToServer.append("picture", formData.picture);
      formDataToServer.append("presentAddress", formData.presentAddress);
      formDataToServer.append("permanentAddress", formData.permanentAddress);
      formDataToServer.append(
        "educationQualification",
        JSON.stringify(formData.educationQualification)
      );
      formDataToServer.append("specialization", formData.specialization);
      formDataToServer.append("userDesignation", formData.userDesignation);
      formDataToServer.append("lastWorkPlace", formData.lastWorkPlace);
      formDataToServer.append("yearsOfExperience", formData.yearsOfExperience);
      formDataToServer.append(
        "addressOfWorkPlace",
        formData.addressOfWorkPlace
      );
      formDataToServer.append("responsibilities", formData.responsibilities);
      formDataToServer.append("referenceContact", formData.referenceContact);
      formDataToServer.append(
        "totalYearsOfExperience",
        formData.totalYearsOfExperience
      );

      const response = await axios.post(
        "http://localhost:5000/api/users/createUserWithDetails",
        formDataToServer,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        enqueueSnackbar("User created successfully!", { variant: "success" });
        navigate(-1);
      } else {
        throw new Error("Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);

      if (error.response) {
        enqueueSnackbar(
          error.response.data.message || "An unexpected error occurred.",
          {
            variant: "error",
          }
        );
      } else {
        enqueueSnackbar("Error creating user. Please try again.", {
          variant: "error",
        });
      }
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/departments/list"
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    const fetchUserRoles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/rolesList",
          {
            withCredentials: true,
          }
        );
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
        <h3 className="mb-3 text-center">Add New-User Form</h3>
        <h4 className="mb-1 mt-4">Personal Information:</h4>
        <hr id="title-line" className="mb-4" data-symbol="✈" />
        <form
          className="custom-form"
          onSubmit={handleSubmit}
          method="POST"
          encType="multipart/form-data"
        >
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name:</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              {nameError.firstName && (
                <p className="text-danger">{nameError.firstName}</p>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Father Name:</label>
              <input
                type="text"
                name="fatherName"
                className="form-control"
                value={formData.fatherName}
                onChange={handleChange}
                required
              />
              {nameError.fatherName && (
                <p className="text-danger">{nameError.fatherName}</p>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Surname:</label>
              <input
                type="text"
                name="surName"
                className="form-control"
                value={formData.surName}
                onChange={handleChange}
                required
              />
              {nameError.surName && (
                <p className="text-danger">{nameError.surName}</p>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Gender:</label>
              <select
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email:</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                pattern="^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$"
              />
              {emailError && <p className="text-danger">{emailError}</p>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone:</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {phoneError && <p className="text-danger">{phoneError}</p>}
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
                max={
                  new Date(
                    new Date().getFullYear() - 18,
                    new Date().getMonth(),
                    new Date().getDate()
                  )
                    .toISOString()
                    .split("T")[0]
                }
              />

              {ErrorMessage && <p className="text-danger">{ErrorMessage}</p>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Age:</label>
              <input
                type="number"
                name="age"
                disabled
                className="form-control"
                min="1"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Native Place:</label>
              <input
                type="text"
                name="nativePlace"
                className="form-control"
                value={formData.nativePlace}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Nationality:</label>
              <input
                type="text"
                name="nationality"
                className="form-control"
                value={formData.nationality}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Marital Status:</label>
              <select
                name="maritalStatus"
                className="form-control"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Languages Known:</label>
              <input
                type="text"
                name="languagesKnown"
                className="form-control"
                value={formData.languagesKnown}
                onChange={handleChange}
                required
              />
              {languagesError && (
                <p className="text-danger">{languagesError}</p>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Present Address:</label>
              <textarea
                name="presentAddress"
                className="form-control"
                value={formData.presentAddress}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Permanent Address:</label>
              <textarea
                name="permanentAddress"
                className="form-control"
                value={formData.permanentAddress}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Picture:</label>
              <input
                type="file"
                name="picture"
                className="form-control"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={handleImageChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Identity Proof: [Any Government Document]
              </label>
              <input
                type="file"
                name="identityProof"
                className="form-control"
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            {imagePreview && (
              <>
                <div className="col-md-2 mt-5 text-center">
                  <label className="form-label">Preview:</label>
                </div>
                <div className="col-md-6 mt-2">
                  <img
                    src={imagePreview}
                    alt="Selected"
                    className="img-fluid rounded"
                    style={{
                      maxWidth: "150px",
                      maxHeight: "150px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              </>
            )}
            <h4 className="mb-1 mt-4">Education Qualifications: </h4>
            <hr id="title-line" className="mb-4" data-symbol="✈" />
            <button
              type="button"
              className="btn btn-primary mb-3"
              onClick={addEducationField}
            >
              <FaPlus /> Add Education
            </button>
            {formData.educationQualification.map((edu) => (
              <div
                key={edu.id}
                className="p-3 mb-3 rounded border border-secondary shadow-sm position-relative"
                style={{ backgroundColor: "#f8f9fa" }}
              >
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
                  {collapsedEntries[edu.id] ? (
                    <FaChevronDown />
                  ) : (
                    <FaChevronUp />
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                  style={{ padding: "2px 6px", fontSize: "12px" }}
                  onClick={() => removeEducationEntry(edu.id)}
                >
                  <FaTimes />
                </button>
                {collapsedEntries[edu.id] && (
                  <p className="mt-3 fw-bold text-center">
                    Education: {edu.field || "Not Selected"}
                  </p>
                )}
                {!collapsedEntries[edu.id] && (
                  <>
                    <div className="row">
                      <div className="col-md-12 mb-3 mt-4">
                        <label className="form-label">Type of Education:</label>
                        <select
                          className="form-control"
                          value={edu.field}
                          required
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "field",
                              e.target.value
                            )
                          }
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
                    {edu.field === "Graduate" ||
                    edu.field === "PostGraduate" ||
                    edu.field === "PhD" ? (
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Field of Study:</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Field of Study (e.g., Computer Science, Biology)"
                          value={edu.fieldOfStudy}
                          required
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              "fieldOfStudy",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    ) : null}
                    {edu.field === "HSC" || edu.field === "SSC" ? (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Name of Board:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={edu.nameOfBoard}
                            required
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "nameOfBoard",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">School Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={edu.schoolName}
                            required
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "schoolName",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : edu.field === "Graduate" ||
                      edu.field === "PostGraduate" ? (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Name of University:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={edu.nameOfUniversity}
                            required
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "nameOfUniversity",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">College Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={edu.collegeName}
                            required
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "collegeName",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : edu.field === "PhD" ? (
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Name of University:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={edu.nameOfUniversity}
                            required
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "nameOfUniversity",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Year of Passing:</label>
                          <input
                            type="number"
                            className="form-control"
                            value={edu.yearOfPassing}
                            required
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                "yearOfPassing",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                    {(edu.field === "HSC" ||
                      edu.field === "SSC" ||
                      edu.field === "Graduate" ||
                      edu.field === "PostGraduate") && (
                      <>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Marks Obtained:
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={edu.marksObtained}
                              required
                              onChange={(e) =>
                                handleEducationChange(
                                  edu.id,
                                  "marksObtained",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Out of:</label>
                            <input
                              type="number"
                              className="form-control"
                              value={edu.outOf}
                              required
                              onChange={(e) =>
                                handleEducationChange(
                                  edu.id,
                                  "outOf",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">Percentage:</label>
                            <input
                              type="text"
                              className="form-control"
                              value={edu.percentage}
                              readOnly
                              required
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              No. of Attempts:
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={edu.noOfAttempts}
                              required
                              onChange={(e) =>
                                handleEducationChange(
                                  edu.id,
                                  "noOfAttempts",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Year of Passing:
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={edu.yearOfPassing}
                              required
                              onChange={(e) =>
                                handleEducationChange(
                                  edu.id,
                                  "yearOfPassing",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
            <h4 className="mb-1 mt-4">In-organization Information:</h4>
            <hr id="title-line" className="mb-4" data-symbol="✈" />
            <div className="col-md-6 mb-3">
              <label className="form-label">User Role:</label>
              <select
                name="userRoleid"
                className="form-control"
                value={formData.userRoleid}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    userRoleid: selectedRole,
                    department:
                      selectedRole === "Department-Manager" ||
                      selectedRole === "Employee"
                        ? prev.department
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
            {systemAdminExtra && formData.userRoleid === "System-Admin" && (
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Give Permission to Add System-Admin:
                </label>
                <select
                  className="form-control"
                  value={formData.extraPermissions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      extraPermissions: e.target.value === "true",
                    }))
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            )}
            {(formData.userRoleid === "Department-Manager" ||
              formData.userRoleid === "Employee") && (
              <div className="col-md-6 mb-3">
                <label className="form-label">Department:</label>
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
              <input
                type="text"
                name="specialization"
                className="form-control"
                value={formData.specialization}
                onChange={handleChange}
                required
              />
              {specializationError && (
                <p className="text-danger">{specializationError}</p>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">User Designation:</label>
              <input
                type="text"
                name="userDesignation"
                className="form-control"
                value={formData.userDesignation}
                onChange={handleChange}
                required
              />
              {designationError && (
                <p className="text-danger">{designationError}</p>
              )}
            </div>
            <h4 className="mb-1 mt-4">Other Information: [Optional]</h4>
            <hr id="title-line" className="mb-4" data-symbol="✈" />
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
          <div className="form-check mb-4">
            <input
              type="checkbox"
              name="confirmInformation"
              className="form-check-input"
              checked={formData.confirmInformation}
              onChange={handleChange}
              required
            />
            <label className="form-check-label">
              I confirm that all the information provided is an accurate
              depiction of a real person and complies with our policies.
            </label>
          </div>
          <div className="d-flex justify-content-between w-100 mt-5">
            <button
              type="button"
              className="btn btn-danger px-8"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={hasErrors}
            >
              Submit
            </button>

            <button
              type="button"
              className="btn btn-dark px-4"
              onClick={() => {
                setFormData({
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
                  educationQualification: [],
                  userRoleid: "",
                  extraPermissions: false,
                  department: "",
                  specialization: "",
                  userDesignation: "",
                  lastWorkPlace: "",
                  yearsOfExperience: "",
                  addressOfWorkPlace: "",
                  responsibilities: "",
                  referenceContact: "",
                  totalYearsOfExperience: "",
                  confirmInformation: false,
                });

                enqueueSnackbar("Form data cleared successfully!", {
                  variant: "info",
                  autoHideDuration: 3000,
                });
              }}
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
