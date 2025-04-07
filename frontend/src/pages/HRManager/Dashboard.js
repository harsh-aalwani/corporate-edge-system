import SUTemplate from "../../components/HRManager/HRTemplate";
import { BiTrash } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSnackbar } from "notistack";
import { Clock } from "react-feather";
import {
  Users,
  Briefcase,
  FileText,
  Bell,
  CheckCircle,
  Clock as ClockIcon,
  ListOrdered,
  X,
  ShieldCheck,
  FilePlus 
} from "lucide-react";
import styled from "styled-components";
import axios from "axios";

const Dashboard = () => {
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDesc, setScheduleDesc] = useState("");
  const [schedules, setSchedules] = useState([]);
  const { enqueueSnackbar } = useSnackbar(); // ✅ Use notistack
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [departmentCount, setDepartmentCount] = useState(null);
  const [jobVacancyCount, setJobVacancyCount] = useState(null);
  const [policyCount, setPolicyCount] = useState(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [history, setHistory] = useState([]);
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  
  const handleOpenModal = (schedule) => {
    setSelectedSchedule(schedule);
  };
  const handleDelete = async (scheduleId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/schedules/delete`, {
        method: "POST", // 🔥 Use POST instead of DELETE
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: scheduleId }), // 🔥 Send ID in request body
      });
  
      if (!response.ok) throw new Error("Failed to delete schedule");
  
      // ✅ Remove schedule from UI after deletion
      setSchedules((prevSchedules) => prevSchedules.filter((s) => s._id !== scheduleId));
      setSelectedSchedule(null); // Close modal after deleting
  
      // ✅ Show success notification
      enqueueSnackbar("Schedule deleted successfully!", { variant: "success" });
  
    } catch (error) {
      console.error("Error deleting schedule:", error);
      enqueueSnackbar("Error deleting schedule!", { variant: "error" });
    }
  };
  

  const handleCloseModal = () => {
    setSelectedSchedule(null);
  };
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    let isMounted = true;
    // Fetch All Counts in a Single API Call
    setTimeout(() => {
      axios
        .get("http://localhost:5000/api/manage/counts")
        .then((response) => {
          const {
            totalUsers,
            activeUsers,
            departmentCount,
            jobVacancyCount,
            policyCount,
            pendingLeaveCount,
          } = response.data;
          setUserStats({ totalUsers, activeUsers });
          setDepartmentCount(departmentCount);
          setJobVacancyCount(jobVacancyCount);
          setPolicyCount(policyCount);
          setPendingLeaveCount(pendingLeaveCount);
        })
        .catch((error) => console.error("Error fetching all counts:", error));
    }, 500);
    // ✅ Fetch Recent Announcements
    axios
      .get("http://localhost:5000/api/announcements/recent")
      .then((response) => {
        if (isMounted) {
          const data = Array.isArray(response.data)
            ? response.data.slice(0, 5)
            : []; // ✅ Limit to 5
          setAnnouncements(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
        if (isMounted) {
          setAnnouncements([]); // ✅ Prevents null errors
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    // Fetch schedules for logged-in user
    axios
      .get("http://localhost:5000/api/schedules/my-schedules", {
        withCredentials: true, // ✅ Include session credentials
      })
      .then((response) => {
        setSchedules(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching schedules:", error);
        setLoading(false);
      });
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time as HH:MM:SS AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const handleDateClick = (date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of the day

    if (date >= now) {
      // Only allow future dates
      setSelectedDate(date.toDateString());
      setShowModal(true); // ✅ Opens modal properly
    }
  };
  const handleSaveSchedule = () => {
    if (!scheduleTitle.trim()) {
      enqueueSnackbar("Please enter a schedule title!", { variant: "error" });
      return;
    }

    axios
      .post(
        "http://localhost:5000/api/schedules/create",
        {
          title: scheduleTitle,
          description: scheduleDesc,
          date: selectedDate,
        },
        { withCredentials: true }
      )
      .then(() => {
        enqueueSnackbar("Schedule saved successfully!", { variant: "success" });
        setShowModal(false);
        setScheduleTitle("");
        setScheduleDesc("");
      })
      .catch((error) => {
        enqueueSnackbar("Error saving schedule!", { variant: "error" });
        console.error("Error saving schedule:", error);
      });
  };
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/manage/history",
          {},
          { withCredentials: true } // 🔥 Includes session for authentication
        );
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);
  return (
    <SUTemplate>
      <div className="page-inner">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between py-3 border-bottom">
          <div>
            <h3 className="fw-bold text-primary mb-2 mb-md-0">📊 Dashboard</h3>
            <p className="text-muted fs-6 mb-0">
              Welcome back! Stay updated with the latest insights.
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* User Stats */}
          <div className="col-md-3">
            <div className="card shadow-sm p-4 text-center border-primary">
              <div className="icon mb-3 text-primary">
                <Users size={30} />
              </div>
              <h5 className="fw-bold mb-2">Users</h5>
              <p className="text-muted">
                {userStats
                  ? `Total: ${userStats.totalUsers} | Active: ${userStats.activeUsers}`
                  : "Loading..."}
              </p>
            </div>
          </div>

        {/* Open Job Vacancies */}
        <div className="col-md-3">
        <div
            className="card shadow-sm p-4 text-center border-primary clickable"
            onClick={() => navigate("/Recruitment")}
            style={{ cursor: "pointer" }}
        >
            <div className="icon mb-3 text-primary">
            <FilePlus size={30} /> 
            </div>
            <h5 className="fw-bold mb-2">Open Job Vacancies</h5>
            <p className="text-muted">
            {jobVacancyCount !== null
                ? `${jobVacancyCount} Open Positions`
                : "Loading..."}
            </p>
        </div>
        </div>

          {/* Active Policies */}
          <div className="col-md-3">
            <div
              className="card shadow-sm p-4 text-center border-warning clickable"
              onClick={() => navigate("/Policy")}
              style={{ cursor: "pointer" }}
            >
              <div className="icon mb-3 text-warning">
                <FileText size={30} />
              </div>
              <h5 className="fw-bold mb-2">Active Policies</h5>
              <p className="text-muted">
                {policyCount !== null
                  ? `${policyCount} Policies`
                  : "Loading..."}
              </p>
            </div>
          </div>

          {/* Pending Requests */}
         {/* Departments */}
         <div className="col-md-3">
            <div
              className="card shadow-sm p-4 text-center border-success clickable"
              onClick={() => navigate("/OrganizationChart")}
              style={{ cursor: "pointer" }}
            >
              <div className="icon mb-3 text-success">
                <Briefcase size={30} />
              </div>
              <h5 className="fw-bold mb-2">Departments</h5>
              <p className="text-muted">
                {departmentCount !== null
                  ? `${departmentCount} Departments`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="row mt-5">
          {/* Left Column: Updates, Logs, History */}
          <div className="col-md-6">
            {/* Recent Updates */}
            <div className="card shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Recent Updates</h5>
              <ul className="list-group list-group-flush">
                {loading ? (
                  <li className="list-group-item text-muted text-center py-3">
                    <em>Loading...</em>
                  </li>
                ) : announcements.length > 0 ? (
                  announcements.map((announcement, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex align-items-center py-3 clickable"
                      onClick={() => navigate(`/PublicAnnouncement`)}
                      style={{ cursor: "pointer" }}
                    >
                      <CheckCircle className="text-info me-2" size={18} />
                      <span className="fw-semibold">{announcement.title}</span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-muted text-center py-3">
                    <em>No recent updates</em>
                  </li>
                )}
              </ul>
            </div>
            {/* <div className="card shadow-sm p-4 mb-4">
                <h5 className="fw-bold mb-3">System Logs</h5>
                <ul className="list-group list-group-flush">
                    <li
                    className="list-group-item d-flex align-items-center py-3 clickable"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/UserLog")}
                    >
                    <ShieldCheck className="text-primary me-2" size={18} /> 
                    <span className="fw-semibold">User Access Logs</span>
                    </li>
                </ul>
            </div> */}

            {/* History Section */}
            <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">History</h5>
                <ul className="list-group list-group-flush">
                    {loading ? (
                    <li className="list-group-item text-center py-3 text-muted">
                        <em>Loading history...</em>
                    </li>
                    ) : history.length > 0 ? (
                    history.map((item) => (
                        <li key={item.id} className="list-group-item d-flex align-items-center py-3">
                        <Clock className="text-info me-2" />
                        <div>
                            <span className="fw-semibold">{item.event}</span>
                            <br />
                            <small className="text-muted">{new Date(item.date).toLocaleString()}</small>
                        </div>
                        </li>
                    ))
                    ) : (
                    <li className="list-group-item text-center py-3 text-muted">
                        <em>No recent activity</em>
                    </li>
                    )}
                </ul>
                </div>
            </div>

          {/* Right Column: Clock, Calendar, Schedule */}
          <div className="col-md-6">
            {/* Digital Clock */}
            <div className="card shadow-sm p-4 mb-4 text-center">
              <h5 className="fw-bold mb-3">Current Time</h5>
              <div className="d-flex justify-content-center align-items-center">
                <ClockIcon size={30} className="text-primary me-3" />
                <h4 className="mb-0">{formatTime(time)}</h4>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="card shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Calendar</h5>
              <Calendar
                className="w-100 border-0"
                onClickDay={handleDateClick}
                value={date}
              />
            </div>

            <div className="card shadow-sm p-4">
                <h5 className="fw-bold mb-3">Schedule</h5>
                <ul className="list-group list-group-flush">
                    {loading ? (
                    <li className="list-group-item text-muted text-center py-3">
                        <em>Loading schedules...</em>
                    </li>
                    ) : schedules.length > 0 ? (
                    schedules.slice(0, visibleCount).map((schedule, index) => (
                        <li
                        key={index}
                        className="list-group-item d-flex align-items-center py-3"
                        onClick={() => handleOpenModal(schedule)}
                        style={{ cursor: "pointer" }}
                        >
                        <input type="checkbox" className="me-3 form-check-input" />
                        <span className="fw-semibold">{schedule.title}</span>
                        </li>
                    ))
                    ) : (
                    <li className="list-group-item text-muted text-center py-3">
                        <em>No schedules available</em>
                    </li>
                    )}
                </ul>

                {/* Show More Button */}
                {schedules.length > visibleCount && (
                    <button
                    className="btn btn-primary mt-3 w-100"
                    onClick={handleLoadMore}
                    >
                    Show More
                    </button>
                )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <ModalOverlay>
            <ModalContainer>
              <ModalHeader>
                <h5 className="fw-bold">Selected Date</h5>
                <CloseButton onClick={() => setShowModal(false)}>
                  <X size={24} />
                </CloseButton>
              </ModalHeader>
              <p className="text-muted">{selectedDate}</p>

              {/* Schedule Input */}
              <InputLabel>Schedule Title</InputLabel>
              <ModalInput
                type="text"
                placeholder="Enter schedule title"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
              />

              {/* Optional Description */}
              <InputLabel>Description (Optional)</InputLabel>
              <ModalTextarea
                placeholder="Enter description..."
                value={scheduleDesc}
                onChange={(e) => setScheduleDesc(e.target.value)}
              />

              {/* Save Button */}
              <SaveButton onClick={handleSaveSchedule}>
                Save Schedule
              </SaveButton>
            </ModalContainer>
          </ModalOverlay>
        )}

        {selectedSchedule && (
        <ModalOverlay onClick={handleCloseModal}>
            <ModalContainer
            onClick={(e) => e.stopPropagation()}
            className="p-4 rounded shadow-lg bg-white"
            >
            {/* Header */}
            <ModalHeader className="d-flex justify-content-between align-items-center border-bottom pb-3">
                <h5 className="fw-bold mb-0">{selectedSchedule.title}</h5>
                <div>
                {/* Trash Bin Button */}
                <button
                    className="btn btn-outline-danger me-2 d-flex align-items-center"
                    onClick={() => handleDelete(selectedSchedule._id)}
                >
                    <BiTrash size={18} className="me-1" /> {/* React Trash Icon */}
                </button>
                <CloseButton onClick={handleCloseModal} className="btn-close"></CloseButton>
                </div>
            </ModalHeader>

            {/* Body */}
            <div className="mt-4">
                <div className="mb-3 border-bottom pb-2">
                <p className="text-muted mb-1">📅 Date</p>
                <p className="fw-semibold fs-6">{new Date(selectedSchedule.date).toLocaleDateString()}</p>
                </div>

                <div className="mb-3 border-bottom pb-2">
                <p className="text-muted mb-1">🕒 Created At</p>
                <p className="fw-semibold fs-6">{new Date(selectedSchedule.createdAt).toLocaleString()}</p>
                </div>

                {selectedSchedule.description && (
                <div className="mb-2">
                    <p className="text-muted mb-1">📝 Description</p>
                    <p className="fw-normal fs-6">{selectedSchedule.description}</p>
                </div>
                )}
            </div>
            </ModalContainer>
        </ModalOverlay>
        )}
      </div>
    </SUTemplate>
  );
};

export default Dashboard;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 350px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CloseButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: bold;
  display: block;
  margin-top: 10px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 60px;
  resize: none;
`;

const SaveButton = styled.button`
  margin-top: 15px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;
