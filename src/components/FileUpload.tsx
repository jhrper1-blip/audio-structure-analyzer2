import React from 'react';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  dragActive: boolean;
  error: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  dragActive,
  error,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  onAnalyze,
  isAnalyzing
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-400/10 scale-105'
            : 'border-slate-400 hover:border-blue-400 hover:bg-blue-400/5'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="flex flex-col items-center space-y-4 z-10 relative">
          <div
            className={`p-4 rounded-2xl transition-all duration-300 ${
              dragActive ? 'bg-blue-500 scale-110' : 'bg-slate-600'
            }`}
          >
            <Upload className="w-8 h-8 text-white" />
          </div>

          {selectedFile ? (
            <div className="flex items-center space-x-3 text-white">
              <FileAudio className="w-5 h-5 text-green-400" />
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-slate-300 text-sm">
                ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
          ) : (
            <>
              <div className="text-white">
                <p className="text-xl font-semibold mb-2">Drop your audio file here</p>
                <p className="text-slate-300">or click to browse</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-400">
                <span className="px-3 py-1 bg-slate-700 rounded-full">MP3</span>
                <span className="px-3 py-1 bg-slate-700 rounded-full">WAV</span>
              </div>
            </>
          )}
        </div>

        <input
          type="file"
          accept=".mp3,.wav,audio/mp3,audio/wav,audio/mpeg"
          onChange={onFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>

    

      {error && (
        <div className="mt-6 flex items-center space-x-3 text-red-400 bg-red-400/10 rounded-xl p-4 border border-red-400/20">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;