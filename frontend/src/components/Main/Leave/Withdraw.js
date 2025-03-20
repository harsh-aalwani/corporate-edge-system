import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap"; // Import Modal

const WithdrawLeave = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);

    useEffect(() => {
        fetchWithdrawableLeaves();
    }, []);

    const fetchWithdrawableLeaves = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/leaves/user-all-leaves", { withCredentials: true });
            setLeaveRequests(response.data);
        } catch (error) {
            enqueueSnackbar("Failed to fetch leave requests", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawClick = (leaveId) => {
        setSelectedLeaveId(leaveId);
        setShowConfirmModal(true);
    };

    const confirmWithdraw = async () => {
        setShowConfirmModal(false);
        try {
            await axios.put(`http://localhost:5000/api/leaves/request-withdraw/${selectedLeaveId}`);
            enqueueSnackbar("Withdrawal request submitted", { variant: "success" });
            fetchWithdrawableLeaves();
        } catch (error) {
            enqueueSnackbar("Failed to request withdrawal", { variant: "error" });
        }
    };

    return (
        <div className="page-inner page-box page-start mt-5">
            <div className="d-flex align-items-center justify-content-between pt-2 pb-4">
                <h4 className="fw-bold mb-1">My Leave</h4>
                <div className="d-flex gap-2 mb-3">
                <button className="btn btn-primary" onClick={() => navigate("/MyLeave")}>
                My Leave Balance
                </button>
                {/* ✅ Apply Leave Button */}
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/LeaveApply")} // ✅ Navigate to Apply Leave Page
                >
                    Apply Leave
                </button>
               
                </div>
            </div>

            {loading ? (
                <p>Loading leave requests...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveRequests.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">No leave requests found</td>
                            </tr>
                        ) : (
                            leaveRequests.map((leave) => (
                                <tr key={leave.leaveId}>
                                    <td>{leave.leaveName}</td>
                                    <td>{new Date(leave.startDate).toLocaleDateString("en-GB")}</td>
                                    <td>{new Date(leave.endDate).toLocaleDateString("en-GB")}</td>
                                    <td>
                                        <span className={`badge ${getBadgeClass(leave.status)}`}>{leave.status}</span>
                                    </td>
                                    <td>
                                        {leave.status === "Approved" && new Date(leave.startDate) > new Date() ? (
                                            <button 
                                                className="btn btn-warning" 
                                                onClick={() => handleWithdrawClick(leave.leaveId)}
                                            >
                                                Request Withdraw
                                            </button>
                                        ) : (
                                            <span className="text-muted">No Action</span>
                                        )}
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Withdrawal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: "#000" }}>Are you sure you want to request withdrawal for this leave?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmWithdraw}>OK</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const getBadgeClass = (status) => {
    switch (status) {
        case "Approved": return "bg-success";
        
        case "Withdrawn": return "bg-primary";
        case  "Rejected": return "bg-danger";
        case "Pending": return "bg-secondary";
        default: return "bg-secondary";
    }
};

export default WithdrawLeave;
