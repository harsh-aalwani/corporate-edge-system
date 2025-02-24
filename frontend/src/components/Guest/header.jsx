import React, { useState, useEffect } from "react";
import data from "../data/data.json"; // Importing the JSON file

export const Header = (props) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (data?.images?.length > 0) {
            setImages(data.images);
        }
    }, []);

    useEffect(() => {
        if (images.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % images.length);
            }, 5000);

            return () => clearInterval(interval); // Cleanup interval
        }
    }, [images]);

    const headerStyle = {
        textAlign: "center",
    };

    const sliderStyle = {
        position: "relative",
        maxWidth: "100%",
        width: "100%",
        height: "auto",
        display: "inline-block",
    };

    const sliderImageStyle = {
        width: "100%",
        maxWidth: "100%",
        height: "600px",
        maxHeight: "600px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        filter: "blur(1px) brightness(50%)",
    };

    const sliderOverlayStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional for better readability
        padding: "20px",
        borderRadius: "8px",
    };

    const btnStyle = {
        textDecoration: "underline",
        color: "white",
        padding: "10px 20px",
        border: "1px solid white",
        borderRadius: "5px",
        fontSize: "1.2rem",
        display: "inline-block",
        marginTop: "10px",
    };

    return (
        <header id="header" style={headerStyle}>
            <div style={sliderStyle}>
                {images.length > 0 ? (
                    <div>
                        <img
                            src={images[currentSlide]?.src}
                            alt={images[currentSlide]?.alt || "Slider Image"}
                            style={sliderImageStyle}
                        />
                        <div style={sliderOverlayStyle}>
                            <h1>{props.data?.title || "Loading"}<span></span></h1>
                            <p>{props.data?.paragraph || "Loading"}</p>
                            <a href="#features" style={btnStyle}>
                                Learn More
                            </a>
                        </div>
                    </div>
                ) : (
                    <p>Loading Images...</p>
                )}
            </div>
        </header>
    );
};
