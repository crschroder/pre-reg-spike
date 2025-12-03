import { Link } from '@tanstack/react-router'
import React, { useState } from 'react';
import {Stepper} from 'react-form-stepper'

export default function CreateTournament () {
      const steps = [
    { label: 'Create Event' },
    { label: 'Add Events' },
    { label: 'Step 3' },  { label: 'Step 4' },
  ];

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };




    return ( <div className="min-h-screen bg-gray-900 p-6 text-white">
     <div style={{ padding: '2rem' }}>
      {/* Stepper itself */}
      <Stepper steps={steps} activeStep={activeStep}  
      styleConfig={{
    activeBgColor: '#2563eb',       // Tailwind blue-600
    activeTextColor: '#fff',
    completedBgColor: '#9ca3af',    // Tailwind gray-400
    completedTextColor: '#fff',
    inactiveBgColor: '#e5e7eb',     // Tailwind gray-200
    inactiveTextColor: '#374151',   // Tailwind gray-700

    // Required extra props
    size: '2em',             // circle size
    circleFontSize: '1em',   // font size inside circle
    labelFontSize: '0.875em',// font size for labels
    borderRadius: '50%',     // round circles
    fontWeight: 500,         // label font weight
  }}

/>

      {/* Step content */}
      <div style={{ marginTop: '2rem' }}>
        {activeStep === 0 && <div>Content for Step 1</div>}
        {activeStep === 1 && <div>Content for Step 2</div>}
        {activeStep === 2 && <div>Content for Step 3</div>}
        {activeStep === 3 && <div>Content for Step 3</div>}
      </div>

      {/* Navigation buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={handleBack} disabled={activeStep === 0}  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
>
          Back
        </button>
        <button onClick={handleNext} disabled={activeStep === steps.length - 1}  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
>
          Next
        </button>
      </div>
    </div>

    </div>)
}