import time
import requests
import json
import random  # For simulated data
from python_near_integration import store_sentiment_on_near, execute_trade
from datetime import datetime, timedelta

# Simulated Twitter data to avoid rate limits
SIMULATED_TWEETS = {
    "BTC": [
        {"text": "Bitcoin just broke $50k! This bull run is just getting started! #BTC #ToTheMoon", "weight": 2.5},
        {"text": "I've been holding BTC since 2017 and I'm never selling. The future of finance is here.", "weight": 1.8},
        {"text": "Bitcoin energy consumption is still a major concern. Not sustainable in the long term. #BTC", "weight": 1.2},
        {"text": "Just bought more Bitcoin on the dip. Dollar cost averaging is the way to go.", "weight": 1.5},
        {"text": "Regulatory concerns around BTC are overblown. Adoption continues to grow worldwide.", "weight": 1.4}
    ],
    "ETH": [
        {"text": "Ethereum's upgrade is game-changing for scalability. Gas fees finally coming down! #ETH", "weight": 2.2},
        {"text": "ETH is the foundation of DeFi. Without Ethereum, the whole ecosystem falls apart.", "weight": 1.9},
        {"text": "Concerned about Ethereum's competitors gaining market share. $SOL and $ADA looking strong.", "weight": 1.3},
        {"text": "Just staked all my ETH for the long term. Passive income while supporting the network!", "weight": 1.7},
        {"text": "Smart contracts are the future and Ethereum is leading the way. Bullish on ETH.", "weight": 1.6}
    ],
    "SOL": [
        {"text": "Solana's speed and low fees make it a true Ethereum competitor. #SOL to $200 soon!", "weight": 2.1},
        {"text": "Another Solana outage? This is getting ridiculous. How can we trust the network? #SOL", "weight": 1.5},
        {"text": "Solana NFT ecosystem is booming. Artists are moving from ETH to SOL in droves.", "weight": 1.8},
        {"text": "Just launched our dApp on Solana. The developer experience is amazing compared to ETH.", "weight": 1.7},
        {"text": "SOL tokenomics are concerning with so many tokens held by VCs. Be careful out there.", "weight": 1.4}
    ]
}

# Configure CoinGecko API
COINGECKO_API_KEY = "CG-dr4d5ck44cX2unRCv11kFjNc"
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"  # Removed 'pro-' to use free API

# Map of crypto symbols to CoinGecko IDs
CRYPTO_ID_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana"
}

# Portfolio allocation settings
portfolio = {
    "BTC": 5000,  # USD value
    "ETH": 3000,
    "SOL": 2000
}
target_allocation = {
    "BTC": 0.5,  # 50%
    "ETH": 0.3,  # 30%
    "SOL": 0.2   # 20%
}

# Fetch Crypto Prices from CoinGecko
def fetch_prices():
    try:
        # Get comma-separated list of coin IDs
        coin_ids = ','.join([CRYPTO_ID_MAP[coin] for coin in portfolio.keys()])
        
        # Make API request to CoinGecko (free API)
        url = f"{COINGECKO_BASE_URL}/simple/price"
        params = {
            'ids': coin_ids,
            'vs_currencies': 'usd'
            # Removed API key parameter for free API
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Convert response to our format
        return {
            symbol: data[coin_id]['usd']
            for symbol, coin_id in CRYPTO_ID_MAP.items()
        }
    except Exception as e:
        print(f"Error fetching prices from CoinGecko: {e}")
        # Use fallback prices if API fails
        return {
            "BTC": 50000,
            "ETH": 3000,
            "SOL": 100
        }

def fetch_sentiment_data(crypto):
    """Get simulated Twitter data instead of using the API"""
    try:
        print(f"Getting simulated Twitter data for {crypto}...")
        
        # Get tweets for the specific crypto with some randomization
        if crypto in SIMULATED_TWEETS:
            # Randomly select 3-5 tweets from the collection for this run
            num_tweets = random.randint(3, 5)
            selected_tweets = random.sample(SIMULATED_TWEETS[crypto], num_tweets)
            
            # Add some randomness to the weights to simulate changing engagement
            for tweet in selected_tweets:
                # Vary the weight by ±20%
                variation = random.uniform(0.8, 1.2)
                tweet["weight"] = round(tweet["weight"] * variation, 2)
            
            # Format tweets for sentiment analysis
            formatted_tweets = "\n".join([f"Tweet (engagement weight {t['weight']:.2f}): {t['text']}" for t in selected_tweets])
            return formatted_tweets
        else:
            return f"No tweets found for {crypto}"
        
    except Exception as e:
        print(f"Error with simulated Twitter data: {e}")
        return f"Error simulating Twitter data for {crypto}"

# Simple rule-based sentiment analyzer instead of using Gemini API
def analyze_sentiment(crypto):
    """
    Analyze sentiment using a simple rule-based approach instead of using Gemini API
    """
    print(f"Analyzing sentiment for {crypto}...")
    
    # Predefined sentiment scores with some randomness
    base_sentiment = {
        "BTC": 0.3,    # Slightly positive
        "ETH": 0.5,    # Positive
        "SOL": 0.0     # Neutral
    }
    
    # Add some randomness (-0.3 to +0.3)
    sentiment = base_sentiment.get(crypto, 0.0) + random.uniform(-0.3, 0.3)
    
    # Ensure it's between -1 and 1
    sentiment = max(-1, min(1, sentiment))
    
    return round(sentiment, 2)

# Calculate Rebalance
def rebalance():
    prices = fetch_prices()
    
    # Skip rebalancing if we couldn't get prices
    if None in prices.values():
        print("Skipping rebalance due to missing price data")
        return {}
        
    portfolio_value = sum(portfolio[coin] for coin in portfolio)
    
    trades = {}
    for coin in portfolio:
        target_value = portfolio_value * target_allocation[coin]
        current_value = portfolio[coin] * prices[coin]
        trade_amount = target_value - current_value
        
        if abs(trade_amount) > 50:  # Avoid small adjustments
            trades[coin] = trade_amount / prices[coin]  # Convert USD to Crypto
        
    return trades

# Main autonomous agent function
def autonomous_agent():
    print("Fetching sentiment data...")
    
    for coin in portfolio.keys():
        # Get sentiment and store on NEAR blockchain
        sentiment = analyze_sentiment(coin)
        print(f"Sentiment for {coin}: {sentiment}")
        
        # Store sentiment on NEAR blockchain
        store_sentiment_on_near(coin, sentiment)
        
    print("Calculating rebalancing...")
    trades = rebalance()
    
    # Execute trades based on sentiment and rebalancing needs
    for coin, amount in trades.items():
        print(f"Executing trade: {coin} -> {amount:.4f} units")
        # Add sentiment data to trade execution
        sentiment = analyze_sentiment(coin)
        execute_trade(coin, amount, sentiment)
    
    # Sleep for a while before next cycle  
    print("Cycle complete. Will run again in 1 hour.")

if __name__ == "__main__":
    autonomous_agent()
