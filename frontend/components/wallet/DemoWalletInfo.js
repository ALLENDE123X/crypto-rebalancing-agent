import React, { useState } from 'react';
import { useNear } from '../../lib/near/NearContext';
import { DEMO_CONFIG } from '../../lib/near/demo-config';

export function DemoWalletInfo() {
  const { usingDemoAccount } = useNear();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!usingDemoAccount) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
          <h3 className="font-medium">Using Demo Wallet</h3>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isOpen ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {isOpen && (
        <div className="mt-3 text-sm">
          <p className="mb-2">
            You are currently using a demo wallet for testing purposes. This lets you explore the application
            without connecting your own NEAR wallet.
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 mt-3">
            <h4 className="font-medium mb-2">Demo Portfolio:</h4>
            <ul className="space-y-1">
              {Object.entries(DEMO_CONFIG.INITIAL_PORTFOLIO).map(([asset, amount]) => (
                <li key={asset} className="flex justify-between">
                  <span>{asset}:</span>
                  <span className="font-mono">{amount} ({DEMO_CONFIG.PORTFOLIO_USD_VALUES[asset]} USD)</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p className="mt-3 text-xs text-gray-600">
            Note: All transactions with the demo wallet are simulated and do not interact with the NEAR blockchain.
            To perform real transactions, please disconnect and connect your own NEAR testnet wallet.
          </p>
        </div>
      )}
    </div>
  );
} 