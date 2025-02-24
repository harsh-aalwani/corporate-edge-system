import React, { useState } from 'react';

const JobAnnouncement = () => {
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    description: '',
    file: null,
    link: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementData({
      ...announcementData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setAnnouncementData({
      ...announcementData,
      file: e.target.files[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(announcementData);
    // Handle form submission logic here
  };

  return (
    <div className="announcement-container">
      <h1 className="announcement-title">Job Announcement</h1>
      <form className="announcement-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Announcement Title:</label>
          <input
            type="text"
            name="title"
            value={announcementData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Announcement Description:</label>
          <textarea
            name="description"
            value={announcementData.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label>Announcement File:</label>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
        </div>
        <div className="form-group">
          <label>Link to Job Vacancy Form:</label>
          <input
            type="url"
            name="link"
            value={announcementData.link}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Submit Announcement</button>
      </form>
    </div>
  );
};

export default JobAnnouncement;