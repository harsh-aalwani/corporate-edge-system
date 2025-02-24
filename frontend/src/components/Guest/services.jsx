import React from "react";

export const Services = ({ data }) => {
  return (
    <div
      id="services"
      style={{
        padding: "100px 0",
        background: "linear-gradient(to right, #6372ff 0%, #5ca9fb 100%)",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div className="container">
        {/* Section Title */}
        <div
          className="section-title"
          style={{ position: "relative", marginBottom: "30px" }}
        >
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              fontFamily: '"Raleway", sans-serif',
              color: "#fff",
              position: "relative",
              display: "inline-block",
              paddingBottom: "10px",
            }}
          >
            Our Services
            <span
              style={{
                position: "absolute",
                background: "rgba(255, 255, 255, 0.3)",
                height: "4px",
                width: "60px",
                bottom: "0",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            ></span>
          </h2>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              marginTop: "8px",
              lineHeight: "1.4",
              fontSize: "1rem",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            With our service, you can improve the workflow in your organization and make daily processes easier.
          </p>
        </div>

        {/* Services Grid */}
        <div className="row">
          {Array.isArray(data) && data.length > 0 ? (
            data.map((service, index) => (
              <div
                key={`${service.name}-${index}`}
                className="col-md-4"
                style={{ marginBottom: "35px" }}
              >
                <i
                  className={service.icon}
                  aria-hidden="true"
                  style={{
                    fontSize: "42px",
                    width: "120px",
                    height: "120px",
                    padding: "40px 0",
                    background: "linear-gradient(to right, #6372ff 0%, #5ca9fb 100%)",
                    borderRadius: "50%",
                    color: "#fff",
                    display: "inline-block",
                    boxShadow: "10px 10px 10px rgba(0, 0, 0, 0.05)",
                  }}
                ></i>
                <div
                  className="service-desc"
                  style={{ margin: "8px 8px 15px" }}
                >
                  <h3 style={{ fontWeight: "500", padding: "5px 0", color: "#fff" }}>
                    {service.name}
                  </h3>
                  <p style={{ color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.5", marginBottom: "0" }}>
                    {service.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "18px", fontWeight: "500", marginTop: "20px" }}>
              Loading services...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
