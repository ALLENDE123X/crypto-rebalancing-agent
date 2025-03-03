# Crypto Rebalancing Agent

An AI-powered cryptocurrency trading application that analyzes sentiment data to automatically rebalance your portfolio. The application consists of:

1. A Next.js frontend dashboard for visualizing sentiment data and portfolio performance
2. A Python sentiment analysis engine that analyzes crypto trends
3. NEAR blockchain integration for executing trades and storing sentiment data

## Project Overview

The Crypto Rebalancing Agent is designed to:

1. Analyze sentiment around cryptocurrencies (BTC, ETH, NEAR, SOL, etc.)
2. Make automated portfolio rebalancing decisions based on sentiment analysis
3. Execute trades through the user's NEAR wallet via smart contracts
4. Provide a dashboard that visualizes sentiment data, trade history, and portfolio allocation

## Architecture

This project uses a serverless architecture for cost-effectiveness:

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Serverless Python function deployed on AWS Lambda
- **Database**: AWS DynamoDB for storing sentiment data and trade history
- **Blockchain**: NEAR Protocol for executing trades and permanently storing sentiment data

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- AWS Account (free tier eligible)
- NEAR Wallet (testnet account for development)

### Local Development

#### 1. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# For local development, leave NEXT_PUBLIC_LAMBDA_API_URL commented out
```

#### 2. Python Sentiment Analysis Setup

```bash
# Navigate to sentiment-analysis directory
cd sentiment-analysis

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install boto3

# If testing locally with DynamoDB Local:
pip install boto3[ddb-local]
```

### AWS Lambda Deployment

Follow the instructions in `sentiment-analysis/aws-lambda-deployment.md` for detailed steps on deploying the sentiment analysis engine to AWS Lambda.

#### Quick Summary:

1. Create DynamoDB tables for sentiment data, trades, and portfolio
2. Create an IAM role with DynamoDB and Lambda execution permissions
3. Package the Python code and dependencies
4. Create a Lambda function and upload the package
5. Configure API Gateway to expose endpoints
6. Set up CloudWatch Events for scheduled execution

### Connecting Frontend to Lambda

1. Get your API Gateway URL from the AWS Console
2. Update your frontend `.env.local` file:

```
NEXT_PUBLIC_LAMBDA_API_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod
```

3. Deploy your frontend to Vercel or your preferred hosting service

## Project Structure

```
crypto-rebalancing-agent/
├── frontend/                 # Next.js frontend application
│   ├── components/           # React components
│   ├── lib/                  # Utility functions
│   ├── pages/                # Next.js pages
│   └── public/               # Static assets
├── sentiment-analysis/       # Python sentiment analysis engine
│   ├── crypto_sentiment_agent.py  # Main sentiment analysis script
│   └── aws-lambda-deployment.md   # AWS Lambda deployment guide
└── smart-contract/           # NEAR Protocol smart contract
```

## Running the Project

### Development Mode

```bash
# Start the frontend
cd frontend
npm run dev

# The frontend will be available at http://localhost:3000
```

### Production Mode

1. Deploy the sentiment analysis engine to AWS Lambda
2. Deploy the frontend to Vercel or similar hosting
3. Connect your NEAR wallet to the application
4. Configure your target allocation and sentiment thresholds

## Cost Management

The setup is designed to minimize costs:
- AWS Lambda free tier includes 1M requests/month
- DynamoDB free tier includes 25GB storage and 25 read/write capacity units
- Scheduled sentiment analysis runs once per day
- All components run within the AWS free tier for normal usage

## Future Improvements

- Implement real Twitter API integration
- Add more data sources for sentiment analysis (Reddit, news articles)
- Expand cryptocurrency coverage
- Implement actual reinforcement learning for trading strategies
- Deploy to NEAR mainnet for real trading

## Contract Deployment Instructions

To deploy the smart contract to the NEAR testnet, follow these steps:

### Option 1: Deploy via NEAR Wallet (Recommended for Hackathon)

1. Build the contract:
   ```
   cd smart_contract
   cargo build --target wasm32-unknown-unknown --release
   ```

2. Go to [NEAR Wallet](https://wallet.testnet.near.org/)

3. Login to your testnet account or create a new one

4. Go to the "Deploy Contract" section in your wallet

5. Upload the compiled WASM file from:
   ```
   smart_contract/target/wasm32-unknown-unknown/release/smart_contract.wasm
   ```

6. After deployment, update the contract ID in the frontend configuration:
   ```
   # In frontend/.env.local
   NEXT_PUBLIC_NEAR_CONTRACT_ID=your-account.testnet
   NEXT_PUBLIC_NEAR_NETWORK=testnet
   ```

7. Also update the contract ID in `frontend/lib/near/NearContext.js`:
   ```js
   const CONTRACT_ID = 'your-account.testnet';
   ```

### Option 2: Deploy via NEAR CLI

If you have NEAR CLI set up with proper authentication, you can use:

```bash
# Login to NEAR testnet
near login

# Deploy the contract
near deploy --wasmFile ./smart_contract/target/wasm32-unknown-unknown/release/smart_contract.wasm --accountId your-account.testnet

# Initialize the contract if needed
near call your-account.testnet new '{}' --accountId your-account.testnet
```

## Testing Contract Methods

You can use the provided test script to verify the contract works:

```bash
node test-contract.js
```

This will try to call view methods on the contract and check if it's properly deployed.
