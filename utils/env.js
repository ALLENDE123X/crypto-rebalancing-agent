/**
 * Environment variable utilities
 * 
 * This file provides helper functions for loading and accessing
 * environment variables safely throughout your application.
 */

require('dotenv').config();

/**
 * Gets an environment variable safely with optional fallback
 * 
 * @param {string} key - The environment variable key
 * @param {string} [defaultValue] - Optional default value if env var is not set
 * @returns {string} The environment variable value or default
 */
function getEnv(key, defaultValue = '') {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue;
}

/**
 * Environment variables grouped by service
 */
module.exports = {
  twitter: {
    apiKey: getEnv('TWITTER_API_KEY'),
    apiSecret: getEnv('TWITTER_API_SECRET'),
    bearerToken: getEnv('TWITTER_BEARER_TOKEN'),
    accessToken: getEnv('TWITTER_ACCESS_TOKEN'),
    accessSecret: getEnv('TWITTER_ACCESS_SECRET'),
  },
  google: {
    apiKey: getEnv('GOOGLE_API_KEY'),
    apiSecret: getEnv('GOOGLE_API_SECRET'),
  },
  coinGecko: {
    apiKey: getEnv('COINGECKO_API_KEY'),
  },
  near: {
    testnetAccount: getEnv('NEAR_TESTNET_ACCOUNT'),
    mainnetAccount: getEnv('NEAR_MAINNET_ACCOUNT'),
    privateKey: getEnv('NEAR_PRIVATE_KEY'),
    poolId: getEnv('NEAR_POOL_ID', '146'),
  }
}; 