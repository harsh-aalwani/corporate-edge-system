import React from "react";

const footerStyle = {
  backgroundColor: "#2c3e50",
  color: "#ecf0f1",
  padding: "20px 0",
  textAlign: "center",
  bottom: 0,
  width: "100%"
};

const footerContentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 15px"
};

const footerParagraphStyle = {
  margin: 0,
  fontSize: "14px"
};

const Footer = () => {
  return (
    <footer style={footerStyle} aria-label="Footer">
      <div style={footerContentStyle}>
        <p style={footerParagraphStyle}>
          © {new Date().getFullYear()} Corporate Edge System.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
