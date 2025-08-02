import React from 'react';
import { Clock, List, Loader2, Download } from 'lucide-react';

interface StructureSection {
  label: string;
  start_time: number;
  end_time: number;
}

interface AnalysisResult {
  tempo: number;
  structure: StructureSection[];
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  isExporting: boolean;
  midiLibLoaded: boolean;
  onExport: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  isExporting,
  midiLibLoaded,
  onExport
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <List className="w-6 h-6 text-white" />
          </div>
          <span>Analysis Results</span>
        </h2>

        {midiLibLoaded && (
          <button
            onClick={onExport}
            disabled={isExporting}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export MIDI</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Export Notice */}
      {midiLibLoaded && (
        <div className="mb-6 bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-purple-500 rounded-lg flex-shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm text-purple-200">
              <p className="font-semibold mb-1">MIDI Export Available</p>
              <p>Download structural markers as a MIDI file for use in your DAW or music software.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tempo Display */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Detected Tempo</h3>
              <p className="text-3xl font-bold text-orange-400">{result.tempo} BPM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Song Structure Sections */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <span>Song Structure</span>
          <span className="text-slate-400 text-sm font-normal">({result.structure.length} sections)</span>
        </h3>

        <div className="space-y-4">
          {result.structure.map((section, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">{section.label}</h4>
                    <p className="text-slate-300">
                      {formatTime(section.start_time)} - {formatTime(section.end_time)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="text-lg font-semibold text-teal-400">
                    {formatTime(section.end_time - section.start_time)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;