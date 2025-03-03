import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";

const HRManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConcerns();
  }, []);

  const fetchConcerns = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employee-concerns/list");
      setConcerns(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch concerns", { variant: "error" });
    }
  };

  const handleApproval = async (id, status) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/employee-concerns/update/${id}`, { status });
      enqueueSnackbar("Concern status updated successfully!", { variant: "success" });
      setConcerns((prev) =>
        prev.map((concern) => (concern._id === id ? { ...concern, status } : concern))
      );
    } catch (error) {
      enqueueSnackbar("Failed to update concern status", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (documentPath) => {
    if (documentPath) {
      window.open(`http://localhost:5000/uploads/${documentPath}`, "_blank");
    } else {
      enqueueSnackbar("No document available to view", { variant: "warning" });
    }
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">HR Manager Dashboard</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Complaint Title</th>
              <th>Description</th>
              <th>Department</th>
              <th>Status</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerns
              .filter(concern => concern.status === "Approved by Manager")
              .map((concern) => (
                <tr key={concern._id}>
                  <td>{concern.complaintTitle}</td>
                  <td>{concern.complaintDescription}</td>
                  <td>{concern.departmentid}</td>
                  <td
                    className={
                      concern.status.includes("Approved") ? "text-success" : "text-danger"
                    }
                  >
                    {concern.status}
                  </td>
                  <td>
                    {concern.relatedDocuments && (
                      <button className="btn btn-primary action-btn" onClick={() => viewDocument(concern.relatedDocuments)}>
                        <VisibilityIcon /> View
                      </button>
                    )}
                  </td>
                  <td>
                    {concern.status === "Approved by Manager" && (
                      <>
                        <button className="btn btn-success action-btn" disabled={loading} onClick={() => handleApproval(concern._id, "Approved by HR")}>
                          Approve
                        </button>
                        <button className="btn btn-danger action-btn ml-2" disabled={loading} onClick={() => handleApproval(concern._id, "Rejected by HR")}>
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <style>
        {`.action-btn {
          padding: 8px 12px;
          font-size: 14px;
          margin: 4px;
        }
        .text-success {
          color: green;
          font-weight: bold;
        }
        .text-danger {
          color: red;
          font-weight: bold;
        }`}
      </style>
    </div>
  );
};

export default HRManager;
