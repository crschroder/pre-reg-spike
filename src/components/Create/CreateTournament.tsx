import { Link } from '@tanstack/react-router'
import React, { useState } from 'react';
import {Stepper, Step} from '../Custom/Stepper'

export default function CreateTournament () {
      const steps = [
    { label: 'Create Event' },
    { label: 'Add Events' },
    { label: 'Step 3' },  { label: 'Step 4' },
  ];

  const [activeStep, setActiveStep] = useState(0);

   const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };





    return (  <div className="min-h-screen bg-gray-900 p-6 text-white">
    <div className="p-8">
      {/* Stepper at the top with margin */}
      <div className="mt-2">
        <Stepper activeStep={activeStep}>
          <Step label="Create Event" />
          <Step label="Add Events" />
          <Step label="Step 3" />
          <Step label="Step 4" />
        </Stepper>
      </div>

      {/* Step content */}
      <div className="mt-8 text-center">
        {activeStep === 0 && <Tournament></Tournament>}
        {activeStep === 1 && <div>Content for Step 2</div>}
        {activeStep === 2 && <div>Content for Step 3</div>}
        {activeStep === 3 && <div>Content for Step 4</div>}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className={`px-4 py-2 rounded ${
            activeStep === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={activeStep === 3}
          className={`px-4 py-2 rounded ${
            activeStep === 3
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
)
}



export function Tournament()
{
  return (
    <div>External component for Step 1</div>
  )
}
