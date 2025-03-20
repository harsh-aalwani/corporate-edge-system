import React, { useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";

const OrgChart = () => {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (node) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const containerStyle = {
    display: "flex",
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
    minWidth: "150px",
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

  const renderNode = (role, name, imgSrc, nodeKey) => (
    <div
      style={{ ...nodeStyle, ...roleStyles[role] }}
      onClick={(e) => {
        e.stopPropagation();
        toggleNode(nodeKey);
      }}
    >
      <img
        src={imgSrc}
        alt={name}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          marginBottom: "5px",
        }}
      />
      {name}
    </div>
  );

  return (
    <div style={containerStyle} className="orgchart-container">
      <Tree
        label={renderNode(
          "superAdmin",
          "Super Admin",
          "https://i.pravatar.cc/40?img=1",
          "superAdmin"
        )}
        lineWidth={expandedNodes.superAdmin ? "2px" : "0px"}
        lineColor={expandedNodes.superAdmin ? "black" : "transparent"}
        lineBorderRadius="10px"
      >
        {expandedNodes.superAdmin && (
          <>
            {/* System Admins Section */}
            {expandedNodes.systemAdmins ? (
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
                      "https://i.pravatar.cc/40?img=2",
                      "systemAdmins"
                    )}
                  </div>
                }
                lineWidth="2px"
                lineColor="black"
              >
                <TreeNode
                  label={renderNode(
                    "systemAdmin",
                    "System Admin 1 (Can Add)",
                    "https://i.pravatar.cc/40?img=3"
                  )}
                />
                <TreeNode
                  label={renderNode(
                    "systemAdmin",
                    "System Admin 2 (Can Add)",
                    "https://i.pravatar.cc/40?img=4"
                  )}
                />
                <TreeNode
                  label={renderNode(
                    "systemAdmin",
                    "System Admin 3 (No Add)",
                    "https://i.pravatar.cc/40?img=5"
                  )}
                />
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
                      "https://i.pravatar.cc/40?img=2",
                      "systemAdmins"
                    )}
                  </div>
                }
              />
            )}
            {/* HR Managers Section */}
            {expandedNodes.hrManagers ? (
              <TreeNode
                label={
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode("hrManagers");
                    }}
                  >
                    {renderNode(
                      "hrManager",
                      "HR Managers",
                      "https://i.pravatar.cc/40?img=6",
                      "hrManagers"
                    )}
                  </div>
                }
                lineWidth="2px"
                lineColor="black"
              >
                <TreeNode
                  label={renderNode(
                    "hrManager",
                    "HR Manager 1",
                    "https://i.pravatar.cc/40?img=7"
                  )}
                />
                <TreeNode
                  label={renderNode(
                    "hrManager",
                    "HR Manager 2",
                    "https://i.pravatar.cc/40?img=8"
                  )}
                />
              </TreeNode>
            ) : (
              <TreeNode
                label={
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode("hrManagers");
                    }}
                  >
                    {renderNode(
                      "hrManager",
                      "HR Managers",
                      "https://i.pravatar.cc/40?img=6",
                      "hrManagers"
                    )}
                  </div>
                }
              />
            )}

            {/* Departments Section */}
            {expandedNodes.departments ? (
              <TreeNode
                label={
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode("departments");
                    }}
                  >
                    {renderNode(
                      "department",
                      "Departments",
                      "https://i.pravatar.cc/40?img=9",
                      "departments"
                    )}
                  </div>
                }
                lineWidth="2px"
                lineColor="black"
              >
                {["Account", "Finance", "Production", "Sales"].map(
                  (dept, idx) =>
                    expandedNodes[dept] ? (
                      <TreeNode
                        key={dept}
                        label={renderNode(
                          "department",
                          `${dept} Department`,
                          `https://i.pravatar.cc/40?img=${10 + idx}`,
                          dept
                        )}
                        lineWidth="2px"
                        lineColor="black"
                      >
                        <TreeNode
                          label={renderNode(
                            "departmentManager",
                            `Dept Manager: DM-10${idx + 1}`,
                            `https://i.pravatar.cc/40?img=${22 + idx}`
                          )}
                        />
                        <TreeNode
                          label={renderNode(
                            "employee",
                            "Employee",
                            `https://i.pravatar.cc/40?img=${11 + idx}`
                          )}
                        />
                      </TreeNode>
                    ) : (
                      <TreeNode
                        key={dept}
                        label={
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNode(dept);
                            }}
                          >
                            {renderNode(
                              "department",
                              `${dept} Department`,
                              `https://i.pravatar.cc/40?img=${10 + idx}`,
                              dept
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
                    {renderNode(
                      "department",
                      "Departments",
                      "https://i.pravatar.cc/40?img=9",
                      "departments"
                    )}
                  </div>
                }
              />
            )}
          </>
        )}
      </Tree>
    </div>
  );
};

export default OrgChart;
