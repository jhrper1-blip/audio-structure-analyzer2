import React from 'react';
import { AlertCircle } from 'lucide-react';

const InfoBanner: React.FC = () => {
  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-slate-300">
            <p className="font-semibold text-white mb-2">Demo Mode</p>
            <p className="text-sm leading-relaxed">
              This demo uses simulated analysis results. In a production environment, this would connect to a Python backend using Librosa for real audio analysis including tempo detection and structural segmentation. MIDI export creates markers that can be imported into DAWs like Logic Pro, Ableton Live, or Pro Tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
