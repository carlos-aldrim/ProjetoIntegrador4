import React, { useEffect } from "react";
import { SidebarSteps, RenderConditional, Name, Address, Identification, Security } from "../../components";
import { useFormSteps, useUser } from "../../hooks";
import { useLocation } from "react-router-dom";

export const SignUpPage: React.FC = () => {
  const { currentStep, data, resetFormSteps } = useFormSteps();
  const { createUser } = useUser();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.resetForm) {
      resetFormSteps();
    }
  }, [location.state, resetFormSteps]);

  useEffect(() => {
    if (currentStep === 4) {
      createUser(data);
    }
  }, [currentStep]);

  return (
    <div className="w-full min-h-screen overflow-auto flex flex-col items-center justify-center md:w-full">
      <div className="h-full grid md:grid-cols-2 items-center justify-items-center w-full">
        <SidebarSteps currentStep={currentStep} />

        <RenderConditional condition={currentStep === 0}>
          <Name />
        </RenderConditional>

        <RenderConditional condition={currentStep === 1}>
          <Identification />
        </RenderConditional>

        <RenderConditional condition={currentStep === 2}>
          <Address />
        </RenderConditional>

        <RenderConditional condition={currentStep === 3}>
          <Security />
        </RenderConditional>
      </div>
    </div>
  );
};
