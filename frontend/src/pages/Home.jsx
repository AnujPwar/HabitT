import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Bell, Check, Droplet, Book, Activity, Moon, Wind, Trash2, Camera, Plus, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import HorizontalCalendar from '../components/HorizontalCalendar';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const getHabitStyling = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('water') || lower.includes('drink')) return { icon: <Droplet size={24}/>, bg: 'bg-blue', color: 'color-blue' };
  if (lower.includes('read') || lower.includes('study') || lower.includes('journal')) return { icon: <Book size={24}/>, bg: 'bg-orange', color: 'color-orange' };
  if (lower.includes('sleep') || lower.includes('meditat')) return { icon: <Moon size={24}/>, bg: 'bg-purple', color: 'color-purple' };
  if (lower.includes('walk') || lower.includes('run') || lower.includes('workout')) return { icon: <Activity size={24}/>, bg: 'bg-pink', color: 'color-pink' };
  return { icon: <Wind size={24}/>, bg: 'bg-green', color: 'color-green' };
};

const Home = ({ userName, refreshStats }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingXP, setFloatingXP] = useState([]);
  const [quickHabit, setQuickHabit] = useState('');
  
  const [editMode, setEditMode] = useState(null); // entryId of routine being edited
  const [editHabits, setEditHabits] = useState([]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Morning";
    if (hours < 17) return "Afternoon";
    return "Evening";
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const res = await axios.get(`${API_BASE}/habits?date=${formattedDate}`);
      setEntries(res.data.filter(e => e.user_name === userName));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedDate, userName]);

  const toggleHabitStatus = async (e, entryId, habitName, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Not Done' : 'Done';
    try {
      const res = await axios.put(`${API_BASE}/habits/${entryId}/habit/${habitName}`, { status: newStatus });
      fetchEntries();
      refreshStats();

      if(newStatus === 'Done') {
        const rect = e.target.getBoundingClientRect();
        
        const id = Date.now();
        setFloatingXP(prev => [...prev, { id, x: rect.left, y: rect.top }]);
        setTimeout(() => setFloatingXP(prev => prev.filter(xp => xp.id !== id)), 1500);

        if(res.data.leveledUp) {
           setShowConfetti(true);
           toast('LEVEL UP! Health Restored! 🎉', {icon: '🌟', duration: 4000});
           setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const handlePhotoUpload = async (e, entryId, habitName) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
        try {
            await axios.post(`${API_BASE}/habits/${entryId}/habit/${habitName}/photo`, { photo: reader.result });
            toast.success("Visual proof logged!");
            fetchEntries();
        } catch(err) {
            toast.error("Photo upload failed");
        }
    }
    reader.readAsDataURL(file);
  };

  const deleteDayEntry = async (entryId) => {
    if(!window.confirm("Are you sure you want to delete this scheduled routine?")) return;
    try {
      await axios.delete(`${API_BASE}/habits/${entryId}`);
      toast.success("Routine deleted.");
      fetchEntries();
    } catch(err) {
      toast.error("Failed to delete.");
    }
  };

  const deleteIndividualHabit = async (entryId, habitName) => {
    if(!window.confirm(`Remove "${habitName}" from today?`)) return;
    try {
        await axios.delete(`${API_BASE}/habits/${entryId}/habit/${habitName}`);
        toast.success("Habit removed!");
        fetchEntries();
        refreshStats();
    } catch(err) {
        toast.error("Failed to remove habit");
    }
  };

  const startEditing = (entry) => {
      setEditMode(entry._id);
      setEditHabits(entry.habits.map(h => h.habit_name));
  };

  const saveEdit = async (entryId) => {
      try {
          await axios.put(`${API_BASE}/habits/${entryId}`, { habits: editHabits });
          toast.success("Routine updated!");
          setEditMode(null);
          fetchEntries();
      } catch(err) {
          toast.error("Update failed");
      }
  };

  const handleQuickAdd = async (e) => {
      e.preventDefault();
      if(!quickHabit.trim()) return;
      try {
          await axios.post(`${API_BASE}/habits`, {
              user_name: userName,
              date: format(selectedDate, 'yyyy-MM-dd'),
              habits: [quickHabit.trim()]
          });
          setQuickHabit('');
          toast.success("Habit Added!");
          fetchEntries();
      } catch(err) {
          toast.error("Error adding habit");
      }
  }

  let allDailyHabits = [];
  entries.forEach(e => {
    e.habits.forEach(h => {
      allDailyHabits.push({ entryId: e._id, ...h });
    });
  });

  const displayedHabits = showAll ? allDailyHabits : allDailyHabits.slice(0, 5);

  return (
    <div className="page-container" style={{position: 'relative'}}>
      {showConfetti && <div style={{position: 'fixed', top:0, left:0, zIndex: 9999, pointerEvents: 'none'}}><Confetti width={window.innerWidth} height={window.innerHeight} /></div>}
      
      <AnimatePresence>
        {floatingXP.map(xp => (
          <motion.div
            key={xp.id}
            initial={{ opacity: 1, y: xp.y - 20, x: xp.x }}
            animate={{ opacity: 0, y: xp.y - 80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ position: 'fixed', zIndex: 1000, color: '#8b5cf6', fontWeight: 'bold', fontSize: '1.4rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)', pointerEvents: 'none' }}
          >
            +10 XP
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="header-hero">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>{getGreeting()}, {userName}</h1>
            <p>{format(selectedDate, 'EEEE, dd MMMM yyyy')}</p>
          </div>
        </div>
        <HorizontalCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      <div className="content-overlay">
        <div className="dashboard-grid">
          <div className="main-feed">
            <div className="section-title">
              <h2>Daily routine</h2>
              <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                {entries.length > 0 && (
                  <button onClick={() => editMode ? saveEdit(editMode) : startEditing(entries[0])} style={{background: 'transparent', border: 'none', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600}}>
                    {editMode ? <Check size={18}/> : <Edit size={18}/>}
                    {editMode ? 'Save' : 'Edit'}
                  </button>
                )}
                {allDailyHabits.length > 5 && (
                  <span onClick={() => setShowAll(!showAll)}>{showAll ? 'Show less' : 'See all'}</span>
                )}
              </div>
            </div>

            <div className="routine-list">
              {loading && <p style={{textAlign: 'center', opacity: 0.5}}>Loading...</p>}
              
              {!loading && entries.length === 0 && (
                 <p style={{textAlign:'center', color: '#94a3b8', padding: '20px'}}>No habits set for today!</p>
              )}

              {!loading && displayedHabits.map((habit, idx) => {
                const style = getHabitStyling(habit.habit_name);
                const isDone = habit.status === 'Done';
                const hasPhoto = habit.photos && habit.photos.length > 0;
                
                return (
                  <div key={idx} className={`routine-item ${isDone ? 'done' : ''}`} style={{position: 'relative'}}>
                    <div 
                      className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                      onClick={(e) => toggleHabitStatus(e, habit.entryId, habit.habit_name, habit.status)}
                    >
                      {isDone && <Check size={16} strokeWidth={3} />}
                    </div>
                    
                    <div className={`routine-icon-box ${style.bg} ${style.color}`}>
                      {style.icon}
                    </div>
                    
                    <div className="routine-info">
                      {editMode === habit.entryId ? (
                          <input 
                            type="text" 
                            className="input-text" 
                            style={{padding: '8px', marginBottom: 0, fontSize: '0.9rem'}}
                            value={editHabits[idx] || ''}
                            onChange={(e) => {
                                const newHabits = [...editHabits];
                                newHabits[idx] = e.target.value;
                                setEditHabits(newHabits);
                            }}
                          />
                      ) : (
                        <h4>{habit.habit_name}</h4>
                      )}
                      <p>{hasPhoto ? 'Photo Verified 📸' : 'Active habit tracking'}</p>
                    </div>
                    
                    <div className="routine-meta" style={{alignItems: 'center', flexDirection: 'row', gap: '8px'}}>
                      <button onClick={() => deleteIndividualHabit(habit.entryId, habit.habit_name)} style={{background: 'rgba(244, 63, 94, 0.05)', color: '#f43f5e', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer'}}>
                          <Trash2 size={18} />
                      </button>
                      <label style={{cursor: 'pointer', background: hasPhoto ? '#d1fae5' : '#f1f5f9', color: hasPhoto ? '#10b981' : '#cbd5e1', padding: '8px', borderRadius: '12px', transition: 'all 0.2s'}}>
                          <Camera size={20} />
                          <input type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => handlePhotoUpload(e, habit.entryId, habit.habit_name)} />
                      </label>
                    </div>
                  </div>
                );
              })}
              
              {!loading && entries.length > 0 && (
                <div style={{marginTop: '16px', textAlign: 'center'}}>
                    {entries.map(e => (
                        <button key={e._id} onClick={() => deleteDayEntry(e._id)} style={{background: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', padding: '10px 20px', borderRadius: '16px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600}}>
                            <Trash2 size={16} /> Delete Schedule For This Day
                        </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="side-feed">
            <form onSubmit={handleQuickAdd} className="reminder-card" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#ede9fe', padding: '24px'}}>
              <h3 style={{color: '#4c1d95', marginBottom: '12px'}}>Quick Add Habit</h3>
              <p style={{color: '#7c3aed', marginBottom: '16px'}}>Instantly add a new goal to today's schedule.</p>
              <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                  <input type="text" placeholder="e.g. Read 10 Pages" value={quickHabit} onChange={e=>setQuickHabit(e.target.value)} style={{flex: 1, padding: '12px', border: 'none', borderRadius: '12px', outline: 'none'}} />
                  <button type="submit" style={{background: '#8b5cf6', color: 'white', border: 'none', padding: '0 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Plus size={20} />
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
