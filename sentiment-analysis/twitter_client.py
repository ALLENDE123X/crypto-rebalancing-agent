"""
Twitter Client for Crypto Sentiment Analysis

This module handles fetching tweets about cryptocurrencies
using the Twitter API and environment variables for authentication.
"""

import tweepy
from utils.env import (
    TWITTER_API_KEY, 
    TWITTER_API_SECRET, 
    TWITTER_BEARER_TOKEN, 
    TWITTER_ACCESS_TOKEN, 
    TWITTER_ACCESS_SECRET
)

class TwitterClient:
    """Client for fetching tweets related to cryptocurrencies."""
    
    def __init__(self):
        """Initialize the Twitter client using environment variables."""
        # Use bearer token authentication for v2 API
        self.client = tweepy.Client(
            bearer_token=TWITTER_BEARER_TOKEN,
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=TWITTER_ACCESS_TOKEN,
            access_token_secret=TWITTER_ACCESS_SECRET
        )
        
    def search_recent_tweets(self, query, max_results=100):
        """
        Search for recent tweets matching the query.
        
        Args:
            query: The search query string
            max_results: Maximum number of results to return
            
        Returns:
            List of tweet objects
        """
        try:
            response = self.client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=['created_at', 'public_metrics', 'lang']
            )
            return response.data
        except tweepy.TweepyException as e:
            print(f"Error searching tweets: {e}")
            return []
            
    def get_crypto_tweets(self, symbol, days=1, max_results=100):
        """
        Get recent tweets about a specific cryptocurrency.
        
        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTC')
            days: Number of days to look back
            max_results: Maximum number of results
            
        Returns:
            List of tweets about the cryptocurrency
        """
        # Create query for the cryptocurrency
        query = f"#{symbol} OR ${symbol} OR {symbol} crypto -is:retweet lang:en"
        return self.search_recent_tweets(query, max_results)
        
if __name__ == "__main__":
    # Example usage
    client = TwitterClient()
    btc_tweets = client.get_crypto_tweets("BTC", max_results=10)
    
    print(f"Found {len(btc_tweets) if btc_tweets else 0} tweets about BTC")
    
    # Display sample tweets
    for i, tweet in enumerate(btc_tweets or []):
        if i >= 3:  # Just show first 3 tweets
            break
        print(f"Tweet {i+1}: {tweet.text[:100]}...") 