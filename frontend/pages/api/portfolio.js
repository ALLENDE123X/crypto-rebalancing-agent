// Server-side API endpoint for portfolio allocation
import { getSentimentStatus } from '../../lib/api/sentimentApi';

// Mock portfolio data
const mockPortfolio = {
  BTC: { allocation: 35, value: 14560, sentiment: 0.78 },
  ETH: { allocation: 25, value: 10400, sentiment: 0.62 },
  NEAR: { allocation: 20, value: 8320, sentiment: 0.81 },
  SOL: { allocation: 5, value: 2080, sentiment: -0.25 },
  DOT: { allocation: 5, value: 2080, sentiment: 0.45 },
  USDC: { allocation: 10, value: 4160, sentiment: 0.1 }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // In production, this would fetch data from your NEAR wallet/contract
    // Example:
    /*
    const nearAccountId = process.env.NEAR_ACCOUNT_ID;
    const nearPrivateKey = process.env.NEAR_PRIVATE_KEY;
    const coinGeckoKey = process.env.COINGECKO_API_KEY;
    
    const holdings = await getNearHoldings(nearAccountId, nearPrivateKey);
    const prices = await getCoinPrices(coinGeckoKey);
    const portfolio = calculatePortfolio(holdings, prices);
    */
    
    const totalValue = Object.values(mockPortfolio).reduce(
      (sum, asset) => sum + asset.value, 0
    );
    
    const portfolioData = Object.entries(mockPortfolio).map(([symbol, data]) => ({
      symbol,
      ...data,
      percentage: data.allocation,
      status: getSentimentStatus(data.sentiment)
    }));
    
    res.status(200).json({
      totalValue,
      assets: portfolioData
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
} 