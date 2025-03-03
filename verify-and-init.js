const nearAPI = require('near-api-js');
const { connect, keyStores } = nearAPI;

// Replace with your actual account ID
const contractId = 'your-new-account.testnet';

// Sample initial data
const initialData = {
  BTC: 0.85,  // Positive sentiment
  ETH: 0.67,  // Positive sentiment
  NEAR: 0.75, // Positive sentiment 
  SOL: 0.45,  // Neutral sentiment
  AVAX: -0.22 // Negative sentiment
};

async function verifyAndInitContract() {
  try {
    console.log(`Verifying contract on account: ${contractId}`);
    
    // Configure NEAR connection
    const config = {
      networkId: 'testnet',
      keyStore: new keyStores.InMemoryKeyStore(),
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
    };
    
    // Connect to NEAR
    const near = await connect(config);
    
    // For view methods, we don't need to sign transactions
    const account = await near.account('dontneeda.account');
    
    console.log('Checking if contract has required methods...');
    
    // Try to call get_all_sentiments to see if the contract is deployed correctly
    try {
      const sentiments = await account.viewFunction({
        contractId,
        methodName: 'get_all_sentiments',
        args: {}
      });
      
      console.log('✅ Contract is deployed and working!');
      console.log('Current sentiments:', sentiments);
      
      if (sentiments.length === 0) {
        console.log('\nContract has no sentiment data yet.');
        console.log('To initialize the contract with test data:');
        console.log('1. Go to https://wallet.testnet.near.org/');
        console.log('2. Find your contract at:', contractId);
        console.log('3. Call the "store_sentiment" method for each crypto:');
        
        Object.entries(initialData).forEach(([crypto, score]) => {
          console.log(`   - For ${crypto}: Call store_sentiment("${crypto}", ${score})`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error calling contract method:', error.message);
      console.log('\nPossible reasons:');
      console.log('1. The contract might not be deployed correctly');
      console.log('2. The contract ID might be incorrect');
      console.log('3. The contract might not have the expected methods');
      console.log('\nSolution:');
      console.log('1. Make sure you\'ve deployed the contract at:', contractId);
      console.log('2. Check that you\'re using the correct account ID');
      console.log('3. Try deploying the contract again using the NEAR wallet interface');
    }
    
    // Check explorer link
    console.log('\nYou can view your contract on NEAR Explorer:');
    console.log(`https://explorer.testnet.near.org/accounts/${contractId}`);
    
  } catch (error) {
    console.error('Error verifying contract:', error);
  }
}

verifyAndInitContract(); 