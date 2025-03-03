import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";

const AnnouncementList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/announcements/list");
      setAnnouncements(response.data);
      setFilteredAnnouncements(response.data);
    } catch (error) {
      enqueueSnackbar("⚠️ Failed to fetch announcements", { variant: "error" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredAnnouncements(
      query.trim() === ""
        ? announcements
        : announcements.filter((ann) =>
            ann.announcementTitle.toLowerCase().includes(query) ||
            ann.announcementDescription.toLowerCase().includes(query)
          )
    );
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);
    setCheckedRows(isChecked ? filteredAnnouncements.map((ann) => ann.announcementId) : []);
  };

  const handleRowCheck = (e, announcementId) => {
    setCheckedRows((prev) =>
      e.target.checked ? [...prev, announcementId] : prev.filter((id) => id !== announcementId)
    );
  };

  const handleEdit = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one announcement to edit");
      return;
    }
    const selectedAnnouncement = announcements.find((ann) => ann.announcementId === checkedRows[0]);
    navigate(`/EditAnnouncement/${checkedRows[0]}`, { state: { announcementData: selectedAnnouncement } });
  };

  const handleDelete = () => {
    if (checkedRows.length === 0) {
      enqueueSnackbar("⚠️ Please select at least one announcement to delete", { variant: "warning" });
      return;
    }
    setIsModalOpen(true);
  };

  const deleteAnnouncements = async () => {
    try {
      const response = await axios.delete("http://localhost:5000/api/announcements/delete", {
        data: { ids: checkedRows },
      });
      if (response.status === 200) {
        enqueueSnackbar("Announcements deleted successfully", { variant: "success" });
        fetchAnnouncements();
        setCheckedRows([]);
        setCheckAll(false);
      }
    } catch (error) {
      enqueueSnackbar("⚠️ Failed to delete announcements", { variant: "error" });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage Announcements</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Announcements</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <button className="btn btn-label-info btn-round me-2" onClick={handleEdit}>Edit</button>
          <Link to="/AddAnnouncement" className="btn btn-primary btn-round me-2">Add</Link>
          <button className="btn btn-dark btn-round" onClick={handleDelete}>Remove</button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Search by Title or Description..."
          className="form-control"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <hr id="title-line" data-symbol="📢" />
      <div className="content-area">
        <div className="table-responsive">
          <table className="table custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                {/* <th>Description</th> */}
                <th>Tag</th>
                <th>Public</th>
                <th>Schedule Time</th>
                <th scope="col">
                  <label className="control control--checkbox">
                    <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
                    <div className="control__indicator"></div>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.announcementId}>
                    <td>{announcement.announcementId}</td>
                    <td>{announcement.announcementTitle}</td>
                    {/* <td>{announcement.announcementDescription}</td> */}
                    <td>{announcement.announcementTag}</td>
                    <td>{announcement.announcementPublic ? "Yes" : "No"}</td>
                    <td>{new Date(announcement.announcementScheduleTime).toLocaleString()}</td>
                    <td>
                    <label className="control control--checkbox">
                      <input
                        type="checkbox"
                        checked={checkedRows.includes(announcement.announcementId)}
                        onChange={(e) => handleRowCheck(e, announcement.announcementId)}
                      />
                       <div className="control__indicator"></div>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No Announcements found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate">
            <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2 className="modal-title">Confirm Deletion</h2>
            <p className="modal-desc">
              Are you sure you want to delete {checkedRows.length} announcement(s)?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn btn-danger" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={deleteAnnouncements}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementList;
