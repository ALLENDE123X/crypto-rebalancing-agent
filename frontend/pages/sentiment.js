import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { SentimentChart } from '../components/dashboard/SentimentChart';
import { getSentimentColorClass, getSentimentStatus } from '../lib/api/sentimentApi';

// Mock data for display
const cryptoList = ['BTC', 'ETH', 'NEAR', 'SOL', 'DOT', 'ADA', 'BNB', 'XRP'];

const mockSentimentData = {
  BTC: [
    { date: 'Mar 1', score: 0.65 },
    { date: 'Mar 2', score: 0.70 },
    { date: 'Mar 3', score: 0.68 },
    { date: 'Mar 4', score: 0.72 },
    { date: 'Mar 5', score: 0.75 },
    { date: 'Mar 6', score: 0.81 },
    { date: 'Mar 7', score: 0.78 },
  ],
  ETH: [
    { date: 'Mar 1', score: 0.55 },
    { date: 'Mar 2', score: 0.53 },
    { date: 'Mar 3', score: 0.60 },
    { date: 'Mar 4', score: 0.64 },
    { date: 'Mar 5', score: 0.68 },
    { date: 'Mar 6', score: 0.65 },
    { date: 'Mar 7', score: 0.62 },
  ],
  NEAR: [
    { date: 'Mar 1', score: 0.45 },
    { date: 'Mar 2', score: 0.52 },
    { date: 'Mar 3', score: 0.63 },
    { date: 'Mar 4', score: 0.70 },
    { date: 'Mar 5', score: 0.72 },
    { date: 'Mar 6', score: 0.78 },
    { date: 'Mar 7', score: 0.81 },
  ],
  SOL: [
    { date: 'Mar 1', score: 0.10 },
    { date: 'Mar 2', score: 0.05 },
    { date: 'Mar 3', score: -0.15 },
    { date: 'Mar 4', score: -0.20 },
    { date: 'Mar 5', score: -0.22 },
    { date: 'Mar 6', score: -0.25 },
    { date: 'Mar 7', score: -0.25 },
  ]
};

// Mock sources data
const mockSources = [
  {
    name: 'Twitter',
    count: 1250,
    sentiment: 0.68
  },
  {
    name: 'Reddit',
    count: 850,
    sentiment: 0.72
  },
  {
    name: 'News Articles',
    count: 320,
    sentiment: 0.55
  }
];

export default function SentimentAnalysis() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [timeRange, setTimeRange] = useState(7);
  const [sentimentData, setSentimentData] = useState([]);
  const [sources, setSources] = useState(mockSources);
  const [loading, setLoading] = useState(true);
  
  // Load sentiment data for the selected crypto
  useEffect(() => {
    setLoading(true);
    
    // Simulate API fetch
    setTimeout(() => {
      const data = mockSentimentData[selectedCrypto] || [];
      setSentimentData(data);
      setLoading(false);
    }, 500);
    
    // In a real app, you'd fetch from an API:
    // const fetchData = async () => {
    //   try {
    //     const data = await getSentimentHistory(selectedCrypto, timeRange);
    //     setSentimentData(data);
    //   } catch (error) {
    //     console.error('Error fetching sentiment data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();
  }, [selectedCrypto, timeRange]);
  
  // Get current sentiment score
  const getCurrentSentiment = () => {
    if (sentimentData.length === 0) return 0;
    return sentimentData[sentimentData.length - 1].score;
  };
  
  // Calculate sentiment change
  const getSentimentChange = () => {
    if (sentimentData.length < 2) return 0;
    const current = sentimentData[sentimentData.length - 1].score;
    const previous = sentimentData[0].score;
    return current - previous;
  };
  
  const currentSentiment = getCurrentSentiment();
  const sentimentChange = getSentimentChange();
  
  return (
    <>
      <Head>
        <title>Sentiment Analysis | Crypto Rebalancing Agent</title>
        <meta name="description" content="Detailed crypto sentiment analysis" />
      </Head>
      
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sentiment Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed sentiment analysis for cryptocurrencies
        </p>
        
        {/* Crypto Selection */}
        <div className="mt-6 flex flex-wrap gap-2">
          {cryptoList.map((crypto) => (
            <button
              key={crypto}
              onClick={() => setSelectedCrypto(crypto)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCrypto === crypto 
                  ? 'bg-near-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {crypto}
            </button>
          ))}
        </div>
        
        {/* Time Range Selection */}
        <div className="mt-4 flex gap-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                timeRange === days 
                  ? 'bg-near-light text-near-primary border border-near-primary' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-near-primary"></div>
          </div>
        ) : (
          <>
            {/* Current Sentiment */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">{selectedCrypto} Sentiment</h2>
                  <p className={`text-sm mt-1 ${getSentimentColorClass(currentSentiment)}`}>
                    {getSentimentStatus(currentSentiment)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{currentSentiment.toFixed(2)}</div>
                  <div className={`text-sm flex items-center justify-end ${
                    sentimentChange > 0 
                      ? 'text-green-600' 
                      : sentimentChange < 0 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                  }`}>
                    {sentimentChange > 0 ? '↑' : sentimentChange < 0 ? '↓' : '—'}
                    <span className="ml-1">{Math.abs(sentimentChange).toFixed(2)}</span>
                    <span className="ml-1">({timeRange} days)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sentiment Chart */}
            <div className="mt-6">
              <SentimentChart 
                data={sentimentData}
                title={`${selectedCrypto} Sentiment Trend (${timeRange} Days)`}
              />
            </div>
            
            {/* Data Sources */}
            <div className="mt-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Data Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sources.map((source) => (
                  <div key={source.name} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                    <h3 className="font-medium">{source.name}</h3>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p className="text-sm text-gray-500">Posts Analyzed</p>
                        <p className="font-bold">{source.count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sentiment</p>
                        <p className={`font-bold ${getSentimentColorClass(source.sentiment)}`}>
                          {source.sentiment.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Insights */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h2 className="text-lg font-medium text-blue-800">AI Insights</h2>
              <p className="mt-2 text-blue-700">
                {selectedCrypto === 'BTC' && "Bitcoin's sentiment is strongly positive and improving, suggesting growing market confidence. Social media activity has increased by 15% in the past week, with most positive sentiment coming from Twitter."}
                {selectedCrypto === 'ETH' && "Ethereum's sentiment is moderately positive with a stable trend. Technical discussions about upcoming upgrades dominate the conversation, with Reddit showing the most bullish sentiment."}
                {selectedCrypto === 'NEAR' && "NEAR Protocol's sentiment has been trending strongly upward, reaching very positive territory. Recent protocol announcements and developer activity are driving increased positive sentiment across all platforms."}
                {selectedCrypto === 'SOL' && "Solana's sentiment is currently negative, with concerns about network stability being the main topic. Recent technical improvements have not yet shifted market sentiment."}
                {!['BTC', 'ETH', 'NEAR', 'SOL'].includes(selectedCrypto) && "Sentiment analysis for this cryptocurrency shows typical market uncertainty. Monitor closely for developing trends."}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
} 