import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Share, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const COLORS = ['#fb923c', '#34d399', '#f472b6', '#3b82f6', '#8b5cf6'];

const Insights = ({ userName }) => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/habits/stats`);
        const userStats = res.data.aggregations.find(a => a._id === userName);
        const myEntries = res.data.recent_entries.filter(e => e.user_name === userName);
        
        setStats({
          aggregations: userStats ? [userStats] : [],
          current_streak: res.data.current_streak || 0,
          recent_entries: myEntries
        });
      } catch(err) {
        console.log(err);
      }
    };
    fetchStats();
  }, [userName]);

  const handleShare = async () => {
    try {
      const summary = `I've completed ${totalPoints} habit points this week with a streak of ${streak} days!`;
      await navigator.clipboard.writeText(summary);
      toast.success('Summary copied to clipboard!');
    } catch(err) {
      toast.error('Failed to copy');
    }
  };

  const totalPoints = stats?.aggregations?.[0] ? stats.aggregations[0].total_completed * 10 : 0;
  const streak = stats?.current_streak || 0;
  
  let chartData = [];
  if (stats && stats.recent_entries && Array.isArray(stats.recent_entries)) {
      chartData = stats.recent_entries.slice(0, 5).map((entry, index) => {
          let dayName = 'Day';
          try {
              if(entry.date) dayName = new Date(entry.date).toLocaleDateString('en-US', {weekday: 'short'});
          } catch(e) {}
          
          return {
            name: dayName,
            value: entry.completion_percentage || 0,
            color: COLORS[index % COLORS.length]
          };
      }).reverse();
  } else {
      chartData = [
          { name: 'Mon', value: 48, color: COLORS[0] },
          { name: 'Tue', value: 33, color: COLORS[1] },
          { name: 'Wed', value: 27, color: COLORS[2] },
          { name: 'Thu', value: 40, color: COLORS[3] }
      ];
  }

  return (
    <div className="page-container">
      <div className="insights-header">
        <h1>Your progress <br/> and insights</h1>
      </div>

      <div style={{padding: '0 24px'}}>
        <div className="insights-grid">
          <div className="chart-card" style={{height: '340px', marginBottom: 0}}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
                 <YAxis hide={true} domain={[0, 100]} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" radius={[20, 20, 20, 20]} barSize={40}>
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="points-sidebar">
            <div className="reminder-card" style={{background: 'white', border: '1px solid #f1f5f9', alignItem: 'flex-start', marginBottom: '24px'}}>
              <div style={{flex: 1}}>
                <h3 style={{color: '#1e293b'}}>Points Earned</h3>
                <p style={{color: '#94a3b8', marginBottom: '24px'}}>For this month</p>
                
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <p style={{margin: 0, fontSize: '0.8rem', color: '#94a3b8'}}>Completed</p>
                    <b style={{fontSize: '1.2rem', color: '#1e293b'}}>{stats?.aggregations?.[0]?.total_completed || 0}</b>
                  </div>
                  <div>
                    <p style={{margin: 0, fontSize: '0.8rem', color: '#94a3b8'}}>Streak</p>
                    <b style={{fontSize: '1.2rem', color: '#f97316', display:'flex', gap:'4px'}}><Flame size={18} className={streak > 0 ? "streak-glow" : ""}/> {streak}</b>
                  </div>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <h2 style={{color: '#ea580c', fontSize: '1.8rem', marginBottom: 'auto'}}>{totalPoints} Points</h2>
              </div>
            </div>

            <button className="btn-submit" onClick={handleShare} style={{background: '#ea580c'}}>
              <Share size={20} style={{marginRight: '8px', verticalAlign: 'middle', display: 'inline'}} /> Share Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
