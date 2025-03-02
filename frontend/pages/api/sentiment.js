// Server-side API endpoint for sentiment data
// This runs on the server and can safely access environment variables

import { getSentimentStatus } from '../../lib/api/sentimentApi';

// Mock data for now - in production this would call your Twitter/Google APIs using your keys
const mockCryptoData = {
  BTC: { score: 0.78, change: 0.13 },
  ETH: { score: 0.62, change: 0.07 },
  NEAR: { score: 0.81, change: 0.36 },
  SOL: { score: -0.25, change: -0.35 },
  DOT: { score: 0.45, change: 0.05 },
  ADA: { score: 0.22, change: -0.03 },
  BNB: { score: 0.36, change: 0.02 },
  XRP: { score: 0.18, change: 0.08 },
};

export default async function handler(req, res) {
  // Enable CORS for public deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    // In a production environment, you would use your API keys here
    // to fetch real data from Twitter, Google, etc.
    // This is all server-side code, so your keys are never exposed to the client
    
    // Example with environment variables (would actually be implemented):
    /*
    const twitterApiKey = process.env.TWITTER_API_KEY;
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const coinGeckoApiKey = process.env.COINGECKO_API_KEY;
    
    // Make API requests to external services using your keys
    const twitterData = await fetchTwitterSentiment(twitterApiKey);
    const googleData = await fetchGoogleNews(googleApiKey);
    const priceData = await fetchCoinGeckoData(coinGeckoApiKey);
    
    // Process data and calculate sentiment scores
    const sentimentScores = calculateSentiment(twitterData, googleData);
    */
    
    // Get specific crypto from query parameter
    const { crypto } = req.query;
    
    if (crypto && mockCryptoData[crypto]) {
      // Return data for a specific cryptocurrency
      res.status(200).json({
        symbol: crypto,
        ...mockCryptoData[crypto],
        status: getSentimentStatus(mockCryptoData[crypto].score)
      });
    } else {
      // Return all cryptocurrencies
      const allData = Object.entries(mockCryptoData).map(([symbol, data]) => ({
        symbol,
        ...data,
        status: getSentimentStatus(data.score)
      }));
      
      res.status(200).json(allData);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment data' });
  }
} 