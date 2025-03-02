import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const generateColors = (count) => {
  const baseColors = [
    'rgba(95, 138, 234, 0.8)',   // NEAR blue
    'rgba(16, 185, 129, 0.8)',   // Green
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(245, 158, 11, 0.8)',   // Yellow
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(14, 165, 233, 0.8)',   // Sky blue
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(236, 72, 153, 0.8)',   // Pink
  ];
  
  // If we have more assets than colors, generate random colors
  if (count > baseColors.length) {
    const additionalColors = Array(count - baseColors.length).fill().map(() => {
      return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;
    });
    return [...baseColors, ...additionalColors];
  }
  
  return baseColors.slice(0, count);
};

export function PortfolioAllocation({ allocations, title = 'Portfolio Allocation' }) {
  const colors = generateColors(allocations.length);
  
  const data = {
    labels: allocations.map(item => item.asset),
    datasets: [
      {
        data: allocations.map(item => item.percentage),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${value.toFixed(2)}%`;
          },
        },
      },
    },
  };
  
  return (
    <div className="card">
      <Pie data={data} options={options} />
    </div>
  );
} 