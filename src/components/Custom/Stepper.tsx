import React, { ReactElement } from 'react';

type StepperProps = {
  activeStep: number;
  children: ReactElement<StepProps>[];
};

export const Stepper: React.FC<StepperProps> = ({ activeStep, children }) => {
  // Clone children and inject activeStep automatically
  return (
    <div className="flex items-center justify-center gap-8">
      {React.Children.map(children, (child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { index, activeStep })
          : child
      )}
    </div>
  );
};


type StepProps = {
  index: number;
  label: string;
  activeStep: number;
};

export const Step: React.FC<StepProps> = ({ index, label, activeStep }) => {
  const isActive = index === activeStep;
  const isCompleted = index < activeStep;

  return (
    <div className="flex flex-col items-center">
      {/* Circle */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full 
          ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}
        `}
      >
        {index + 1}
      </div>
      {/* Label */}
      <span className="mt-2 text-sm">{label}</span>
    </div>
  );
};