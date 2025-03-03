const nearAPI = require('near-api-js');
const { connect, keyStores } = nearAPI;
require('dotenv').config();

// Contract to interact with
const CONTRACT_ID = 'sweetowl8091.testnet';

// Test contract interaction
async function testContract() {
  try {
    console.log('Setting up NEAR connection...');
    
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
    
    // Setup "view" account with no keys
    const account = await near.account('dontneeda.account');
    
    console.log(`Testing contract methods on ${CONTRACT_ID}`);
    
    try {
      // Try getting all sentiments
      console.log('Testing get_all_sentiments() method...');
      const sentiments = await account.viewFunction({
        contractId: CONTRACT_ID,
        methodName: 'get_all_sentiments',
        args: {}
      });
      console.log('Sentiment scores:', sentiments);
    } catch (error) {
      console.log('Error calling get_all_sentiments():', error.message);
      
      // If the method doesn't exist, it's likely the contract is not deployed or initialized
      console.log('The contract might not be deployed or initialized properly.');
    }
    
    try {
      // Try getting portfolio
      console.log('Testing get_portfolio() method...');
      const portfolio = await account.viewFunction({
        contractId: CONTRACT_ID,
        methodName: 'get_portfolio',
        args: {}
      });
      console.log('Portfolio:', portfolio);
    } catch (error) {
      console.log('Error calling get_portfolio():', error.message);
    }
    
    console.log('Testing completed.');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testContract(); 