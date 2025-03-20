import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Add Navigation
import axios from "axios";
import { useSnackbar } from "notistack";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import "../../../assets/css/Main/ModalCss.css";

const MyLeave = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [leaveAllocations, setLeaveAllocations] = useState([]);
    const [leaveUsage, setLeaveUsage] = useState([]);
    const navigate = useNavigate(); // ✅ Use React Router for navigation

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const fetchLeaveData = async () => {
        try {
            const allocationsRes = await axios.get("http://localhost:5000/api/leaveAllocation/list");
            const usageRes = await axios.get("http://localhost:5000/api/leaves/usage", {
                withCredentials: true,
            });

            console.log("Leave Allocations:", allocationsRes.data); // ✅ Debugging
            console.log("Leave Usage:", usageRes.data); // ✅ Debugging

            setLeaveAllocations(allocationsRes.data);
            setLeaveUsage(usageRes.data);
        } catch (error) {
            enqueueSnackbar("Error fetching leave data", { variant: "error" });
        }
    };

    return (
        <div className="page-inner page-box page-start mt-5">
            <div className="d-flex align-items-center justify-content-between pt-2 pb-4">
                <h4 className="fw-bold mb-1">My Leave</h4>
                <div className="d-flex gap-2 mb-3">
                {/* ✅ Apply Leave Button */}
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/LeaveApply")} // ✅ Navigate to Apply Leave Page
                >
                    Apply Leave
                </button>
                <button className="btn btn-primary" onClick={() => navigate("/WithdrawLeave")}>
                    My Leave Status
                </button>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table custom-table">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Total Leave</th>
                            <th>Used Leave</th>
                            <th>Remaining Leave</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveAllocations.map((leave) => {
                            const usage = leaveUsage.find((u) => u.type.toString() === leave.leaveId.toString()) || { used: 0 };

                            const usedLeaves = Math.max(0, usage.used); // ✅ Ensure no negative or extra counted values
                            const remaining = Math.max(0, leave.leaveNumber - usedLeaves); // ✅ Correct remaining leave calculation

                            return (
                                <tr key={leave._id}>
                                    <td>{leave.leaveName}</td>
                                    <td>{leave.leaveNumber}</td>
                                    <td>{usedLeaves}</td>
                                    <td>{remaining}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyLeave;
