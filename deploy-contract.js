const fs = require('fs');
const nearAPI = require('near-api-js');
const { connect, KeyPair, keyStores } = nearAPI;
require('dotenv').config();

async function deployContract() {
  try {
    console.log('Starting deployment process...');
    
    // Get account credentials from .env
    const accountId = process.env.NEAR_TESTNET_ACCOUNT;
    const privateKey = process.env.NEAR_PRIVATE_KEY;
    
    if (!accountId || !privateKey) {
      throw new Error('Missing required environment variables NEAR_TESTNET_ACCOUNT or NEAR_PRIVATE_KEY');
    }
    
    console.log(`Using account: ${accountId}`);
    
    // Create an in-memory keystore
    const keyStore = new keyStores.InMemoryKeyStore();
    
    // Parse private key and add to keystore - handling both formats
    let keyPair;
    if (privateKey.startsWith('ed25519:')) {
      keyPair = KeyPair.fromString(privateKey);
    } else {
      keyPair = KeyPair.fromString(`ed25519:${privateKey}`);
    }
    
    await keyStore.setKey('testnet', accountId, keyPair);
    
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
    const account = await near.account(accountId);
    
    // Read the compiled WASM file
    const wasmFilePath = './smart_contract/res/smart_contract.wasm';
    const wasmFileContent = fs.readFileSync(wasmFilePath);
    
    console.log(`Deploying contract to account ${accountId}...`);
    
    // Deploy the contract
    const deployResult = await account.deployContract(wasmFileContent);
    
    console.log('Contract deployed successfully!');
    console.log(`Contract ID: ${accountId}`);
    console.log('Transaction details:', deployResult);
    
    // Call a method to initialize the contract if needed
    // const initResult = await account.functionCall({
    //   contractId: accountId,
    //   methodName: 'new',
    //   args: {},
    //   gas: '100000000000000'
    // });
    
    console.log('Deployment completed.');
  } catch (error) {
    console.error('Error during deployment:', error);
    process.exit(1);
  }
}

deployContract(); 