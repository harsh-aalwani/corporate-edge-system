import React, { useState } from "react";
import HRTemplate from "../../../components/HRManager/HRTemplate";
import JobListing from "../../../components/Main/Recruitment/JobListing";

const MngEmployee = () => {

  return (
    <HRTemplate>
      <JobListing />
    </HRTemplate>
  );
};

export default MngEmployee;
