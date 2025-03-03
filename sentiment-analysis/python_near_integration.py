import os
import json
import time
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('near_integration')

# Simulated NEAR integration for Lambda deployment
# In a production environment, this would use the NEAR Python SDK
# but we're keeping it simple for the hackathon

def store_sentiment_on_near(crypto, sentiment_score):
    """
    Store sentiment data on the NEAR blockchain.
    This is a simulated function for the hackathon.
    
    Args:
        crypto (str): Cryptocurrency symbol (e.g., "BTC")
        sentiment_score (float): Sentiment score between -1 and 1
    
    Returns:
        bool: Success status
    """
    try:
        # Log the action (would be a blockchain transaction in production)
        logger.info(f"[NEAR] Storing sentiment for {crypto}: {sentiment_score}")
        
        # In a real implementation, we would:
        # 1. Connect to NEAR using credentials from environment variables
        # 2. Call a smart contract function to store the sentiment
        # 3. Return the transaction receipt
        
        # For the hackathon, we'll simulate this with a log message
        logger.info(f"[NEAR] Transaction simulated: store_sentiment({crypto}, {sentiment_score})")
        
        # Simulate blockchain latency
        time.sleep(0.2)
        
        return True
    
    except Exception as e:
        logger.error(f"[NEAR] Error storing sentiment on blockchain: {str(e)}")
        return False

def execute_trade(crypto, amount, sentiment):
    """
    Execute a trade on the NEAR blockchain.
    This is a simulated function for the hackathon.
    
    Args:
        crypto (str): Cryptocurrency symbol (e.g., "BTC")
        amount (float): Amount to trade (positive for buy, negative for sell)
        sentiment (float): Current sentiment score
    
    Returns:
        bool: Success status
    """
    try:
        trade_type = "buy" if amount > 0 else "sell"
        
        # Log the action (would be a blockchain transaction in production)
        logger.info(f"[NEAR] Executing {trade_type} for {crypto}: {abs(amount):.4f} units")
        logger.info(f"[NEAR] Trade based on sentiment score: {sentiment}")
        
        # In a real implementation, we would:
        # 1. Connect to NEAR using credentials from environment variables
        # 2. Call a smart contract function to execute the trade
        # 3. Return the transaction receipt
        
        # For the hackathon, we'll simulate this with a log message
        logger.info(f"[NEAR] Transaction simulated: execute_trade({crypto}, {amount}, {sentiment})")
        
        # Simulate blockchain latency
        time.sleep(0.5)
        
        # Record trade details to a local file - could be useful for testing/debugging
        timestamp = datetime.now().isoformat()
        trade_details = {
            "timestamp": timestamp,
            "crypto": crypto,
            "amount": amount,
            "type": trade_type,
            "sentiment": sentiment
        }
        
        # In AWS Lambda, we can write to /tmp for debugging if needed
        if 'AWS_LAMBDA_FUNCTION_NAME' in os.environ:
            try:
                with open('/tmp/trades.log', 'a') as f:
                    f.write(json.dumps(trade_details) + "\n")
            except:
                pass
                
        return True
    
    except Exception as e:
        logger.error(f"[NEAR] Error executing trade on blockchain: {str(e)}")
        return False

# For local testing
if __name__ == "__main__":
    # Test storing sentiment
    store_sentiment_on_near("BTC", 0.75)
    
    # Test executing trades
    execute_trade("BTC", 0.1, 0.75)  # Buy 0.1 BTC
    execute_trade("SOL", -10, -0.25)  # Sell 10 SOL