# AWS Lambda Deployment Guide

This guide explains how to deploy the Crypto Sentiment Agent to AWS Lambda and set up the necessary infrastructure to run it on a schedule.

## Prerequisites

- AWS Account (free tier eligible)
- AWS CLI installed and configured with your credentials
- Python 3.8+ installed locally

## Step 1: Set up DynamoDB Tables

1. Navigate to the DynamoDB service in the AWS Console
2. Create the following tables:

### crypto_sentiment_data
- Partition key: `crypto` (String)
- Sort key: `timestamp` (String)
- Create a GSI (Global Secondary Index):
  - Partition key: `date` (String)

### crypto_trades
- Partition key: `crypto` (String)
- Sort key: `timestamp` (String)

### crypto_portfolio
- Partition key: `id` (String)

## Step 2: Create IAM Role for Lambda

1. Navigate to IAM in AWS Console
2. Create a new Role with the following permissions:
   - `AmazonDynamoDBFullAccess`
   - `AWSLambdaBasicExecutionRole`

## Step 3: Prepare Lambda Deployment Package

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Navigate to sentiment-analysis directory
cd crypto-rebalancing-agent/sentiment-analysis

# Install required packages to a temporary directory
pip install boto3 -t ./package

# Copy your script to the package directory
cp crypto_sentiment_agent.py ./package/
cp python_near_integration.py ./package/

# Create a zip file
cd package
zip -r ../lambda_deployment.zip .
cd ..
```

## Step 4: Create Lambda Function

1. Navigate to AWS Lambda in the console
2. Create a new Lambda function:
   - Name: `crypto-sentiment-agent`
   - Runtime: Python 3.9
   - Use the IAM role created in Step 2
3. Upload the deployment package:
   - Click "Upload from" and select "zip file"
   - Upload the `lambda_deployment.zip` created in Step 3
4. Configure the Lambda function:
   - Handler: `crypto_sentiment_agent.lambda_handler`
   - Timeout: 30 seconds (increase if needed)
   - Memory: 256 MB (increase if needed)

## Step 5: Set Up API Gateway

1. Navigate to API Gateway in AWS Console
2. Create a REST API
3. Create the following resources and methods:
   - `/sentiment` (GET) - Returns current sentiment scores for all cryptos
   - `/sentiment/history` (GET) - Returns historical sentiment data
   - `/portfolio` (GET) - Returns current portfolio allocation
   - `/trades` (GET) - Returns recent trades
4. For each method, set up the integration:
   - Integration type: Lambda Function
   - Lambda Function: `crypto-sentiment-agent`
5. Deploy the API:
   - Create a new stage (e.g., "prod")
   - Note the Invoke URL provided after deployment

## Step 6: Set Up EventBridge for Scheduled Execution

1. Navigate to EventBridge (CloudWatch Events) in AWS Console
2. Create a new rule:
   - Name: `crypto-sentiment-daily-analysis`
   - Schedule: Fixed rate of 1 day (adjust as needed)
3. Set the target:
   - Target: Lambda function
   - Function: `crypto-sentiment-agent`
   - Configure input: Constant (JSON text)
   - Input JSON:
     ```json
     {
       "detail-type": "Scheduled Event"
     }
     ```

## Step 7: Update Frontend to Use Lambda API

Update your frontend API utility file to use the new API Gateway endpoint:

```javascript
// Example update for sentimentApi.js
const API_BASE_URL = 'https://your-api-gateway-url.amazonaws.com/prod';

// Update the existing API methods to use this new endpoint
```

## Monitoring

- You can view Lambda function logs in CloudWatch Logs
- Monitor DynamoDB usage in the DynamoDB console
- Set up CloudWatch alarms for any errors or issues

## Cost Management

The setup described above should stay within the AWS Free Tier limits if:
- The Lambda function runs once per day
- DynamoDB usage is minimal (which it should be for this application)
- API Gateway calls are limited (under 1 million per month)

To manage costs:
- Monitor your AWS Billing dashboard
- Set up AWS Budgets to alert you if costs approach a threshold
- Consider using Reserved Capacity for DynamoDB if usage increases 