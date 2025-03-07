import React, { useState } from "react";
import HRTemplate from "../../../components/HRManager/HRTemplate";
import CandidateList from "../../../components/Main/Recruitment/CandidateList";

const MngEmployee = () => {

  return (
    <HRTemplate>
      <CandidateList />
    </HRTemplate>
  );
};

export default MngEmployee;
