import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../assets/css/FormsCss/form.css";

const AddEmployeeConcern = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    complaintTitle: "",
    complaintDescription: "",
    departmentid: "",
    departmentManagerName: "",
    relatedDocuments: "",
    status: "Pending",
    comments: "",
    approvedByManager: false,
    approvedByHR: false,
  });

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/departments/list");
        setDepartments(response.data);
      } catch (error) {
        enqueueSnackbar("Failed to fetch departments", { variant: "error" });
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = departments.find(dept => dept.departmentid === e.target.value);
    if (selectedDepartment) {
      setFormData(prevState => ({
        ...prevState,
        departmentid: selectedDepartment.departmentid,
        departmentManagerName: selectedDepartment.managerName || "Unknown"
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, relatedDocuments: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.departmentid || !formData.complaintTitle || !formData.complaintDescription) {
      enqueueSnackbar("All fields are required!", { variant: "error" });
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      await axios.post("http://localhost:5000/api/employee-concerns/create", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      enqueueSnackbar("Concern Request Sent Successfully!", { variant: "success" });
      setFormData({
        complaintTitle: "",
        complaintDescription: "",
        departmentid: "",
        departmentManagerName: "",
        relatedDocuments: "",
        status: "Pending",
        comments: "",
        approvedByManager: false,
        approvedByHR: false,
      });
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || "Failed to add concern", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">Add Employee Concern</h4>
        <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group full-width">
            <label className="form-label">Title:</label>
            <input type="text" name="complaintTitle" className="form-control" value={formData.complaintTitle} onChange={handleChange} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Description:</label>
            <textarea name="complaintDescription" className="form-control" value={formData.complaintDescription} onChange={handleChange} rows="4" />
          </div>
          <div className="form-group">
            <label className="form-label">Department:</label>
            <select name="departmentid" className="form-control" value={formData.departmentid} onChange={handleDepartmentChange}>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentid} value={dept.departmentid}>{dept.departmentName}</option>
              ))}
            </select>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Upload Related Documents:</label>
            <input type="file" name="relatedDocuments" className="form-control" onChange={handleFileChange} />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Comments:</label>
            <textarea name="comments" className="form-control" value={formData.comments} onChange={handleChange} />
          </div>
          <div className="d-flex justify-content-between w-100 mt-4">
            <button type="button" className="btn btn-danger px-4" onClick={() => navigate(-1)}>Go Back</button>
            <button type="submit" className="btn btn-primary px-4" disabled={isLoading}>Send Request</button>
            <button type="button" className="btn btn-dark px-4" onClick={() => setFormData({
              complaintTitle: "",
              complaintDescription: "",
              departmentid: "",
              departmentManagerName: "",
              relatedDocuments: "",
              status: "Pending",
              comments: "",
              approvedByManager: false,
              approvedByHR: false,
            })}>Clear Data</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeConcern;
