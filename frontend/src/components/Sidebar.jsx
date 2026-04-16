import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, PlusCircle, LogOut, Leaf, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ onLogout, userName, userStats }) => {
  
  const level = userStats?.level || 1;
  const xp = userStats?.xp || 0;
  const xpNeeded = level * 100;
  const xpPercent = Math.min(100, (xp / xpNeeded) * 100);
  const hp = userStats?.hp || 100;
  const hpPercent = Math.max(0, Math.min(100, hp));
  const hpColor = hpPercent > 50 ? '#34d399' : hpPercent > 20 ? '#fbbf24' : '#ef4444';

  return (
    <div className="sidebar">
      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 12px'}}>
        <div style={{background: 'linear-gradient(135deg, #a5b4fc, #f472b6)', padding: '8px', borderRadius: '12px', color: 'white'}}>
          <Leaf size={24} />
        </div>
        <h2 style={{fontSize: '1.4rem', color: '#1e293b'}}>HabitSync</h2>
      </div>

      {/* RPG HUD */}
      <div style={{background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', padding: '16px', marginBottom: '32px'}}>
         <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{fontWeight: 700, fontSize: '1rem', color: '#1e293b'}}>Level {level}</span>
            <span style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 600}}>{xp} / {xpNeeded} XP</span>
         </div>
         <div style={{width: '100%', background: '#e2e8f0', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '16px'}}>
            <motion.div 
               initial={{width: 0}} 
               animate={{width: `${xpPercent}%`}} 
               transition={{duration: 0.5}}
               style={{background: '#8b5cf6', height: '100%'}}
            />
         </div>

         <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{fontWeight: 700, fontSize: '0.85rem', color: '#64748b'}}>Health Points</span>
            <span style={{fontSize: '0.8rem', color: hpColor, fontWeight: 700}}>{hp} HP</span>
         </div>
         <div style={{width: '100%', background: '#e2e8f0', borderRadius: '8px', height: '8px', overflow: 'hidden'}}>
            <motion.div 
               initial={{width: 0}} 
               animate={{width: `${hpPercent}%`}} 
               transition={{duration: 0.5}}
               style={{background: hpColor, height: '100%'}}
            />
         </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
        <NavLink to="/" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Today Routine
        </NavLink>
        <NavLink to="/add" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} /> Add Habit
        </NavLink>
        <NavLink to="/trophies" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Award size={20} /> Trophy Room
        </NavLink>
        <NavLink to="/insights" className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} /> View Insights
        </NavLink>
      </div>

      <div style={{borderTop: '1px solid #f1f5f9', paddingTop: '24px', paddingBottom: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 12px'}}>
          <div style={{width: '40px', height: '40px', borderRadius: '20px', background: '#fb923c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{flex: 1, overflow: 'hidden'}}>
            <h4 style={{fontSize: '0.95rem', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{userName}</h4>
            <p style={{fontSize: '0.8rem', color: '#94a3b8', margin: 0}}>Lvl {level} Player</p>
          </div>
        </div>
        <button onClick={onLogout} style={{width: '100%', background: 'transparent', border: 'none', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', cursor: 'pointer', borderRadius: '12px', fontWeight: 600, transition: 'all 0.2s'}}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
