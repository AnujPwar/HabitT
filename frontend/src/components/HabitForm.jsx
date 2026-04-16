import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { format } from 'date-fns';

const HabitForm = ({ onSubmit, onCancel }) => {
  const [userName, setUserName] = useState('My User');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentHabit, setCurrentHabit] = useState('');
  const [habits, setHabits] = useState(['Drink Water', 'Workout', 'Read 10 pages']);

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (currentHabit.trim() && !habits.includes(currentHabit.trim())) {
      setHabits([...habits, currentHabit.trim()]);
      setCurrentHabit('');
    }
  };

  const handleRemoveHabit = (h) => {
    setHabits(habits.filter(x => x !== h));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userName || !date || habits.length === 0) {
      alert("Please provide user, date, and at least one habit.");
      return;
    }
    onSubmit({ user_name: userName, date, habits });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{marginBottom: "20px"}}>Add Daily Habits</h2>
      
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <div className="input-group">
          <label>User Name</label>
          <input 
            type="text" 
            className="input-field" 
            value={userName} 
            onChange={e => setUserName(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>Date</label>
          <input 
            type="date" 
            className="input-field" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
          />
        </div>
      </div>

      <div className="input-group">
        <label>Habits to Track</label>
        <div style={{display: "flex", gap: "8px"}}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="E.g., Meditate" 
            value={currentHabit}
            onChange={e => setCurrentHabit(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddHabit(e)}
          />
          <button type="button" className="btn btn-outline" onClick={handleAddHabit}>
            <Plus size={20} />
          </button>
        </div>
        <div className="habit-tags">
          {habits.map((h, idx) => (
            <span key={idx} className="habit-tag">
              {h}
              <button type="button" onClick={() => handleRemoveHabit(h)}>
                <X size={14} />
              </button>
            </span>
          ))}
          {habits.length === 0 && <span style={{fontSize: "0.85rem", color: "var(--text-muted)"}}>No habits added yet.</span>}
        </div>
      </div>

      <div style={{display: "flex", gap: "12px", marginTop: "24px"}}>
        <button type="submit" className="btn btn-primary" style={{flex: 1}}>
          <Save size={18} /> Save Entry
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default HabitForm;
