import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ArrowPathIcon, KeyIcon, DocumentIcon } from '@heroicons/react/24/solid';

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Function to get the appropriate icon for transaction type
function getTransactionIcon(type) {
  switch(type.toLowerCase()) {
    case 'buy':
    case 'receive':
      return <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />;
    case 'sell':
    case 'send':
      return <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />;
    case 'swap':
    case 'exchange':
    case 'transfer':
      return <ArrowPathIcon className="h-4 w-4 text-blue-600 mr-1" />;
    case 'key':
      return <KeyIcon className="h-4 w-4 text-yellow-600 mr-1" />;
    case 'deploy':
    case 'storage':
      return <DocumentIcon className="h-4 w-4 text-purple-600 mr-1" />;
    default:
      return <ArrowPathIcon className="h-4 w-4 text-gray-600 mr-1" />;
  }
}

// Function to get the appropriate color for transaction type
function getTransactionColor(type) {
  switch(type.toLowerCase()) {
    case 'buy':
    case 'receive':
      return 'text-green-600';
    case 'sell':
    case 'send':
      return 'text-red-600';
    case 'swap':
    case 'exchange':
    case 'transfer':
      return 'text-blue-600';
    case 'key':
      return 'text-yellow-600';
    case 'deploy':
    case 'storage':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
}

export function TradeHistory({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No transactions found for this account.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[400px]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(trade.timestamp)}
                  {trade.txHash && (
                    <div className="text-xs text-gray-400 truncate max-w-[100px]">
                      {trade.txHash.substring(0, 12)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTransactionIcon(trade.type)}
                    <span className={getTransactionColor(trade.type)}>
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trade.asset}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeof trade.amount === 'number' ? parseFloat(trade.amount).toFixed(4) : '0.0000'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={parseFloat(trade.sentiment) > 0 ? 'text-green-500' : 'text-red-500'}>
                    {parseFloat(trade.sentiment).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 