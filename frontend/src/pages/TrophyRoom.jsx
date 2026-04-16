import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Camera, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const TrophyRoom = ({ userName, userStats }) => {
  const [photoLogs, setPhotoLogs] = useState([]);
  const badges = userStats?.badges || [];

  const loadPhotos = async () => {
    try {
        const res = await axios.get(`${API_BASE}/habits`);
        const userEntries = res.data.filter(e => e.user_name === userName);
        let photosExtracted = [];
        userEntries.forEach(entry => {
            entry.habits.forEach(h => {
                if(h.photos) {
                    h.photos.forEach(p => {
                        photosExtracted.push({ 
                            habitName: h.habit_name, 
                            date: entry.date, 
                            entryId: entry._id,
                            ...p 
                        });
                    });
                }
            });
        });
        photosExtracted.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPhotoLogs(photosExtracted);
    } catch(err) {
        console.error(err);
    }
  }

  useEffect(() => {
    loadPhotos();
  }, [userName]);

  const deletePhoto = async (entryId, habitName, timestamp) => {
      if(!window.confirm("Permanently delete this photo?")) return;
      try {
          await axios.delete(`${API_BASE}/habits/${entryId}/habit/${habitName}/photo?timestamp=${timestamp}`);
          toast.success("Photo removed!");
          loadPhotos();
      } catch(err) {
          toast.error("Failed to delete photo");
      }
  };

  return (
    <div className="page-container">
      <div className="insights-header">
        <h1>Your Trophy Room</h1>
        <p style={{color: '#64748b'}}>View accumulated badges and visual progress logs.</p>
      </div>

      <div style={{padding: '0 24px'}}>
        
        <div className="section-title" style={{marginTop: '20px'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><ShieldCheck size={24} color="#8b5cf6"/> Earned Badges</h2>
        </div>

        <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px'}}>
            {badges.length === 0 ? (
                <div style={{padding: '24px', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '16px', width: '100%', textAlign: 'center', color: '#94a3b8'}}>
                    Keep maintaining streaks to earn badges!
                </div>
            ) : badges.map((b, i) => {
                let formattedDate = 'Recent';
                try {
                   if(b.earnedAt) formattedDate = format(new Date(b.earnedAt), 'MMM dd, yyyy');
                } catch(e) {}
                
                return (
                  <div key={i} style={{background: 'white', padding: '16px 24px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'}}>
                      <span style={{fontSize: '3rem'}}>{b.icon}</span>
                      <div style={{textAlign: 'center'}}>
                          <h4 style={{margin: 0, color: '#1e293b'}}>{b.badgeName}</h4>
                          <p style={{margin: 0, fontSize: '0.8rem', color: '#94a3b8'}}>Earned: {formattedDate}</p>
                      </div>
                  </div>
                );
            })}
        </div>

        <div className="section-title">
            <h2 style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Camera size={24} color="#ec4899"/> Visual Logs</h2>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px'}}>
            {photoLogs.length === 0 ? (
                <div style={{gridColumn: '1 / -1', padding: '40px 24px', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '16px', textAlign: 'center', color: '#94a3b8'}}>
                    <Camera size={48} opacity={0.3} style={{marginBottom: '12px'}}/>
                    <p>No photos uploaded yet. Snap a picture while completing routines!</p>
                </div>
            ) : photoLogs.map((p, i) => {
                let photoDate = 'Today';
                try {
                  if(p.timestamp) photoDate = format(new Date(p.timestamp), 'MMM dd');
                } catch(e) {}

                return (
                  <div key={i} className="photo-card" style={{borderRadius: '16px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative', aspectRatio: '1/1'}}>
                      <img src={p.image} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Proof" />
                      
                      <button 
                        onClick={() => deletePhoto(p.entryId, p.habitName, p.timestamp)}
                        style={{position: 'absolute', top: '8px', right: '8px', background: 'rgba(244, 63, 94, 0.9)', color: 'white', border: 'none', padding: '6px', borderRadius: '10px', cursor: 'pointer', zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}
                      >
                          <Trash2 size={16} />
                      </button>

                      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '24px 12px 12px 12px', color: 'white'}}>
                          <p style={{margin: 0, fontSize: '0.85rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{p.habitName}</p>
                          <p style={{margin: 0, fontSize: '0.7rem', opacity: 0.8}}>{photoDate}</p>
                      </div>
                  </div>
                );
            })}
        </div>
        
      </div>
    </div>
  );
};

export default TrophyRoom;
