import React, { useState } from "react";
import "../../../assets/css/Main/EditForm.css"; // Updated CSS file name

const EditForm = () => {
  const [user, setUser] = useState({
    UserType: "Employee",
    FullName: "",
    Email: "",
    Password: "",
    MobileNumber: "",
    department: "",
    UserIdProof: null, // Added field for ID proof
  });

  const UserTypes = ["Employee", "HR", "Manager", "Admin"];
  const departments = ["HR", "Engineering", "Marketing", "Finance", "Sales"];

  const handleChange = (e) => {
    if (e.target.name === "UserIdProof") {
      setUser({ ...user, UserIdProof: e.target.files[0] });
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User Data Submitted: ", user);
    // API call can be made here
  };

  return (
    <div className="edit-user-bg-gradient">
      <div className="edit-user-container">
        <h2 className="edit-user-title">Edit User</h2>
        <form onSubmit={handleSubmit} className="edit-user-form">
          {Object.keys(user).map((key) => (
            <div key={key}>
              <label className="edit-user-label">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              {key === "UserType" ? (
                <select
                  name={key}
                  value={user[key]}
                  onChange={handleChange}
                  className="edit-user-select"
                >
                  {UserTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : key === "department" ? (
                <select
                  name={key}
                  value={user[key]}
                  onChange={handleChange}
                  className="edit-user-select"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              ) : key === "UserIdProof" ? (
                <input
                  type="file"
                  name={key}
                  onChange={handleChange}
                  className="edit-user-input"
                  accept=".jpg, .jpeg, .png, .pdf"
                  required
                />
              ) : (
                <input
                  type={key === "Password" ? "password" : key === "Email" ? "email" : "text"}
                  name={key}
                  value={user[key]}
                  onChange={handleChange}
                  className="edit-user-input"
                  required
                />
              )}
            </div>
          ))}
          {user.UserIdProof && (
            <p className="edit-user-file-name">Selected File: {user.UserIdProof.name}</p>
          )}
          <button type="submit" className="edit-user-button mt-4">
            Edit User
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditForm;
