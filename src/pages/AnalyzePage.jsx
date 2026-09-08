import React, { useState, useEffect } from 'react';
import DropZone from '../components/upload/DropZone';
import StageProgress from '../components/analysis/StageProgress';
import ResultDashboard from '../components/results/ResultDashboard';
import { analyzeFile } from '../services/api';

export default function AnalyzePage({ initialResultData, onClearActiveResult, onOpenAssistant, onUpdateCurrentRecord }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState('RECEIVING_FILE');
  const [progressPercent, setProgressPercent] = useState(0);
  const [resultData, setResultData] = useState(initialResultData || null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (initialResultData) {
      setResultData(initialResultData);
      if (onUpdateCurrentRecord) onUpdateCurrentRecord(initialResultData);
    }
  }, [initialResultData]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setAnalysisError(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setResultData(null);
    setAnalysisError(null);
    if (onClearActiveResult) onClearActiveResult();
    if (onUpdateCurrentRecord) onUpdateCurrentRecord(null);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setProgressPercent(10);
    setCurrentStage('RECEIVING_FILE');

    try {
      const data = await analyzeFile(selectedFile, (stageKey, stageLabel, percent) => {
        setCurrentStage(stageKey);
        setProgressPercent(percent);
      });

      setResultData(data);
      if (onUpdateCurrentRecord) onUpdateCurrentRecord(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError('Unable to analyze this file. Please verify that the backend service is running and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setResultData(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
    if (onClearActiveResult) onClearActiveResult();
    if (onUpdateCurrentRecord) onUpdateCurrentRecord(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* If result is ready (Step 3) */}
      {resultData && !isAnalyzing ? (
        <ResultDashboard 
          resultData={resultData}
          uploadedFile={selectedFile}
          onNewAnalysis={handleNewAnalysis}
          onOpenAssistant={onOpenAssistant}
        />
      ) : isAnalyzing ? (
        /* If analyzing (Step 2) */
        <StageProgress 
          currentStage={currentStage}
          progressPercent={progressPercent}
          fileName={selectedFile?.name || 'Uploaded File'}
        />
      ) : (
        /* If selecting file (Step 1) */
        <div className="space-y-6">
          <DropZone
            selectedFile={selectedFile}
            onFileSelected={handleFileSelected}
            onClearFile={handleClearFile}
            onStartAnalysis={handleStartAnalysis}
          />

          {analysisError && (
            <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center shadow-sm">
              {analysisError}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

