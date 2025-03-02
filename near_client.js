/**
 * NEAR Blockchain Client for the Crypto Rebalancing Agent
 * 
 * This module handles interactions with the NEAR blockchain
 * using environment variables for secure authentication.
 */

const nearAPI = require('near-api-js');
const { connect, keyStores, KeyPair } = nearAPI;
const env = require('./utils/env');

/**
 * Client for interacting with NEAR blockchain and smart contracts
 */
class NearClient {
  constructor(useTestnet = true) {
    this.useTestnet = useTestnet;
    this.accountId = useTestnet ? env.near.testnetAccount : env.near.mainnetAccount;
    this.poolId = env.near.poolId;
    this.initialized = false;
  }

  /**
   * Initialize the NEAR connection
   */
  async initialize() {
    if (this.initialized) return;

    // Create an in-memory keystore
    const keyStore = new keyStores.InMemoryKeyStore();
    
    // Add the key pair to the keystore
    const keyPair = KeyPair.fromString(env.near.privateKey);
    
    // Network configuration
    const config = {
      networkId: this.useTestnet ? 'testnet' : 'mainnet',
      keyStore,
      nodeUrl: this.useTestnet 
        ? 'https://rpc.testnet.near.org' 
        : 'https://rpc.mainnet.near.org',
      walletUrl: this.useTestnet 
        ? 'https://wallet.testnet.near.org'
        : 'https://wallet.near.org',
      helperUrl: this.useTestnet 
        ? 'https://helper.testnet.near.org'
        : 'https://helper.mainnet.near.org',
    };

    // Add the key to the keystore for the specified account
    await keyStore.setKey(config.networkId, this.accountId, keyPair);

    // Connect to NEAR
    this.nearConnection = await connect(config);
    
    // Get the account
    this.account = await this.nearConnection.account(this.accountId);
    
    this.initialized = true;
    console.log(`NEAR client initialized for account: ${this.accountId}`);
  }

  /**
   * Store sentiment data in the smart contract
   * 
   * @param {string} contractId - The smart contract account ID
   * @param {string} crypto - The cryptocurrency symbol
   * @param {string} score - The sentiment score as a string
   * @returns {Promise<any>} - Transaction result
   */
  async storeSentiment(contractId, crypto, score) {
    if (!this.initialized) await this.initialize();
    
    try {
      // Call the store_sentiment method on the smart contract
      const result = await this.account.functionCall({
        contractId,
        methodName: 'store_sentiment',
        args: { crypto, score },
        gas: '100000000000000', // 100 TGas
      });
      
      console.log(`Stored sentiment for ${crypto}: ${score}`);
      return result;
    } catch (error) {
      console.error('Error storing sentiment:', error);
      throw error;
    }
  }

  /**
   * Get sentiment score for a cryptocurrency
   * 
   * @param {string} contractId - The smart contract account ID
   * @param {string} crypto - The cryptocurrency symbol
   * @returns {Promise<string|null>} - The sentiment score or null
   */
  async getSentiment(contractId, crypto) {
    if (!this.initialized) await this.initialize();
    
    try {
      // Call the get_sentiment view method on the smart contract
      const result = await this.account.viewFunction({
        contractId,
        methodName: 'get_sentiment',
        args: { crypto },
      });
      
      return result;
    } catch (error) {
      console.error('Error getting sentiment:', error);
      return null;
    }
  }
}

module.exports = NearClient;

// Example usage
if (require.main === module) {
  const main = async () => {
    try {
      // Create client
      const nearClient = new NearClient(true); // true for testnet
      await nearClient.initialize();
      
      // Use the deployed contract ID
      const contractId = 'crypto-rebalancing-agent.testnet';
      
      // Store sentiment data
      await nearClient.storeSentiment(contractId, 'BTC', '0.75');
      
      // Get sentiment data
      const sentiment = await nearClient.getSentiment(contractId, 'BTC');
      console.log(`Retrieved BTC sentiment: ${sentiment}`);
    } catch (error) {
      console.error('Error in example:', error);
    }
  };
  
  main();
} 