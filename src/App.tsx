import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import InfoBanner from './components/InfoBanner';
import { downloadMidiFile } from './utils/midiExport';
import { exportAbletonTemplateZip } from './utils/abletonExport';
import type { AnalysisResult } from './types';
import logo from './assets/strooq-logo-dark.png';
import logo from './assets/strooq-logo-light.png'; // ensure correct path

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAbleton, setIsExportingAbleton] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
    if (file && validTypes.includes(file.type)) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    } else {
      setError('Please select a valid MP3 or WAV file.');
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const analyzeAudio = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulated delay

      const mockResult: AnalysisResult = {
        tempo: Math.floor(Math.random() * 60) + 100,
        structure: [
          { label: 'Intro', start_time: 0, end_time: 15.2 },
          { label: 'Verse 1', start_time: 15.2, end_time: 45.8 },
          { label: 'Chorus', start_time: 45.8, end_time: 76.4 },
          { label: 'Verse 2', start_time: 76.4, end_time: 107.1 },
          { label: 'Chorus', start_time: 107.1, end_time: 137.8 },
          { label: 'Outro', start_time: 137.8, end_time: 168.5 }
        ]
      };

      setResult(mockResult);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMidiExport = async () => {
    if (!result || !selectedFile) return;
    setIsExporting(true);
    try {
      await downloadMidiFile(result, selectedFile.name);
    } catch {
      setError('Failed to export MIDI file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAbletonExport = async () => {
    if (!result || !selectedFile) return;
    setIsExportingAbleton(true);
    try {
      await exportAbletonTemplateZip(result, selectedFile.name);
    } catch {
      setError('Failed to export Ableton template.');
    } finally {
      setIsExportingAbleton(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,...')]" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Logo + Tagline */}
        <header className="flex flex-col items-center justify-center mb-12">
          <img
            src={logo}
            alt="Strooq logo"
            className="h-24 md:h-28 object-contain mb-4"
          />
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-center">
            Upload your MP3 or WAV files to analyze tempo and detect song structure.
          </p>
        </header>

        {/* File Upload */}
        <FileUpload
          selectedFile={selectedFile}
          dragActive={dragActive}
          error={error}
          onFileSelect={handleFileSelect}
          onFileInput={handleFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* Analyze Button */}
        {selectedFile && (
          <div className="text-center mt-6">
            <button
              onClick={analyzeAudio}
              disabled={isAnalyzing}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>🎵</span>
                  <span>Analyze Structure</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results + Exports */}
        {result && (
          <AnalysisResults
            result={result}
            isExporting={isExporting}
            midiLibLoaded={true}
            onExport={handleMidiExport}
            onExportAbleton={handleAbletonExport}
            isExportingAbleton={isExportingAbleton}
          />
        )}

        <InfoBanner />
      </div>
    </div>
  );
}

export default App;