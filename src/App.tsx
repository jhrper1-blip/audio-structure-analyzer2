import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import InfoBanner from './components/InfoBanner';
import Toast from './components/Toast';
import { Loader2 } from 'lucide-react';
import { downloadMidiFile } from './utils/midiExport';
import { exportAbletonTemplateZip } from './utils/abletonExport';
import type { AnalysisResult } from './types';
import darkLogo from './assets/strooq-logo-dark.png';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAbleton, setIsExportingAbleton] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Server returned an error");

    const data = await response.json();
    setResult(data);
  } catch (err) {
    console.error("Analysis failed", err);
    setError("Analysis failed. Please try again.");
  } finally {
    setIsAnalyzing(false);
    }
  };

  const handleMidiExport = async () => {
    if (!result || !selectedFile) return;
    setIsExporting(true);
    try {
      await downloadMidiFile(result, selectedFile.name);
      setToast({ message: 'MIDI exported successfully!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to export MIDI file.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAbletonExport = async () => {
    if (!result || !selectedFile) return;
    setIsExportingAbleton(true);
    try {
      await exportAbletonTemplateZip(result, selectedFile.name);
      setToast({ message: 'Ableton template exported!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to export Ableton template.', type: 'error' });
    } finally {
      setIsExportingAbleton(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Overlay Spinner */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Logo + Tagline */}
        <header className="flex flex-col items-center justify-center mb-10">
          <img
            src={darkLogo}
            alt="Strooq logo"
            className="h-24 md:h-28 object-contain mb-4"
          />
          <p className="text-base text-slate-400 max-w-xl mx-auto text-center italic font-light">
            Let your music show its shape.
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
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
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

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;