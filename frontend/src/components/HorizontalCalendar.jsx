import React, { useState } from 'react';
import { format, addDays, subDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HorizontalCalendar = ({ selectedDate, onSelectDate }) => {
  // viewDate determines which week is shown
  const [viewDate, setViewDate] = useState(selectedDate);
  
  const startDate = startOfWeek(viewDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setViewDate(prev => addDays(prev, 7));
  const prevWeek = () => setViewDate(prev => subDays(prev, 7));
  const goToday = () => {
      setViewDate(new Date());
      onSelectDate(new Date());
  };

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginTop: '24px'}}>
      <button 
        onClick={prevWeek}
        style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="horizontal-calendar" style={{flex: 1}}>
        {weekDays.map(day => {
          const isActive = isSameDay(day, selectedDate);
          return (
            <div 
              key={day.toString()} 
              className={`calendar-day ${isActive ? 'active' : ''}`}
              onClick={() => onSelectDate(day)}
              style={{flex: 1}}
            >
              <span className="calendar-day-name">{format(day, 'EEE')}</span>
              <span className="calendar-day-num">{format(day, 'd')}</span>
            </div>
          );
        })}
      </div>

      <button 
        onClick={nextWeek}
        style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
      >
        <ChevronRight size={20} />
      </button>

      <button 
        onClick={goToday}
        style={{background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600}}
      >
        Today
      </button>
    </div>
  );
};

export default HorizontalCalendar;
