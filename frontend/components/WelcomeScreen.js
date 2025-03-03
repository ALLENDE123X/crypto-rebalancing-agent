import React from 'react';
import Image from 'next/image';

export function WelcomeScreen({ onConnect, onUseDemoData }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Crypto Rebalancer</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Your AI-powered dashboard for cryptocurrency portfolio management and sentiment analysis
        </p>
      </div>
      
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Get Started</h2>
        <p className="mb-6 text-gray-600">
          Connect your NEAR wallet to see your portfolio or try the demo version with sample data.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onConnect}
            className="bg-near-primary hover:bg-near-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
          
          <button
            onClick={onUseDemoData}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Try Demo
          </button>
        </div>
      </div>
      
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Portfolio Management"
            description="View and manage your cryptocurrency portfolio with real-time data"
            iconClass="fas fa-chart-pie"
          />
          <FeatureCard
            title="Sentiment Analysis"
            description="Get AI-powered sentiment analysis for major cryptocurrencies"
            iconClass="fas fa-brain"
          />
          <FeatureCard
            title="Transaction History"
            description="Track your trading history and performance metrics"
            iconClass="fas fa-history"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, iconClass }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-2">
        <div className="bg-blue-50 rounded-full p-2 mr-2">
          <i className={`${iconClass} text-blue-500`}></i>
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default WelcomeScreen; 