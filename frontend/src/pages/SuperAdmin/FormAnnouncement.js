import React, { useState } from "react";

const AnnouncementForm = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/discord/send-announcement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, message }),
            });            

            const data = await response.json();

            if (response.ok) {
                alert("Announcement sent!");
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error sending announcement:", error);
            alert("Failed to send announcement.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Send Announcement</button>
        </form>
    );
};

export default AnnouncementForm;
