import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { count, percentage } = payload[0].payload;
    return (
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        border: "1px solid #8884d8",
        padding: "10px",
        borderRadius: "6px",
        fontSize: "14px",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.15)"
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>{`Interval: ${label}`}</p>
        <p style={{ margin: 0, color: '#444' }}>{`Candidates: ${count}`}</p>
        <p style={{ margin: 0, color: '#444' }}>{`Percentage: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const BellCurveChart = ({ candidates, title }) => {
  const data = useMemo(() => {
    if (!Array.isArray(candidates) || candidates.length === 0) return [];
    const total = candidates.length;
    const bins = Array(10).fill(0);
    candidates.forEach((candidate) => {
      const performance = parseFloat(candidate.candidatePerformance) || 0;
      const index = Math.min(Math.floor(performance / 10), 9);
      bins[index] += 1;
    });
    return bins.map((count, index) => ({
      range: `${index * 10}-${index * 10 + 10}%`,
      count,
      percentage: Number(((count / total) * 100).toFixed(1)),
    }));
  }, [candidates]);

  return (
    <div style={{
      margin: '20px 0',
      padding: '15px',
      background: '#fff',
      borderRadius: '8px',
      border: '1px solid #eee',
      boxShadow: '0px 4px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '5px' }}>{title}</h2>
      <h4 style={{
        textAlign: 'center',
        color: '#666',
        marginTop: '0px',
        fontWeight: 'normal',
        fontSize: '16px'
      }}>
        Distribution of Candidate Performance Scores
      </h4>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={data} margin={{ bottom: 80, left: 20, right: 20, top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis 
            dataKey="range" 
            label={{ 
              value: "Performance Intervals", 
              position: "bottom", 
              offset: 50,  
              fill: "#555", 
              fontSize: 14 
            }}
            tick={{ fill: "#555", fontSize: 13 }}
            tickMargin={15}
            angle={-45} 
            textAnchor="end"
          />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={(tick) => `${tick}%`}
            label={{ 
              value: "Percentage of Candidates", 
              angle: -90, 
              position: "insideLeft", 
              fill: "#555", 
              fontSize: 14 
            }}
            tick={{ fill: "#555", fontSize: 14 }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ color: "#333", fontWeight: "bold", fontSize: 14 }} />
          <defs>
            <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="none"
            fill="url(#colorPercentage)"
            name="Percentage of Candidates"
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#8884d8"
            strokeWidth={3}
            dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 7 }}
            name="Performance in Intervals"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BellCurveChart;
