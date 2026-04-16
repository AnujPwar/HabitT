import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const AddHabit = ({ userName }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentHabit, setCurrentHabit] = useState('');
  const [habits, setHabits] = useState([]);

  const suggestions = ['Drink 8 glasses of water', 'Meditate for 10 min', 'Read a book', 'Go for a walk', 'Journaling'];

  const addSuggestion = (s) => {
    if(!habits.includes(s)) setHabits([...habits, s]);
  };

  const handleAdd = () => {
    if(currentHabit.trim()) {
      setHabits([...habits, currentHabit.trim()]);
      setCurrentHabit('');
    }
  };

  const handleRemove = (index) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if(!date || habits.length === 0) return toast.error('Add at least one habit');
    try {
      await axios.post(`${API_BASE}/habits`, {
        user_name: userName,
        date: date,
        habits: habits
      });
      toast.success('Routine Scheduled!');
      navigate('/');
    } catch(err) {
      toast.error('Failed to create route');
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1>Create Plan</h1>

        <label className="input-label">Date (Schedule)</label>
        <input 
          type="date" 
          className="input-text" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
        />

        <label className="input-label">Habits & Tasks</label>
        <div style={{display: 'flex', gap: '16px', marginBottom: '16px'}}>
          <input 
            type="text" 
            className="input-text" 
            style={{marginBottom: 0}}
            placeholder="e.g. Stretch for 10 minutes"
            value={currentHabit}
            onChange={e => setCurrentHabit(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAdd()}
          />
          <button 
            type="button" 
            onClick={handleAdd}
            style={{padding: '0 24px', borderRadius: '16px', background: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#1e293b'}}
          >
            <Plus size={24} />
          </button>
        </div>

        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px'}}>
            {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => addSuggestion(s)}
                  style={{padding: '6px 14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', transition: 'all 0.2s'}}
                >
                    + {s}
                </button>
            ))}
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px'}}>
          {habits.map((h, i) => (
            <div key={i} style={{background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontWeight: 500, color: '#334155'}}>{h}</span>
              <button onClick={() => handleRemove(i)} style={{background: 'transparent', border: 'none', color: '#f43f5e', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'}}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <button className="btn-submit" onClick={handleSubmit}>
          Save Daily Routine
        </button>

      </div>
    </div>
  );
};

export default AddHabit;
