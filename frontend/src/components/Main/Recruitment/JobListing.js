import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link } from "react-router-dom";

const JobListing = () => {
  const [jobListings, setJobListings] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/announcements/jobListing");
        setJobListings(response.data);
      } catch (error) {
        console.error("Error fetching job listings:", error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <StyledWrapper>
      <h2 className="title">Job Listings</h2>
      <div className="card-container">
        {jobListings.length > 0 ? (
          jobListings.map((job) => (
            <Link to={`/CandidateList/${job.announcementId}`} key={job.announcementId} className="card-link">
              <div className="card">

                {/* Candidates OR Selected Count */}
                <div className="card__total-candidates" style={{ background: job.concluded ? "#007bff" : "#ff6b6b" }}>
                  {job.concluded ? `Concluded` : `${job.totalCandidates} Candidates`}
                </div>

                <h3 className="card__title">{job.position || "Unknown Position"}</h3>
                <p className="card__content">
                  Department: {job.departmentName || "Unknown"}
                </p>
                <p className="card__content">
                  Vacancies: {job.totalVacancy > 0 ? job.totalVacancy : <span className="text-success">All Vacancies Filled</span>} 
                  | Selected: {job.totalSelected}
                </p>
                <p className="card__content">
                  Salary: {job.salaryRange?.min && job.salaryRange?.max
                    ? `${job.salaryRange.currency || "N/A"} ${job.salaryRange.min} - ${job.salaryRange.max}`
                    : "Not Disclosed Yet"}
                </p>

                <div className="card__arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height={20} width={20}>
                    <path
                      fill="#fff"
                      d="M13.4697 17.9697C13.1768 18.2626 13.1768 18.7374 13.4697 19.0303C13.7626 19.3232 14.2374 19.3232 14.5303 19.0303L20.3232 13.2374C21.0066 12.554 21.0066 11.446 20.3232 10.7626L14.5303 4.96967C14.2374 4.67678 13.7626 4.67678 13.4697 4.96967C13.1768 5.26256 13.1768 5.73744 13.4697 6.03033L18.6893 11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H18.6893L13.4697 17.9697Z"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-data">No job listings available.</p>
        )}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background-color: #f8f9fa;

  .title {
    font-size: 2rem;
    font-weight: bold;
    color: #3c3852;
    text-align: center;
    margin-bottom: 1rem;
  }

  .card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    max-width: 1200px; /* Adjust based on your layout */
    margin: 0 auto; /* Centers the whole block */
    justify-content: flex-start; /* Aligns cards from the left */
    align-items: flex-start; /* Prevents vertical alignment issues */
  }

  .card-link {
    text-decoration: none;
  }

  .card {
    width: 372px;
    padding: 1.8rem;
    cursor: pointer;
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    transition: transform 0.2s ease-in-out;
    color: #3c3852;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .card .card__title {
    font-size: 1.6rem;
    font-weight: bold;
  }

  .card .card__content {
    font-size: 1rem;
    line-height: 1.4;
  }

  /* Total Candidates Styling */
  .card .card__total-candidates {
    position: absolute;
    top: 10px;
    right: 15px;
    background: #ff6b6b;
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 15px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }

  .card .card__arrow {
    position: absolute;
    background: #7257fa;
    padding: 0.6rem;
    border-top-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    bottom: 0;
    right: 0;
    transition: 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card:hover .card__arrow {
    background: #111;
  }

  .card:hover .card__arrow svg {
    transform: translateX(6px);
  }

.card__concluded {
  position: absolute;
  top: 10px;
  left: 15px;
  background: #007bff;
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}


  .no-data {
    font-size: 1.2rem;
    color: #6e6b80;
    text-align: center;
    width: 100%;
  }
`;

export default JobListing;
