import React from 'react';
import { getSentimentColorClass, getSentimentStatus } from '../../lib/api/sentimentApi';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

export function SentimentCard({ crypto, score, change }) {
  const scoreValue = parseFloat(score);
  const changeValue = parseFloat(change || '0');
  
  const IconComponent = changeValue > 0 
    ? ArrowUpIcon 
    : changeValue < 0 
      ? ArrowDownIcon 
      : MinusIcon;
      
  const changeColorClass = changeValue > 0 
    ? 'text-green-600' 
    : changeValue < 0 
      ? 'text-red-600' 
      : 'text-gray-500';

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{crypto}</h3>
          <p className={`text-sm ${getSentimentColorClass(scoreValue)}`}>
            {getSentimentStatus(scoreValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{scoreValue.toFixed(2)}</p>
          <div className="flex items-center text-sm">
            <IconComponent className={`h-4 w-4 ${changeColorClass}`} />
            <span className={`ml-1 ${changeColorClass}`}>
              {Math.abs(changeValue).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 