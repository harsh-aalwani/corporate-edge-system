import { useState , useEffect} from "react";
import axios from "axios";
import React from "react";
import "../../assets/css/guest/Contact.css";
import ReCAPTCHA from "react-google-recaptcha";
import { CAPTCHA_KEY } from "../../config.js";
import { useSnackbar } from "notistack";
import { useInView } from "react-intersection-observer";

const initialState = {
  name: "",
  email: "",
  message: "",
  captchaToken: "", // ✅ Matches backend
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
  fontSize: "2.2rem",
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
  const { enqueueSnackbar } = useSnackbar();
  const [captchaValid, setCaptchaValid] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaContainerRef = React.useRef(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  const { ref: captchaRef, inView: isCaptchaVisible } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleRecaptcha = async (token) => {
    if (!token) return;

    setFormData((prevState) => ({ ...prevState, captchaToken: token }));
    setCaptchaError(""); // Clear any previous error

    try {
      const res = await axios.post(
        "http://localhost:5000/api/manage/verify-captcha",
        { token }
      );
      if (res.data.success) {
        setCaptchaValid(true);
      } else {
        setCaptchaValid(false);
        setCaptchaError("CAPTCHA verification failed. Please try again.");
      }
    } catch (err) {
      console.error("CAPTCHA verification error:", err);
      setCaptchaValid(false);
      setCaptchaError("An error occurred while verifying CAPTCHA.");
    }
  };

  const clearState = () => {
    setFormData({ ...initialState });
    setStatusMessage(""); // Clear previous messages
  };

  const waitForRecaptchaAndReset = (maxRetries = 10, interval = 300) => {
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (window.grecaptcha && typeof window.grecaptcha.reset === "function") {
        try {
          window.grecaptcha.reset();
          clearInterval(intervalId);
        } catch (err) {
          console.warn("grecaptcha reset failed:", err);
        }
      } else {
        attempts++;
        if (attempts >= maxRetries) {
          clearInterval(intervalId);
          console.warn("grecaptcha not ready after retries");
        }
      }
    }, interval);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    if (!formData.captchaToken || !captchaValid) {
      setStatusMessage("Please complete the reCAPTCHA verification.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/emails/contactUs",
        formData
      );
      if (response.status === 200) {
        enqueueSnackbar("Message sent successfully! ✅", {
          variant: "success",
        });
        clearState();

        waitForRecaptchaAndReset(); // Much more reliable

        setCaptchaValid(null); // reset validation status
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage("Error sending message. Please try again. ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCaptchaVisible) return;
  
    const interval = setInterval(() => {
      const iframe = captchaContainerRef.current?.querySelector("iframe");
      if (iframe) {
        setCaptchaLoaded(true);
        clearInterval(interval);
      }
    }, 200);
  
    return () => clearInterval(interval);
  }, [isCaptchaVisible]);

  return (
    <div id="contact" style={contactStyle}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="section-title" style={sectionTitleStyle}>
              <h2 style={h2Style}>Get In Touch</h2>
              <p style={pStyle}>
                Please fill out the form below, and we will get back to you as
                soon as possible.
              </p>
            </div>
            <form onSubmit={handleSubmit} style={formStyle}>
              <div className="row row-cols-1 row-cols-md-2">
                <div className="col">
                  <div className="form-group">
                    <label
                      htmlFor="name"
                      style={{ ...labelStyle }}
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
                    <label
                      htmlFor="email"
                      style={labelStyle}
                      className="label-white"
                    >
                      Email
                    </label>
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
                <label
                  htmlFor="message"
                  style={{ ...labelStyle }}
                  className="label-white" // Override for white text
                >
                  Message
                </label>
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

              {/* Center and properly space CAPTCHA */}
<div
  ref={captchaRef}
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  }}
>
  {isCaptchaVisible && (
    <div ref={captchaContainerRef}>
      {!captchaLoaded && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          <div
            className="spinner-border text-light spinner-border-sm"
            role="status"
            style={{ width: "1rem", height: "1rem" }}
          >
            <span className="visually-hidden">Loading CAPTCHA...</span>
          </div>
          <span style={{ marginLeft: "8px", color: "#fff" }}>
            Loading CAPTCHA...
          </span>
        </div>
      )}
      <ReCAPTCHA
        sitekey={CAPTCHA_KEY}
        onChange={handleRecaptcha}
        onErrored={() => {
          console.warn("reCAPTCHA error occurred");
          setCaptchaError("Failed to load reCAPTCHA. Please refresh the page.");
          setCaptchaValid(false);
        }}
      />
    </div>
  )}
</div>

              {/* Error below CAPTCHA, above the button */}
              {captchaError && (
                <p style={{ color: "salmon", marginBottom: "10px" }}>
                  {captchaError}
                </p>
              )}

              <button
                type="submit"
                style={buttonStyle}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div
                    className="spinner-border spinner-border-sm text-light"
                    role="status"
                    style={{ width: "1rem", height: "1rem" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
              {statusMessage && (
                <p className="status-message mt-2">{statusMessage}</p>
              )}
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
                {data?.address || "Loading..."}
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
