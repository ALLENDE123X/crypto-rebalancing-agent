# AI-Powered Cryptocurrency Portfolio Rebalancing Agent

An autonomous trading agent on the NEAR blockchain that uses sentiment analysis with Google Gemini AI to make data-driven cryptocurrency trading decisions.

## Features

- **AI-Powered Sentiment Analysis**: Uses Twitter data and Google Gemini AI to analyze market sentiment
- **Automated Portfolio Rebalancing**: Dynamically adjusts crypto allocations based on sentiment scores
- **NEAR Blockchain Integration**: Executes trades through secure smart contracts
- **Interactive Dashboard**: Visualize sentiment trends, portfolio allocation, and trade history
- **Reinforcement Learning**: Uses RL to improve trading strategies over time

## Project Structure

- `frontend/`: Next.js web application
- `smart_contract/`: NEAR blockchain smart contracts
- `sentiment_analysis/`: Scripts for analyzing sentiment data
- `reinforcement_learning/`: ML models for optimizing trading strategies

## Quick Start

### Option 1: Using the Public Deployment

Visit our public deployment at [https://crypto-rebalancer.example.com](https://crypto-rebalancer.example.com) to use the application with our API keys.

### Option 2: Run Your Own Instance

#### Prerequisites

- Node.js (v16+)
- NEAR account and wallet
- Twitter Developer API keys
- Google Cloud API key (for Gemini AI)
- CoinGecko API key

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crypto-rebalancing-agent.git
   cd crypto-rebalancing-agent
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   ```

3. Edit `.env.local` to add your own API keys

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` in your browser

## Deployment

### Deploying to Vercel

The simplest way to deploy this application is with Vercel:

1. Push your code to a GitHub repository
2. Sign up for a [Vercel account](https://vercel.com)
3. Import the repository in Vercel
4. Add your environment variables in the Vercel project settings
5. Deploy!

### Alternative Deployment Options

#### Self-hosted Server

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

#### Docker Deployment

A Dockerfile is provided for containerized deployment:

```bash
docker build -t crypto-rebalancer .
docker run -p 3000:3000 --env-file .env crypto-rebalancer
```

## Security Notes

- Never commit your `.env.local` file to version control
- API keys are handled server-side in Next.js API routes
- For production, use proper secrets management
- Consider using environment variables through your deployment platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
