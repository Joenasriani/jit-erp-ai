
import React from 'react';
import type { ProblemCard, Entity, Relationship, Action, Policy } from '../types';
import { ArrowLeftIcon, CodeIcon } from './Icons';

interface ProblemCardDisplayProps {
  card: ProblemCard;
  onGenerate: () => void;
  onBack: () => void;
}

const DetailCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
    <h4 className="text-md font-semibold text-indigo-400 border-b border-gray-600 pb-2 mb-3">
      {title}
    </h4>
    {children}
  </div>
);

const ProblemCardDisplay: React.FC<ProblemCardDisplayProps> = ({ card, onGenerate, onBack }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">{card.title}</h2>
        <p className="text-gray-400 mt-2 max-w-3xl mx-auto">{card.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <DetailCard title="Entities">
            <div className="flex flex-wrap gap-4">
              {card.entities.map((entity: Entity) => (
                <div
                  key={entity.name}
                  className="flex-1 min-w-[250px] bg-gray-900 p-3 rounded-md border border-gray-700"
                >
                  <p className="font-bold text-cyan-400">{entity.name}</p>
                  <ul className="list-disc list-inside text-sm text-gray-400 pl-2 mt-1">
                    {entity.fields.map((field) => (
                      <li key={field.name}>
                        {field.name}: <span className="text-gray-300">{field.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </DetailCard>
        </div>

        <DetailCard title="Relationships">
          <ul className="space-y-2 text-gray-300">
            {card.relationships.map((rel: Relationship, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-mono bg-gray-700 px-2 py-1 rounded-md text-sm">
                  {rel.from}
                </span>
                <span className="text-indigo-400">&rarr;</span>
                <span className="font-mono bg-gray-700 px-2 py-1 rounded-md text-sm">
                  {rel.to}
                </span>
                <span className="text-xs text-gray-500">({rel.type})</span>
              </li>
            ))}
          </ul>
        </DetailCard>

        <DetailCard title="Actions">
          <ul className="space-y-2 text-gray-300">
            {card.actions.map((action: Action) => (
              <li
                key={action.name}
                className="font-mono text-sm bg-gray-700/50 px-2 py-1 rounded"
              >
                {action.name}
              </li>
            ))}
          </ul>
        </DetailCard>

        <div className="space-y-6">
          <DetailCard title="Proposed Access Policies">
            <ul className="space-y-2 text-gray-300">
              {card.policies.map((policy: Policy) => (
                <li key={policy.role}>
                  <span className="font-semibold text-cyan-400">{policy.role}:</span> proposed for{' '}
                  {policy.actions.length} actions.
                </li>
              ))}
            </ul>
          </DetailCard>

          <DetailCard title="Compliance Considerations">
            <div className="flex flex-wrap gap-2">
              {card.compliance.length > 0 ? (
                card.compliance.map((item) => (
                  <span
                    key={item}
                    className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-600"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">None specified.</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Listed standards are requirements or design considerations, not proof of compliance.
            </p>
          </DetailCard>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          <CodeIcon className="w-6 h-6" />
          Generate Prototype Code
        </button>
      </div>
    </div>
  );
};

export default ProblemCardDisplay;
