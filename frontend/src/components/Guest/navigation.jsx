import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SmoothScroll from "smooth-scroll";
import "../../assets/css/guest/Navbar.css";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logo, setLogo] = useState("");

  useEffect(() => {
    new SmoothScroll('a[href*="#"]', {
      speed: 500,
      easing: "easeInOutCubic",
    });
    // Optionally set logo from JSON data here
    // if (JsonData.Header && JsonData.Header.logo) {
    //   setLogo(JsonData.Header.logo);
    // }
  }, []);

  const handleScroll = (id) => {
    if (["/PublicAnnouncement", "/JobApplicationForm"].includes(location.pathname)) {
      navigate("/", { replace: true });
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    } else {
      scrollToSection(id);
    }
  };

  const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      const scroll = new SmoothScroll();
      scroll.animateScroll(element, null, {
        speed: 500,
        easing: "easeInOutCubic",
      });
    }
  };

  // ===============================
  // Inline style objects conversion
  // (Note: Pseudo-classes, media queries, keyframes, and pseudo-elements are not supported inline)
  // ===============================

  // Navbar General Styles (#menu)
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    marginBottom: "8px",
    position: "sticky",
    top: 0,
    zIndex: 999,
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderBottom: "1px solid rgba(231, 231, 231, 0.5)"
  };

  // Logo Styles (.navbar-header .logo)
  const logoStyle = {
    height: "50px",
    width: "auto"
  };

  // Brand Styles (.navbar-brand)
  const brandStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "bold",
    marginLeft: "10px",
    textDecoration: "none",
    color: "#000"
  };

  // Menu Items (.navbar-nav)
  const navUlStyle = {
    display: "flex",
    listStyle: "none",
    margin: 0,
    padding: 0
  };

  // Each Menu Item (.navbar-nav > li)
  const navItemStyle = {
    position: "relative",
    marginLeft: "15px"
  };

  // Menu Link Styles (.navbar-nav > li > a)
  const navLinkStyle = {
    fontFamily: '"Lato", sans-serif',
    textTransform: "uppercase",
    color: "#555",
    fontSize: "16px",
    fontWeight: 400,
    textDecoration: "none",
    padding: "10px",
    transition: "color 0.3s ease, background-color 0.3s ease"
  };

  // Enhanced Login/Register Button (.register) – if used
  const registerStyle = {
    padding: "5px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "15px",
    fontSize: "16px",
    cursor: "pointer",
    marginLeft: "15px",
    transition: "background-color 0.3s ease, transform 0.3s ease"
  };

  // Button Styles (.btn-23 from Uiverse.io)
  const btn23Style = {
    borderRadius: "99rem",
    borderWidth: "2px",
    overflow: "hidden",
    padding: "1.6rem 5rem",
    position: "relative",
    backgroundColor: "#000",
    color: "white",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "background-color 0.3s ease, transform 0.3s ease",
    border: "none"
  };

  // Shared style for spans inside .btn-23
  const btn23SpanStyle = {
    display: "grid",
    position: "absolute", // added to ensure proper positioning
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    placeItems: "center",
    transition: "opacity 0.3s ease-in-out",
  };
  

  // Custom Font Style (.custome_font)
  const customeFontStyle = {
    fontSize: "16px",
    textDecoration: "none",
    color: "white",
    fontWeight: 600
  };

  // ===============================
  // End inline styles conversion
  // ===============================

  return (
    <nav id="menu" style={navStyle} className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <a
          className="navbar-brand page-scroll"
          href="#page-top"
          style={brandStyle}
          onClick={(e) => {
            e.preventDefault();
            handleScroll("#page-top");
          }}
        >
          CES
        </a>

        {/*
          To display a logo image instead of text, uncomment the following:
          {logo && <img src={logo} alt="Company Logo" style={logoStyle} />}
        */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar-collapse"
          aria-controls="navbar-collapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar-collapse">
          <ul style={navUlStyle} className="navbar-nav ms-auto">
            {[
              { id: "#features", label: "Features" },
              { id: "#about", label: "About" },
              { id: "#services", label: "Services" },
              { id: "#team", label: "Team" },
              { id: "#contact", label: "Contact" }
            ].map(({ id, label }) => (
              <li key={id} style={navItemStyle} className="nav-item">
                <a
                  href={id}
                  style={navLinkStyle}
                  className="nav-link page-scroll"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll(id);
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
            <li style={navItemStyle} className="nav-item">
              <Link className="nav-link" to="/PublicAnnouncement" style={navLinkStyle}>
                Career
              </Link>
            </li>
            <li style={navItemStyle} className="nav-item">
              <Link className="nav-link" to="/Policy" style={navLinkStyle}>
                Policy
              </Link>
            </li>
          
            <li style={navItemStyle} className="nav-item">
              <button style={btn23Style} className="btn-23">
                
              <Link to="/Login" style={{ color: "white", textDecoration: "none" }}>
                <span style={btn23SpanStyle} className="text custome_font">
                  <b>
                    Login
                  </b>
                </span>
                <span aria-hidden="true" style={btn23SpanStyle} className="marquee">
                  <b>
                    Login
                  </b>
                </span>
                
                </Link>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
