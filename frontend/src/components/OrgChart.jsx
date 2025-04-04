import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tree, TreeNode } from "react-organizational-chart";

const OrgChart = () => {
  const [expandedNodes, setExpandedNodes] = useState({
    superAdmin: true,
    systemAdmins: false,
    hrManagers: false,
    departments: false,
  });

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const toggleNode = (node) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const containerStyle = {
    display: "block",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    overflowX: "auto",
    width: "100%",
    position: "relative",
    whiteSpace: "nowrap",
  };

  const nodeStyle = {
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    margin: "5px",
    display: "inline-block",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    minWidth: "200px",
    position: "relative",
    border: "1px solid #ccc",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const roleStyles = {
    superAdmin: { backgroundColor: "green" },
    systemAdmin: { backgroundColor: "blue" },
    hrManager: { backgroundColor: "orange" },
    department: { backgroundColor: "purple" },
    employee: { backgroundColor: "gray" },
    departmentManager: { backgroundColor: "red" },
  };

  const renderNode = (role, name, nodeKey) => (
    <div
      style={{ ...nodeStyle, ...roleStyles[role] }}
      onClick={(e) => {
        e.stopPropagation();
        toggleNode(nodeKey);
      }}
    >
      {name}
    </div>
  );

  const roleNames = {
    R1: "Super Admin",
    R2: "System Admin",
    R3: "HR Manager",
    R4: "Department Manager",
    R5: "Employee",
  };

  useEffect(() => {
    console.log(
      "HR Managers:",
      users.filter((user) => user.userRoleid === "R3")
    );
  }, [users]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/getAllUsersSafe"),
          axios.get("http://localhost:5000/api/departments/list"),
        ]);

        const usersData = usersRes.data.users || [];
        const deptsData = Array.isArray(departmentsRes.data)
          ? departmentsRes.data
          : [];

        console.log("Fetched Users:", usersData); // <-- Debugging log
        console.log("Fetched Departments:", deptsData); // <-- Debugging log

        // Ensure we are not removing R2 and R3 from users
        const filteredUsers = usersData.filter(
          (user) =>
            user.userRoleid === "R2" ||
            user.userRoleid === "R3" ||
            user.userDepartment
        );

        console.log("Filtered Dept:", filteredUsers); // <-- Debugging log

        // Only filter departments with R4/R5 users (not affecting R2, R3 display)
        const filteredDepartments = deptsData.filter((dept) =>
          usersData.some(
            (user) =>
              user.userDepartment === dept.departmentid &&
              user.userRoleid !== "R2" &&
              user.userRoleid !== "R3"
          )
        );

        setUsers(filteredUsers);
        setDepartments(deptsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUsers([]);
        setDepartments([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={containerStyle} className="orgchart-container">
      <Tree
        label={renderNode("superAdmin", "Super Admin", "superAdmin")}
        lineWidth={expandedNodes.superAdmin ? "2px" : "0px"}
        lineColor={expandedNodes.superAdmin ? "black" : "transparent"}
        lineBorderRadius="10px"
      >
        {expandedNodes.superAdmin && (
          <>
            {/* System Admins Branch */}
            {users.some((user) => user.userRoleid === "R2") &&
              (expandedNodes.systemAdmins ? (
                <TreeNode
                  label={
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode("systemAdmins");
                      }}
                    >
                      {renderNode(
                        "systemAdmin",
                        "System Admins",
                        "systemAdmins"
                      )}
                    </div>
                  }
                  lineWidth="2px"
                  lineColor="black"
                >
                  {users
                    .filter((user) => user.userRoleid === "R2")
                    .map((user) => (
                      <TreeNode
                        key={user.userId}
                        label={renderNode(
                          "systemAdmin",
                          <div>
                            <div>{user.fullName}</div>
                            <div style={{ fontSize: "12px",color:"light"}}>{user.userDesignation}</div>
                          </div>,
                          user.userId
                        )}
                      />
                    ))}

                </TreeNode>
              ) : (
                <TreeNode
                  label={
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode("systemAdmins");
                      }}
                    >
                      {renderNode(
                        "systemAdmin",
                        "System Admins",
                        "systemAdmins"
                      )}
                    </div>
                  }
                />
              ))}

            {/* HR Managers Branch */}
            {users.some((user) => user.userRoleid === "R3") && (
              <TreeNode
                label={
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Clicked `HR Manager`s");
                      toggleNode("hrManagers");
                    }}
                  >
                    {renderNode("hrManager", "HR Managers", "hrManagers")}
                  </div>
                }
                lineWidth="2px"
                lineColor="black"
              >
                {expandedNodes.hrManagers
                  ? users.filter((user) => user.userRoleid === "R3")
                      .map((user) => (
                        <TreeNode
                          key={user.userId}
                          label={renderNode(
                            "hrManager",
                            user.fullName,
                            user.userId
                          )}
                        />
                      ))
                  : null}
              </TreeNode>
            )}

            {/* Departments Branch */}
            {departments.length > 0 &&
              (expandedNodes.departments ? (
                <TreeNode
                  label={
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode("departments");
                      }}
                    >
                      {renderNode("department", "Departments", "departments")}
                    </div>
                  }
                  lineWidth="2px"
                  lineColor="black"
                >
                  {departments.map((dept, idx) =>
                    expandedNodes[dept.departmentid] ? (
                      <TreeNode
                        key={dept.departmentid}
                        label={renderNode(
                          "department",
                          dept.departmentName,
                          dept.departmentid
                        )}
                        lineWidth="2px"
                        lineColor="black"
                      >
                        {/* Department Manager */}
                        {users.some(
                          (user) =>
                            user.userRoleid === "R4" &&
                            user.userDepartment === dept.departmentid
                        ) ? (
                          expandedNodes[`manager-${dept.departmentid}`] ? (
                            <TreeNode
                              label={
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(`manager-${dept.departmentid}`);
                                  }}
                                >
                                  {renderNode(
                                    "departmentManager",
                                    "Department Manager",
                                    `manager-${dept.departmentid}`
                                  )}
                                </div>
                              }
                              lineWidth="2px"
                              lineColor="black"
                            >
{users
  .filter(
    (user) =>
      user.userRoleid === "R4" && user.userDepartment === dept.departmentid
  )
  .map((user) => (
    <TreeNode
      key={user.userId}
      label={renderNode(
        "departmentManager",
        <div>
          <div>{user.fullName}</div>
          <div style={{ fontSize: "12px"}}>{user.userDesignation}</div>
        </div>,
        user.userId
      )}
    />
  ))}

                            </TreeNode>
                          ) : (
                            <TreeNode
                              label={
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(`manager-${dept.departmentid}`);
                                  }}
                                >
                                  {renderNode(
                                    "departmentManager",
                                    "Department Manager",
                                    `manager-${dept.departmentid}`
                                  )}
                                </div>
                              }
                            />
                          )
                        ) : (
                          <TreeNode
                            label={renderNode(
                              "departmentManager",
                              "No Department Manager",
                              `manager-${dept.departmentid}`
                            )}
                          />
                        )}

                        {/* Employees */}
                        {users.some(
                          (user) =>
                            user.userRoleid === "R5" &&
                            user.userDepartment === dept.departmentid
                        ) &&
                          (expandedNodes[`employees-${dept.departmentid}`] ? (
                            <TreeNode
                              label={
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(
                                      `employees-${dept.departmentid}`
                                    );
                                  }}
                                >
                                  {renderNode(
                                    "employee",
                                    "Employees",
                                    `employees-${dept.departmentid}`
                                  )}
                                </div>
                              }
                              lineWidth="2px"
                              lineColor="black"
                            > 
                            </TreeNode>
                          ) : (
                            <TreeNode
                              label={
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(
                                      `employees-${dept.departmentid}`
                                    );
                                  }}
                                >
                                  {renderNode(
                                    "employee",
                                    "Employees",
                                    `employees-${dept.departmentid}`
                                  )}
                                </div>
                              }
                            />
                          ))}
                      </TreeNode>
                    ) : (
                      <TreeNode
                        key={dept.departmentid}
                        label={
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNode(dept.departmentid);
                            }}
                          >
                            {renderNode(
                              "department",
                              dept.departmentName,
                              dept.departmentid
                            )}
                          </div>
                        }
                      />
                    )
                  )}
                </TreeNode>
              ) : (
                <TreeNode
                  label={
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode("departments");
                      }}
                    >
                      {renderNode("department", "Departments", "departments")}
                    </div>
                  }
                />
              ))}
          </>
        )}
      </Tree>
    </div>
  );
};

export default OrgChart;
