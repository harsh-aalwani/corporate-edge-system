import React from "react";

export const Team = ({ data }) => {
  const teamStyle = {
    padding: "100px 0",
    textAlign: "center",
  };

  const sectionTitleStyle = {
    marginBottom: "40px",
  };

  const h2Style = {
    fontSize: "2.2rem",
    fontWeight: "bold",
    fontFamily: '"Raleway", sans-serif',
  };

  const pStyle = {
    fontSize: "16px",
    color: "#666",
  };

  const teamContainerStyle = {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const teamMemberStyle = {
    width: "240px",
    margin: "40px", // Increased spacing around each team member
    textAlign: "center",
  };
  
  const teamImgStyle = {
    width: "100%",
    borderRadius: "10px",
  };

  const captionStyle = {
    padding: "10px 0 0",
    color: "#888",
  };

  return (
    <div id="team" style={teamStyle}>
      <div className="container">
        <div className="section-title" style={sectionTitleStyle}>
          <h2 style={h2Style}>Meet the Team</h2>
          <p style={pStyle}>We are the team who developed the system.</p>
        </div>
        <div style={teamContainerStyle}>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((member, index) => (
              <div key={`${member.name}-${index}`} style={teamMemberStyle}>
                <div>
                  <img
                    src={member.img}
                    alt={member.name}
                    style={teamImgStyle}
                  />
                  <div style={captionStyle}>
                    <h4>{member.name}</h4>
                    <p>{member.job}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="loading-text">Loading team members...</p>
          )}
        </div>
      </div>
    </div>
  );
};
