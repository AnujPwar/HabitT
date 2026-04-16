import React from 'react';
import { Target, TrendingUp, Flame, CheckCircle2 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const HabitDashboard = ({ stats }) => {
  const aggs = stats.aggregations?.[0] || { total_completed: 0, total_habits: 0, average_completion: 0 };
  const streak = stats.current_streak || 0;
  
  // Format data for chart (reverse strictly to timeline)
  const chartData = (stats.recent_entries || []).map(e => ({
    date: e.date.substring(5), // Short date like "04-16"
    completion: e.completion_percentage
  })).reverse();

  return (
    <div className="glass-panel" style={{marginBottom: '32px'}}>
      <div className="stats-grid">
        <div className="stat-card">
          <CheckCircle2 size={32} color="var(--success-color)" style={{marginBottom: "12px"}}/>
          <div className="stat-value">{aggs.total_completed} <span style={{fontSize: "1rem", color: "var(--text-muted)"}}> / {aggs.total_habits}</span></div>
          <div className="stat-label">Total Completed</div>
        </div>
        
        <div className="stat-card">
          <Flame size={32} color="var(--danger-color)" style={{marginBottom: "12px"}}/>
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        
        <div className="stat-card">
          <TrendingUp size={32} color="var(--primary-color)" style={{marginBottom: "12px"}}/>
          <div className="stat-value">{aggs.average_completion ? aggs.average_completion.toFixed(1) : 0}%</div>
          <div className="stat-label">Avg Completion / wk</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="chart-container">
          <h3 style={{marginBottom: "16px", textAlign: "center", color: "var(--text-main)"}}>Performance Overview</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="completion" stroke="#818cf8" strokeWidth={4} dot={{r: 6, fill: "#818cf8", stroke: "#0f172a", strokeWidth: 2}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HabitDashboard;
