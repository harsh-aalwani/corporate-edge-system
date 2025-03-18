import React, { useState } from "react";
import CETemplate from "../../components/CandidateEvaluator/CETemplate";
import JobListing from "../../components/CandidateEvaluator/EvaluatorDashboard";

const dashboard = () => {

  return (
    <CETemplate>
      <JobListing />
    </CETemplate>
  );
};

export default dashboard;
