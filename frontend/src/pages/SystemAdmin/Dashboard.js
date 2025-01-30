import SUTemplate from "../../components/SystemAdmin/SYTemplate";
const Dashboard = () => {
    return (
        <>
            <SUTemplate>
                <div className="page-inner">
                    <div className="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
                    <div>
                        <h3 className="fw-bold mb-3">Dashboard</h3>
                        <h6 className="op-7 mb-2">Free Bootstrap 5 Admin Dashboard</h6>
                    </div>
                    <div className="ms-md-auto py-2 py-md-0">
                        <a href="#" className="btn btn-label-info btn-round me-2">Manage</a>
                        <a href="#" className="btn btn-primary btn-round">Add Customer</a>
                    </div>
                    </div>
                    <div className="content-area">
                    
                    </div>
                </div>
            </SUTemplate>
        </>
    );
}
export default Dashboard;