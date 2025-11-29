
import React, { useState, useCallback } from 'react';
import type { ProblemCard, UserInput } from './types';
import { AppState, BackendTech } from './types';
import { generateProblemCard, generateAppCode } from './services/geminiService';
import StepIndicator from './components/StepIndicator';
import ProblemInputForm from './components/ProblemInputForm';
import ProblemCardDisplay from './components/ProblemCardDisplay';
import CodeDisplay from './components/CodeDisplay';
import Loader from './components/Loader';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [problemCard, setProblemCard] = useState<ProblemCard | null>(null);
  const [generatedCode, setGeneratedCode] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (input: UserInput) => {
    setUserInput(input);
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const card = await generateProblemCard(input);
      setProblemCard(card);
      setAppState(AppState.REVIEWING_CARD);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!problemCard || !userInput) return;
    setAppState(AppState.GENERATING);
    setError(null);
    try {
      const code = await generateAppCode(problemCard, userInput.backendTech);
      setGeneratedCode(code);
      setAppState(AppState.VIEWING_CODE);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during code generation.');
      setAppState(AppState.ERROR);
    }
  }, [problemCard, userInput]);
  
  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setUserInput(null);
    setProblemCard(null);
    setGeneratedCode(null);
    setError(null);
  }, []);

  const handleBackToCard = useCallback(() => {
    setAppState(AppState.REVIEWING_CARD);
    setGeneratedCode(null);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.ANALYZING:
      case AppState.GENERATING:
        return <Loader text={appState === AppState.ANALYZING ? 'Analyzing pain point...' : 'Generating micro-SaaS...'} />;
      case AppState.REVIEWING_CARD:
        return problemCard && <ProblemCardDisplay card={problemCard} onGenerate={handleGenerate} onBack={handleReset} />;
      case AppState.VIEWING_CODE:
        return generatedCode && <CodeDisplay codeFiles={generatedCode} onRestart={handleReset} onBack={handleBackToCard} />;
      case AppState.ERROR:
        return (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        );
      case AppState.IDLE:
      default:
        return <ProblemInputForm onAnalyze={handleAnalyze} />;
    }
  };

  const currentStep = () => {
    switch (appState) {
        case AppState.IDLE: return 1;
        case AppState.ANALYZING: return 1;
        case AppState.REVIEWING_CARD: return 2;
        case AppState.GENERATING: return 2;
        case AppState.VIEWING_CODE: return 3;
        case AppState.ERROR: return 0; // No step highlighted on error
        default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <LogoIcon className="w-12 h-12 text-indigo-400" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            JIT-ERP Generator
          </h1>
        </div>
        <p className="text-lg text-gray-400 mb-6">
          Shadow IT that deploys into the real stack before you finish your coffee.
        </p>

        {appState === AppState.IDLE && (
          <div className="max-w-3xl mx-auto bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm animate-fade-in">
            <p className="text-base text-gray-300 leading-relaxed">
              JIT-ERP Generator is an AI-powered engine that bridges the gap between business needs and enterprise software. 
              It analyzes your plain-language problem description to architect a formal solution, then autonomously writes 
              the full source code—frontend, backend, and database—complete with role-based access control and compliance 
              standards. No waiting for IT tickets; just describe, review, and deploy.
            </p>
          </div>
        )}
      </header>
      
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center">
        <StepIndicator currentStep={currentStep()} />
        <div className="w-full mt-8 p-4 sm:p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
          {renderContent()}
        </div>
      </main>

      <footer className="w-full max-w-5xl mt-8 text-center text-gray-500 text-sm">
        <p>This is a conceptual demonstration. Always review generated code before deployment.</p>
      </footer>
    </div>
  );
};

export default App;
