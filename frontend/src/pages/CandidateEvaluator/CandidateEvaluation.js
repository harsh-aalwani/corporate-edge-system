import React, { useState } from "react";
import CETemplate from "../../components/CandidateEvaluator/CETemplate";
import CECandidateEvaluation from "../../components/CandidateEvaluator/CECandidateEvaluation";

const CandidateEvaluation = () => {

  return (
    <CETemplate>
      <CECandidateEvaluation />
    </CETemplate>
  );
};

export default CandidateEvaluation;
