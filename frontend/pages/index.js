import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Layout } from '../components/layout/Layout';
import { SentimentCard } from '../components/dashboard/SentimentCard';
import { SentimentChart } from '../components/dashboard/SentimentChart';
import { PortfolioAllocation } from '../components/dashboard/PortfolioAllocation';
import { TradeHistory } from '../components/dashboard/TradeHistory';
import { useNear } from '../lib/near/NearContext';
import { 
  getAllSentimentScores, 
  getSentimentHistory,
  getPortfolioData,
  getRecentTrades
} from '../lib/api/sentimentApi';

export default function Dashboard() {
  const [sentiments, setSentiments] = useState([]);
  const [history, setHistory] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  
  const { isSignedIn, viewMethod } = useNear();
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch data from our API endpoints
        const [sentimentData, portfolioData, tradesData] = await Promise.all([
          getAllSentimentScores(),
          getPortfolioData(),
          getRecentTrades(5)
        ]);
        
        setSentiments(sentimentData);
        setAllocations(portfolioData.assets);
        setTrades(tradesData);
        
        // Fetch sentiment history for the selected crypto
        if (sentimentData.length > 0) {
          const historyData = await getSentimentHistory(selectedCrypto);
          setHistory(historyData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [selectedCrypto]);
  
  // Handle crypto selection for history chart
  const handleCryptoSelect = async (symbol) => {
    setSelectedCrypto(symbol);
    try {
      const historyData = await getSentimentHistory(symbol);
      setHistory(historyData);
    } catch (error) {
      console.error(`Error fetching history for ${symbol}:`, error);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>AI Crypto Rebalancer Dashboard</title>
      </Head>
      
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Crypto Portfolio Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Sentiment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {sentiments.slice(0, 4).map((crypto) => (
                <SentimentCard
                  key={crypto.symbol}
                  crypto={crypto.symbol}
                  score={crypto.score}
                  change={crypto.change}
                  onClick={() => handleCryptoSelect(crypto.symbol)}
                />
              ))}
            </div>
            
            {/* Main Content - Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Sentiment Chart - Takes 2 columns on large screens */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                <SentimentChart 
                  data={history} 
                  title={`${selectedCrypto} Sentiment Trend`} 
                />
              </div>
              
              {/* Portfolio Allocation */}
              <div className="bg-white rounded-lg shadow p-4">
                <PortfolioAllocation allocations={allocations} />
              </div>
            </div>
            
            {/* Trade History */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <TradeHistory trades={trades} />
            </div>
            
            {/* How it Works Section */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-bold mb-4">How This AI Agent Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <h3 className="font-bold mb-2">1. Sentiment Analysis</h3>
                  <p>The agent analyzes tweets, news, and social media using Google Gemini AI to gauge market sentiment for cryptocurrencies.</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-bold mb-2">2. Portfolio Optimization</h3>
                  <p>A reinforcement learning model optimizes portfolio allocation based on sentiment scores and historical performance.</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h3 className="font-bold mb-2">3. Automated Execution</h3>
                  <p>Smart contracts on the NEAR blockchain execute trades automatically with the best timing and price.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 