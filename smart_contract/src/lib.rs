use near_sdk::{near_bindgen, env, AccountId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct SentimentContract {
    sentiment_scores: UnorderedMap<String, f64>,
    portfolio: UnorderedMap<String, f64>,
}

impl Default for SentimentContract {
    fn default() -> Self {
        Self {
            sentiment_scores: UnorderedMap::new(b"s"),
            portfolio: UnorderedMap::new(b"p"),
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

    // Get all sentiment scores
    pub fn get_all_sentiments(&self) -> Vec<(String, f64)> {
        self.sentiment_scores.to_vec()
    }

    // Update portfolio allocation
    pub fn update_portfolio(&mut self, crypto: String, amount: f64) {
        self.portfolio.insert(&crypto, &amount);
        env::log_str(&format!("Updated portfolio for {}: {}", crypto, amount));
    }

    // Get portfolio allocation for a cryptocurrency
    pub fn get_portfolio_item(&self, crypto: String) -> Option<f64> {
        self.portfolio.get(&crypto)
    }

    // Get entire portfolio
    pub fn get_portfolio(&self) -> Vec<(String, f64)> {
        self.portfolio.to_vec()
    }

    // Execute a trade
    pub fn execute_trade(&mut self, crypto: String, amount: f64, sentiment: f64) {
        env::log_str(&format!("Executing trade for {}: amount={}, sentiment={}", crypto, amount, sentiment));
        
        // Update portfolio after trade
        let current = self.portfolio.get(&crypto).unwrap_or(0.0);
        self.portfolio.insert(&crypto, &(current + amount));
    }
}
