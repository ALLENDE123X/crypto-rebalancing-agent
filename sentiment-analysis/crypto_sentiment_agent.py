import json
import random
import time
from datetime import datetime, timedelta
import boto3
from python_near_integration import store_sentiment_on_near, execute_trade

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
    ],
    "NEAR": [
        {"text": "NEAR Protocol's sharding approach is superior to other L1s for scalability. Bullish! #NEAR", "weight": 2.3},
        {"text": "The developer experience on NEAR is amazing. Their JavaScript SDK is best in class.", "weight": 1.9},
        {"text": "NEAR's ecosystem is growing fast but still needs more killer apps to compete with ETH and SOL.", "weight": 1.5},
        {"text": "Just moved all my assets to NEAR because of the low fees and fast transactions. Game changer!", "weight": 2.0},
        {"text": "NEAR's tokenomics and community development fund make it a long-term winner in crypto.", "weight": 1.8}
    ]
}

# Configure DynamoDB for storing sentiment data
dynamodb = boto3.resource('dynamodb')
SENTIMENT_TABLE = "crypto_sentiment_data"
TRADES_TABLE = "crypto_trades"
PORTFOLIO_TABLE = "crypto_portfolio"

# Map of crypto symbols to CoinGecko IDs (for future real API usage)
CRYPTO_ID_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "NEAR": "near"
}

# Portfolio allocation settings - this would be stored in DynamoDB in a real implementation
portfolio = {
    "BTC": 5000,  # USD value
    "ETH": 3000,
    "NEAR": 2000,
    "SOL": 1000
}

target_allocation = {
    "BTC": 0.4,  # 40%
    "ETH": 0.3,  # 30%
    "NEAR": 0.2,  # 20%
    "SOL": 0.1   # 10%
}

# --- Sentiment Analysis Functions ---

def analyze_sentiment(crypto):
    """
    Analyze sentiment for a specific cryptocurrency using simulated data.
    In a real implementation, this would call a Twitter API and NLP service.
    """
    print(f"Analyzing sentiment for {crypto}...")
    
    # In a real implementation, this would analyze real tweets
    # For the hackathon, we'll use simulated data
    if crypto in SIMULATED_TWEETS:
        tweets = SIMULATED_TWEETS[crypto]
        # Select a random subset of tweets to simulate variation
        selected_tweets = random.sample(tweets, min(3, len(tweets)))
        
        # Calculate weighted sentiment
        total_weight = sum(tweet["weight"] for tweet in selected_tweets)
        sentiment_score = sum(
            (0.5 + (random.random() * 0.5 - 0.25)) * tweet["weight"] 
            for tweet in selected_tweets
        ) / total_weight
        
        # Ensure score is between -1 and 1
        sentiment_score = max(-1, min(1, sentiment_score))
        
        return round(sentiment_score, 2)
    else:
        # Default neutral sentiment if crypto not found
        return 0.0

def store_sentiment_data(crypto, score):
    """Store sentiment data in DynamoDB"""
    try:
        table = dynamodb.Table(SENTIMENT_TABLE)
        timestamp = datetime.now().isoformat()
        
        # Store current sentiment
        table.put_item(Item={
            'crypto': crypto,
            'timestamp': timestamp,
            'score': score,
            'date': timestamp.split('T')[0]  # Extract date for easier querying
        })
        
        print(f"Stored sentiment data for {crypto}: {score}")
        return True
    except Exception as e:
        print(f"Error storing sentiment data: {e}")
        return False

def get_historical_sentiment(crypto, days=7):
    """Get historical sentiment data from DynamoDB"""
    try:
        table = dynamodb.Table(SENTIMENT_TABLE)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Query for sentiment data within date range
        response = table.query(
            KeyConditionExpression='crypto = :crypto AND timestamp BETWEEN :start AND :end',
            ExpressionAttributeValues={
                ':crypto': crypto,
                ':start': start_date.isoformat(),
                ':end': end_date.isoformat()
            }
        )
        
        # Format response for frontend
        history = []
        for item in response.get('Items', []):
            history.append({
                'date': item['date'],
                'score': item['score']
            })
        
        return history
    except Exception as e:
        print(f"Error retrieving historical sentiment: {e}")
        return []

# --- Portfolio Management Functions ---

def calculate_current_allocation():
    """Calculate current portfolio allocation percentages"""
    total_value = sum(portfolio.values())
    return {
        crypto: value / total_value
        for crypto, value in portfolio.items()
    }

def rebalance():
    """
    Determine trades needed to rebalance portfolio based on target allocation
    and sentiment scores.
    
    Returns a dictionary of trades to execute {crypto: amount}
    """
    trades = {}
    current_allocation = calculate_current_allocation()
    total_value = sum(portfolio.values())
    
    for crypto, target_pct in target_allocation.items():
        # Get sentiment to adjust target allocation
        sentiment = analyze_sentiment(crypto)
        
        # Adjust target allocation based on sentiment
        # More positive sentiment = increase allocation
        sentiment_factor = 1 + (sentiment * 0.2)  # Max 20% adjustment
        adjusted_target = target_pct * sentiment_factor
        
        # Calculate trade amount (positive = buy, negative = sell)
        current_pct = current_allocation.get(crypto, 0)
        pct_difference = adjusted_target - current_pct
        
        # Only trade if difference is significant
        if abs(pct_difference) > 0.05:  # 5% threshold
            trade_amount = pct_difference * total_value
            trades[crypto] = trade_amount
    
    return trades

def execute_trades(trades):
    """Execute and record trades in DynamoDB"""
    try:
        table = dynamodb.Table(TRADES_TABLE)
        timestamp = datetime.now().isoformat()
        
        for crypto, amount in trades.items():
            trade_type = "buy" if amount > 0 else "sell"
            sentiment = analyze_sentiment(crypto)
            
            # Record the trade
            table.put_item(Item={
                'crypto': crypto,
                'timestamp': timestamp,
                'amount': abs(amount),
                'type': trade_type,
                'sentiment': sentiment
            })
            
            # Update portfolio (in a real implementation, this would interact with exchange APIs)
            portfolio[crypto] = portfolio.get(crypto, 0) + amount
            
            print(f"Executed {trade_type} for {crypto}: {abs(amount):.2f} units")
            
            # Call NEAR integration (for blockchain recording)
            execute_trade(crypto, abs(amount), sentiment)
    
    except Exception as e:
        print(f"Error executing trades: {e}")

def update_portfolio_data():
    """Update portfolio data in DynamoDB"""
    try:
        table = dynamodb.Table(PORTFOLIO_TABLE)
        timestamp = datetime.now().isoformat()
        
        # Calculate percentages
        total_value = sum(portfolio.values())
        percentages = {
            crypto: (value / total_value) * 100
            for crypto, value in portfolio.items()
        }
        
        # Store portfolio data
        table.put_item(Item={
            'id': 'current_portfolio',
            'timestamp': timestamp,
            'assets': [
                {'asset': crypto, 'value': value, 'percentage': percentages[crypto]}
                for crypto, value in portfolio.items()
            ],
            'total_value': total_value
        })
        
        print(f"Updated portfolio data in DynamoDB")
    except Exception as e:
        print(f"Error updating portfolio data: {e}")

# --- API Endpoints for Frontend ---

def get_all_sentiment_scores():
    """Get current sentiment scores for all supported cryptocurrencies"""
    result = []
    for crypto in CRYPTO_ID_MAP.keys():
        score = analyze_sentiment(crypto)
        # Calculate a change value (would be real in production)
        change = round(random.random() * 0.4 - 0.2, 2)
        result.append({
            'asset': crypto,
            'score': score,
            'change': change
        })
    return result

def get_portfolio_data():
    """Get current portfolio allocation data"""
    # Calculate percentages
    total_value = sum(portfolio.values())
    
    return {
        'total_value': total_value,
        'assets': [
            {
                'asset': crypto,
                'value': value,
                'percentage': (value / total_value) * 100
            }
            for crypto, value in portfolio.items()
        ]
    }

def get_recent_trades(limit=5):
    """Get recent trades from DynamoDB"""
    try:
        table = dynamodb.Table(TRADES_TABLE)
        response = table.scan(Limit=limit)
        
        trades = []
        for item in response.get('Items', []):
            trades.append({
                'asset': item['crypto'],
                'timestamp': item['timestamp'],
                'amount': item['amount'],
                'type': item['type'],
                'sentiment': item['sentiment']
            })
        
        # Sort by timestamp descending
        trades.sort(key=lambda x: x['timestamp'], reverse=True)
        return trades[:limit]
    except Exception as e:
        print(f"Error getting recent trades: {e}")
        # Return mock data if database error
        return [
            {
                'asset': 'BTC',
                'timestamp': (datetime.now() - timedelta(hours=5)).isoformat(),
                'amount': 0.05,
                'type': 'buy',
                'sentiment': 0.78
            },
            {
                'asset': 'SOL',
                'timestamp': (datetime.now() - timedelta(hours=12)).isoformat(),
                'amount': 12.5,
                'type': 'sell',
                'sentiment': -0.25
            }
        ]

# --- Lambda Handler ---

def lambda_handler(event, context):
    """AWS Lambda handler function"""
    try:
        # Determine what action to perform based on the event
        path = event.get('path', '')
        http_method = event.get('httpMethod', 'GET')
        
        # API Gateway routes
        if path.endswith('/sentiment'):
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'  # For CORS
                },
                'body': json.dumps(get_all_sentiment_scores())
            }
            
        elif path.endswith('/sentiment/history'):
            # Get query parameters
            params = event.get('queryStringParameters', {}) or {}
            crypto = params.get('crypto', 'BTC')
            days = int(params.get('days', 7))
            
            # Get historical sentiment
            history = get_historical_sentiment(crypto, days)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(history)
            }
            
        elif path.endswith('/portfolio'):
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(get_portfolio_data())
            }
            
        elif path.endswith('/trades'):
            # Get query parameters
            params = event.get('queryStringParameters', {}) or {}
            limit = int(params.get('limit', 5))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(get_recent_trades(limit))
            }
            
        # Scheduled event for running sentiment analysis and rebalancing
        elif event.get('detail-type') == 'Scheduled Event':
            # Process sentiment for all supported cryptocurrencies
            results = {}
            for crypto in CRYPTO_ID_MAP.keys():
                sentiment = analyze_sentiment(crypto)
                store_sentiment_data(crypto, sentiment)
                store_sentiment_on_near(crypto, sentiment)
                results[crypto] = sentiment
            
            # Calculate rebalancing needs
            trades = rebalance()
            
            # Execute trades if needed
            if trades:
                execute_trades(trades)
            
            # Update portfolio data
            update_portfolio_data()
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Sentiment analysis and rebalancing completed',
                    'sentiments': results,
                    'trades': {k: float(v) for k, v in trades.items()}
                })
            }
        
        # Default response
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid endpoint'})
        }
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

# For local testing
if __name__ == "__main__":
    # Simulate a scheduled event
    event = {'detail-type': 'Scheduled Event'}
    print(lambda_handler(event, None))
