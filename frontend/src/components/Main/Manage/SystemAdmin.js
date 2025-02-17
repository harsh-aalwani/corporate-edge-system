import React, { useState } from "react";
import "../../../assets/css/TableCss/TableManage.css";
import "../../../assets/css/TableCss/TableIcon.css";
import { Link } from "react-router-dom";

const SystemAdmin = () => {
  const [checkedRows, setCheckedRows] = useState([]);
  const [checkAll, setCheckAll] = useState(false);

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setCheckAll(isChecked);

    if (isChecked) {
      const allRows = Array.from(document.querySelectorAll("tbody tr")).map(
        (row) => row.dataset.id
      );
      setCheckedRows(allRows);
    } else {
      setCheckedRows([]);
    }
  };

  const handleRowCheck = (e, rowId) => {
    const isChecked = e.target.checked;
    setCheckedRows((prev) =>
      isChecked ? [...prev, rowId] : prev.filter((id) => id !== rowId)
    );
  };

  const isRowChecked = (rowId) => checkedRows.includes(rowId);

  const rows = [
    {
      id: "1392",
      name: "James Yates",
      mobile: "+63 983 0962 971",
      email: "NY University",
      permission: "Yes",
      isOnline: true,
    },
    {
      id: "4616",
      name: "Matthew Wasil",
      mobile: "+02 020 3994 929",
      email: "London College",
      permission: "No",
      isOnline: false,
    },
    {
      id: "9841",
      name: "Sampson Murphy",
      mobile: "+01 352 1125 0192",
      email: "Senior High",
      permission: "Yes",
      isOnline: true,
    },
    {
      id: "9548",
      name: "Gaspar Semenov",
      mobile: "+92 020 3994 929",
      email: "College",
      permission: "No",
      isOnline: false,
    },
  ];

  return (
    <div className="page-inner page-box page-start mt-5">
      <div className="d-flex align-items-center flex-column flex-md-row pt-2 pb-4">
        <div>
          <h4 className="fw-bold mb-3">Manage SystemAdmin</h4>
          <h6 className="op-7 mb-2">Add, Change, and Delete Departments</h6>
        </div>
        <div className="ms-md-auto py-2 py-md-0">
          <Link to="/EditDepartment" className="btn btn-label-info btn-round me-2">
            Edit
          </Link>
          <Link to="/AddDepartment" className="btn btn-primary btn-round me-2">
            Add
          </Link>
          <button className="btn btn-dark btn-round">Remove</button>
        </div>
      </div>
      <div className="input-group">
        <input type="text" placeholder="Search ..." className="form-control" />
      </div>
      <hr id="title-line" data-symbol="✈" />
      <div className="content-area">
        <div className="table-responsive" style={{ border: "" }}>
          <table className="table custom-table">
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Mobile Number</th>
                <th scope="col">Can Manage Admins</th>
                <th scope="col">
                  <label className="control control--checkbox">
                    <input
                      type="checkbox"
                      className="js-check-all"
                      checked={checkAll}
                      onChange={handleCheckAll}
                    />
                    <div className="control__indicator"></div>
                  </label>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  data-id={row.id}
                  className={isRowChecked(row.id) ? "active" : ""}
                >
                  <th scope="row">
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: row.isOnline ? "green" : "red",
                      }}
                    ></span>
                  </th>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.mobile}</td>
                  <td>{row.permission}</td>
                  <th scope="row">
                    <label className="control control--checkbox">
                      <input
                        type="checkbox"
                        checked={isRowChecked(row.id)}
                        onChange={(e) => handleRowCheck(e, row.id)}
                      />
                      <div className="control__indicator"></div>
                    </label>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
