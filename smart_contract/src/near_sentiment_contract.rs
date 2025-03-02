use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct SentimentContract {
    sentiment_scores: UnorderedMap<String, f64>,
}

impl Default for SentimentContract {
    fn default() -> Self {
        Self {
            sentiment_scores: UnorderedMap::new(b"s"),
        }
    }
}

#[near_bindgen]
impl SentimentContract {
    // Store sentiment score
    pub fn store_sentiment(&mut self, crypto: String, score: f64) {
        self.sentiment_scores.insert(&crypto, &score);
        env::log_str(&format!("Stored sentiment for {}: {}", crypto, score));
    }
    
    // Get sentiment score for a cryptocurrency
    pub fn get_sentiment(&self, crypto: String) -> Option<f64> {
        self.sentiment_scores.get(&crypto)
    }

    // Execute a trade on Ref Finance
    pub fn execute_trade(&mut self, crypto: String, amount: f64) {
        let account_id: AccountId = "ref-finance.near".parse().unwrap();
        let transaction = format!("{{'crypto': '{}', 'amount': {}}}", crypto, amount);
        env::log_str(&format!("Executing trade: {}", transaction));

        // This would normally invoke a trade on Ref Finance via a cross-contract call
    }
}
