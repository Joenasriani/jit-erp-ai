import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ['Describe Pain Point', 'Review Architecture', 'Generated Code'];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isFinalStepReached = currentStep === steps.length;
          const isCompleted = currentStep > stepNumber || isFinalStepReached;
          const isActive = currentStep === stepNumber && !isFinalStepReached;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold border-2 transition-all duration-300 ${
                    isActive ? 'bg-indigo-600 border-indigo-500 text-white' : 
                    isCompleted ? 'bg-green-600 border-green-500 text-white' : 
                    'bg-gray-700 border-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✔' : stepNumber}
                </div>
                <p className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>{step}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;