import {  getRouteApi, useParams, useMatch } from '@tanstack/react-router'
import React, { useState } from 'react';
import {Stepper, Step} from '../Custom/Stepper'

type Props = { tournamentId?: string };



export default function CreateTournament ({tournamentId}:Props) {
      const steps = [
    { label: 'Create Event' },
    { label: 'Add Events' },
    { label: 'Step 3' },  { label: 'Step 4' },
  ];
 
  const [activeStep, setActiveStep] = useState(0);

  

  
  if (tournamentId) {
    // edit mode → fetch tournament by id
  } else {
    // create mode → new tournament
  }


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

  const handleSave = () => {
    
  }

    return (
  <div className="min-h-screen bg-gray-900 p-6 text-white flex flex-col items-center">
    <div className="p-8 w-full max-w-md">
      {tournamentId ? (
        <h1 className="text-xl font-semibold mb-6">
          Editing tournament {tournamentId}
        </h1>
      ) : (
        <h1 className="text-xl font-semibold mb-6">Creating a new tournament</h1>
      )}

      {/* Form fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Date
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament date"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Location
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament location"
          />
        </div>
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
    onClick={handleSave}
    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    Save
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
);
}



export function Tournament()
{
  return (
    <div>External component for Step 1</div>
  )
}
