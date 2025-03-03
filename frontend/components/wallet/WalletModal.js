import React, { useEffect } from 'react';
import { useNear } from '../../lib/near/NearContext';

export function WalletModal({ isOpen, onClose }) {
  const { useDemoAccount } = useNear();

  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDemoWallet = () => {
    useDemoAccount();
    onClose();
  };

  const handleNearWallet = () => {
    // Redirect to NEAR Wallet for login
    const currentUrl = window.location.href;
    const nearWalletUrl = `https://testnet.mynearwallet.com/login/?success_url=${encodeURIComponent(currentUrl)}`;
    window.location.href = nearWalletUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Connect a Wallet</h2>
        
        <div className="space-y-4">
          <button 
            onClick={handleNearWallet}
            className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <span className="font-medium">NEAR Wallet</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={handleDemoWallet}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
          >
            <span className="font-medium">Demo Wallet</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 