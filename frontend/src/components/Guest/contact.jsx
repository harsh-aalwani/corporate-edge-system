import { useState } from "react";
import React from "react";
import "../../assets/css/guest/Contact.css";

const initialState = {
  name: "",
  email: "",
  message: "",
};

const contactStyle = {
  padding: "100px 0 60px",
  background: "linear-gradient(to right, #6372ff 0%, #5ca9fb 100%)",
  color: "rgba(255, 255, 255, 0.75)",
  textAlign: "center",
};

const sectionTitleStyle = {
  marginBottom: "40px",
  textAlign: "center",
};

const h2Style = {
  fontFamily: '"Raleway", sans-serif',
  color: "#fff",
  marginTop: "10px",
  marginBottom: "15px",
  paddingBottom: "15px",
  fontSize: "2.2rem"
};

const pStyle = {
  color: "#fff",
  fontSize: "16px",
};

const formStyle = {
  paddingTop: "20px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: 400,
  fontFamily: '"Open Sans", sans-serif',
  float: "left",
};


const formControlStyle = {
  display: "block",
  width: "100%",
  padding: "6px 12px",
  fontSize: "16px",
  lineHeight: "1.42857143",
  color: "#444",
  backgroundColor: "#fff",
  backgroundImage: "none",
  border: "1px solid #ddd",
  borderRadius: 0,
  boxShadow: "none",
  transition: "none",
};

const buttonStyle = {
  border: "1px solid white",
};

const contactItemStyle = {
  margin: "20px 0",
};

const contactItemSpanStyle = {
  color: "rgba(255, 255, 255, 1)",
  marginBottom: "10px",
  display: "block",
};

const faStyle = {
  marginRight: "10px",
};

export const Contact = ({ data }) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const clearState = () => setFormData(initialState);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    setStatusMessage("Message sent successfully! ✅");
    clearState();
    setLoading(false);
  };

  return (
    <div id="contact" style={contactStyle}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="section-title" style={sectionTitleStyle}>
              <h2 style={h2Style}>Get In Touch</h2>
              <p style={pStyle}>
                Please fill out the form below, and we will get back to you as soon as possible.
              </p>
            </div>
            <form onSubmit={handleSubmit} style={formStyle}>
              <div className="row row-cols-1 row-cols-md-2">
                <div className="col">
                  <div className="form-group">
                    <label
                      htmlFor="name"
                      style={{ ...labelStyle}}
                      className="label-white" // Override for white text
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      style={formControlStyle}
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="email" style={labelStyle} className="label-white">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      style={formControlStyle}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="message" 
                  style={{ ...labelStyle}}
                  className="label-white" // Override for white text
                >
                  Message</label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  placeholder="Write your message..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                  style={formControlStyle}
                ></textarea>
              </div>
              <button type="submit" style={buttonStyle} class="btn btn-primary" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
              {statusMessage && <p className="status-message mt-2">{statusMessage}</p>}
            </form>
          </div>

          <div className="col-lg-4 mt-4 contact-info">
            <div className="contact-item" style={contactItemStyle}>
              <h3
                style={{
                  color: "#fff",
                  marginTop: "80px",
                  marginBottom: "25px",
                  paddingBottom: "20px",
                  fontWeight: 400,
                }}
              >
                Contact Info
              </h3>
              <p className="label-white">
                <span style={contactItemSpanStyle}>
                  <i className="fa fa-map-marker" style={faStyle}></i> Address:
                </span>
                {data?.address|| "Loading..."}
              </p>
            </div>
            <div className="contact-item" style={contactItemStyle}>
              <p className="label-white">
                <span style={contactItemSpanStyle}>
                  <i className="fa fa-phone" style={faStyle}></i> Phone:
                </span>{" "}
                {data?.phone || "Loading..."}
              </p>
            </div>
            <div className="contact-item" style={contactItemStyle}>
              <p className="label-white">
                <span style={contactItemSpanStyle}>
                  <i className="fa fa-envelope" style={faStyle}></i> Email:
                </span>{" "}
                {data?.email || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
