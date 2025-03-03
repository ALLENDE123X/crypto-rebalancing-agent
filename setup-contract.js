const nearAPI = require('near-api-js');
const { connect, keyStores, KeyPair } = nearAPI;
require('dotenv').config();

// Contract to interact with
const CONTRACT_ID = process.env.NEAR_TESTNET_ACCOUNT || 'sweetowl8091.testnet';

// Initialize the smart contract with sample data
async function setupContract() {
  try {
    console.log('Starting contract initialization...');
    
    // Get account credentials from .env
    const accountId = process.env.NEAR_TESTNET_ACCOUNT;
    const privateKey = process.env.NEAR_PRIVATE_KEY;
    
    if (!accountId || !privateKey) {
      console.log('No credentials found. Will try to check contract status only.');
    }
    
    // Create an in-memory keystore
    const keyStore = new keyStores.InMemoryKeyStore();
    
    // Parse private key and add to keystore if available
    if (accountId && privateKey) {
      try {
        const keyPair = KeyPair.fromString(privateKey);
        await keyStore.setKey('testnet', accountId, keyPair);
        console.log(`Added credentials for account: ${accountId}`);
      } catch (keyError) {
        console.warn('Invalid private key format, will proceed in view-only mode.');
      }
    }
    
    // Configure NEAR connection
    const config = {
      networkId: 'testnet',
      keyStore,
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
    };
    
    // Connect to NEAR
    const near = await connect(config);
    
    // Setup account - use a dummy account for view-only if no valid credentials
    let account;
    try {
      account = await near.account(accountId || 'dontneeda.account');
    } catch (error) {
      console.warn('Could not connect to account, using view-only mode.');
      account = await near.account('dontneeda.account');
    }
    
    console.log(`Checking contract status on ${CONTRACT_ID}...`);
    
    // Sample crypto data to initialize
    const sampleData = {
      BTC: 0.85,  // Positive sentiment
      ETH: 0.67,  // Positive sentiment
      NEAR: 0.75, // Positive sentiment 
      SOL: 0.45,  // Neutral sentiment
      AVAX: -0.22 // Negative sentiment
    };
    
    // First, check if the contract is deployed and has the expected methods
    let isContractDeployed = false;
    
    try {
      // Try getting all sentiments
      console.log('Testing get_all_sentiments() method...');
      const sentiments = await account.viewFunction({
        contractId: CONTRACT_ID,
        methodName: 'get_all_sentiments',
        args: {}
      });
      console.log('Current sentiment scores:', sentiments);
      isContractDeployed = true;
      
      if (sentiments && sentiments.length > 0) {
        console.log('Contract already has sentiment data.');
      }
      
    } catch (error) {
      console.log('Error calling get_all_sentiments():', error.message);
      console.log('The contract might not be deployed or initialized properly.');
    }
    
    // If contract is deployed and we have valid credentials, seed with data
    if (isContractDeployed && accountId && privateKey) {
      try {
        console.log('Initializing contract with sample sentiment data...');
        
        for (const [crypto, score] of Object.entries(sampleData)) {
          console.log(`Setting sentiment for ${crypto}: ${score}`);
          
          try {
            await account.functionCall({
              contractId: CONTRACT_ID,
              methodName: 'store_sentiment',
              args: { crypto, score },
              gas: '30000000000000'
            });
            console.log(`✓ Successfully added sentiment for ${crypto}`);
          } catch (callError) {
            console.error(`Error setting sentiment for ${crypto}:`, callError.message);
          }
        }
        
        // Verify data was added
        const updatedSentiments = await account.viewFunction({
          contractId: CONTRACT_ID,
          methodName: 'get_all_sentiments',
          args: {}
        });
        console.log('Updated sentiment scores:', updatedSentiments);
        
      } catch (initError) {
        console.error('Failed to initialize contract with sample data:', initError);
      }
    } else if (isContractDeployed) {
      console.log('Contract is deployed, but we don\'t have credentials to initialize it.');
      console.log('Please use the NEAR wallet to call store_sentiment() methods.');
    } else {
      console.log('Contract does not appear to be properly deployed.');
      console.log('Please deploy the contract following the instructions in the README.');
    }
    
    console.log('Setup process completed.');
  } catch (error) {
    console.error('Error during setup:', error);
  }
}

setupContract(); 