// Server-side API endpoint for trade history
// This runs on the server and can safely access environment variables

// Mock data for now - in production this would access your NEAR account/contract
const mockTradeHistory = [
  { id: 1, timestamp: '2023-12-05T15:32:11Z', type: 'buy', asset: 'BTC', amount: '0.05', sentiment: 0.78 },
  { id: 2, timestamp: '2023-12-05T14:21:03Z', type: 'sell', asset: 'SOL', amount: '12.5', sentiment: -0.25 },
  { id: 3, timestamp: '2023-12-04T18:45:30Z', type: 'buy', asset: 'NEAR', amount: '125', sentiment: 0.81 },
  { id: 4, timestamp: '2023-12-04T09:12:45Z', type: 'buy', asset: 'ETH', amount: '1.2', sentiment: 0.62 },
  { id: 5, timestamp: '2023-12-03T21:05:22Z', type: 'sell', asset: 'DOT', amount: '45.8', sentiment: 0.32 },
  { id: 6, timestamp: '2023-12-03T16:33:57Z', type: 'buy', asset: 'BTC', amount: '0.03', sentiment: 0.65 },
  { id: 7, timestamp: '2023-12-02T10:27:19Z', type: 'sell', asset: 'SOL', amount: '18.7', sentiment: -0.15 },
  { id: 8, timestamp: '2023-12-01T13:59:01Z', type: 'buy', asset: 'NEAR', amount: '80', sentiment: 0.73 },
];

export default async function handler(req, res) {
  // Enable CORS for public deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    // In a production environment, you would use your NEAR credentials here
    // to fetch real data from your smart contract
    
    // Example with environment variables (would actually be implemented):
    /*
    const nearAccountId = process.env.NEAR_ACCOUNT_ID;
    const nearPrivateKey = process.env.NEAR_PRIVATE_KEY;
    const nearContractId = process.env.NEAR_CONTRACT_ID;
    
    // Connect to NEAR and fetch trade history
    const trades = await getNearTrades(nearAccountId, nearPrivateKey, nearContractId);
    */
    
    // Get query parameters
    const { limit = 10, asset } = req.query;
    
    let trades = [...mockTradeHistory];
    
    // Filter by asset if specified
    if (asset) {
      trades = trades.filter(trade => trade.asset === asset);
    }
    
    // Limit number of trades returned
    trades = trades.slice(0, Number(limit));
    
    res.status(200).json(trades);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
} 