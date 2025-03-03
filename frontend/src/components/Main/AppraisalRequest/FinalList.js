import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";

const HRManagerAppraisal = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employee-appraisal/list");
      setAppraisals(response.data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch appraisals", { variant: "error" });
    }
  };

  const handleApproval = async (id, status) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/employee-appraisal/update/${id}`, { status });
      enqueueSnackbar("Appraisal status updated successfully!", { variant: "success" });
      setAppraisals((prev) =>
        prev.map((appraisal) => (appraisal._id === id ? { ...appraisal, status } : appraisal))
      );
    } catch (error) {
      enqueueSnackbar("Failed to update appraisal status", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (documentPath) => {
    window.open(`http://localhost:5000/uploads/${documentPath}`, "_blank");
  };

  return (
    <div className="container mt-5 px-5">
      <div className="card p-4 page-box">
        <h4 className="mb-3 text-center">HR Manager - Appraisals</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Appraisal Title</th>
              <th>Description</th>
              <th>Department</th>
              <th>Status</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appraisals
              .filter(appraisal => appraisal.status === "Approved by Manager")
              .map((appraisal) => (
                <tr key={appraisal._id}>
                  <td>{appraisal.appraisalTitle}</td>
                  <td>{appraisal.appraisalDescription}</td>
                  <td>{appraisal.departmentId}</td>
                  <td
                    className={
                      appraisal.status.includes("Approved") ? "text-success" : "text-danger"
                    }
                  >
                    {appraisal.status}
                  </td>
                  <td>
                    {appraisal.relatedDocuments && (
                      <button className="btn btn-primary action-btn" onClick={() => viewDocument(appraisal.relatedDocuments)}>
                        <VisibilityIcon /> View
                      </button>
                    )}
                  </td>
                  <td>
                    {appraisal.status === "Approved by Manager" && (
                      <>
                        <button className="btn btn-success action-btn" disabled={loading} onClick={() => handleApproval(appraisal._id, "Approved by HR")}>
                          Approve
                        </button>
                        <button className="btn btn-danger action-btn ml-2" disabled={loading} onClick={() => handleApproval(appraisal._id, "Rejected by HR")}>
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

export default HRManagerAppraisal;
