import React, { useState, useEffect } from 'react';
import { useNear } from '../../lib/near/NearContext';
import { WalletModal } from './WalletModal';

export function WalletConnection() {
  const { isSignedIn, signIn, signOut, useDemoAccount, getAccountId, loading, usingDemoAccount } = useNear();
  const [showOptions, setShowOptions] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [modalAttempted, setModalAttempted] = useState(false);

  // Check if the NEAR modal fails to open and show fallback
  useEffect(() => {
    if (modalAttempted) {
      // Set a timeout to check if the NEAR modal element exists and is visible
      const checkModalTimeout = setTimeout(() => {
        const nearModalElement = document.querySelector('.nws-modal-wrapper');
        if (!nearModalElement || nearModalElement.style.display === 'none') {
          console.log('NEAR modal not detected, showing fallback');
          setShowFallbackModal(true);
        }
        setModalAttempted(false);
      }, 1000); // Give the NEAR modal a second to appear
      
      return () => clearTimeout(checkModalTimeout);
    }
  }, [modalAttempted]);

  if (loading) {
    return (
      <button disabled className="btn-secondary opacity-75">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </button>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-2">
        <span className="hidden md:inline text-sm text-gray-600">
          {usingDemoAccount ? (
            <span className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1.5"></span>
              {getAccountId()} (Demo)
            </span>
          ) : (
            getAccountId()
          )}
        </span>
        <button
          onClick={signOut}
          className="btn-secondary text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const handleConnectWallet = () => {
    try {
      signIn();
      setModalAttempted(true);
    } catch (error) {
      console.error("Error opening wallet modal:", error);
      setShowFallbackModal(true);
    }
  };

  if (showOptions) {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        <button 
          onClick={() => {
            handleConnectWallet();
            setShowOptions(false);
          }}
          className="btn-primary text-sm"
        >
          Connect Your Wallet
        </button>
        <button 
          onClick={() => {
            useDemoAccount();
            setShowOptions(false);
          }}
          className="btn-secondary text-sm"
        >
          Use Demo Wallet
        </button>
        <button 
          onClick={() => setShowOptions(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowOptions(true)}
        className="btn-primary"
      >
        Connect Wallet
      </button>
      
      {/* Fallback modal if NEAR wallet selector fails */}
      <WalletModal 
        isOpen={showFallbackModal} 
        onClose={() => setShowFallbackModal(false)} 
      />
    </>
  );
} 