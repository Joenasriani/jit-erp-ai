
import React, { useState } from 'react';
import { BrainCircuitIcon } from './Icons';
import { UserInput, BackendTech } from '../types';

interface ProblemInputFormProps {
  onAnalyze: (userInput: UserInput) => void;
}

const placeholderText = `Describe a business pain point or workflow you want to automate. For example:

"Our team manually tracks employee vacation requests in a shared spreadsheet. It's error-prone. We need a simple system where employees can submit requests, managers can approve or deny them, and everyone can see a calendar of upcoming time off. Admins should be able to manage users and set holiday schedules."`;

const ProblemInputForm: React.FC<ProblemInputFormProps> = ({ onAnalyze }) => {
  const [formData, setFormData] = useState<UserInput>({
    projectName: '',
    backendTech: BackendTech.NESTJS,
    userRoles: '',
    compliance: '',
    painPoint: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.painPoint.trim() && formData.projectName.trim()) {
      onAnalyze(formData);
    }
  };

  const isFormValid = formData.painPoint.trim() && formData.projectName.trim();

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="projectName"
              id="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g., Vacation Tracker"
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
              required
            />
          </div>
          <div>
            <label htmlFor="backendTech" className="block text-sm font-medium text-gray-300 mb-1">
              Backend Technology
            </label>
            <select
              name="backendTech"
              id="backendTech"
              value={formData.backendTech}
              onChange={handleChange}
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
            >
              <option value={BackendTech.NESTJS}>NestJS (Node.js)</option>
              <option value={BackendTech.FASTAPI}>FastAPI (Python)</option>
            </select>
          </div>
          <div>
            <label htmlFor="userRoles" className="block text-sm font-medium text-gray-300 mb-1">
              User Roles (comma-separated)
            </label>
            <input
              type="text"
              name="userRoles"
              id="userRoles"
              value={formData.userRoles}
              onChange={handleChange}
              placeholder="e.g., Admin, Manager, Employee"
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
            />
          </div>
          <div>
            <label htmlFor="compliance" className="block text-sm font-medium text-gray-300 mb-1">
              Compliance Standards (comma-separated)
            </label>
            <input
              type="text"
              name="compliance"
              id="compliance"
              value={formData.compliance}
              onChange={handleChange}
              placeholder="e.g., GDPR, SOX"
              className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
            />
          </div>
        </div>

        {/* Pain Point Textarea */}
        <div>
          <label htmlFor="painPoint" className="block text-lg font-semibold text-gray-300 mb-2">
            Describe Your Pain Point
          </label>
          <textarea
            id="painPoint"
            name="painPoint"
            value={formData.painPoint}
            onChange={handleChange}
            placeholder={placeholderText}
            className="w-full h-52 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200 placeholder-gray-500 resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!isFormValid}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <BrainCircuitIcon className="w-6 h-6" />
            Analyze & Architect
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProblemInputForm;
