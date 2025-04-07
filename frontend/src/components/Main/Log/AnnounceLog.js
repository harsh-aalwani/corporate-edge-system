import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";

const AnnouncementLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortField, sortOrder };
      if (actionFilter) params.action = actionFilter;

      const response = await axios.get("http://localhost:5000/api/announcements/getAnnouncementLogs", { params });
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching announcement logs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortField, sortOrder, actionFilter]);

  return (
    <div className="page-inner page-box page-start mt-5">
      <h4 className="fw-bold mb-4">Announcement Activity Logs</h4>

      <div className="row mb-4">
        <div className="col-3">
          <label htmlFor="actionFilter" className="control-label">Filter by Action:</label>
          <select
            id="actionFilter"
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="form-control"
          >
            <option value="">All</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
          </select>
        </div>

        <div className="col-3">
          <label htmlFor="sortField" className="control-label">Sort by:</label>
          <select
            id="sortField"
            value={sortField}
            onChange={(e) => { setSortField(e.target.value); setPage(1); }}
            className="form-control"
          >
            <option value="timestamp">Timestamp</option>
            <option value="announcementId">Announcement ID</option>
            <option value="action">Action</option>
          </select>
        </div>

        <div className="col-3">
          <label htmlFor="sortOrder" className="control-label">Order:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
            className="form-control"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="col-3">
          <label htmlFor="limitInput" className="control-label">Records per page:</label>
          <input
            type="number"
            id="limitInput"
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="form-control"
          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Announcement ID</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map(log => (
                <tr key={log._id}>
                  <td>{log._id}</td>
                  <td>{log.announcementId}</td>
                  <td>
                    {log.action === "create" && <span className="badge bg-success">Created</span>}
                    {log.action === "update" && <span className="badge bg-warning">Updated</span>}
                    {log.action === "delete" && <span className="badge bg-danger">Deleted</span>}
                  </td>
                  <td>{log.performedBy?.fullName || log.performedBy?.userId || "N/A"}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center">No logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-controls mt-4 d-flex justify-content-center align-items-center">
        <button className="btn btn-secondary me-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span className="mx-2">Page {page} of {totalPages}</span>
        <button className="btn btn-secondary ms-2" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default AnnouncementLogs;
