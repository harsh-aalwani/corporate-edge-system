import React from "react";

export const Features = ({ data }) => {
  const featuresStyle = {
    background: "#f6f6f6",
    paddingTop: "100px",
    paddingBottom: "70px", // Added bottom padding for more spacing
  };

  const sectionTitleStyle = {
    textAlign: "center",
    marginBottom: "30px", // Increased spacing below the title
    fontFamily: '"Raleway", sans-serif',
  };

  const iconStyle = {
    fontSize: "38px",
    marginBottom: "20px",
    transition: "all 0.5s",
    color: "#fff",
    width: "100px",
    height: "100px",
    padding: "30px 0",
    borderRadius: "50%",
    background: "linear-gradient(to right, #6372ff 0%, #5ca9fb 100%)",
    boxShadow: "10px 10px 10px rgba(0, 0, 0, 0.05)",
  };

  const featureItemStyle = {
    textAlign: "center",
    marginBottom: "40px", // Increased spacing between feature items
    padding: "20px", // Added padding to separate content inside each feature
  };

  const titleStyle = {
    fontFamily: '"Raleway", sans-serif',
  };

  const titleStyleHeader = {
    fontFamily: '"Raleway", sans-serif',
    fontSize: "2.2rem",
  };

  return (
    <div id="features" style={featuresStyle}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10 section-title" style={sectionTitleStyle}>
            <h2 style={titleStyleHeader}>Features</h2>
          </div>
        </div>

        <div className="row">
          {data
            ? data.map((d, i) => (
                <div
                  key={`${d.title}-${i}`}
                  className="col-sm-6 col-md-3"
                  style={featureItemStyle}
                >
                  <i className={d.icon} style={iconStyle}></i>
                  <h3 style={titleStyle}>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))
            : "Loading..."}
        </div>
      </div>
    </div>
  );
};
