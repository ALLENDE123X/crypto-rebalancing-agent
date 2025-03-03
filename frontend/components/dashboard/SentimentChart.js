import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function SentimentChart({ data, title = 'Sentiment Trend' }) {
  const chartRef = useRef(null);

  // If data is empty or undefined, render a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-gray-500">No sentiment data available</p>
      </div>
    );
  }
  
  // Format data for Chart.js
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Sentiment Score',
        data: data.map(item => item.score),
        borderColor: 'rgb(95, 138, 234)',
        backgroundColor: 'rgba(95, 138, 234, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const score = context.raw;
            let sentiment = 'Neutral';
            
            if (score >= 0.5) sentiment = 'Very Positive';
            else if (score >= 0.2) sentiment = 'Positive';
            else if (score >= -0.2) sentiment = 'Neutral';
            else if (score >= -0.5) sentiment = 'Negative';
            else sentiment = 'Very Negative';
            
            return [`Score: ${score.toFixed(2)}`, `Sentiment: ${sentiment}`];
          },
        },
      },
    },
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
    },
  };

  return (
    <div className="card">
      <div className="h-64">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
} 