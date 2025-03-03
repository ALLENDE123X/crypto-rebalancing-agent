const nearAPI = require('near-api-js');
const { connect, keyStores } = nearAPI;

// Accept account ID as command line argument or use default
const accountToCheck = process.argv[2] || 'sweetowl8091.testnet';

async function verifyContract() {
  try {
    console.log(`Verifying contract deployment for account: ${accountToCheck}`);
    
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
    
    try {
      // Check if account exists
      const account = await near.account(accountToCheck);
      const state = await account.state();
      console.log('\nAccount Info:');
      console.log('----------------');
      console.log(`Account ID: ${accountToCheck}`);
      console.log(`Balance: ${nearAPI.utils.format.formatNearAmount(state.amount)} NEAR`);
      console.log(`Storage Used: ${state.storage_usage} bytes`);
      
      // If code_hash is not default, contract is deployed
      const isContractDeployed = state.code_hash !== '11111111111111111111111111111111';
      console.log(`Contract Deployed: ${isContractDeployed ? 'YES ✓' : 'NO ✗'}`);
      
      if (isContractDeployed) {
        console.log('\nTesting Contract Methods:');
        console.log('------------------------');
        
        // Try common view methods
        const viewMethods = ['get_all_sentiments', 'get_sentiment', 'get_portfolio'];
        
        for (const method of viewMethods) {
          try {
            console.log(`Testing method ${method}()...`);
            const result = await account.viewFunction({
              contractId: accountToCheck,
              methodName: method,
              args: method === 'get_sentiment' ? { crypto: 'BTC' } : {}
            });
            console.log(`✓ Success! Method ${method} returned:`, result);
          } catch (methodError) {
            console.log(`✗ Method ${method} failed:`, methodError.message);
          }
        }
        
        console.log('\nContract URL:');
        console.log(`https://explorer.testnet.near.org/accounts/${accountToCheck}`);
      }
    } catch (accountError) {
      console.error(`\n✗ Account ${accountToCheck} does not exist on NEAR testnet.`);
      console.log('\nYou need to:');
      console.log('1. Create an account at https://wallet.testnet.near.org/');
      console.log('2. Deploy your contract using:');
      console.log(`   near deploy --wasmFile ./smart_contract/target/wasm32-unknown-unknown/release/smart_contract.wasm --accountId youraccount.testnet`);
    }
  } catch (error) {
    console.error('Error verifying contract:', error);
  }
}

verifyContract(); 