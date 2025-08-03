import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all
      ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}
    `}>
      <div className="flex items-center space-x-3">
        <span>{message}</span>
        <button className="text-white hover:text-gray-200" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;