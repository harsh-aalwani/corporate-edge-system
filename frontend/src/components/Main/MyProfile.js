import React, { useState, useEffect } from "react";
import { enqueueSnackbar } from 'notistack';
import { removeUserRoleCookie } from '../../utils/cookieHelper';


const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const hiddenFields = ["userId", "userRoleid", "userStatus", "createdAt"];
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showDocModal, setShowDocModal] = useState(false);
  const [docPassword, setDocPassword] = useState("");
  const [docError, setDocError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userData?.picture) {
      setPreviewImage(`/uploads/${userData.picture}`);
    }
  }, [userData]);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.data) {
            setUserData(data.data);
          } else {
            console.error("Profile data is missing.");
          }
        } else {
          console.error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleImageClick = () => {
    setPreviewImage(`http://localhost:5000/${userData.picture}`);
    setShowImageModal(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !userData) {
      enqueueSnackbar("Please select an image first", { variant: "warning" });
      return;
    }
  
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append("picture", selectedImage);
  
    try {
      const response = await fetch(`http://localhost:5000/api/users/update-profile-picture/${userData.userId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Update userData with the new image
        const updatedImageUrl = `http://localhost:5000/${userData.picture}?timestamp=${new Date().getTime()}`;
        setPreviewImage(updatedImageUrl);
        setUserData((prev) => ({ ...prev, picture: data.picture }));
        enqueueSnackbar("Profile picture updated successfully", { variant: "success" });
        console.log("Response Data:", data);
      } else {
        enqueueSnackbar(data.message || "Failed to update profile picture", { variant: "error" });
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      enqueueSnackbar("An error occurred while updating your profile picture.", { variant: "error" });
    } finally {
      setIsUploading(false);
    }
  };
  


  const handleLogoutBackend = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        removeUserRoleCookie();
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.message || 'Failed to log out', { variant: 'error' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      enqueueSnackbar('An error occurred during logout', { variant: 'error' });
    } finally {
      setIsLoggingOut(false);
    }
  };

	const handleChangePassword = async () => {
	  if (newPassword !== confirmPassword) {
		setError("New password and confirm password do not match.");
		return;
	  }

	  setError("");
	  try {
		const response = await fetch("http://localhost:5000/api/users/change-password", {
		  method: "POST",
		  headers: {
			"Content-Type": "application/json",
		  },
		  credentials: "include",
		  body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
		});

		const data = await response.json(); // ✅ Get backend response

		if (response.ok) {
		  enqueueSnackbar("Password changed successfully. Logging out...", { variant: "success" });
		  handleLogoutBackend();
		  setShowModal(false);
		  // Clear password fields
		  setCurrentPassword("");
		  setNewPassword("");
		  setConfirmPassword("");

		  window.location.href = "/login";
		} else {
		  // ✅ Show backend error message if available
		  enqueueSnackbar(data.message || "Failed to change password. Please try again.", { variant: "error" });
		  console.error("Backend Error:", data);
		}
	  } catch (error) {
		console.error("❌ Network Error Changing Password:", error);
		enqueueSnackbar("Network error. Please check your connection and try again.", { variant: "error" });
	  }
	};

  const handleDocPasswordSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: docPassword }), // ✅ Remove userId (session handles it)
        credentials: "include", // ✅ Ensure session cookies are sent
      });

      const data = await response.json();
      console.log("🔍 Server Response:", data);

      if (response.ok && data.success) {
        setIsVerified(true);
        setShowDocModal(false);
        enqueueSnackbar("Access granted! You can now view the document.", { variant: "success" });
      } else {
        console.log("❌ Password verification failed:", data.message);
        setDocError("Sorry, you can't access it. Incorrect password.");
      }
    } catch (error) {
      console.error("❌ Error verifying password:", error);
      setDocError("An error occurred. Please try again.");
    }
  };

  if (!userData) {
    return <p>Loading profile...</p>;
  }

  const rolesWithoutDepartment = ["SystemAdmin", "HR", "SuperAdmin"];
  const shouldShowDepartment = !rolesWithoutDepartment.includes(userData.userDepartment);


  return (
    <>
      <style>{`
        .my-profile-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .profile-card {
          display: flex;
          flex-direction: column;
          width: 80%;
          max-width: 1000px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
        }

        .profile-card:hover {
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          transform: scale(1.02);
        }

        .profile-picture {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          margin-right: 20px;
          transition: transform 0.3s ease-in-out;
        }

        .profile-picture:hover {
          transform: scale(1.1);
        }

        .profile-header {
          display: flex;
          padding: 20px;
          border-bottom: 1px solid #ddd;
        }
        .profile-picture {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          margin-right: 20px;
        }
        .profile-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .profile-sections {
          padding: 20px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          color: #007bff;
          border-bottom: 2px solid #007bff;
          padding-bottom: 5px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .profile-item {
          display: flex;
          flex-direction: column;
        }
        .profile-item label {
          font-weight: bold;
          font-size: 14px;
          color: #555;
        }
        .profile-item input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          background: #f9f9f9;
        }
        .view-doc-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: #f9f9f9;
        }
        .view-doc-btn {
          font-size: 14px;
          color: #007bff;
          text-decoration: none;
          margin-left: 10px;
        }
          .modal {
          display: ${showModal ? "block" : "none"};
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          width: 350px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        .close {
          color: red;
          float: right;
          font-size: 24px;
          cursor: pointer;
        }
        .modal-body input {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          display: block;
        }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .modal-footer button {
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
        }
        .error {
          color: red;
          margin-top: 5px;
        }
          .update-btn {
          background-color: #007bff;
          color: white;
        }
        .profile-picture-preview {
          width: 150px;
          height: 150px;
          display: flex;
          justify-content: center;
          margin-top: 15px;
          object-fit: cover;
          margin-right: 20px;
        }
          .profile-item label {
          font-weight: bold;
          font-size: 14px;
          color: #555;
        }
        .profile-item input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          background: #f9f9f9; 
        }
      `}</style>
      <div className="my-profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <img className="profile-picture" src={`http://localhost:5000/${userData.picture}`} alt="Profile" onClick={handleImageClick} />

            <div className="profile-info">
              <h4>{userData.fullName}</h4>
              <p>{userData.userEmail}</p>
              <button onClick={() => setShowModal(true)}>Change Password</button>
            </div>
          </div>
          <div className="profile-sections">
            <h4 className="section-title">Personal Details</h4>
            <div className="profile-grid">
              {["dob", "age", "gender", "maritalStatus", "nativePlace", "nationality", "languagesKnown", "userDesignation"].map(
                (key) =>
                  !hiddenFields.includes(key) && (
                    <div className="profile-item" key={key}>
                      <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</label>
                      <input
                        type="text"
                        value={
                          key === "dob"
                            ? new Date(userData[key]).toLocaleDateString("en-GB")
                            : userData[key] || "N/A"
                        }
                        disabled
                      />
                    </div>
                  )
              )}
            </div>
            {shouldShowDepartment && (
              <>
                <h4 className="section-title">Organizational Details</h4>
                <div className="profile-grid">
                  {["userDepartment"].map(
                    (key) =>
                      userData[key] && (
                        <div className="profile-item" key={key}>
                          <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</label>
                          <input type="text" value={userData[key]} disabled />
                        </div>
                      )
                  )}
                </div>
              </>
            )}
            <h4 className="section-title">Other Details</h4>
            {userData.identityProof && (
              <div className="profile-grid">
                <div className="profile-item">
                  <label>Identity Proof:</label>
                  <div className="view-doc-input">
                    <input type="text" value="Available" disabled />
                    {!isVerified ? (
                      <button onClick={() => setShowDocModal(true)} className="view-doc-btn">
                        View Document
                      </button>
                    ) : (
                      <a href={`http://localhost:5000/${userData.identityProof}`} target="_blank" rel="noopener noreferrer" className="view-doc-btn">
                        Open Document
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="profile-grid">
              {["presentAddress", "permanentAddress"].map(
                (key) =>
                  !hiddenFields.includes(key) && (
                    <div className="profile-item" key={key}>
                      <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</label>
                      <input type="text" value={userData[key] || "N/A"} disabled />
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {/* <span className="close" onClick={() => setShowModal(false)}>&times;</span> */}
            <h3>Change Password</h3>
            <div className="modal-body">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button
                disabled={!currentPassword || !newPassword || !confirmPassword}
                onClick={handleChangePassword}
              >
                Change Password
              </button>
              <button className='btn btn-danger' onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {showImageModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Profile Picture</h3>
            <img src={previewImage} alt="Preview" className="profile-picture-preview" />
            <hr />
            <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
            <div className="modal-footer">
              <button onClick={handleImageUpload}>Update Image</button>
              <button className="btn btn-danger" onClick={() => setShowImageModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showDocModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Enter Password</h3>
            <div className="modal-body">
              <input
                type="password"
                placeholder="Enter your password"
                value={docPassword}
                onChange={(e) => setDocPassword(e.target.value)}
              />
              {docError && <p className="error">{docError}</p>}
            </div>
            <div className="modal-footer">
              <button onClick={handleDocPasswordSubmit}>Submit</button>

              <button className="btn btn-danger" onClick={() => setShowDocModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProfile;
