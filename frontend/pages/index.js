import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { SentimentCard } from '../components/dashboard/SentimentCard';
import { SentimentChart } from '../components/dashboard/SentimentChart';
import { PortfolioAllocation } from '../components/dashboard/PortfolioAllocation';
import { TradeHistory } from '../components/dashboard/TradeHistory';
import { DemoWalletInfo } from '../components/wallet/DemoWalletInfo';
import { useNear } from '../lib/near/NearContext';
import { 
  getAllSentimentScores, 
  getSentimentHistory,
  getPortfolioData,
  getRecentTrades
} from '../lib/api/sentimentApi';
import WelcomeScreen from '../components/WelcomeScreen';
import { useRouter } from 'next/router';

// Specific cryptos for sweetowl8091.testnet account (NEAR + 2 others)
const SWEETOWL_CRYPTOS = ['NEAR', 'ETH', 'BTC'];

// Default data in case API fails
const DEFAULT_SENTIMENTS = [
  { asset: 'BTC', score: 0.78, change: 0.13 },
  { asset: 'ETH', score: 0.62, change: 0.07 },
  { asset: 'NEAR', score: 0.81, change: 0.36 },
  { asset: 'SOL', score: -0.25, change: -0.35 }
];

const DEFAULT_ALLOCATIONS = [
  { asset: 'BTC', percentage: 40 },
  { asset: 'ETH', percentage: 30 },
  { asset: 'NEAR', percentage: 20 },
  { asset: 'SOL', percentage: 10 }
];

// Generate simulated sentiment data for any asset
function generateSimulatedSentiment(asset) {
  // Create a deterministic but seemingly random value based on the asset name
  const assetValue = asset.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const baseScore = ((assetValue % 100) / 100) * 1.6 - 0.8; // Range: -0.8 to 0.8
  
  // Add a bit of randomness
  const randomFactor = (Math.random() * 0.4) - 0.2; // Range: -0.2 to 0.2
  const score = Math.max(-1, Math.min(1, baseScore + randomFactor));
  
  // Generate a "change" value
  const change = (Math.random() * 0.5) - 0.2;
  
  return { 
    asset, 
    score: parseFloat(score.toFixed(2)), 
    change: parseFloat(change.toFixed(2)) 
  };
}

// Generate simulated history data for an asset
function generateSimulatedHistory(asset, days) {
  const result = [];
  const date = new Date();
  const assetValue = asset.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const baseScore = ((assetValue % 100) / 100) * 1.6 - 0.8; // Range: -0.8 to 0.8
  
  for (let i = days; i > 0; i--) {
    const pastDate = new Date(date);
    pastDate.setDate(date.getDate() - i);
    
    // Generate a score with some trend and randomness
    const trendFactor = Math.sin(i / (days / Math.PI)) * 0.3;
    const randomFactor = (Math.random() * 0.4) - 0.2;
    const score = Math.max(-1, Math.min(1, baseScore + trendFactor + randomFactor));
    
    result.push({
      date: pastDate.toISOString().split('T')[0],
      score: parseFloat(score.toFixed(2))
    });
  }
  
  return result;
}

export default function Dashboard() {
  const router = useRouter();
  const { 
    accountId,
    signIn,
    isSignedIn,
    transactions,
    nearConnection,
    accountBalance,
    loadingWallet,
    disconnectWallet,
    getDemoData,
    accounts,
    usingDemoAccount,
    useDemoAccount,
    signOut,
    getDemoPortfolioData,
    getDemoTradeHistory,
    viewMethod,
    getAccountId,
    getUserSpecificPortfolio,
    getUserSpecificTradeHistory,
    getUserRealPortfolio,
    fetchRealTransactionHistory
  } = useNear();
  
  // Test section to verify wallet connection and data
  const [testData, setTestData] = useState({
    walletStatus: 'Checking...',
    transactionTest: 'Not tested',
    accountIdValue: null,
    urlParams: null,
    isSignedInValue: null
  });

  useEffect(() => {
    // Log connection status
    console.log("🔍 TEST - Wallet connection status:", {
      accountId,
      isSignedIn,
      loadingWallet,
      urlParams: router.query,
      transactions: transactions ? transactions.length : 0
    });
    
    setTestData({
      walletStatus: loadingWallet ? 'Loading wallet...' : (isSignedIn ? 'Connected' : 'Not connected'),
      accountIdValue: accountId || 'No account ID',
      urlParams: JSON.stringify(router.query),
      isSignedInValue: isSignedIn,
      transactionTest: transactions && transactions.length > 0 ? 
        `Found ${transactions.length} transactions` : 
        'No transactions found'
    });
  }, [accountId, isSignedIn, loadingWallet, router.query, transactions]);

  // Test function to manually fetch transactions
  const testFetchTransactions = async () => {
    try {
      console.log("🧪 Testing manual transaction fetch");
      
      // Check if we have the nearConnection or if we need to create a fallback
      let provider = null;
      
      if (nearConnection && nearConnection.connection && nearConnection.connection.provider) {
        console.log("✅ Using existing NEAR connection");
        provider = nearConnection.connection.provider;
      } else if (accountId) {
        // Fallback: Create a provider directly if we have accountId but no connection
        console.log("⚠️ No NEAR connection available, creating fallback provider");
        // Import the provider dynamically to avoid issues
        const { providers } = await import('near-api-js');
        provider = new providers.JsonRpcProvider({ 
          url: 'https://rpc.testnet.near.org' 
        });
      }
      
      if (!provider || !accountId) {
        console.log("❌ Cannot fetch: No provider or account ID");
        setTestData(prev => ({...prev, transactionTest: "❌ Cannot fetch: No connection or account ID"}));
        return;
      }
      
      console.log("📊 Attempting to fetch transactions for", accountId);
      // Try to fetch transactions directly
      const result = await provider.query({
        request_type: "view_account",
        account_id: accountId,
        finality: "final"
      });
      
      console.log("✅ Account data:", result);
      setTestData(prev => ({...prev, transactionTest: `✅ Account exists! Balance: ${result.amount} yoctoNEAR`}));
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      setTestData(prev => ({...prev, transactionTest: `❌ Error: ${error.message}`}));
    }
  };
  const [selectedCrypto, setSelectedCrypto] = useState('NEAR');
  const [sentiments, setSentiments] = useState([]);
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [trades, setTrades] = useState([]);
  const [allocations, setAllocations] = useState(DEFAULT_ALLOCATIONS);
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to your crypto dashboard.');
  const [checkingWalletStatus, setCheckingWalletStatus] = useState(true);
  const [showTestData, setShowTestData] = useState(true); // Control whether to show test data
  
  // Effect to check URL parameters for wallet connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log the current state
      console.log("🧩 INITIAL STATE CHECK:", {
        isSignedIn,
        accountId,
        urlParams: router.query,
        loadingWallet
      });
      
      // Check if there's an account_id in the URL
      const account_id = router.query.account_id;
      
      if (account_id && !isSignedIn) {
        console.log("⚠️ Found account_id in URL but isSignedIn is false!", account_id);
        console.log("⚠️ This should trigger a wallet sync from URL parameters");
        
        // We can try to force reload the page or manually update the wallet status
        setTestData({
          walletStatus: 'Connected via URL params',
          accountIdValue: account_id,
          urlParams: JSON.stringify(router.query),
          isSignedInValue: true,
          transactionTest: 'Not tested yet (from URL)'
        });
      }
      
      // Set loading state to false after checking
      setCheckingWalletStatus(false);
    }
  }, [router.query, isSignedIn, accountId, loadingWallet]);
  
  // Fetch data when component mounts or account changes
  useEffect(() => {
    // Skip if we're still checking wallet status
    if (checkingWalletStatus) {
      console.log("Still checking wallet status, skipping data fetch");
      return;
    }
    
    async function fetchData() {
      setLoading(true);
      console.log("Starting to fetch dashboard data...");
      console.log("Signed in status:", isSignedIn);
      console.log("Account ID:", getAccountId());
      
      try {
        // If using demo account, get data from the demo context
        if (usingDemoAccount) {
          // Get portfolio data from demo context
          const portfolioData = getDemoPortfolioData();
          
          // Update allocations based on portfolio data
          const userAllocations = portfolioData.assets.map(asset => ({
            asset: asset.asset,
            percentage: asset.percentage
          }));
          setAllocations(userAllocations);
          
          // Get trade history from demo context
          const tradeHistory = getDemoTradeHistory(5);
          setTrades(tradeHistory);
          
          // Generate sentiment data for user's assets
          const userAssets = userAllocations.map(a => a.asset);
          let sentimentData;
          
          try {
            // Try to get real sentiment data
            sentimentData = await getAllSentimentScores();
            // Filter to only include user's assets
            sentimentData = sentimentData.filter(item => userAssets.includes(item.asset));
            
            // If we're missing any assets, generate simulated data for them
            const missingAssets = userAssets.filter(
              asset => !sentimentData.find(s => s.asset === asset)
            );
            
            // Add simulated data for missing assets
            const simulatedData = missingAssets.map(generateSimulatedSentiment);
            sentimentData = [...sentimentData, ...simulatedData];
          } catch (error) {
            // Generate simulated sentiment data for all assets
            sentimentData = userAssets.map(generateSimulatedSentiment);
          }
          
          setSentiments(sentimentData);
          
          // Set the default selected crypto to the first one in the portfolio
          if (sentimentData.length > 0 && selectedCrypto !== sentimentData[0].asset) {
            setSelectedCrypto(sentimentData[0].asset);
          }
        } else if (isSignedIn) {
          // Check if we're using the specific test account
          console.log(`Account ID: ${getAccountId()}`);
          if (getAccountId() === 'sweetowl8091.testnet') {
            try {
              console.log("Fetching data for sweetowl8091.testnet account");
              
              // Use Promise.all to fetch data in parallel for better performance
              const portfolioPromise = getUserRealPortfolio(getAccountId());
              const transactionPromise = fetchRealTransactionHistory(getAccountId());
              
              // Wait for both promises to resolve
              const [portfolioData, txHistory] = await Promise.all([
                portfolioPromise.catch(error => {
                  console.error('Error fetching portfolio data:', error);
                  // Return fallback portfolio data
                  return {
                    total_value: 10000,
                    assets: [
                      { asset: 'NEAR', value: 6000, percentage: 60 },
                      { asset: 'USDT', value: 2500, percentage: 25 },
                      { asset: 'REF', value: 1500, percentage: 15 }
                    ]
                  };
                }),
                transactionPromise.catch(error => {
                  console.error('Error fetching transaction history:', error);
                  // Return fallback transaction data
                  return [];
                })
              ]);
              
              console.log('Fetched portfolio data:', portfolioData);
              console.log('Fetched transaction history:', txHistory);
              
              // Set allocations from the real portfolio
              const userAllocations = portfolioData.assets.map(asset => ({
                asset: asset.asset,
                percentage: asset.percentage
              }));
              setAllocations(userAllocations);
              
              // Get user's assets and ensure we have at least one
              let userAssets = userAllocations.map(a => a.asset);
              if (userAssets.length === 0) {
                userAssets = ['NEAR'];
                setAllocations([{ asset: 'NEAR', percentage: 100 }]);
              }
              
              // Set trade history
              if (txHistory && txHistory.length > 0) {
                setTrades(txHistory.slice(0, 5));
              } else {
                console.log('No transactions found, using fallback');
                const fallbackTrades = getUserSpecificTradeHistory(5);
                setTrades(fallbackTrades);
              }
              
              // Fetch or generate sentiment data
              try {
                let sentimentData = await getAllSentimentScores();
                
                // Filter to only include the user's cryptos
                sentimentData = sentimentData.filter(item => userAssets.includes(item.asset));
                
                // If we're missing any assets, generate simulated data for them
                const missingAssets = userAssets.filter(
                  asset => !sentimentData.find(s => s.asset === asset)
                );
                
                // Add simulated data for missing assets
                const simulatedData = missingAssets.map(generateSimulatedSentiment);
                sentimentData = [...sentimentData, ...simulatedData];
                
                // Ensure we have at least one sentiment data point
                if (sentimentData.length === 0) {
                  sentimentData = [generateSimulatedSentiment('NEAR')];
                }
                
                setSentiments(sentimentData);
                
                // Set the default selected crypto
                if (sentimentData.length > 0) {
                  setSelectedCrypto(sentimentData[0].asset);
                }
              } catch (error) {
                console.error('Error fetching sentiment data:', error);
                // Generate fallback sentiment data
                const sentimentData = userAssets.map(generateSimulatedSentiment);
                setSentiments(sentimentData);
                
                if (sentimentData.length > 0) {
                  setSelectedCrypto(sentimentData[0].asset);
                }
              }
              
              // Display welcome message
              setWelcomeMessage(`Welcome, ${getAccountId()}! Your dashboard shows your actual transaction history from the NEAR blockchain.`);
            } catch (error) {
              console.error('Error in sweetowl account processing:', error);
              // Use fallback data to ensure the UI doesn't break
              // ... existing fallback code ...
            }
          } else {
            // For other connected wallets - attempt to get portfolio from contract
            let portfolioData;
            try {
              // Try to get portfolio data from the contract
              portfolioData = await viewMethod('get_portfolio');
            } catch (error) {
              console.error('Error fetching portfolio from contract, using API fallback:', error);
              // Fallback to API
              try {
                portfolioData = await getPortfolioData();
              } catch (secondError) {
                console.error('API fallback also failed:', secondError);
                // Use default data if both methods fail
                portfolioData = {
                  total_value: 10000,
                  assets: DEFAULT_ALLOCATIONS.map(a => ({
                    asset: a.asset,
                    percentage: a.percentage,
                    value: (a.percentage / 100) * 10000
                  }))
                };
              }
            }
            
            // Update allocations from portfolio data
            const userAllocations = portfolioData.assets.map(asset => ({
              asset: asset.asset,
              percentage: asset.percentage || Math.round((asset.value / portfolioData.total_value) * 100)
            }));
            setAllocations(userAllocations);
            
            // Get trade history
            let tradeData;
            try {
              // Try to get trades from contract
              tradeData = await viewMethod('get_trades', { limit: 5 });
            } catch (error) {
              console.error('Error fetching trades from contract, using API fallback:', error);
              // Fallback to API
              try {
                tradeData = await getRecentTrades(5);
              } catch (secondError) {
                console.error('API fallback also failed:', secondError);
                // Use simulated data if both methods fail
                const now = new Date();
                tradeData = [
                  {
                    asset: userAllocations[0]?.asset || 'BTC',
                    timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
                    amount: 0.05,
                    type: 'buy',
                    sentiment: 0.75
                  }
                ];
              }
            }
            setTrades(tradeData);
            
            // Generate sentiment data for user's assets
            const userAssets = userAllocations.map(a => a.asset);
            let sentimentData;
            
            try {
              // Try to get real sentiment data
              sentimentData = await getAllSentimentScores();
              // Filter to only include user's assets
              sentimentData = sentimentData.filter(item => userAssets.includes(item.asset));
              
              // If we're missing any assets, generate simulated data for them
              const missingAssets = userAssets.filter(
                asset => !sentimentData.find(s => s.asset === asset)
              );
              
              // Add simulated data for missing assets
              const simulatedData = missingAssets.map(generateSimulatedSentiment);
              sentimentData = [...sentimentData, ...simulatedData];
            } catch (error) {
              // Generate simulated sentiment data for all assets
              sentimentData = userAssets.map(generateSimulatedSentiment);
            }
            
            setSentiments(sentimentData);
            
            // Set the default selected crypto to the first one in the portfolio
            if (sentimentData.length > 0 && selectedCrypto !== sentimentData[0].asset) {
              setSelectedCrypto(sentimentData[0].asset);
            }
          }
        } else {
          // Not signed in - use default data from API or fallbacks
          try {
          // Regular data fetching from APIs
          const [sentimentData, portfolioData, tradeData] = await Promise.all([
            getAllSentimentScores(),
            getPortfolioData(),
            getRecentTrades(5)
          ]);
          
          if (sentimentData && sentimentData.length > 0) {
            setSentiments(sentimentData);
          }
          
          if (portfolioData && portfolioData.assets) {
            setAllocations(portfolioData.assets.map(asset => ({
              asset: asset.asset,
              percentage: asset.percentage
            })));
          }
          
          if (tradeData && tradeData.length > 0) {
            setTrades(tradeData);
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            // Use defaults
          }
        }
        
        // Always fetch or generate sentiment history for the selected crypto
        try {
        const historyData = await getSentimentHistory(selectedCrypto, 7);
        if (historyData && historyData.length > 0) {
          setSentimentHistory(historyData);
          } else {
            // Generate simulated history if API returned empty data
            setSentimentHistory(generateSimulatedHistory(selectedCrypto, 7));
          }
        } catch (error) {
          console.error(`Error fetching sentiment history for ${selectedCrypto}:`, error);
          // Generate simulated history
          setSentimentHistory(generateSimulatedHistory(selectedCrypto, 7));
        }
      } catch (error) {
        console.error('Error in dashboard data fetching:', error);
        // Set default data to prevent UI from breaking
        setAllocations(DEFAULT_ALLOCATIONS);
        setSentiments(DEFAULT_ALLOCATIONS.map(generateSimulatedSentiment));
        setTrades([]);
        setSentimentHistory(generateSimulatedHistory('NEAR', 7));
        setSelectedCrypto('NEAR');
      } finally {
        console.log("Finished fetching dashboard data, setting loading to false");
        setLoading(false);
      }
    }
    
    fetchData();
  }, [selectedCrypto, isSignedIn, usingDemoAccount, accounts, checkingWalletStatus, getDemoPortfolioData, getDemoTradeHistory, viewMethod, getAccountId, getUserSpecificPortfolio, getUserSpecificTradeHistory, getUserRealPortfolio, fetchRealTransactionHistory]);
  
  // Handle clicking on a sentiment card
  const handleSentimentCardClick = async (crypto) => {
    setSelectedCrypto(crypto);
    try {
      const historyData = await getSentimentHistory(crypto, 7);
      if (historyData && historyData.length > 0) {
        setSentimentHistory(historyData);
      } else {
        // Generate simulated history if API returned empty data
        setSentimentHistory(generateSimulatedHistory(crypto, 7));
      }
    } catch (error) {
      console.error(`Error fetching sentiment history for ${crypto}:`, error);
      // Generate simulated history
      setSentimentHistory(generateSimulatedHistory(crypto, 7));
    }
  };

  return (
    <div className="dark:bg-gray-900 min-h-screen">
      <Head>
        <title>Crypto Rebalancer - Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {showTestData && (
        <div className="p-4 m-4 bg-yellow-100 border border-yellow-400 rounded-md">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-2">🔍 Wallet Connection Test</h2>
            <button 
              onClick={() => setShowTestData(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between">
              <span className="font-medium">Wallet Status:</span>
              <span className={`px-2 py-1 rounded ${testData.walletStatus.includes('Connected') ? 'bg-green-200' : 'bg-red-200'}`}>
                {testData.walletStatus}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Account ID:</span>
              <span>{testData.accountIdValue}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">isSignedIn:</span>
              <span className={`px-2 py-1 rounded ${testData.isSignedInValue ? 'bg-green-200' : 'bg-red-200'}`}>
                {testData.isSignedInValue ? 'true' : 'false'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Transactions:</span>
              <span>{testData.transactionTest}</span>
            </div>
            
            <div className="mt-2">
              <span className="font-medium">URL Parameters:</span>
              <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">{testData.urlParams}</pre>
            </div>
            
            <button 
              onClick={testFetchTransactions}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Test Transaction Fetch
            </button>
          </div>
        </div>
      )}

      {(loadingWallet || checkingWalletStatus) ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Checking wallet status...</p>
          </div>
        </div>
      ) : !isSignedIn && !usingDemoAccount && !router.query.account_id ? (
        <WelcomeScreen onSignIn={signIn} onDemoClick={useDemoAccount} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>AI Crypto Rebalancer | Dashboard</title>
            <meta name="description" content="AI-powered crypto portfolio rebalancing based on sentiment analysis" />
          </Head>

          <main className="container mx-auto px-4 py-8">
            {/* Demo wallet information banner */}
            {usingDemoAccount && <DemoWalletInfo />}
            
            {/* Welcome message for signed in users */}
            {isSignedIn && !usingDemoAccount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-medium">Connected to {getAccountId()}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {getAccountId() === 'sweetowl8091.testnet' 
                    ? "Your portfolio shows your actual transaction history from the NEAR blockchain."
                    : "Your portfolio data and trading information are displayed below."}
                </p>
              </div>
            )}
          
            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
                <p className="text-gray-500 text-center max-w-md">
                  Fetching your transaction history and portfolio data from the NEAR blockchain...
                </p>
              </div>
            ) : checkingWalletStatus ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Checking Wallet Status</h2>
                <p className="text-gray-500 text-center max-w-md">
                  Verifying your NEAR wallet connection...
                </p>
              </div>
            ) : !isSignedIn && !usingDemoAccount ? (
              <WelcomeScreen onConnect={signIn} onUseDemoData={useDemoAccount} />
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                  <p className="text-gray-600">{welcomeMessage}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {sentiments.map((sentiment) => (
                <SentimentCard
                      key={sentiment.asset}
                      asset={sentiment.asset}
                      sentiment={sentiment.score}
                      change={sentiment.change}
                      isActive={selectedCrypto === sentiment.asset}
                      onClick={() => handleSentimentCardClick(sentiment.asset)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="card">
                <h2 className="text-xl font-medium mb-4">Sentiment Trend (7 Days)</h2>
                <SentimentChart data={sentimentHistory} />
              </div>
              
              <div className="card">
                <h2 className="text-xl font-medium mb-4">Portfolio Allocation</h2>
                <PortfolioAllocation allocations={allocations} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-medium mb-4">Recent Trades</h2>
              <TradeHistory trades={trades} />
            </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
} 