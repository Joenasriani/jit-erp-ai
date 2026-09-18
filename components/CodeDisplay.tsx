
import React, { useState } from 'react';
import { ArrowLeftIcon, ClipboardIcon, RefreshCwIcon } from './Icons';

interface CodeDisplayProps {
  codeFiles: Record<string, string>;
  onRestart: () => void;
  onBack: () => void;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ codeFiles, onRestart, onBack }) => {
  const filePaths = Object.keys(codeFiles);
  const [activeFile, setActiveFile] = useState(filePaths[0] || null);
  const [copyStatus, setCopyStatus] = useState('Copy');

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(codeFiles[activeFile]);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };


  return (
    <div className="animate-fade-in w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Prototype Code Generated</h2>
        <p className="text-gray-400 mt-1">Review each generated file before using it in an application.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 h-[60vh] max-h-[700px]">
        {/* File Tree */}
        <div className="md:w-1/4 lg:w-1/5 bg-gray-900 p-4 rounded-lg border border-gray-700 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Files</h3>
          <ul>
            {filePaths.map((path) => (
              <li key={path} className="mb-1">
                <button
                  onClick={() => setActiveFile(path)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                    activeFile === path ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  {path.split('/').pop()}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Viewer */}
        <div className="md:w-3/4 lg:w-4/5 flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          {activeFile ? (
            <>
              <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
                <p className="text-sm font-mono text-cyan-400">{activeFile}</p>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                    <ClipboardIcon className="w-4 h-4" /> {copyStatus}
                  </button>
                </div>
              </div>
              <div className="flex-grow overflow-auto">
                 <pre className="p-4 text-sm text-gray-200 language-typescript">
                    <code className="whitespace-pre-wrap">{codeFiles[activeFile]}</code>
                 </pre>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              <p>Select a file to view its content.</p>
            </div>
          )}
        </div>
      </div>

       <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
         <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Card
        </button>
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCwIcon className="w-5 h-5" />
          Start New Project
        </button>
      </div>
    </div>
  );
};

export default CodeDisplay;
