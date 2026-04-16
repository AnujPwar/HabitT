import React from 'react';
import { Calendar, Trash2, CheckCircle, Circle } from 'lucide-react';

const HabitList = ({ entries, onUpdateStatus, onDeleteEntry }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="empty-state">
        <Calendar size={48} />
        <h2>No habits found</h2>
        <p>You have no entries for this selection. Try changing the date or adding one.</p>
      </div>
    );
  }

  return (
    <div>
      {entries.map(entry => (
        <div key={entry._id} className="habit-entry">
          <div className="habit-entry-header">
            <div className="habit-entry-date">
              <Calendar size={18} style={{display: "inline", marginRight: "8px", verticalAlign: "middle"}} />
              {entry.date} - {entry.user_name}
            </div>
            <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
              <div className="habit-progress">
                <span style={{fontSize: "0.9rem", fontWeight: 600}}>
                  {entry.completion_percentage}% Done
                </span>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{width: `${entry.completion_percentage}%`}} />
                </div>
              </div>
              <button className="btn btn-icon btn-outline" style={{borderColor: "var(--danger-color)", color: "var(--danger-color)"}} onClick={() => onDeleteEntry(entry._id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="habit-items">
            {entry.habits.map((habit, idx) => (
              <div key={idx} className="habit-item">
                <div className="habit-item-info">
                  <button 
                    onClick={() => onUpdateStatus(entry._id, habit.habit_name, habit.status === 'Done' ? 'Not Done' : 'Done')}
                    style={{background: "none", border: "none", cursor: "pointer", color: habit.status === 'Done' ? 'var(--success-color)' : 'var(--text-muted)'}}
                  >
                    {habit.status === 'Done' ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  <span className="habit-item-name" style={{
                    textDecoration: habit.status === 'Done' ? 'line-through' : 'none',
                    opacity: habit.status === 'Done' ? 0.6 : 1
                  }}>
                    {habit.habit_name}
                  </span>
                </div>
                <span className={`habit-status-badge ${habit.status === 'Done' ? 'status-done' : 'status-not-done'}`}>
                  {habit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitList;
