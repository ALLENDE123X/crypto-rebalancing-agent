import React from 'react';
import { getSentimentColorClass, getSentimentStatus } from '../../lib/api/sentimentApi';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

export function SentimentCard({ asset, crypto, sentiment, score, change, isActive, onClick }) {
  // Accept both asset and crypto props for backwards compatibility
  const assetName = asset || crypto || 'BTC';
  
  // Handle both sentiment and score props
  const scoreValue = parseFloat(sentiment || score || 0);
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

  // Set a default background color, with active state if provided
  const cardClass = isActive 
    ? "card border-2 border-near-primary cursor-pointer" 
    : "card cursor-pointer hover:shadow-md transition-shadow";

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{assetName}</h3>
          <p className={`text-sm ${getSentimentColorClass(scoreValue)}`}>
            {getSentimentStatus(scoreValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{isNaN(scoreValue) ? '0.00' : scoreValue.toFixed(2)}</p>
          <div className="flex items-center text-sm">
            <IconComponent className={`h-4 w-4 ${changeColorClass}`} />
            <span className={`ml-1 ${changeColorClass}`}>
              {isNaN(changeValue) ? '0.00' : Math.abs(changeValue).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 