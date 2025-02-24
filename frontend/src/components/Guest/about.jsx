import React from "react";

export const About = ({ data }) => {
  const aboutStyle = {
    padding: "120px 0", // Increased padding for better spacing
  };

  const heading2Style = {
    position: "relative",
    marginBottom: "25px", // More spacing below heading
    paddingBottom: "15px",
    fontFamily: '"Raleway", sans-serif',
    fontSize: "2.4rem", // Slightly larger for better emphasis
  };

  const heading3Style = {
    fontFamily: '"Raleway", sans-serif',
    fontSize: "2rem",
    marginBottom: "25px", // More spacing below heading
  };

  const heading2AfterStyle = {
    position: "absolute",
    background: "linear-gradient(to right, #5ca9fb 0%, #6372ff 100%)",
    height: "4px",
    width: "60px",
    bottom: "0",
    left: "0",
  };

  const aboutTextStyle = {
    lineHeight: "28px", // Increased line height for better readability
    marginBottom: "35px", // More spacing below paragraphs
  };

  const listItemStyle = {
    marginBottom: "10px", // Increased spacing between list items
    marginLeft: "6px",
    listStyle: "none",
    padding: "0",
    display: "flex",
    alignItems: "center",
  };

  const checkmarkStyle = {
    color: "#5ca9fb",
    fontSize: "16px", // Slightly bigger for better visibility
    marginRight: "10px",
  };

  const aboutImageStyle = {
    width: "520px",
    marginTop: "20px", // More spacing above image
    background: "#fff",
    borderRight: "0",
    boxShadow: "0 0 50px rgba(0, 0, 0, 0.06)",
  };

  return (
    <div id="about" style={aboutStyle}>
      <div className="container">
        <div className="row">
          {/* Image Section */}
          <div className="col-md-6">
            <img src="img/about.jpg" style={aboutImageStyle} alt="About Us" />
          </div>

          {/* Text Section */}
          <div className="col-md-6">
            <div className="about-text">
              <h2 style={heading2Style}>
                About Us
                <span style={heading2AfterStyle}></span>
              </h2>
              <p style={aboutTextStyle}>{data ? data.paragraph : "Loading..."}</p>

              <h3 style={heading3Style}>Why Choose Us?</h3>
              <div className="row">
                <div className="col-lg-6 col-sm-6">
                  <ul>
                    {data
                      ? data.Why.map((item, index) => (
                          <li key={index} style={listItemStyle}>
                            <span style={checkmarkStyle}>✔</span> {item}
                          </li>
                        ))
                      : "Loading..."}
                  </ul>
                </div>

                <div className="col-lg-6 col-sm-6">
                  <ul>
                    {data
                      ? data.Why2.map((item, index) => (
                          <li key={index} style={listItemStyle}>
                            <span style={checkmarkStyle}>✔</span> {item}
                          </li>
                        ))
                      : "Loading..."}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
