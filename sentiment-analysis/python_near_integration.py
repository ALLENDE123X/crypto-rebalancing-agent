import requests
import json

NEAR_ACCOUNT = "your_near_account.testnet"
NEAR_CONTRACT = "your_near_contract.testnet"

# Store sentiment on NEAR blockchain
def store_sentiment_on_near(crypto, sentiment):
    data = {
        "crypto": crypto,
        "sentiment": sentiment
    }
    response = requests.post(f"https://rpc.testnet.near.org", json={
        "method": "call_function",
        "params": {
            "contract_id": NEAR_CONTRACT,
            "method_name": "store_sentiment",
            "args_base64": json.dumps(data).encode().decode('utf-8'),
            "gas": 10000000000000,
            "attached_deposit": "0"
        }
    })
    return response.json()

# Execute trade on Ref Finance (NEAR DEX)
def execute_trade(crypto, amount, sentiment):
    # Only trade if sentiment is strongly positive or negative
    if sentiment > 0.5:
        print(f"Buying more {crypto} since sentiment is {sentiment}")
    elif sentiment < -0.5:
        print(f"Selling {crypto} since sentiment is {sentiment}")
    else:
        print(f"No action for {crypto} (Sentiment {sentiment})")
        return  # Skip trade

    # Call NEAR smart contract function to execute trade
    response = execute_trade_on_near(crypto, amount)
    print(f"Trade executed: {response}")


def execute_trade_on_near(crypto, amount):
    global trade_history
    
    # Prevent duplicate trades within 1 hour
    if crypto in trade_history and (time.time() - trade_history[crypto]) < 3600:
        print(f"Skipping duplicate trade for {crypto} (cooldown active)")
        return {"status": "skipped"}

    trade_data = {
        "crypto": crypto,
        "amount": amount
    }

    response = requests.post(f"https://rpc.testnet.near.org", json={
        "method": "call_function",
        "params": {
            "contract_id": "your_near_contract.testnet",
            "method_name": "execute_trade",
            "args_base64": json.dumps(trade_data).encode().decode('utf-8'),
            "gas": 10000000000000,
            "attached_deposit": "0"
        }
    })

    trade_history[crypto] = time.time()  # Store trade timestamp
    return response.json()