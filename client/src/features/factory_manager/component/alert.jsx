import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertBanner = ({ type = 'warning', title, message }) => {
  const alertStyles = {
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${alertStyles[type]}`}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">ALERT: {title}</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default AlertBanner;