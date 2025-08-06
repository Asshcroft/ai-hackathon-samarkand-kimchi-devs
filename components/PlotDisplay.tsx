import React, { useRef, useEffect } from 'react';
import type { PlotData } from '../types';
import { Chart } from 'chart.js/auto';
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';

interface PlotDisplayProps {
  plotData: PlotData;
}

// Set global Chart.js defaults for a retro terminal theme
Chart.defaults.color = '#fb923c'; // text-orange-400
Chart.defaults.borderColor = '#9a3412'; // orange-800
Chart.defaults.font.family = "'Fira Code', monospace";
Chart.defaults.font.size = 12;

const PlotDisplay: React.FC<PlotDisplayProps> = ({ plotData }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current || !plotData) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const { type, data, title, xAxisLabel, yAxisLabel } = plotData;
    
    // Customize datasets for retro theme
    const themedDatasets = data.datasets.map(dataset => ({
        ...dataset,
        borderColor: '#ea580c', // orange-600
        backgroundColor: '#ea580c33', // orange-600 with alpha
        pointBackgroundColor: '#f97316', // orange-500
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f97316', // orange-500
        tension: 0.1
    }));

    const chartConfig: ChartConfiguration = {
      type: type,
      data: {
          ...data,
          datasets: themedDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#fdba74' // orange-300
                }
            },
            title: {
                display: !!title,
                text: title,
                color: '#fed7aa' // orange-200
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#c2410c4D' // orange-700 with alpha
                },
                ticks: {
                    color: '#fb923c' // orange-400
                },
                title: {
                    display: !!xAxisLabel,
                    text: xAxisLabel,
                    color: '#fdba74' // orange-300
                }
            },
            y: {
                 grid: {
                    color: '#c2410c4D' // orange-700 with alpha
                },
                ticks: {
                    color: '#fb923c' // orange-400
                },
                title: {
                    display: !!yAxisLabel,
                    text: yAxisLabel,
                    color: '#fdba74' // orange-300
                }
            }
        }
      },
    };

    chartInstanceRef.current = new Chart(chartRef.current, chartConfig);

    // Cleanup function to destroy the chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [plotData]);

  return (
    <div className="mt-4 p-4 bg-black border-2 border-orange-700/50 rounded-lg">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PlotDisplay;