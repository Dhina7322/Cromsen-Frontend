import React from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

const FeedbackModal = ({ show, type, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-50">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border ${type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {type === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{type === 'success' ? 'Successful' : 'Request Failed'}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">{message}</p>
        <button 
          onClick={onClose}
          className={`w-full text-white font-bold h-12 rounded-2xl transition-all shadow-xl hover:scale-[0.98] active:scale-[0.95] ${type === 'success' ? 'bg-[#1e293b] hover:bg-black' : 'bg-red-600 hover:bg-red-700 shadow-red-900/10'}`}
        >
          {type === 'success' ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
