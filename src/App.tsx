import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import InfoBanner from './components/InfoBanner';
import { downloadMidiFile, loadMidiWriter } from './utils/midiExport';
import type { AnalysisResult } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [midiLibLoaded, setMidiLibLoaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
  loadMidiWriter()
    .then(() => {
      setMidiLibLoaded(true);
      console.log('✅ MIDI Writer loaded!');
    })
    .catch((err) => {
      console.warn('❌ MIDI export unavailable:', err);
    });
}, []);

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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const analyzeAudio = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
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
    setError(null);

    try {
      await downloadMidiFile(result, selectedFile.name);
    } catch {
      setError('Failed to export MIDI file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,...')]" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Audio Structure Analyzer
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload your MP3 or WAV files to analyze tempo and detect song structure.
          </p>
        </header>

        <FileUpload
          selectedFile={selectedFile}
          dragActive={dragActive}
          error={error}
          onFileInput={handleFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />

        {selectedFile && (
          <div className="mt-8 text-center">
            <button
              onClick={analyzeAudio}
              disabled={isAnalyzing}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            >
              {isAnalyzing ? (
                <>
                  <span className="loader mr-2"></span>
                  <span>Analyzing Audio...</span>
                </>
              ) : (
                <>
                  <span>Analyze Structure</span>
                </>
              )}
            </button>
          </div>
        )}

        {result && (
          <AnalysisResults
            result={result}
            isExporting={isExporting}
            midiLibLoaded={midiLibLoaded}
            onExport={handleMidiExport}
          />
        )}

        <InfoBanner />
      </div>
    </div>
  );
}

export default App;