use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near_bindgen};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct SentimentContract {
    sentiment_scores: UnorderedMap<String, String>,
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
    pub fn store_sentiment(&mut self, crypto: String, score: String) {
        self.sentiment_scores.insert(&crypto, &score);
        env::log_str(&format!("Stored sentiment for {}: {}", crypto, score));
    }
    
    pub fn get_sentiment(&self, crypto: String) -> Option<String> {
        self.sentiment_scores.get(&crypto)
    }

    pub fn execute_trade(&self, crypto: String, amount: String) {
        env::log_str(&format!("Executing trade: {} -> {} units", crypto, amount));
    }
}
