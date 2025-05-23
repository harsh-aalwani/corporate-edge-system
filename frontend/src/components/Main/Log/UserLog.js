import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // default limit is 10, but user can change it
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [eventFilter, setEventFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortField, sortOrder };
      if (eventFilter) {
        params.event = eventFilter;
      }
      const response = await axios.get("http://localhost:5000/api/users/getUserLogs", { params });
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
    setLoading(false);
  };

  // Re-fetch logs when controls change
  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortField, sortOrder, eventFilter]);
  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  const handleEventFilterChange = (e) => {
    setEventFilter(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 1;
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <h4 className="fw-bold mb-4">User Login/Logout Logs</h4>

      {/* Grid structure for filter, sort, and limit controls */}
      <div className="row mb-4">
        <div className="col-3">
          <label htmlFor="eventFilter" className="control-label">Filter by Event:</label>
          <select
            id="eventFilter"
            value={eventFilter}
            onChange={handleEventFilterChange}
            className="form-control"
          >
            <option value="">All</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
            <option value="AddUser">User Added</option>  {/* ✅ Added */}
            <option value="EditUser">User Edited</option> {/* ✅ Added */}
          </select>
        </div>
        <div className="col-3">
          <label htmlFor="sortField" className="control-label">Sort by:</label>
          <select
            id="sortField"
            value={sortField}
            onChange={handleSortFieldChange}
            className="form-control"
          >
            <option value="timestamp">Timestamp</option>
            <option value="userId">User ID</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="col-3">
          <label htmlFor="sortOrder" className="control-label">Order:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortOrderChange}
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
            onChange={handleLimitChange}
            className="form-control"

          />
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User ID</th>
                <th>User Name</th>
                <th>Event</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.logId || log._id}>
                    <td>{log.logId || log._id}</td>
                    <td>{log.userId}</td>
                    <td>{log.fullName || "N/A"}</td>
                    <td>
                      {log.event === "Login" && <span className="badge bg-success">Login</span>}
                      {log.event === "Logout" && <span className="badge bg-danger">Logout</span>}
                      {log.event === "AddUser" && <span className="badge bg-primary">User Added</span>} {/* ✅ Added */}
                      {log.event === "EditUser" && <span className="badge bg-warning">User Edited</span>} {/* ✅ Added */}
                    </td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}


      {/* Enhanced Pagination Controls */}
      <div className="pagination-controls mt-4 d-flex justify-content-center align-items-center">
        <button
          className="btn btn-secondary me-2"
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span className="mx-2">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary ms-2"
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserLogs;
