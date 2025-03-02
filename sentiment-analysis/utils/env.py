"""
Environment variables utilities for Python components.

This module provides helper functions for loading and accessing
environment variables safely throughout the application.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
dotenv_path = Path(__file__).parents[2] / '.env'
load_dotenv(dotenv_path=dotenv_path)

def get_env(key, default=None, required=False):
    """
    Get an environment variable safely with optional default.
    
    Args:
        key: The environment variable key
        default: Optional default value if the env var is not set
        required: Whether the env var is required
        
    Returns:
        The environment variable value or default
        
    Raises:
        ValueError: If the env var is required but not set
    """
    value = os.getenv(key)
    if value is None:
        if required:
            raise ValueError(f"Environment variable {key} is required but not set")
        return default
    return value

# Twitter credentials
TWITTER_API_KEY = get_env("TWITTER_API_KEY", required=True)
TWITTER_API_SECRET = get_env("TWITTER_API_SECRET", required=True)
TWITTER_BEARER_TOKEN = get_env("TWITTER_BEARER_TOKEN", required=True)
TWITTER_ACCESS_TOKEN = get_env("TWITTER_ACCESS_TOKEN", required=True)
TWITTER_ACCESS_SECRET = get_env("TWITTER_ACCESS_SECRET", required=True)

# Google credentials
GOOGLE_API_KEY = get_env("GOOGLE_API_KEY", required=True)
GOOGLE_API_SECRET = get_env("GOOGLE_API_SECRET", required=True)

# CoinGecko credentials
COINGECKO_API_KEY = get_env("COINGECKO_API_KEY", required=True)

# NEAR credentials
NEAR_TESTNET_ACCOUNT = get_env("NEAR_TESTNET_ACCOUNT", required=True)
NEAR_MAINNET_ACCOUNT = get_env("NEAR_MAINNET_ACCOUNT", required=True)
NEAR_PRIVATE_KEY = get_env("NEAR_PRIVATE_KEY", required=True)
NEAR_POOL_ID = get_env("NEAR_POOL_ID", default="146") 