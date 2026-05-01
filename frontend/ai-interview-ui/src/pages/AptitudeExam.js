import React from "react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import AptitudeTest from "./AptitudeTest";

function AptitudeExam() {
  useScrollToTop();
  return <AptitudeTest examOnly />;
}

export default AptitudeExam;
