import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const JobDetails = () => {
  const { announcementId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/announcements/${announcementId}`);
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJob();
  }, [announcementId]);

  if (!job) return <p>Loading...</p>;

  return (
    <div>
      <h2>{job.position}</h2>
      <p>Department: {job.departmentName}</p>
      <p>Vacancies: {job.totalVacancy}</p>
      <p>Selected: {job.totalSelected}</p>
      <p>Salary: {job.salaryRange?.currency} {job.salaryRange?.min} - {job.salaryRange?.max}</p>
    </div>
  );
};

export default JobDetails;
