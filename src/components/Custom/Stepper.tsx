import React from 'react';
import type { ReactElement } from 'react';

type StepperProps = {
  activeStep: number;
  children: ReactElement<StepProps>[];
};

export const Stepper: React.FC<StepperProps> = ({ activeStep, children }) => {
  // Clone children and inject activeStep automatically
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-6">

      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { index, activeStep })
          : child
      )}
    </div>
  );
};


type StepProps = {
  index?: number;
  label: string;
  activeStep?: number;
};

export const Step: React.FC<StepProps> = ({ index = 0, label, activeStep = 0 }) => {
  const isActive = index === activeStep;
  const isCompleted = index < activeStep;

  return (
    <div className="flex flex-col items-center w-28 md:w-32 text-center">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full
          ${isActive ? 'bg-blue-600 text-white'
            : isCompleted ? 'bg-green-500 text-white'
            : 'bg-gray-300 text-gray-700'}

        `}
      >
        {index + 1}
      </div>
      <span className="mt-2 text-sm text-center">{label}</span>
    </div>
  );
};
