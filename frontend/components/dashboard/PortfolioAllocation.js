import React, { useRef } from 'react';
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

export function PortfolioAllocation({ allocations = [], title = 'Portfolio Allocation' }) {
  const chartRef = useRef(null);
  
  // Ensure allocations is an array
  const allocationArray = Array.isArray(allocations) ? allocations : 
    (allocations && typeof allocations === 'object' && allocations.assets ? 
      allocations.assets : 
      [
        { asset: 'BTC', percentage: 40 },
        { asset: 'ETH', percentage: 30 },
        { asset: 'NEAR', percentage: 20 },
        { asset: 'SOL', percentage: 10 }
      ]
    );
  
  // If allocations is empty or undefined, render a placeholder
  if (!allocationArray || allocationArray.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64">
        <p className="text-gray-500">No portfolio data available</p>
      </div>
    );
  }
  
  const colors = generateColors(allocationArray.length);
  
  // Ensure we have proper labels
  const labels = allocationArray.map(item => {
    if (!item || typeof item !== 'object') return 'Unknown';
    if (typeof item.asset === 'string') return item.asset;
    if (item.crypto) return item.crypto;
    if (item.symbol) return item.symbol;
    return 'Unknown';
  });
  
  // Ensure we have proper percentage values
  const percentages = allocationArray.map(item => {
    if (!item || typeof item !== 'object') return 0;
    if (typeof item.percentage === 'number') return item.percentage;
    if (typeof item.value === 'number') return item.value;
    if (typeof item.amount === 'number') return item.amount;
    return 0;
  });
  
  const data = {
    labels: labels,
    datasets: [
      {
        data: percentages,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => {
              const meta = chart.getDatasetMeta(0);
              const style = meta.controller.getStyle(i);
              
              return {
                text: `${label}: ${datasets[0].data[i].toFixed(1)}%`,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
        }
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };
  
  return (
    <div className="card">
      <div className="h-64">
        <Pie ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
} 